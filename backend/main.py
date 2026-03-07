import json
import re
from fastapi import FastAPI, Depends, HTTPException
from schemas import RegisterRequest, LoginRequest
from fastapi.middleware.cors import CORSMiddleware
from interview_agent import InterviewAgent
from sqlalchemy.orm import Session
from database import Base, engine
from models import User, InterviewResult
from auth import get_db, hash_password, verify_password, create_access_token, get_current_user

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ FIX 1: Single shared agent instance used everywhere
agent = InterviewAgent(
    company="Product Based",
    role="Software Engineer",
    level="Intermediate"
)

@app.post("/interview/start")
def start_interview():
    """Call this at the beginning of every new session to wipe old history."""
    agent.history = []
    return {"message": "Session started, history cleared"}

@app.post("/interview/hr")
def hr_interview(answer: str):
    response = agent.hr_interviewer(answer)
    return {"question": response}

@app.post("/interview/tech")
def tech_interview(answer: str):
    response = agent.tech_interviewer(answer)
    return {"question": response}

@app.post("/interview/voice/tech")
async def voice_tech_interview(text: str):
    ai_text = agent.tech_interviewer(text)
    return {"reply": ai_text}

# Auth routes
@app.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(name=data.name, email=data.email, password=hash_password(data.password))
    db.add(user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
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
def interview_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not agent.history:
        raise HTTPException(status_code=400, detail="No interview session found. Please complete an interview first.")

    raw_feedback = agent.generate_feedback()

    # ✅ FIX 2: Strip markdown code fences before parsing JSON
    cleaned = re.sub(r"```(?:json)?", "", raw_feedback).strip().rstrip("```").strip()

    try:
        feedback = json.loads(cleaned)
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid feedback format from AI. Please try again.")

    # ✅ FIX 2: Parse scores safely — handles "7/10", "7", 7, "7.5/10"
    def parse_score(val) -> int:
        if isinstance(val, int):
            return val
        if isinstance(val, float):
            return int(round(val))
        s = str(val).strip()
        # Extract first number from strings like "7/10" or "8.5/10"
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
def interview_history(
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