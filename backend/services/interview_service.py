# services/interview_service.py — Interview session business logic
# SOLID: SRP — interview session management only
# SOLID: DIP — depends on BaseInterviewAgent, InterviewRepository, and SessionRepository abstractions
import json, re
from typing import Optional
from fastapi import HTTPException
from agents.base_agent import BaseInterviewAgent
from repositories.interview_repository import InterviewRepository
from repositories.session_repository import SessionRepository
from models.interview_result import InterviewResult
from models.interview_session import InterviewSession
from schemas.interview import ResumeContext


class InterviewService:
    """
    Manages interview sessions: starting, asking, stopping, feedback generation.
    Routes call this — they know nothing about agents or DB directly.
    Session state is persisted in DB to prevent cross-user data leakage.
    """

    def __init__(
        self,
        tech_agent:     BaseInterviewAgent,
        hr_agent:       BaseInterviewAgent,
        interview_repo: InterviewRepository,
        session_repo:   SessionRepository,
    ):
        self.tech_agent     = tech_agent
        self.hr_agent       = hr_agent
        self.interview_repo = interview_repo
        self.session_repo   = session_repo

    def _resolve_session(
        self,
        user_id: int,
        session_id: Optional[str] = None,
        interview_type: str = "tech",
    ) -> InterviewSession:
        session = None
        if session_id:
            session = self.session_repo.find_by_id(session_id)
            if session and session.user_id and session.user_id != user_id:
                raise HTTPException(status_code=403, detail="Unauthorized access to interview session.")

        if not session:
            session = self.session_repo.find_latest_active_by_user_id(user_id)

        if not session:
            session = self.session_repo.create_session(
                user_id=user_id,
                interview_type=interview_type,
            )
        return session

    def start_session(
        self,
        resume: ResumeContext,
        user_id: int,
        interview_type: str = "tech",
    ) -> dict:
        """Create an isolated session in the DB for the authenticated user."""
        ctx = resume.dict() if any([
            resume.name, resume.skills, resume.projects, resume.summary
        ]) else None

        session = self.session_repo.create_session(
            user_id=user_id,
            interview_type=interview_type,
            resume_context=ctx,
        )
        return {
            "message": "Session started",
            "session_id": session.id,
            "has_resume": ctx is not None,
        }

    def ask_tech(
        self,
        answer: str,
        user_id: int,
        session_id: Optional[str] = None,
    ) -> str:
        session = self._resolve_session(user_id=user_id, session_id=session_id, interview_type="tech")
        reply = self.tech_agent.ask(
            user_answer=answer,
            history=session.history or [],
            resume_context=session.resume_context,
        )
        self.session_repo.append_exchange(session, user_message=answer, assistant_message=reply)
        return reply

    def ask_hr(
        self,
        answer: str,
        user_id: int,
        session_id: Optional[str] = None,
    ) -> str:
        session = self._resolve_session(user_id=user_id, session_id=session_id, interview_type="hr")
        reply = self.hr_agent.ask(
            user_answer=answer,
            history=session.history or [],
            resume_context=session.resume_context,
        )
        self.session_repo.append_exchange(session, user_message=answer, assistant_message=reply)
        return reply

    def stop_session(
        self,
        user_id: int,
        session_id: Optional[str] = None,
    ) -> dict:
        session = None
        if session_id:
            session = self.session_repo.find_by_id(session_id)
            if session and session.user_id and session.user_id != user_id:
                raise HTTPException(status_code=403, detail="Unauthorized access to interview session.")
        elif user_id:
            session = self.session_repo.find_latest_active_by_user_id(user_id)

        if session:
            self.session_repo.update_status(session, "stopped")
        return {"message": "Interview stopped"}

    def generate_feedback(
        self,
        user_id: int,
        session_id: Optional[str] = None,
    ) -> dict:
        """Generate AI feedback for the user's specific interview session."""
        session = None
        if session_id:
            session = self.session_repo.find_by_id(session_id)
            if session and session.user_id and session.user_id != user_id:
                raise HTTPException(status_code=403, detail="Unauthorized access to interview session.")

        if not session and user_id:
            session = self.session_repo.find_latest_active_by_user_id(user_id)

        if not session or not session.history:
            raise HTTPException(status_code=400, detail="No interview session found.")

        agent = self.tech_agent if session.interview_type == "tech" else self.hr_agent
        raw = agent.generate_feedback_prompt(session.history)
        cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()

        try:
            feedback = json.loads(cleaned)
        except Exception:
            raise HTTPException(status_code=500, detail="Invalid feedback format from AI.")

        result = InterviewResult(
            user_id=user_id,
            communication=self._parse_score(feedback.get("communication", 0)),
            confidence=self._parse_score(feedback.get("confidence", 0)),
            technical=self._parse_score(feedback.get("technical", 0)),
            grammar=self._parse_score(feedback.get("grammar", 0)),
            overall=self._parse_score(feedback.get("overall", 0)),
            summary=feedback.get("summary", "No summary provided."),
        )
        saved = self.interview_repo.save(result)

        # Mark session completed
        self.session_repo.update_status(session, "completed")

        return {
            "communication": saved.communication,
            "confidence":    saved.confidence,
            "technical":     saved.technical,
            "grammar":       saved.grammar,
            "overall":       saved.overall,
            "summary":       saved.summary,
        }

    @staticmethod
    def _parse_score(val) -> int:
        if isinstance(val, int):   return val
        if isinstance(val, float): return int(round(val))
        match = re.search(r"(\d+(?:\.\d+)?)", str(val))
        return int(round(float(match.group(1)))) if match else 0