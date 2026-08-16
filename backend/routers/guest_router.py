# routers/guest_router.py — Guest access from Project A (MERN)
# Flow: verify token → interview → generate feedback → redirect back to Project A
# NO MockHire DB writes. Feedback encoded as base64 and sent to Project A via URL.

import os, json, base64, re
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError

router = APIRouter(prefix="/guest", tags=["Guest"])

SHARED_SECRET = os.getenv("MOCKHIRE_SHARED_SECRET", "change-this-shared-secret")
ALGORITHM     = "HS256"


def verify_guest_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SHARED_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired guest token.")
    if not payload.get("guest"):
        raise HTTPException(status_code=401, detail="Not a valid guest token.")
    return payload


def parse_score(val) -> int:
    if isinstance(val, int):   return val
    if isinstance(val, float): return int(round(val))
    match = re.search(r"(\d+(?:\.\d+)?)", str(val))
    return int(round(float(match.group(1)))) if match else 0


# ── GET /guest/verify ─────────────────────────────────────────────
@router.get("/verify")
def verify_guest(token: str):
    """
    Called by GuestInterview.jsx on page load.
    Returns guest user info — no account created, no DB touched.
    """
    payload = verify_guest_token(token)
    return {
        "valid":      True,
        "name":       payload.get("name",       "Guest"),
        "email":      payload.get("email",      ""),
        "source":     payload.get("source",     "external"),
        "return_url": payload.get("return_url", ""),
    }


# ── POST /guest/complete ──────────────────────────────────────────
class CompleteRequest(BaseModel):
    guest_token:    str
    interview_type: str   # "tech" | "hr"


@router.post("/complete")
def guest_complete(body: CompleteRequest):
    """
    Called when guest clicks 'End Session'.
    1. Verifies guest token
    2. Generates feedback from agent history (same as normal interview)
    3. Encodes result as base64 JSON
    4. Returns redirect URL to Project A with encoded data
    No DB writes. Everything goes back to Project A.
    """
    # Verify token
    payload    = verify_guest_token(body.guest_token)
    return_url = payload.get("return_url", "")

    if not return_url:
        raise HTTPException(status_code=400, detail="No return URL found in token.")

    # Generate feedback from the shared agent instance
    # Import here to avoid circular imports
    from routers.interview_router import _tech_agent, _hr_agent
    import json as _json

    agent = _tech_agent if body.interview_type == "tech" else _hr_agent

    if not agent.history:
        raise HTTPException(
            status_code=400,
            detail="No interview history found. Please complete at least one answer before ending."
        )

    # Generate feedback using the agent's built-in method
    try:
        raw     = agent._generate_feedback_prompt()
        cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()
        feedback = _json.loads(cleaned)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}")

    # Clear history after generating feedback
    agent.reset()

    # Build result payload for Project A
    result = {
        "interview_type": body.interview_type,
        "communication":  parse_score(feedback.get("communication", 0)),
        "confidence":     parse_score(feedback.get("confidence",    0)),
        "technical":      parse_score(feedback.get("technical",     0)),
        "grammar":        parse_score(feedback.get("grammar",       0)),
        "overall":        parse_score(feedback.get("overall",       0)),
        "summary":        feedback.get("summary", "No summary available."),
        "completed_at":   datetime.utcnow().isoformat(),
        "source":         "mockhire_ai",
    }

    # Encode as base64 to pass safely in URL
    encoded = base64.b64encode(
        json.dumps(result).encode("utf-8")
    ).decode("utf-8")

    # Return the full redirect URL to Project A
    redirect_to = f"{return_url}?data={encoded}"
    return {"redirect_url": redirect_to}