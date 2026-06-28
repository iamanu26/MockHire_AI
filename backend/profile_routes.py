# profile_routes.py — User profile management
import os, io, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from auth import get_current_user, get_db
from models import User, InterviewResult
from typing import Optional

router = APIRouter(prefix="/profile", tags=["Profile"])

# ── Schemas ───────────────────────────────────────────────────────
class UpdateProfileRequest(BaseModel):
    name:     Optional[str] = None
    bio:      Optional[str] = None
    college:  Optional[str] = None
    role:     Optional[str] = None

# ── GET /profile/me ───────────────────────────────────────────────
@router.get("/me")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return full user profile + interview history with AI feedback."""
    results = (
        db.query(InterviewResult)
        .filter(InterviewResult.user_id == current_user.id)
        .order_by(InterviewResult.created_at.desc())
        .all()
    )

    # Build stats
    total_sessions = len(results)
    avg_overall    = round(sum(r.overall or 0 for r in results) / total_sessions, 1) if total_sessions else 0
    best_overall   = max((r.overall or 0 for r in results), default=0)

    history = [
        {
            "id":            r.id,
            "communication": r.communication,
            "confidence":    r.confidence,
            "technical":     r.technical,
            "grammar":       r.grammar,
            "overall":       r.overall,
            "summary":       r.summary,
            "created_at":    r.created_at.isoformat() if r.created_at else None,
        }
        for r in results
    ]

    # AI recommendation — based on weakest area across all sessions
    recommendation = _generate_recommendation(results)

    return {
        "id":             current_user.id,
        "name":           current_user.name,
        "email":          current_user.email,
        "avatar_url":     current_user.avatar_url,
        "bio":            getattr(current_user, "bio", None),
        "college":        getattr(current_user, "college", None),
        "role":           getattr(current_user, "role_title", None),
        "is_google_user": bool(getattr(current_user, "google_id", None)),
        "stats": {
            "total_sessions": total_sessions,
            "avg_overall":    avg_overall,
            "best_overall":   best_overall,
        },
        "history":         history,
        "recommendation":  recommendation,
    }


def _generate_recommendation(results):
    """Generate a simple AI recommendation based on weakest scores."""
    if not results:
        return {
            "message": "Complete your first interview session to get personalized recommendations.",
            "focus":   "Start practicing",
            "tip":     "Begin with an HR interview to get comfortable with the platform."
        }

    # Average each category
    n = len(results)
    avgs = {
        "Communication": sum(r.communication or 0 for r in results) / n,
        "Confidence":    sum(r.confidence    or 0 for r in results) / n,
        "Technical":     sum(r.technical     or 0 for r in results) / n,
        "Grammar":       sum(r.grammar       or 0 for r in results) / n,
    }
    weakest = min(avgs, key=avgs.get)
    weakest_score = round(avgs[weakest], 1)

    tips = {
        "Communication": {
            "message": f"Your communication scores average {weakest_score}/10. Focus on structuring your answers clearly.",
            "focus":   "Communication",
            "tip":     "Use the STAR method (Situation, Task, Action, Result) for every answer. Practice speaking in complete sentences."
        },
        "Confidence": {
            "message": f"Your confidence scores average {weakest_score}/10. You need to speak more assertively.",
            "focus":   "Confidence",
            "tip":     "Avoid filler words like 'um', 'maybe', 'I think'. State your answers directly and maintain a steady pace."
        },
        "Technical": {
            "message": f"Your technical scores average {weakest_score}/10. Deepen your core CS fundamentals.",
            "focus":   "Technical Knowledge",
            "tip":     "Practice DSA daily. Focus on arrays, trees, and dynamic programming. Use the DSA Practice tab."
        },
        "Grammar": {
            "message": f"Your grammar scores average {weakest_score}/10. Work on language clarity.",
            "focus":   "Grammar & Language",
            "tip":     "Slow down when speaking. Think before answering. Reading technical articles in English daily helps significantly."
        },
    }
    return tips[weakest]


# ── PATCH /profile/update ─────────────────────────────────────────
@router.patch("/update")
def update_profile(
    data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.name    is not None: current_user.name       = data.name.strip()
    if data.bio     is not None: current_user.bio        = data.bio.strip()
    if data.college is not None: current_user.college    = data.college.strip()
    if data.role    is not None: current_user.role_title = data.role.strip()
    db.commit()
    return {"message": "Profile updated successfully"}


# ── POST /profile/avatar ──────────────────────────────────────────
@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload profile picture for manual (non-Google) users."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    content = await file.read()
    if len(content) > 3 * 1024 * 1024:  # 3MB limit
        raise HTTPException(status_code=400, detail="Image must be under 3MB.")

    # Convert to base64 data URL for simple storage
    import base64
    b64 = base64.b64encode(content).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{b64}"

    current_user.avatar_url = data_url
    db.commit()
    return {"message": "Avatar updated", "avatar_url": data_url}