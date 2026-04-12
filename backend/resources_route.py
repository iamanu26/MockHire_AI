# resources_route.py
# Add this router to your main.py:
#   from resources_route import router as resources_router
#   app.include_router(resources_router)

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address
from llama_client import ask_llama

router  = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class ChatMessage(BaseModel):
    role:    str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system:   str = ""


COACH_SYSTEM = """You are MockHire AI's expert interview coach — a senior engineer mentor with 15+ years of experience in Big Tech hiring (Google, Amazon, Meta, Microsoft, Apple).

You specialise in:
- Technical interviews (DSA, system design, coding)
- HR and behavioural interviews (STAR method, situational questions)
- Salary negotiation and offer evaluation
- Career transitions and growth
- Resume and LinkedIn optimisation

Your style: direct, practical, specific. No fluff. Give real examples. Use **bold** for key terms. Use bullet points for lists. End every response with one concrete action the person can take immediately.

Keep responses concise — aim for 150-250 words unless the topic genuinely requires more depth."""


@router.post("/resources/chat")
@limiter.limit("20/minute")
async def resources_chat(request: Request, body: ChatRequest):
    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    # Use provided system prompt or fall back to default
    system = body.system or COACH_SYSTEM

    # Build messages for LLaMA
    messages = [{"role": "system", "content": system}]
    for msg in body.messages[-12:]:  # last 12 messages for context window
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    try:
        reply = ask_llama(messages, max_tokens=600)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")