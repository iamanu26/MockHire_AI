# resume_routes.py — Resume upload and AI extraction
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from auth import get_current_user, get_db
from models import User
from sqlalchemy.orm import Session
from llama_client import ask_llama
import json, re, io

router = APIRouter(prefix="/resume", tags=["Resume"])

def clean_json(text: str) -> dict:
    text = re.sub(r"```(?:json)?", "", text).strip("` \n")
    match = re.search(r"\{[\s\S]*\}", text)
    raw = match.group(0) if match else text
    return json.loads(raw)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using pypdf (pure Python, no system deps)."""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += (page.extract_text() or "") + "\n"
        return text.strip()[:6000]  # cap at 6000 chars to stay within token limits
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")

@router.post("/extract")
async def extract_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload resume PDF → AI extracts structured data."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    raw_text = extract_text_from_pdf(file_bytes)

    if len(raw_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. Try a text-based PDF.")

    prompt = f"""Extract key information from this resume for an interview preparation system.

Resume text:
{raw_text}

Return ONLY valid JSON, no markdown, no explanation:
{{
  "name": "candidate full name or empty string",
  "level": "Fresher or Experienced",
  "years_of_experience": <integer, 0 if fresher>,
  "current_role": "current or most recent job title, or empty string",
  "skills": ["skill1", "skill2", "skill3"],
  "projects": [
    {{"name": "project name", "description": "1 sentence description", "tech": ["tech1", "tech2"]}}
  ],
  "education": "highest degree and institution in one line",
  "companies": ["company1", "company2"],
  "summary": "2 sentence professional summary of this candidate for an interviewer to use"
}}

Extract up to 8 skills and up to 4 projects. Be accurate. If something is not present, use empty string or empty array."""

    try:
        raw = ask_llama(
            [
                {"role": "system", "content": "You extract resume data and output only valid JSON."},
                {"role": "user",   "content": prompt}
            ],
            max_tokens=1000
        )
        data = clean_json(raw)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")