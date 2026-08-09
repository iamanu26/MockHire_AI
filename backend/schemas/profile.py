# schemas/profile.py — Pydantic models for profile routes
from pydantic import BaseModel
from typing import Optional


class UpdateProfileRequest(BaseModel):
    name:    Optional[str] = None
    bio:     Optional[str] = None
    college: Optional[str] = None
    role:    Optional[str] = None