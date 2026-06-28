import json
import os
import re
from dotenv import load_dotenv
load_dotenv()

import httpx
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel
import io

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from schemas import RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from database import Base, engine
from models import User, InterviewResult
from auth import (
    get_db, hash_password, verify_password,
    create_access_token, get_current_user,
    generate_verify_token, generate_reset_token, reset_token_expiry,
)
from email_utils import send_verification_email, send_reset_email
from interview_agent import InterviewAgent
from text_to_speech import text_to_speech
from dsa_routes import router as dsa_router
from resume_routes import router as resume_router
from profile_routes import router as profile_router  # ← swapped from resources_route

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

limiter = Limiter(key_func=get_remote_address)
app     = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Base.metadata.create_all(bind=engine)

FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BACKEND_URL          = os.getenv("BACKEND_URL", "http://localhost:8000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dsa_router)
app.include_router(resume_router)
app.include_router(profile_router)  # ← swapped from resources_router

agent = InterviewAgent(
    company="Product Based",
    role="Software Engineer",
    level="Intermediate"
)


# ── AUTH ROUTES ──────────────────────────────────────────────────
@app.post("/auth/register")
@limiter.limit("5/minute")
async def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    from auth import generate_verify_token
    token = generate_verify_token()
    user  = User(
        name=data.name, email=data.email,
        password=hash_password(data.password),
        is_verified=False, verify_token=token,
    )
    db.add(user); db.commit()
    await send_verification_email(data.email, data.name, token)
    return {"message": "Account created! Please check your email to verify before logging in."}

@app.get("/auth/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verify_token == token).first()
    if not user:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=invalid-token")
    user.is_verified = True; user.verify_token = None; db.commit()
    return RedirectResponse(url=f"{FRONTEND_URL}/login?verified=true")

@app.post("/auth/login")
@limiter.limit("10/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please check your inbox.")
    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url}}

@app.post("/auth/resend-verification")
@limiter.limit("3/minute")
async def resend_verification(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.is_verified:
        return {"message": "If that email exists and is unverified, we've sent a new link."}
    from auth import generate_verify_token
    token = generate_verify_token()
    user.verify_token = token; db.commit()
    await send_verification_email(user.email, user.name, token)
    return {"message": "If that email exists and is unverified, we've sent a new link."}

@app.post("/auth/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user and user.password:
        token = generate_reset_token()
        user.reset_token = token; user.reset_token_expires = reset_token_expiry(); db.commit()
        await send_reset_email(user.email, user.name, token)
    return {"message": "If an account with that email exists, you'll receive a reset link shortly."}

@app.post("/auth/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
    if user.reset_token_expires < datetime.utcnow():
        user.reset_token = None; user.reset_token_expires = None; db.commit()
        raise HTTPException(status_code=400, detail="Reset link has expired.")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    user.password = hash_password(data.new_password)
    user.reset_token = None; user.reset_token_expires = None; user.is_verified = True; db.commit()
    return {"message": "Password updated successfully."}

@app.get("/auth/google")
def google_login():
    params = (f"client_id={GOOGLE_CLIENT_ID}&redirect_uri={BACKEND_URL}/auth/google/callback"
              f"&response_type=code&scope=openid email profile&access_type=offline")
    return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}")

@app.get("/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": f"{BACKEND_URL}/auth/google/callback",
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()
        if "error" in token_data:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=google-failed")
        userinfo_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        google_user = userinfo_res.json()

    google_id  = google_user.get("sub")
    email      = google_user.get("email")
    name       = google_user.get("name", "User")
    avatar_url = google_user.get("picture")
    if not email:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=google-no-email")

    user = db.query(User).filter(User.email == email).first()
    if user:
        if not user.google_id: user.google_id = google_id; user.avatar_url = avatar_url
        user.is_verified = True; db.commit()
    else:
        user = User(name=name, email=email, google_id=google_id,
                    avatar_url=avatar_url, is_verified=True, password=None)
        db.add(user); db.commit(); db.refresh(user)

    jwt_token = create_access_token({"user_id": user.id})
    return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?token={jwt_token}")

@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name,
            "email": current_user.email, "avatar_url": current_user.avatar_url}


# ── INTERVIEW ROUTES ─────────────────────────────────────────────

class ResumeContext(BaseModel):
    name: str = ""
    level: str = "Intermediate"
    years_of_experience: int = 0
    current_role: str = ""
    skills: list = []
    projects: list = []
    education: str = ""
    companies: list = []
    summary: str = ""

@app.post("/interview/speak")
@limiter.limit("10/minute")
async def speak(request: Request, text: str):
    try:
        audio_bytes = text_to_speech(text)
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/wav",
                                 headers={"Content-Disposition": "inline; filename=speech.wav"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@app.post("/interview/start")
def start_interview(resume: ResumeContext = ResumeContext()):
    """Clear history and load resume context into agent if provided."""
    agent.history = []
    agent.resume_context = resume.dict() if any([
        resume.name, resume.skills, resume.projects, resume.summary
    ]) else None
    return {"message": "Session started", "has_resume": agent.resume_context is not None}

@app.post("/interview/hr")
@limiter.limit("10/minute")
def hr_interview(request: Request, answer: str):
    return {"question": agent.hr_interviewer(answer)}

@app.post("/interview/tech")
@limiter.limit("10/minute")
def tech_interview(request: Request, answer: str):
    return {"question": agent.tech_interviewer(answer)}

@app.post("/interview/voice/tech")
@limiter.limit("10/minute")
async def voice_tech_interview(request: Request, text: str):
    return {"reply": agent.tech_interviewer(text)}

@app.post("/interview/stop")
def stop_interview():
    return {"message": "Interview stopped"}

@app.post("/interview/feedback")
@limiter.limit("10/minute")
def interview_feedback(request: Request, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    if not agent.history:
        raise HTTPException(status_code=400, detail="No interview session found.")
    raw_feedback = agent.generate_feedback()
    cleaned = re.sub(r"```(?:json)?", "", raw_feedback).strip().rstrip("```").strip()
    try:
        feedback = json.loads(cleaned)
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid feedback format from AI.")

    def parse_score(val) -> int:
        if isinstance(val, int):   return val
        if isinstance(val, float): return int(round(val))
        match = re.search(r"(\d+(?:\.\d+)?)", str(val))
        return int(round(float(match.group(1)))) if match else 0

    result = InterviewResult(
        user_id=current_user.id,
        communication=parse_score(feedback.get("communication", 0)),
        confidence=parse_score(feedback.get("confidence", 0)),
        technical=parse_score(feedback.get("technical", 0)),
        grammar=parse_score(feedback.get("grammar", 0)),
        overall=parse_score(feedback.get("overall", 0)),
        summary=feedback.get("summary", "No summary provided."),
    )
    db.add(result); db.commit()
    agent.history = []
    return {"feedback": {"communication": result.communication, "confidence": result.confidence,
                         "technical": result.technical, "grammar": result.grammar,
                         "overall": result.overall, "summary": result.summary}}

@app.get("/interview/history")
@limiter.limit("30/minute")
def interview_history(request: Request, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    results = (db.query(InterviewResult)
               .filter(InterviewResult.user_id == current_user.id)
               .order_by(InterviewResult.created_at.desc()).all())
    return results

@app.get("/health")
def health():
    return {"status": "ok"}