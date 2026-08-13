# routers/profile_router.py — Profile HTTP endpoints (thin controllers)
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from repositories.user_repository import UserRepository
from repositories.interview_repository import InterviewRepository
from services.profile_service import ProfileService
from schemas.profile import UpdateProfileRequest

router = APIRouter(prefix="/profile", tags=["Profile"])


def _get_service(db: Session) -> ProfileService:
    return ProfileService(UserRepository(db), InterviewRepository(db))


@router.get("/me")
def get_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return _get_service(db).get_profile(current_user)


@router.patch("/update")
def update_profile(
    data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _get_service(db).update_profile(current_user, data)
    return {"message": "Profile updated successfully"}


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    avatar_url = await _get_service(db).update_avatar(current_user, file)
    return {"message": "Avatar updated", "avatar_url": avatar_url}