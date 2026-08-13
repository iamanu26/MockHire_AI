# routers/auth_router.py — Auth HTTP endpoints (thin controllers)
# SOLID: SRP — only HTTP concerns, all logic in AuthService
# Routes are 3-5 lines each — they validate input, call service, return response
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import create_access_token, get_current_user
from core.config import settings
from repositories.user_repository import UserRepository
from services.auth_service import AuthService
from email_utils import send_verification_email, send_reset_email
from schemas.auth import RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


def _get_service(db: Session) -> AuthService:
    """Dependency injection helper — builds service with its dependencies."""
    return AuthService(UserRepository(db))


# ── Register ─────────────────────────────────────────────────────
@router.post("/register")
async def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    service      = _get_service(db)
    user, token  = service.register(data)
    await send_verification_email(user.email, user.name, token)
    return {"message": "Account created! Please check your email to verify before logging in."}


# ── Verify email ──────────────────────────────────────────────────
@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    service = _get_service(db)
    success = service.verify_email(token)
    if not success:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=invalid-token")
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?verified=true")


# ── Login ─────────────────────────────────────────────────────────
@router.post("/login")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    return _get_service(db).login(data)


# ── Resend verification ───────────────────────────────────────────
@router.post("/resend-verification")
async def resend_verification(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = _get_service(db)
    sent    = service.resend_verification(data.email)
    if sent:
        user = service.repo.find_by_email(data.email)
        await send_verification_email(user.email, user.name, user.verify_token)
    return {"message": "If that email exists and is unverified, we've sent a new link."}


# ── Forgot password ───────────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    result = _get_service(db).forgot_password(data.email)
    if result:
        user, token = result
        await send_reset_email(user.email, user.name, token)
    return {"message": "If an account with that email exists, you'll receive a reset link shortly."}


# ── Reset password ────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    _get_service(db).reset_password(data.token, data.new_password)
    return {"message": "Password updated successfully."}


# ── Google OAuth step 1: redirect ────────────────────────────────
@router.get("/google")
def google_login():
    params = (
        f"client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.BACKEND_URL}/auth/google/callback"
        f"&response_type=code&scope=openid email profile&access_type=offline"
    )
    return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


# ── Google OAuth step 2: callback ────────────────────────────────
@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code":          code,
                "client_id":     settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri":  f"{settings.BACKEND_URL}/auth/google/callback",
                "grant_type":    "authorization_code",
            },
        )
        token_data = token_res.json()
        if "error" in token_data:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google-failed")

        userinfo_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        g = userinfo_res.json()

    if not g.get("email"):
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google-no-email")

    service   = _get_service(db)
    user      = service.find_or_create_google_user(g["sub"], g["email"], g.get("name","User"), g.get("picture"))
    jwt_token = create_access_token({"user_id": user.id})
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}")


# ── Me ────────────────────────────────────────────────────────────
@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {
        "id":         current_user.id,
        "name":       current_user.name,
        "email":      current_user.email,
        "avatar_url": current_user.avatar_url,
    }