# agents/agent_factory.py — Creates the correct interview agent
# Pattern: Factory Pattern
# SOLID: OCP — add new agent types without modifying factory logic
from llm.base_llm import BaseLLMClient
from agents.base_agent import BaseInterviewAgent
from agents.tech_agent import TechnicalInterviewAgent
from agents.hr_agent import HRInterviewAgent
from core.config import settings


class AgentFactory:
    """
    Creates the correct interview agent based on type string.
    Decouples agent creation from usage — routes never instantiate agents directly.
    """

    @staticmethod
    def create(
        interview_type: str,
        llm:            BaseLLMClient,
        company:        str = None,
        role:           str = None,
        level:          str = None,
    ) -> BaseInterviewAgent:

        company = company or settings.DEFAULT_COMPANY
        role    = role    or settings.DEFAULT_ROLE
        level   = level   or settings.DEFAULT_LEVEL

        agents = {
            "tech": lambda: TechnicalInterviewAgent(llm, company, role, level),
            "hr":   lambda: HRInterviewAgent(llm, company, level),
        }

        builder = agents.get(interview_type.lower())
        if not builder:
            raise ValueError(
                f"Unknown interview type: '{interview_type}'. "
                f"Available: {list(agents.keys())}"
            )
        return builder()