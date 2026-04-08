import json
import re
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
import io
from schemas import RegisterRequest, LoginRequest
from fastapi.middleware.cors import CORSMiddleware
from interview_agent import InterviewAgent
from sqlalchemy.orm import Session
from database import Base, engine
from models import User, InterviewResult
from auth import get_db, hash_password, verify_password, create_access_token, get_current_user
from text_to_speech import text_to_speech
from dsa_routes import router as dsa_router

#  headers for rates and limits
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create limiter — identifies users by IP
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mock-hire-ai-bay.vercel.app",
        "https://mock-hire-ai-git-main-anurag-dubeys-projects-7936ebb6.vercel.app",
        "https://mock-hire-hxb6cts9m-anurag-dubeys-projects-7936ebb6.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dsa_router)

# Single shared agent instance used everywhere
agent = InterviewAgent(
    company="Product Based",
    role="Software Engineer",
    level="Intermediate"
)

@app.post("/interview/speak")
@limiter.limit("10/minute")
async def speak(request: Request, text: str):
    """
    Convert AI question text to XTTS-v2 speech.
    Returns WAV audio stream that the frontend plays directly.
    """
    try:
        audio_bytes = text_to_speech(text)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@app.post("/interview/start")
def start_interview():
    """Call this at the beginning of every new session to wipe old history."""
    agent.history = []
    return {"message": "Session started, history cleared"}

@app.post("/interview/hr")
@limiter.limit("10/minute")
def hr_interview(request: Request, answer: str):
    response = agent.hr_interviewer(answer)
    return {"question": response}

@app.post("/interview/tech")
@limiter.limit("10/minute")
def tech_interview(request: Request, answer: str):
    response = agent.tech_interviewer(answer)
    return {"question": response}

@app.post("/interview/voice/tech")
async def voice_tech_interview(text: str):
    ai_text = agent.tech_interviewer(text)
    return {"reply": ai_text}

# Auth routes
@app.post("/auth/register")
@limiter.limit("5/minute")
def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(name=data.name, email=data.email, password=hash_password(data.password))
    db.add(user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/auth/login")
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}

@app.post("/interview/stop")
def stop_interview():
    return {"message": "Interview stopped"}

@app.post("/interview/feedback")
@limiter.limit("10/minute")
def interview_feedback(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not agent.history:
        raise HTTPException(status_code=400, detail="No interview session found. Please complete an interview first.")

    raw_feedback = agent.generate_feedback()

    # Strip markdown code fences before parsing JSON
    cleaned = re.sub(r"```(?:json)?", "", raw_feedback).strip().rstrip("```").strip()

    try:
        feedback = json.loads(cleaned)
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid feedback format from AI. Please try again.")

    # Parse scores safely — handles "7/10", "7", 7, "7.5/10"
    def parse_score(val) -> int:
        if isinstance(val, int):
            return val
        if isinstance(val, float):
            return int(round(val))
        s = str(val).strip()
        match = re.search(r"(\d+(?:\.\d+)?)", s)
        if match:
            return int(round(float(match.group(1))))
        return 0

    result = InterviewResult(
        user_id=current_user.id,
        communication=parse_score(feedback.get("communication", 0)),
        confidence=parse_score(feedback.get("confidence", 0)),
        technical=parse_score(feedback.get("technical", 0)),
        grammar=parse_score(feedback.get("grammar", 0)),
        overall=parse_score(feedback.get("overall", 0)),
        summary=feedback.get("summary", "No summary provided."),
    )

    db.add(result)
    db.commit()

    # Clear history after saving
    agent.history = []

    return {"feedback": {
        "communication": result.communication,
        "confidence":    result.confidence,
        "technical":     result.technical,
        "grammar":       result.grammar,
        "overall":       result.overall,
        "summary":       result.summary,
    }}

@app.get("/interview/history")
@limiter.limit("30/minute")
def interview_history(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = (
        db.query(InterviewResult)
        .filter(InterviewResult.user_id == current_user.id)
        .order_by(InterviewResult.created_at.desc())
        .all()
    )
    return results

@app.get("/health")
def health():
    return {"status": "ok"}