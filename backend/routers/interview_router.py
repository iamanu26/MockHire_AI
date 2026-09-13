# routers/interview_router.py — Interview HTTP endpoints (thin controllers)
# SOLID: SRP — only HTTP concerns, all logic delegated to InterviewService
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.user import User
from repositories.interview_repository import InterviewRepository
from repositories.session_repository import SessionRepository
from services.interview_service import InterviewService
from agents.tech_agent import TechnicalInterviewAgent
from agents.hr_agent import HRInterviewAgent
from llm.llm_factory import default_llm
from schemas.interview import ResumeContext, StartSessionRequest
from core.config import settings
from text_to_speech import text_to_speech

router = APIRouter(prefix="/interview", tags=["Interview"])

# ── Stateless agent strategies (fallback / legacy LLM clients) ──
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
    return InterviewService(
        _tech_agent,
        _hr_agent,
        InterviewRepository(db),
        SessionRepository(db),
    )


def _resolve_session_id(request: Request, session_id: Optional[str] = None) -> Optional[str]:
    """Extract session ID from explicit param, header, or query param."""
    return session_id or request.headers.get("X-Session-ID") or request.query_params.get("session_id")


# ── Start session (Requires Auth) ─────────────────────────────────
@router.post("/start")
def start_interview(
    request: Request,
    payload: Optional[StartSessionRequest] = None,
    interview_type: str = "tech",
    company: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    body_payload = payload or StartSessionRequest()
    final_type = body_payload.interview_type or interview_type
    final_company = company or body_payload.company or settings.DEFAULT_COMPANY
    final_role = role or body_payload.role or settings.DEFAULT_ROLE
    final_level = level or body_payload.level or settings.DEFAULT_LEVEL

    # Resolve resume context safely
    if body_payload.resume:
        resume_ctx = body_payload.resume
    else:
        resume_ctx = ResumeContext(
            name=body_payload.name or "",
            level=final_level,
            years_of_experience=body_payload.years_of_experience or 0,
            current_role=body_payload.current_role or "",
            skills=body_payload.skills or [],
            projects=body_payload.projects or [],
            education=body_payload.education or "",
            companies=body_payload.companies or [],
            summary=body_payload.summary or "",
        )

    return _get_service(db).start_session(
        resume=resume_ctx,
        user_id=current_user.id,
        interview_type=final_type,
        company=final_company,
        role=final_role,
        level=final_level,
    )


# ── Tech question (Requires Auth) ─────────────────────────────────
@router.post("/tech")
def tech_interview(
    request: Request,
    answer: str,
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s_id = _resolve_session_id(request, session_id)
    return {"question": _get_service(db).ask_tech(answer, user_id=current_user.id, session_id=s_id)}


# ── HR question (Requires Auth) ───────────────────────────────────
@router.post("/hr")
def hr_interview(
    request: Request,
    answer: str,
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s_id = _resolve_session_id(request, session_id)
    return {"question": _get_service(db).ask_hr(answer, user_id=current_user.id, session_id=s_id)}


# ── Voice tech (Requires Auth) ────────────────────────────────────
@router.post("/voice/tech")
async def voice_tech(
    request: Request,
    text: str,
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s_id = _resolve_session_id(request, session_id)
    return {"reply": _get_service(db).ask_tech(text, user_id=current_user.id, session_id=s_id)}


# ── Stop session (Requires Auth) ──────────────────────────────────
@router.post("/stop")
def stop_interview(
    request: Request,
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s_id = _resolve_session_id(request, session_id)
    return _get_service(db).stop_session(user_id=current_user.id, session_id=s_id)


# ── Feedback (Requires Auth) ──────────────────────────────────────
@router.post("/feedback")
def interview_feedback(
    request: Request,
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s_id = _resolve_session_id(request, session_id)
    result = _get_service(db).generate_feedback(current_user.id, session_id=s_id)
    return {"feedback": result}


# ── History (Requires Auth) ───────────────────────────────────────
@router.get("/history")
def interview_history(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return InterviewRepository(db).find_by_user_id(current_user.id)


# ── TTS Speak (Requires Auth) ─────────────────────────────────────
@router.post("/speak")
async def speak(
    request: Request,
    text: str,
    current_user: User = Depends(get_current_user),
):
    try:
        audio_bytes = text_to_speech(text)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")