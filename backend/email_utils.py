import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

conf = ConnectionConfig(
    MAIL_USERNAME    = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD    = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM        = os.getenv("MAIL_USERNAME"),
    MAIL_FROM_NAME   = "MockHire AI",
    MAIL_PORT        = 587,
    MAIL_SERVER      = "smtp.gmail.com",
    MAIL_STARTTLS    = True,
    MAIL_SSL_TLS     = False,
    USE_CREDENTIALS  = True,
    VALIDATE_CERTS   = True,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL  = os.getenv("BACKEND_URL",  "http://localhost:8000")


async def send_verification_email(email: str, name: str, token: str):
    link = f"{BACKEND_URL}/auth/verify?token={token}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center">
        <h1 style="margin:0;font-size:28px;letter-spacing:-1px">MockHire <span style="color:#a5f3fc">AI</span></h1>
        <p style="margin:8px 0 0;opacity:.8;font-size:14px">AI-Powered Interview Practice</p>
      </div>
      <div style="padding:36px 32px">
        <h2 style="margin:0 0 12px;font-size:22px">Hey {name}, verify your email</h2>
        <p style="color:#aaa;line-height:1.7;margin:0 0 28px">
          You're one step away from practising interviews with AI. Click the button below to verify your email address.
        </p>
        <a href="{link}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px">
          Verify my email →
        </a>
        <p style="color:#555;font-size:12px;margin:28px 0 0">
          This link will be invalidated after first use. If you didn't create an account, ignore this email.
        </p>
      </div>
    </div>
    """
    message = MessageSchema(
        subject    = "Verify your MockHire AI account",
        recipients = [email],
        body       = html,
        subtype    = MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_reset_email(email: str, name: str, token: str):
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center">
        <h1 style="margin:0;font-size:28px;letter-spacing:-1px">MockHire <span style="color:#a5f3fc">AI</span></h1>
        <p style="margin:8px 0 0;opacity:.8;font-size:14px">AI-Powered Interview Practice</p>
      </div>
      <div style="padding:36px 32px">
        <h2 style="margin:0 0 12px;font-size:22px">Reset your password, {name}</h2>
        <p style="color:#aaa;line-height:1.7;margin:0 0 28px">
          We received a request to reset your MockHire AI password. Click below to choose a new one. This link expires in <strong style="color:#fff">15 minutes</strong>.
        </p>
        <a href="{link}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px">
          Reset password →
        </a>
        <p style="color:#555;font-size:12px;margin:28px 0 0">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
      </div>
    </div>
    """
    message = MessageSchema(
        subject    = "Reset your MockHire AI password",
        recipients = [email],
        body       = html,
        subtype    = MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)