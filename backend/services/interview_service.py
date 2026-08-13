# services/interview_service.py — Interview session business logic
# SOLID: SRP — interview session management only
# SOLID: DIP — depends on BaseInterviewAgent and InterviewRepository abstractions
import json, re
from fastapi import HTTPException
from agents.base_agent import BaseInterviewAgent
from repositories.interview_repository import InterviewRepository
from models.interview_result import InterviewResult
from schemas.interview import ResumeContext


class InterviewService:
    """
    Manages interview sessions: starting, asking, stopping, feedback generation.
    Routes call this — they know nothing about agents or DB directly.
    """

    def __init__(
        self,
        tech_agent:  BaseInterviewAgent,
        hr_agent:    BaseInterviewAgent,
        interview_repo: InterviewRepository,
    ):
        self.tech_agent     = tech_agent
        self.hr_agent       = hr_agent
        self.interview_repo = interview_repo

    def start_session(self, resume: ResumeContext) -> dict:
        """Reset both agents and inject resume context."""
        ctx = resume.dict() if any([
            resume.name, resume.skills, resume.projects, resume.summary
        ]) else None
        self.tech_agent.reset(ctx)
        self.hr_agent.reset(ctx)
        return {"message": "Session started", "has_resume": ctx is not None}

    def ask_tech(self, answer: str) -> str:
        return self.tech_agent.ask(answer)

    def ask_hr(self, answer: str) -> str:
        return self.hr_agent.ask(answer)

    def generate_feedback(self, user_id: int) -> dict:
        """Generate AI feedback, parse scores, save to DB, return result."""
        # Use whichever agent has history
        agent = self.tech_agent if self.tech_agent.history else self.hr_agent
        if not agent.history:
            raise HTTPException(status_code=400, detail="No interview session found.")

        raw      = agent._generate_feedback_prompt()
        cleaned  = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()

        try:
            feedback = json.loads(cleaned)
        except Exception:
            raise HTTPException(status_code=500, detail="Invalid feedback format from AI.")

        result = InterviewResult(
            user_id=user_id,
            communication=self._parse_score(feedback.get("communication", 0)),
            confidence=self._parse_score(feedback.get("confidence", 0)),
            technical=self._parse_score(feedback.get("technical", 0)),
            grammar=self._parse_score(feedback.get("grammar", 0)),
            overall=self._parse_score(feedback.get("overall", 0)),
            summary=feedback.get("summary", "No summary provided."),
        )
        saved = self.interview_repo.save(result)

        # Clear history after saving
        self.tech_agent.reset()
        self.hr_agent.reset()

        return {
            "communication": saved.communication,
            "confidence":    saved.confidence,
            "technical":     saved.technical,
            "grammar":       saved.grammar,
            "overall":       saved.overall,
            "summary":       saved.summary,
        }

    @staticmethod
    def _parse_score(val) -> int:
        if isinstance(val, int):   return val
        if isinstance(val, float): return int(round(val))
        match = re.search(r"(\d+(?:\.\d+)?)", str(val))
        return int(round(float(match.group(1)))) if match else 0