# repositories/session_repository.py — All InterviewSession DB queries
# SOLID: SRP — only interview session data access
# Pattern: Repository Pattern
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from models.interview_session import InterviewSession
from repositories.base import BaseRepository


class SessionRepository(BaseRepository[InterviewSession]):
    """Encapsulates all DB operations for InterviewSession."""

    def find_by_id(self, id: str) -> Optional[InterviewSession]:
        return self.db.query(InterviewSession).filter(InterviewSession.id == str(id)).first()

    def find_latest_active_by_user_id(self, user_id: int) -> Optional[InterviewSession]:
        return (
            self.db.query(InterviewSession)
            .filter(
                InterviewSession.user_id == user_id,
                InterviewSession.status == "in_progress",
            )
            .order_by(InterviewSession.created_at.desc())
            .first()
        )

    def create_session(
        self,
        user_id: Optional[int] = None,
        interview_type: str = "tech",
        resume_context: Optional[Dict[str, Any]] = None,
        company: Optional[str] = None,
        role: Optional[str] = None,
        level: Optional[str] = None,
    ) -> InterviewSession:
        session = InterviewSession(
            user_id=user_id,
            interview_type=interview_type,
            company=company,
            role=role,
            level=level,
            resume_context=resume_context,
            history=[],
            status="in_progress",
        )
        return self.save(session)

    def append_exchange(
        self,
        session: InterviewSession,
        user_message: str,
        assistant_message: str,
    ) -> InterviewSession:
        current_history = list(session.history or [])
        current_history.append({"role": "user", "content": user_message})
        current_history.append({"role": "assistant", "content": assistant_message})
        session.history = current_history
        flag_modified(session, "history")
        self.db.commit()
        self.db.refresh(session)
        return session

    def update_status(self, session: InterviewSession, status: str) -> InterviewSession:
        session.status = status
        self.db.commit()
        self.db.refresh(session)
        return session

    def save(self, entity: InterviewSession) -> InterviewSession:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, entity: InterviewSession) -> None:
        self.db.delete(entity)
        self.db.commit()
