# routers/guest_router.py — Guest access from Project A (MERN)
# Flow: verify token → interview → generate feedback → redirect back to Project A
# NO MockHire DB writes. Feedback encoded as base64 and sent to Project A via URL.

import os, json, base64, re
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError, ExpiredSignatureError

router = APIRouter(prefix="/guest", tags=["Guest"])

ALGORITHM = "HS256"


def get_shared_secret() -> str:
    """
    Read lazily (not as a module-level constant) so it always reflects the
    current env var — avoids the import-order bug where a value set via
    load_dotenv() after this module is imported would be missed.
    .strip() guards against a trailing newline/space some hosting
    dashboards inject into env vars.
    """
    return os.getenv("MOCKHIRE_SHARED_SECRET", "change-this-shared-secret").strip()


def verify_guest_token(token: str) -> dict:
    secret = get_shared_secret()
    try:
        # leeway=30 tolerates small clock drift between the Node and Python hosts
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM], options={"leeway": 30})
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Guest token expired. Please start a new interview from your dashboard.")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid guest token: {str(e)}")

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



