"""
Contract AI analysis functions using Google Gemini
"""
import json
import re
from typing import Dict, List, Any
import os
import google.generativeai as genai

def _get_model() -> genai.GenerativeModel:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    return genai.GenerativeModel(model_name)

def _extract_json(text: str) -> Dict[str, Any]:
    # Try to extract JSON block if wrapped in triple backticks
    match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        text = match.group(1)
    return json.loads(text)

def analyze_contract_with_ai(contract_text: str) -> Dict[str, Any]:
    """Analyze contract using Gemini and return structured analysis."""
    model = _get_model()
    prompt = f"""
You are a legal AI assistant specializing in contract analysis.
Always return STRICT valid JSON with the exact schema below.

Analyze the following contract and provide a comprehensive analysis in JSON format.

Contract Text:
{contract_text[:12000]}

Return exactly this JSON structure:
{{
  "summary": "Brief 3-4 bullet point summary (use - bullets separated by newlines)",
  "key_clauses": [
    {{
      "type": "Payment Terms",
      "content": "extracted clause text",
      "importance": "high|medium|low"
    }}
  ],
  "risks": [
    {{
      "risk_type": "Financial Risk",
      "description": "description of the risk",
      "severity": "high|medium|low",
      "clause_reference": "relevant clause"
    }}
  ],
  "risk_score": 0
}}

Notes:
- Focus on payment terms, deadlines, termination, liability/indemnity, IP, confidentiality, dispute resolution, force majeure.
- risk_score is 0–100 (0 very safe, 100 very risky).
"""
    try:
        resp = model.generate_content(prompt)
        content = resp.text or "{}"
        return _extract_json(content)
    except json.JSONDecodeError:
        return {
            "summary": "Contract analysis completed, but formatting error occurred.",
            "key_clauses": [],
            "risks": [{
                "risk_type": "Analysis Error",
                "description": "Could not parse AI response",
                "severity": "low",
                "clause_reference": "N/A"
            }],
            "risk_score": 50,
        }
    except Exception as e:
        raise Exception(f"AI analysis failed: {str(e)}")

def generate_negotiation_email(contract_text: str, tone: str = "professional", issues: List[str] = None) -> Dict[str, str]:
    """Generate negotiation email using Gemini."""
    model = _get_model()
    issues_text = ""
    if issues:
        issues_text = f"Specific issues to address: {', '.join(issues)}\n"
    tone_map = {
        "professional": "Use a professional, respectful tone.",
        "assertive": "Use a confident, assertive tone while remaining respectful.",
        "collaborative": "Use a collaborative, partnership-focused tone.",
        "friendly": "Use a friendly and warm but still professional tone.",
        "concise": "Be concise and to-the-point while remaining polite.",
    }
    user = f"""
Based on this contract, draft a negotiation email.

Contract excerpt:
{contract_text[:4000]}

{issues_text}
Tone: {tone_map.get(tone, 'Use a professional, respectful tone.')}

Return JSON with keys subject and body only.
"""
    try:
        resp = model.generate_content(user)
        content = resp.text or "{}"
        result = _extract_json(content)
        result["tone"] = tone
        return result
    except Exception as e:
        return {
            "subject": f"Contract Review and Discussion - {tone.title()} Approach",
            "body": f"I've reviewed the contract and would like to discuss some key points. Error in AI generation: {str(e)}",
            "tone": tone,
        }

def answer_contract_question(question: str, contract_text: str) -> str:
    """Answer questions about the contract using Gemini (grounded on provided text)."""
    model = _get_model()
    user = f"""
Answer the question using ONLY the contract text.
If the answer is not present, say "The contract does not specify." Do not invent facts.

Question: {question}

Contract Text:
{contract_text[:12000]}
"""
    try:
        resp = model.generate_content(user)
        return resp.text or ""
    except Exception as e:
        return f"Error answering question: {str(e)}"
