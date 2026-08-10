# repositories/interview_repository.py — All InterviewResult DB queries
# SOLID: SRP — only interview result data access
from typing import Optional, List
from sqlalchemy.orm import Session
from models.interview_result import InterviewResult
from repositories.base import BaseRepository


class InterviewRepository(BaseRepository[InterviewResult]):
    """Encapsulates all DB operations for InterviewResult."""

    def find_by_id(self, id: int) -> Optional[InterviewResult]:
        return self.db.query(InterviewResult).filter(InterviewResult.id == id).first()

    def find_by_user_id(self, user_id: int) -> List[InterviewResult]:
        return (
            self.db.query(InterviewResult)
            .filter(InterviewResult.user_id == user_id)
            .order_by(InterviewResult.created_at.desc())
            .all()
        )

    def save(self, result: InterviewResult) -> InterviewResult:
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def delete(self, result: InterviewResult) -> None:
        self.db.delete(result)
        self.db.commit()