from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id                   = Column(Integer, primary_key=True, index=True)
    name                 = Column(String(255), nullable=False)
    email                = Column(String(255), unique=True, index=True, nullable=False)
    password             = Column(String(255), nullable=True)   # nullable for Google-only users

    # ── Profile fields ──────────────────────────────────────────────────
    bio                  = Column(String(500), nullable=True)
    college              = Column(String(255), nullable=True)
    role_title           = Column(String(255), nullable=True)

    # ── Email verification ──────────────────────────────────────────────
    is_verified          = Column(Boolean, default=False, nullable=False)
    verify_token         = Column(String(64), nullable=True)

    # ── Password reset ──────────────────────────────────────────────────
    reset_token          = Column(String(64), nullable=True)
    reset_token_expires  = Column(DateTime, nullable=True)

    # ── Google OAuth ────────────────────────────────────────────────────
    google_id            = Column(String(128), nullable=True, unique=True)
    avatar_url           = Column(String(512), nullable=True)

    # ── Timestamps ──────────────────────────────────────────────────────
    created_at           = Column(DateTime, default=datetime.utcnow)

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
    summary       = Column(Text)

    created_at    = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")