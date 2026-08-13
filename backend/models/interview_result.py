# models/interview_result.py — Interview result database model
# SOLID: SRP — only defines the InterviewResult table structure
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base


class InterviewResult(Base):
    __tablename__ = "interview_results"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    communication = Column(Integer, default=0)
    confidence    = Column(Integer, default=0)
    technical     = Column(Integer, default=0)
    grammar       = Column(Integer, default=0)
    overall       = Column(Integer, default=0)
    summary       = Column(Text)

    created_at    = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")