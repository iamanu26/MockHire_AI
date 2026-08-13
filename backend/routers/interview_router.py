# routers/interview_router.py — Interview HTTP endpoints (thin controllers)
# SOLID: SRP — only HTTP concerns, all logic delegated to InterviewService
import io
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from repositories.interview_repository import InterviewRepository
from services.interview_service import InterviewService
from agents.tech_agent import TechnicalInterviewAgent
from agents.hr_agent import HRInterviewAgent
from llm.llm_factory import default_llm
from schemas.interview import ResumeContext
from core.config import settings
from text_to_speech import text_to_speech

router = APIRouter(prefix="/interview", tags=["Interview"])

# ── Shared agent instances (one per server process) ───────────────
# DIP: service depends on BaseInterviewAgent abstraction
_tech_agent = TechnicalInterviewAgent(
    default_llm,
    company=settings.DEFAULT_COMPANY,
    role=settings.DEFAULT_ROLE,
    level=settings.DEFAULT_LEVEL,
)
_hr_agent = HRInterviewAgent(
    default_llm,
    company=settings.DEFAULT_COMPANY,
    level=settings.DEFAULT_LEVEL,
)


def _get_service(db: Session) -> InterviewService:
    return InterviewService(_tech_agent, _hr_agent, InterviewRepository(db))


# ── Start session ─────────────────────────────────────────────────
@router.post("/start")
def start_interview(resume: ResumeContext = ResumeContext(), db: Session = Depends(get_db)):
    return _get_service(db).start_session(resume)


# ── Tech question ─────────────────────────────────────────────────
@router.post("/tech")
def tech_interview(request: Request, answer: str, db: Session = Depends(get_db)):
    return {"question": _get_service(db).ask_tech(answer)}


# ── HR question ───────────────────────────────────────────────────
@router.post("/hr")
def hr_interview(request: Request, answer: str, db: Session = Depends(get_db)):
    return {"question": _get_service(db).ask_hr(answer)}


# ── Voice tech (legacy compatibility) ────────────────────────────
@router.post("/voice/tech")
async def voice_tech(request: Request, text: str, db: Session = Depends(get_db)):
    return {"reply": _get_service(db).ask_tech(text)}


# ── Stop session ──────────────────────────────────────────────────
@router.post("/stop")
def stop_interview():
    return {"message": "Interview stopped"}


# ── Feedback ──────────────────────────────────────────────────────
@router.post("/feedback")
def interview_feedback(
    request: Request,
    db:           Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = _get_service(db).generate_feedback(current_user.id)
    return {"feedback": result}


# ── History ───────────────────────────────────────────────────────
@router.get("/history")
def interview_history(
    request: Request,
    db:           Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return InterviewRepository(db).find_by_user_id(current_user.id)


# ── TTS Speak ─────────────────────────────────────────────────────
@router.post("/speak")
async def speak(request: Request, text: str):
    try:
        audio_bytes = text_to_speech(text)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")