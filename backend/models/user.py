# models/user.py — User database model
# SOLID: SRP — only defines the User table structure
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String(255), nullable=False)
    email               = Column(String(255), unique=True, index=True, nullable=False)
    password            = Column(String(255), nullable=True)   # nullable for Google-only users

    # ── Profile ─────────────────────────────────────────────────
    bio                 = Column(String(500), nullable=True)
    college             = Column(String(255), nullable=True)
    role_title          = Column(String(255), nullable=True)
    avatar_url          = Column(String(512), nullable=True)

    # ── Email verification ───────────────────────────────────────
    is_verified         = Column(Boolean, default=False, nullable=False)
    verify_token        = Column(String(64), nullable=True)

    # ── Password reset ───────────────────────────────────────────
    reset_token         = Column(String(64), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    # ── Google OAuth ─────────────────────────────────────────────
    google_id           = Column(String(128), nullable=True, unique=True)

    # ── Timestamps ───────────────────────────────────────────────
    created_at          = Column(DateTime, default=datetime.utcnow)

    interviews = relationship(
        "InterviewResult",
        back_populates="user",
        cascade="all, delete"
    )
    sessions = relationship(
        "InterviewSession",
        back_populates="user",
        cascade="all, delete"
    )