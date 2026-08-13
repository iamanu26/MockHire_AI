# services/profile_service.py — Profile business logic
# SOLID: SRP — profile management only
import base64
from fastapi import HTTPException, UploadFile
from models.user import User
from repositories.user_repository import UserRepository
from repositories.interview_repository import InterviewRepository
from schemas.profile import UpdateProfileRequest


class ProfileService:
    """Handles all profile-related business logic."""

    def __init__(self, user_repo: UserRepository, interview_repo: InterviewRepository):
        self.user_repo      = user_repo
        self.interview_repo = interview_repo

    def get_profile(self, user: User) -> dict:
        results        = self.interview_repo.find_by_user_id(user.id)
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

        return {
            "id":             user.id,
            "name":           user.name,
            "email":          user.email,
            "avatar_url":     user.avatar_url,
            "bio":            user.bio,
            "college":        user.college,
            "role":           user.role_title,
            "is_google_user": bool(user.google_id),
            "stats": {
                "total_sessions": total_sessions,
                "avg_overall":    avg_overall,
                "best_overall":   best_overall,
            },
            "history":        history,
            "recommendation": self._generate_recommendation(results),
        }

    def update_profile(self, user: User, data: UpdateProfileRequest) -> User:
        if data.name    is not None: user.name       = data.name.strip()
        if data.bio     is not None: user.bio        = data.bio.strip()
        if data.college is not None: user.college    = data.college.strip()
        if data.role    is not None: user.role_title = data.role.strip()
        return self.user_repo.update(user)

    async def update_avatar(self, user: User, file: UploadFile) -> str:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
        content = await file.read()
        if len(content) > 3 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image must be under 3MB.")
        b64      = base64.b64encode(content).decode("utf-8")
        data_url = f"data:{file.content_type};base64,{b64}"
        user.avatar_url = data_url
        self.user_repo.update(user)
        return data_url

    @staticmethod
    def _generate_recommendation(results) -> dict:
        if not results:
            return {
                "message": "Complete your first interview session to get personalized recommendations.",
                "focus":   "Start practicing",
                "tip":     "Begin with an HR interview to get comfortable with the platform."
            }
        n = len(results)
        avgs = {
            "Communication": sum(r.communication or 0 for r in results) / n,
            "Confidence":    sum(r.confidence    or 0 for r in results) / n,
            "Technical":     sum(r.technical     or 0 for r in results) / n,
            "Grammar":       sum(r.grammar       or 0 for r in results) / n,
        }
        weakest       = min(avgs, key=avgs.get)
        weakest_score = round(avgs[weakest], 1)
        tips = {
            "Communication": {"message": f"Communication averages {weakest_score}/10.", "focus": "Communication", "tip": "Use the STAR method for every answer."},
            "Confidence":    {"message": f"Confidence averages {weakest_score}/10.",    "focus": "Confidence",    "tip": "Avoid filler words. State answers directly."},
            "Technical":     {"message": f"Technical averages {weakest_score}/10.",     "focus": "Technical",     "tip": "Practice DSA daily using the DSA Practice tab."},
            "Grammar":       {"message": f"Grammar averages {weakest_score}/10.",       "focus": "Grammar",       "tip": "Slow down when speaking. Think before answering."},
        }
        return tips[weakest]