# main.py — Application factory (ONLY registers routers and middleware)
# SOLID: SRP — main.py does ONE thing: wire everything together
# All business logic lives in services/, all DB queries in repositories/
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from core.config import settings
from core.database import init_db

# ── Import all models so SQLAlchemy creates tables ────────────────
from models.user import User                            # noqa: F401
from models.interview_result import InterviewResult     # noqa: F401
from models.interview_session import InterviewSession   # noqa: F401

# ── Import routers ────────────────────────────────────────────────
from routers.auth_router      import router as auth_router
from routers.interview_router import router as interview_router
from routers.dsa_router       import router as dsa_router
from routers.profile_router   import router as profile_router
from routers.resume_router    import router as resume_router
from routers.resources_router import router as resources_router


# ── App setup ─────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)
app     = FastAPI(title="MockHire AI API", version="2.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Initialize Database tables ────────────────────────────────────
init_db()

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(dsa_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(resources_router)


# ── Health check ──────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}