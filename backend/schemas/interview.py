# schemas/interview.py — Pydantic models for interview routes
from pydantic import BaseModel
from typing import List, Optional


class ResumeContext(BaseModel):
    name:                str  = ""
    level:               str  = "Intermediate"
    years_of_experience: int  = 0
    current_role:        str  = ""
    skills:              list = []
    projects:            list = []
    education:           str  = ""
    companies:           list = []
    summary:             str  = ""


class FeedbackResponse(BaseModel):
    communication: int
    confidence:    int
    technical:     int
    grammar:       int
    overall:       int
    summary:       str


class DSASubmitRequest(BaseModel):
    question:   str
    difficulty: str
    language:   str
    code:       str


class ChatMessage(BaseModel):
    role:    str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system:   str = ""