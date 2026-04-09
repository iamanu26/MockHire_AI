from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)

    interviews = relationship(
        "InterviewResult",
        back_populates="user",
        cascade="all, delete"
    )


class InterviewResult(Base):
    __tablename__ = "interview_results"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    communication = Column(Integer, default=0)
    confidence    = Column(Integer, default=0)
    technical     = Column(Integer, default=0)
    grammar       = Column(Integer, default=0)
    overall       = Column(Integer, default=0)
    summary       = Column(Text)              # Text instead of String — no length limit

    created_at    = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")