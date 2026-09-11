# core/config.py — Single source of truth for all environment settings
# SOLID: SRP — all config in one place, not scattered across files
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """
    All environment variables in one place.
    DIP: High-level modules depend on this abstraction, not on os.getenv() directly.
    """

    # ── Database ────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # ── JWT ─────────────────────────────────────────────────────
    SECRET_KEY: str                  = os.getenv("SECRET_KEY", "change-this-in-production")
    ALGORITHM: str                   = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7   # 7 days
    RESET_TOKEN_EXPIRE_MINUTES: int  = 15

    # ── AI / LLM ────────────────────────────────────────────────
    GROQ_API_KEY: str  = os.getenv("GROQ_API_KEY", "")
    GROQ_URL: str      = "https://api.groq.com/openai/v1/chat/completions"
    GROQ_MODEL: str    = "openai/gpt-oss-20b" 
    GROQ_TIMEOUT: int  = 120

    HF_API_KEY: str    = os.getenv("HF_API_KEY", "")
    TTS_API: str       = "https://router.huggingface.co/hf-inference/models/coqui/XTTS-v2"

    # ── Google OAuth ────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str     = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # ── URLs ────────────────────────────────────────────────────
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str  = os.getenv("BACKEND_URL",  "http://localhost:8000")

    # ── Email ───────────────────────────────────────────────────
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")

    # ── Interview defaults ──────────────────────────────────────
    DEFAULT_COMPANY: str = "Product Based"
    DEFAULT_ROLE: str    = "Software Engineer"
    DEFAULT_LEVEL: str   = "Intermediate"


# Single shared instance — import this everywhere
settings = Settings()