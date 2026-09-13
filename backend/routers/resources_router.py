from fastapi import APIRouter, HTTPException, Request, Depends
from core.security import get_current_user
from llm.llm_factory import default_llm
from schemas.interview import ChatRequest

router = APIRouter(tags=["Resources"])

COACH_SYSTEM = """You are MockHire AI's expert interview coach — a senior engineer with 15+ years in Big Tech hiring.

Specialties: DSA, system design, HR/behavioural interviews, salary negotiation, career growth, resume review.

Style: direct, practical, specific. No fluff. Use **bold** for key terms. Bullet points for lists.
End every response with one concrete action the person can take immediately.
Keep responses 150-250 words unless depth is genuinely required."""


@router.post("/resources/chat")
async def resources_chat(
    request: Request,
    body: ChatRequest,
    current_user=Depends(get_current_user),
):
    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    system   = body.system or COACH_SYSTEM
    messages = [{"role": "system", "content": system}]
    for msg in body.messages[-12:]:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    try:
        reply = default_llm.complete(messages, max_tokens=600)
        return {"reply": reply}
    except Exception as e:
        print(f"[ResourcesChat] Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI error: {e}")