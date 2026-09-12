from llm.base_llm import BaseLLMClient
from llm.groq_client import GroqLLMClient
from llm.gemini_client import GeminiLLMClient
from core.config import settings


class LLMFactory:
    """
    Factory that returns the correct LLM client.
    Supports Groq and Gemini, configurable via LLM_PROVIDER in .env.
    """

    @staticmethod
    def create(provider: str = None) -> BaseLLMClient:
        chosen = (provider or settings.LLM_PROVIDER or "gemini").lower()

        # If Gemini is chosen but API key is not yet set, fall back to Groq if available
        if chosen == "gemini" and not settings.GEMINI_API_KEY and settings.GROQ_API_KEY:
            print("[LLMFactory] WARNING: 'gemini' requested, but GEMINI_API_KEY is empty. Falling back to Groq.")
            chosen = "groq"

        providers = {
            "groq":   GroqLLMClient,
            "gemini": GeminiLLMClient,
        }
        cls = providers.get(chosen)
        if not cls:
            raise ValueError(f"Unknown LLM provider: '{chosen}'. Available: {list(providers.keys())}")
        
        active_model = settings.GEMINI_MODEL if chosen == "gemini" else settings.GROQ_MODEL
        print(f"[LLMFactory] Initialized provider: '{chosen.upper()}' | Model: '{active_model}'")
        return cls()


# Default shared instance used across interview agents and services
default_llm = LLMFactory.create()