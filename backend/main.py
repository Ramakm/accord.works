from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import aiofiles
import os
from pathlib import Path
import uuid
from typing import Optional, List, Dict, Any
from urllib.parse import urlencode
import PyPDF2
from docx import Document
from dotenv import load_dotenv
import json
import re
from backend.contract_ai import analyze_contract_with_ai, generate_negotiation_email, answer_contract_question
import hmac
import hashlib

# Load env from repo root .env (when running from project root)
load_dotenv()
# Also load env from backend/.env explicitly to ensure backend-specific vars are available
_BACKEND_ENV_PATH = (Path(__file__).resolve().parent / ".env").as_posix()
load_dotenv(dotenv_path=_BACKEND_ENV_PATH, override=True)

app = FastAPI(
    title="Contract AI Backend",
    description="AI-powered contract analysis and management system",
    version="1.0.0"
)

# Gemini env presence will be checked lazily in contract_ai

# Pydantic models
class ContractAnalysis(BaseModel):
    summary: str
    key_clauses: List[Dict[str, Any]]
    risks: List[Dict[str, Any]]
    risk_score: int

class NegotiationEmail(BaseModel):
    subject: str
    body: str
    tone: str

class QuestionRequest(BaseModel):
    question: str
    contract_text: str

class EmailRequest(BaseModel):
    contract_text: str
    tone: str = "professional"
    issues: Optional[List[str]] = None

# Configure CORS (supports exact origin via FRONTEND_URL or regex via FRONTEND_ORIGIN_REGEX)
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").strip()
_frontend_origin_regex = os.getenv("FRONTEND_ORIGIN_REGEX")  # e.g. r"https://cme-ai-frontend(-[a-z0-9-]+)?\\.vercel\\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if _frontend_origin_regex else [_frontend_url],
    allow_origin_regex=_frontend_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create storage directories (serverless-friendly). Vercel only allows writes to /tmp
BASE_DATA_DIR = Path(os.getenv("APP_DATA_DIR", "/tmp")).resolve()
UPLOAD_DIR = BASE_DATA_DIR / "uploads"
DATA_DIR = BASE_DATA_DIR / "data"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Simple persistent stores
_CREDITS_FILE = DATA_DIR / "credits.json"
_EVENTS_FILE = DATA_DIR / "processed_events.json"

def _load_json(path: Path, default):
    try:
        if not path.exists():
            return default
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_credits() -> Dict[str, int]:
    return _load_json(_CREDITS_FILE, {})

def save_credits(data: Dict[str, int]):
    _save_json(_CREDITS_FILE, data)

def load_processed_events() -> Dict[str, bool]:
    return _load_json(_EVENTS_FILE, {})

def save_processed_events(data: Dict[str, bool]):
    _save_json(_EVENTS_FILE, data)

def add_credits(email: str, amount: int):
    credits = load_credits()
    credits[email.lower()] = int(credits.get(email.lower(), 0)) + int(amount)
    save_credits(credits)

def set_credits(email: str, amount: int):
    credits = load_credits()
    credits[email.lower()] = int(amount)
    save_credits(credits)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Contract AI Backend is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "ok",
        "service": "contract-ai-backend",
        "version": "1.0.0",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

def build_static_checkout_link(product_id: str, params: Dict[str, Any]) -> str:
    """Construct a Dodo static payment link for a product with optional params."""
    base = os.getenv("DODO_CHECKOUT_BASE", "https://checkout.dodopayments.com/buy").rstrip("/")
    pid = product_id.strip()
    query = urlencode({k: v for (k, v) in params.items() if v not in (None, "")})
    return f"{base}/{pid}" + (f"?{query}" if query else "")

def extract_text_from_pdf(file_path: Path) -> str:
    """Extract text from PDF file"""
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"
    return text

def extract_text_from_docx(file_path: Path) -> str:
    """Extract text from DOCX file"""
    doc = Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_text_from_file(file_path: Path) -> str:
    """Extract text based on file extension"""
    extension = file_path.suffix.lower()
    
    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif extension == '.docx':
        return extract_text_from_docx(file_path)
    elif extension == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file type: {extension}")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and analyze a contract file
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        allowed_extensions = [".pdf", ".docx", ".txt"]
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed_extensions}")
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Extract text from file
        try:
            extracted_text = extract_text_from_file(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error extracting text: {str(e)}")
        
        # Analyze contract with AI (Gemini)
        try:
            analysis = analyze_contract_with_ai(extracted_text)
        except Exception as e:
            analysis = {
                "summary": f"AI analysis failed: {str(e)}",
                "key_clauses": [],
                "risks": [],
                "risk_score": 50
            }
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Contract uploaded and analyzed successfully",
                "filename": file.filename,
                "saved_as": unique_filename,
                "size": len(content),
                "extracted_text": extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
                "analysis": analysis
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/contracts")
async def list_contracts():
    """
    List all uploaded contract files
    """
    try:
        files = []
        for file_path in UPLOAD_DIR.iterdir():
            if file_path.is_file():
                stat = file_path.stat()
                files.append({
                    "filename": file_path.name,
                    "size": stat.st_size,
                    "created_at": stat.st_ctime,
                    "extension": file_path.suffix
                })
        
        return {"contracts": files, "count": len(files)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing contracts: {str(e)}")

@app.delete("/contracts/{filename}")
async def delete_contract(filename: str):
    """
    Delete a specific contract file
    """
    try:
        file_path = UPLOAD_DIR / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Contract not found")
        
        file_path.unlink()
        
        return {"message": f"Contract {filename} deleted successfully"}
    
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Contract not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting contract: {str(e)}")

@app.post("/analyze")
async def analyze_contract(request: dict):
    """
    Analyze contract text directly (without file upload)
    """
    try:
        contract_text = request.get("contract_text", "")
        if not contract_text:
            raise HTTPException(status_code=400, detail="No contract text provided")
        
        analysis = analyze_contract_with_ai(contract_text)
        return analysis
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/generate-email")
async def generate_email(request: EmailRequest):
    """
    Generate negotiation email based on contract
    """
    try:
        email = generate_negotiation_email(
            contract_text=request.contract_text,
            tone=request.tone,
            issues=request.issues
        )
        return email
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email generation failed: {str(e)}")

@app.post("/ask-question")
async def ask_question(request: QuestionRequest):
    """
    Answer questions about the contract
    """
    try:
        answer = answer_contract_question(
            question=request.question,
            contract_text=request.contract_text
        )
        return {"question": request.question, "answer": answer}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question answering failed: {str(e)}")

def _verify_dodo_signature(secret: str, body: bytes, webhook_headers: Dict[str, str]) -> bool:
    """Verify Dodo webhook signature using Standard Webhooks format.
    
    Dodo uses Standard Webhooks with headers:
    - webhook-id
    - webhook-signature  
    - webhook-timestamp
    """
    try:
        from standardwebhooks import Webhook
        webhook = Webhook(secret)
        webhook.verify(body, webhook_headers)
        return True
    except Exception as e:
        print(f"[Dodo] Webhook signature verification failed: {e}")
        return False

@app.post("/webhooks/dodo")
async def dodo_webhook(request: Request):
    """Handle Dodo Payments webhooks.

    Env required:
    - DODO_WEBHOOK_SECRET: webhook signing secret from Dodo dashboard
    """
    secret = os.getenv("DODO_WEBHOOK_SECRET")
    if not secret:
        # Misconfiguration; do not process
        raise HTTPException(status_code=500, detail="DODO_WEBHOOK_SECRET not configured")

    # Read raw body for signature verification
    raw = await request.body()
    
    # Standard Webhooks headers
    webhook_headers = {
        "webhook-id": request.headers.get("webhook-id") or "",
        "webhook-signature": request.headers.get("webhook-signature") or "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") or "",
    }
    
    if not webhook_headers["webhook-signature"]:
        raise HTTPException(status_code=400, detail="Missing webhook-signature header")

    if not _verify_dodo_signature(secret, raw, webhook_headers):
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Signature valid; parse JSON and perform routing
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_id = payload.get("id") or payload.get("event_id") or ""
    event_type = payload.get("type") or payload.get("event") or ""
    data = payload.get("data") or {}

    # Idempotency: skip if already processed
    processed = load_processed_events()
    if event_id and processed.get(event_id):
        return {"ok": True, "duplicate": True}

    # Extract identifiers—adjust based on Dodo payload schema
    customer = data.get("customer") or {}
    email = (customer.get("email") or data.get("email") or "").strip()
    # Try various fields to determine plan/name
    plan_name = (
        data.get("plan")
        or (data.get("product") or {}).get("name")
        or (data.get("price") or {}).get("name")
        or (data.get("line_item") or {}).get("name")
        or ""
    )

    # Map plan to credits
    def credits_for_plan(name: str) -> int:
        n = (name or "").lower()
        if "pro" in n:
            return 10
        if "free" in n:
            return 1
        # Fallback by amount if present
        amount = data.get("amount") or (data.get("price") or {}).get("amount")
        if str(amount) in {"1500", "15", "15.00"}:
            return 10
        return 0

    granted = 0
    try:
        if event_type in {"payment.completed", "checkout.completed"}:
            if not email:
                print("[Dodo] Missing customer email in payload; cannot grant credits")
            else:
                granted = credits_for_plan(plan_name)
                if granted > 0:
                    add_credits(email, granted)
        elif event_type in {"subscription.activated", "subscription.renewed"}:
            # Example: set base monthly credits for subscription
            if email:
                base = credits_for_plan(plan_name)
                if base > 0:
                    add_credits(email, base)
        elif event_type in {"subscription.canceled"}:
            # No credit change on cancel in this simple example
            pass
    finally:
        if event_id:
            processed[event_id] = True
            save_processed_events(processed)

    print("[Dodo] Webhook received:", event_type, "plan=", plan_name, "email=", email, "granted=", granted)
    return {"ok": True, "granted": granted}

@app.get("/credits/{email}")
async def get_credits(email: str):
    """Get current credits for an email (temporary store)."""
    credits = load_credits()
    return {"email": email.lower(), "credits": int(credits.get(email.lower(), 0))}

@app.get("/payments/pro/link")
async def get_pro_payment_link(
    email: Optional[str] = None,
    firstName: Optional[str] = None,
    lastName: Optional[str] = None,
    quantity: int = 1,
    redirect_url: Optional[str] = None,
    disableEmail: Optional[bool] = None,
    disableFirstName: Optional[bool] = None,
    disableLastName: Optional[bool] = None,
    showDiscounts: Optional[bool] = None,
):
    """
    Returns a static checkout URL for the Pro product.

    Uses env:
    - DODO_PRO_PRODUCT_ID
    - DODO_CHECKOUT_BASE (default https://checkout.dodopayments.com/buy)
    - DODO_RETURN_URL (fallback for redirect_url if not provided)
    """
    product_id = os.getenv("DODO_PRO_PRODUCT_ID")
    if not product_id:
        raise HTTPException(status_code=500, detail="DODO_PRO_PRODUCT_ID not configured")

    if not redirect_url:
        redirect_url = os.getenv("DODO_RETURN_URL")
    
    if not redirect_url:
        raise HTTPException(status_code=500, detail="redirect_url is required but not provided")

    params: Dict[str, Any] = {
        "quantity": quantity,
        "redirect_url": redirect_url,
        "email": email,
        "firstName": firstName,
        "lastName": lastName,
        "disableEmail": str(disableEmail).lower() if isinstance(disableEmail, bool) else None,
        "disableFirstName": str(disableFirstName).lower() if isinstance(disableFirstName, bool) else None,
        "disableLastName": str(disableLastName).lower() if isinstance(disableLastName, bool) else None,
        "showDiscounts": str(showDiscounts).lower() if isinstance(showDiscounts, bool) else None,
    }

    link = build_static_checkout_link(product_id, params)
    return {"paymentLink": link}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
