# models/interview_session.py — Interview session database model
# SOLID: SRP — only defines the InterviewSession table structure
import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id             = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    interview_type = Column(String(32), default="tech")
    company        = Column(String(128), nullable=True)
    role           = Column(String(128), nullable=True)
    level          = Column(String(64), nullable=True)
    status         = Column(String(32), default="in_progress")  # "in_progress", "completed", "stopped"
    resume_context = Column(JSON, nullable=True)
    history        = Column(JSON, default=list)  # [{"role": "...", "content": "..."}]
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
