from typing import List, Dict
from llm.base_llm import BaseLLMClient
from llm.groq_client import GroqLLMClient
from llm.gemini_client import GeminiLLMClient
from core.config import settings


class ResilientLLMClient(BaseLLMClient):
    """
    Decorator pattern: wraps primary LLM and falls back to secondary
    provider if primary fails (e.g. Gemini 429 quota exceeded).
    """
    def __init__(self, primary: BaseLLMClient, fallback: BaseLLMClient = None):
        self.primary = primary
        self.fallback = fallback

    def complete(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> str:
        try:
            return self.primary.complete(messages, max_tokens)
        except Exception as primary_err:
            if self.fallback:
                print(f"[LLM] Primary provider encountered error: {primary_err}")
                print("[LLM] Gracefully falling back to secondary provider...")
                return self.fallback.complete(messages, max_tokens)
            raise primary_err


class LLMFactory:
    """
    Factory that returns the correct LLM client.
    Supports Groq and Gemini, configurable via LLM_PROVIDER in .env.
    Includes automatic failover if an alternate provider key is present.
    """

    @staticmethod
    def create(provider: str = None) -> BaseLLMClient:
        chosen = (provider or settings.LLM_PROVIDER or "gemini").lower()

        primary_cls = GeminiLLMClient if chosen == "gemini" else GroqLLMClient
        fallback_cls = GroqLLMClient if chosen == "gemini" else GeminiLLMClient

        # Check if fallback is available
        fallback_available = bool(
            settings.GROQ_API_KEY if chosen == "gemini" else settings.GEMINI_API_KEY
        )

        primary_client = primary_cls()
        fallback_client = fallback_cls() if fallback_available else None

        active_model = settings.GEMINI_MODEL if chosen == "gemini" else settings.GROQ_MODEL
        fallback_desc = f"with fallback to {'GROQ' if chosen == 'gemini' else 'GEMINI'}" if fallback_client else "no fallback"
        print(f"[LLMFactory] Initialized provider: '{chosen.upper()}' ({active_model}) [{fallback_desc}]")

        return ResilientLLMClient(primary_client, fallback_client)


# Default shared instance used across interview agents and services
default_llm = LLMFactory.create()