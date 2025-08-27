"""
Contract AI analysis functions using OpenAI
"""
import openai
import json
import re
from typing import Dict, List, Any
import os

def analyze_contract_with_ai(contract_text: str) -> Dict[str, Any]:
    """
    Analyze contract using OpenAI and return structured analysis
    """
    
    prompt = f"""
    Analyze the following contract and provide a comprehensive analysis in JSON format:

    Contract Text:
    {contract_text[:8000]}  # Limit to avoid token limits

    Please provide analysis in this exact JSON structure:
    {{
        "summary": "Brief 3-4 bullet point summary of the contract",
        "key_clauses": [
            {{
                "type": "Payment Terms",
                "content": "extracted clause text",
                "importance": "high/medium/low"
            }}
        ],
        "risks": [
            {{
                "risk_type": "Financial Risk",
                "description": "description of the risk",
                "severity": "high/medium/low",
                "clause_reference": "relevant clause"
            }}
        ],
        "risk_score": 75
    }}

    Focus on:
    - Payment terms, deadlines, termination clauses
    - Liability and indemnification
    - Intellectual property rights
    - Confidentiality and non-disclosure
    - Dispute resolution
    - Force majeure and termination conditions

    Risk score should be 0-100 (0=very safe, 100=very risky).
    """

    try:
        response = openai.chat.completions.create(
            model=os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": "You are a legal AI assistant specializing in contract analysis. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=int(os.getenv("MAX_TOKENS", "2000")),
            temperature=float(os.getenv("TEMPERATURE", "0.3"))
        )
        
        # Extract JSON from response
        content = response.choices[0].message.content
        
        # Try to extract JSON if wrapped in markdown
        json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
        
        return json.loads(content)
        
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return {
            "summary": "Contract analysis completed, but formatting error occurred.",
            "key_clauses": [],
            "risks": [{"risk_type": "Analysis Error", "description": "Could not parse AI response", "severity": "low", "clause_reference": "N/A"}],
            "risk_score": 50
        }
    except Exception as e:
        raise Exception(f"AI analysis failed: {str(e)}")

def generate_negotiation_email(contract_text: str, tone: str = "professional", issues: List[str] = None) -> Dict[str, str]:
    """
    Generate negotiation email based on contract analysis
    """
    
    issues_text = ""
    if issues:
        issues_text = f"Specific issues to address: {', '.join(issues)}"
    
    tone_instructions = {
        "professional": "Use a professional, respectful tone",
        "assertive": "Use a confident, assertive tone while remaining respectful",
        "collaborative": "Use a collaborative, partnership-focused tone"
    }
    
    prompt = f"""
    Based on this contract analysis, draft a negotiation email.
    
    Contract excerpt: {contract_text[:2000]}
    {issues_text}
    
    Tone: {tone_instructions.get(tone, "professional")}
    
    Generate an email with:
    1. Professional subject line
    2. Clear, concise body addressing key negotiation points
    3. Specific clause references where applicable
    4. Constructive suggestions for improvements
    
    Format as JSON:
    {{
        "subject": "Email subject line",
        "body": "Email body text"
    }}
    """
    
    try:
        response = openai.chat.completions.create(
            model=os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": f"You are a professional contract negotiator. Write emails in a {tone} tone."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.4
        )
        
        content = response.choices[0].message.content
        
        # Extract JSON if wrapped
        json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
            
        result = json.loads(content)
        result["tone"] = tone
        return result
        
    except Exception as e:
        return {
            "subject": f"Contract Review and Discussion - {tone.title()} Approach",
            "body": f"I've reviewed the contract and would like to discuss some key points. Error in AI generation: {str(e)}",
            "tone": tone
        }

def answer_contract_question(question: str, contract_text: str) -> str:
    """
    Answer questions about the contract using RAG-lite approach
    """
    
    prompt = f"""
    Based on the following contract, answer this question accurately and concisely:
    
    Question: {question}
    
    Contract Text:
    {contract_text[:6000]}
    
    Instructions:
    - Only answer based on information in the contract
    - If the answer isn't in the contract, say so clearly
    - Quote relevant sections when possible
    - Be specific and factual
    """
    
    try:
        response = openai.chat.completions.create(
            model=os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": "You are a legal assistant. Answer questions based only on the provided contract text."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.2
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Error answering question: {str(e)}"
