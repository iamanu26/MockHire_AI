# services/auth_service.py — All auth business logic
# SOLID: SRP — auth logic only, no HTTP, no DB queries directly
# SOLID: DIP — depends on UserRepository abstraction
from datetime import datetime
from fastapi import HTTPException
from models.user import User
from repositories.user_repository import UserRepository
from core.security import (
    hash_password, verify_password, create_access_token,
    generate_verify_token, generate_reset_token, reset_token_expiry,
)
from schemas.auth import RegisterRequest, LoginRequest


class AuthService:
    """
    Handles all authentication business logic.
    Routes become thin — they just call AuthService methods.
    """

    def __init__(self, user_repo: UserRepository):
        self.repo = user_repo

    # ── Register ─────────────────────────────────────────────────
    def register(self, data: RegisterRequest) -> tuple[User, str]:
        """Create user. Returns (user, verify_token)."""
        if self.repo.find_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email already registered.")
        token = generate_verify_token()
        user  = User(
            name=data.name,
            email=data.email,
            password=hash_password(data.password),
            is_verified=False,
            verify_token=token,
        )
        return self.repo.save(user), token

    # ── Verify email ─────────────────────────────────────────────
    def verify_email(self, token: str) -> bool:
        user = self.repo.find_by_verify_token(token)
        if not user:
            return False
        user.is_verified  = True
        user.verify_token = None
        self.repo.update(user)
        return True

    # ── Login ────────────────────────────────────────────────────
    def login(self, data: LoginRequest) -> dict:
        user = self.repo.find_by_email(data.email)
        if not user or not user.password:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        if not verify_password(data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="Email not verified. Please check your inbox.")
        token = create_access_token({"user_id": user.id})
        return {
            "access_token": token,
            "token_type":   "bearer",
            "user": {
                "id":         user.id,
                "name":       user.name,
                "email":      user.email,
                "avatar_url": user.avatar_url,
            }
        }

    # ── Resend verification ───────────────────────────────────────
    def resend_verification(self, email: str) -> bool:
        user = self.repo.find_by_email(email)
        if not user or user.is_verified:
            return False
        token             = generate_verify_token()
        user.verify_token = token
        self.repo.update(user)
        return True

    # ── Forgot password ───────────────────────────────────────────
    def forgot_password(self, email: str) -> tuple[User, str] | None:
        user = self.repo.find_by_email(email)
        if not user or not user.password:
            return None
        token                    = generate_reset_token()
        user.reset_token         = token
        user.reset_token_expires = reset_token_expiry()
        self.repo.update(user)
        return user, token

    # ── Reset password ────────────────────────────────────────────
    def reset_password(self, token: str, new_password: str) -> User:
        user = self.repo.find_by_reset_token(token)
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
        if user.reset_token_expires < datetime.utcnow():
            user.reset_token = None; user.reset_token_expires = None
            self.repo.update(user)
            raise HTTPException(status_code=400, detail="Reset link has expired.")
        user.password            = hash_password(new_password)
        user.reset_token         = None
        user.reset_token_expires = None
        user.is_verified         = True
        return self.repo.update(user)

    # ── Google OAuth ──────────────────────────────────────────────
    def find_or_create_google_user(
        self, google_id: str, email: str, name: str, avatar_url: str
    ) -> User:
        user = self.repo.find_by_email(email)
        if user:
            if not user.google_id:
                user.google_id  = google_id
                user.avatar_url = avatar_url
            user.is_verified = True
            return self.repo.update(user)
        new_user = User(
            name=name, email=email, google_id=google_id,
            avatar_url=avatar_url, is_verified=True, password=None,
        )
        return self.repo.save(new_user)