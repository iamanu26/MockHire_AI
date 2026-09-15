# services/interview_service.py — Interview session business logic
# SOLID: SRP — interview session management only
# SOLID: DIP — depends on BaseInterviewAgent, InterviewRepository, and SessionRepository abstractions
import json, re
from typing import Optional
from fastapi import HTTPException
from agents.base_agent import BaseInterviewAgent
from agents.agent_factory import AgentFactory
from llm.llm_factory import default_llm
from core.config import settings
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

    def _get_agent(self, session: InterviewSession, default_type: str = "tech") -> BaseInterviewAgent:
        """Dynamically build agent strategy configured for the session's company, role, and level."""
        interview_type = session.interview_type or default_type
        ctx = session.resume_context or {}
        company = getattr(session, "company", None) or ctx.get("target_company") or settings.DEFAULT_COMPANY
        role    = getattr(session, "role", None) or ctx.get("target_role") or settings.DEFAULT_ROLE
        level   = getattr(session, "level", None) or ctx.get("target_level") or settings.DEFAULT_LEVEL

        try:
            llm_client = getattr(self.tech_agent, "llm", None) or getattr(self.hr_agent, "llm", None) or default_llm
            return AgentFactory.create(
                interview_type=interview_type,
                llm=llm_client,
                company=company,
                role=role,
                level=level,
            )
        except Exception:
            return self.tech_agent if interview_type == "tech" else self.hr_agent

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
        company: Optional[str] = None,
        role: Optional[str] = None,
        level: Optional[str] = None,
    ) -> dict:
        """Create an isolated session in the DB for the authenticated user with custom company/role/level."""
        target_company = (company or "").strip() or settings.DEFAULT_COMPANY
        target_role    = (role or "").strip()    or settings.DEFAULT_ROLE
        target_level   = (level or "").strip()   or settings.DEFAULT_LEVEL

        ctx = resume.dict() if any([
            resume.name, resume.skills, resume.projects, resume.summary
        ]) else {}

        ctx["target_company"] = target_company
        ctx["target_role"]    = target_role
        ctx["target_level"]   = target_level

        session = self.session_repo.create_session(
            user_id=user_id,
            interview_type=interview_type,
            company=target_company,
            role=target_role,
            level=target_level,
            resume_context=ctx if ctx else None,
        )
        return {
            "message": "Session started",
            "session_id": session.id,
            "has_resume": any([resume.name, resume.skills, resume.projects, resume.summary]),
            "company": target_company,
            "role": target_role,
            "level": target_level,
            "interview_type": interview_type,
            "initial_message": f"Welcome! We are ready to begin your {target_company} {target_role} ({target_level} level) interview. Please introduce yourself to get started.",
        }

    def ask_tech(
        self,
        answer: str,
        user_id: int,
        session_id: Optional[str] = None,
    ) -> str:
        session = self._resolve_session(user_id=user_id, session_id=session_id, interview_type="tech")
        agent = self._get_agent(session, default_type="tech")

        history_list = session.history or []
        num_exchanges = len(history_list) // 2
        max_q = settings.MAX_INTERVIEW_QUESTIONS

        # If already at or past the question limit, conclude immediately
        if num_exchanges >= max_q:
            closing = (
                "Thank you for your time today! That concludes our technical interview questions. "
                "Your responses have been recorded and your detailed performance analysis is ready."
            )
            self.session_repo.append_exchange(session, user_message=answer, assistant_message=closing)
            return closing

        # Sliding Window: Pass only the last 6 messages (3 Q&A pairs) to LLM
        # Keeps prompt token size small (<1000 tokens) and latency under 0.5s
        recent_history = history_list[-6:]
        wrap_up = (num_exchanges + 1 >= max_q)

        reply = agent.ask(
            user_answer=answer,
            history=recent_history,
            resume_context=session.resume_context,
            wrap_up=wrap_up,
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
        agent = self._get_agent(session, default_type="hr")

        history_list = session.history or []
        num_exchanges = len(history_list) // 2
        max_q = settings.MAX_INTERVIEW_QUESTIONS

        # If already at or past the question limit, conclude immediately
        if num_exchanges >= max_q:
            closing = (
                "Thank you for your time today! That concludes our HR interview questions. "
                "Your responses have been recorded and your detailed performance analysis is ready."
            )
            self.session_repo.append_exchange(session, user_message=answer, assistant_message=closing)
            return closing

        # Sliding Window: Pass only the last 6 messages (3 Q&A pairs) to LLM
        recent_history = history_list[-6:]
        wrap_up = (num_exchanges + 1 >= max_q)

        reply = agent.ask(
            user_answer=answer,
            history=recent_history,
            resume_context=session.resume_context,
            wrap_up=wrap_up,
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

        agent = self._get_agent(session, session.interview_type or "tech")
        raw = agent.generate_feedback_prompt(session.history)
        feedback = self._extract_json(raw)

        result = InterviewResult(
            user_id=user_id,
            communication=self._parse_score(feedback.get("communication", 5)),
            confidence=self._parse_score(feedback.get("confidence", 5)),
            technical=self._parse_score(feedback.get("technical", 5)),
            grammar=self._parse_score(feedback.get("grammar", 5)),
            overall=self._parse_score(feedback.get("overall", 5)),
            summary=feedback.get("summary", "Interview session completed."),
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
    def _extract_json(raw: str) -> dict:
        """Safely extract JSON from LLM output, handling markdown blocks and extra text."""
        # 1. Clean markdown code blocks
        cleaned = re.sub(r"```(?:json)?", "", raw).strip("` \n")
        try:
            return json.loads(cleaned)
        except Exception:
            pass

        # 2. Look for outermost curly braces
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned[start : end + 1])
            except Exception:
                pass

        # 3. Fallback regex extraction of key fields
        result = {}
        for key in ["communication", "confidence", "technical", "grammar", "overall"]:
            match = re.search(rf'"{key}"\s*:\s*(\d+)', raw, re.IGNORECASE)
            result[key] = int(match.group(1)) if match else 5

        summary_match = re.search(r'"summary"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', raw, re.IGNORECASE)
        result["summary"] = summary_match.group(1) if summary_match else "Interview evaluated based on conversation transcript."
        return result

    @staticmethod
    def _parse_score(val) -> int:
        if isinstance(val, int):   return val
        if isinstance(val, float): return int(round(val))
        match = re.search(r"(\d+(?:\.\d+)?)", str(val))
        return int(round(float(match.group(1)))) if match else 0