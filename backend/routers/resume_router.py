# routers/resume_router.py — Resume extraction endpoint
import json, re, io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from llm.llm_factory import default_llm

router = APIRouter(prefix="/resume", tags=["Resume"])


def _clean_json(text: str) -> dict:
    text  = re.sub(r"```(?:json)?", "", text).strip("` \n")
    match = re.search(r"\{[\s\S]*\}", text)
    raw   = match.group(0) if match else text
    return json.loads(raw)


def _extract_pdf_text(file_bytes: bytes) -> str:
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        return "\n".join(p.extract_text() or "" for p in reader.pages).strip()[:6000]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")


@router.post("/extract")
async def extract_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    raw_text = _extract_pdf_text(await file.read())

    if len(raw_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract text. Try a text-based PDF.")

    prompt = f"""Extract key information from this resume for an interview system.
Resume:
{raw_text}

Return ONLY valid JSON:
{{"name":"...","level":"Fresher or Experienced","years_of_experience":0,"current_role":"...","skills":["..."],"projects":[{{"name":"...","description":"...","tech":["..."]}}],"education":"...","companies":["..."],"summary":"..."}}

Extract up to 8 skills and 4 projects. Use empty string/array if not found."""

    try:
        raw  = default_llm.complete([
            {"role": "system", "content": "Extract resume data. Output only valid JSON."},
            {"role": "user",   "content": prompt},
        ], max_tokens=1000)
        return _clean_json(raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {e}")