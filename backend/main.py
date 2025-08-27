from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import aiofiles
import os
from pathlib import Path
import uuid
from typing import Optional, List, Dict, Any
import PyPDF2
from docx import Document
from dotenv import load_dotenv
import json
import re
from contract_ai import analyze_contract_with_ai, generate_negotiation_email, answer_contract_question

load_dotenv()

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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Contract AI Backend is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Contract AI Backend",
        "version": "1.0.0",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
