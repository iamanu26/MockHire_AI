from typing import List, Dict
from llm.base_llm import BaseLLMClient
from llm.groq_client import GroqLLMClient
from llm.gemini_client import GeminiLLMClient
from core.config import settings


class ResilientLLMClient(BaseLLMClient):
    """
    Decorator pattern: wraps primary LLM and falls back to secondary
    provider if primary fails (e.g. Groq rate limit -> Gemini fallback).
    """
    def __init__(self, primary: BaseLLMClient, fallback: BaseLLMClient = None, provider: str = "groq"):
        self.primary = primary
        self.fallback = fallback
        self.provider = provider

    def complete(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> str:
        try:
            return self.primary.complete(messages, max_tokens)
        except Exception as primary_err:
            if self.fallback:
                print(f"[LLM] Primary provider ({self.provider}) encountered error: {primary_err}")
                print("[LLM] Gracefully falling back to secondary provider...")
                return self.fallback.complete(messages, max_tokens)
            raise primary_err


class LLMFactory:
    """
    Factory that returns the correct LLM client.
    Prioritizes Groq (qwen/qwen3.8-27b) when GROQ_API_KEY is present,
    with automatic failover to Gemini if an alternate key is available.
    """
    provider: str = "groq"

    @staticmethod
    def create(provider: str = None) -> BaseLLMClient:
        # Priority:
        # 1. Explicit argument passed to create()
        # 2. If GROQ_API_KEY is present, prioritize Groq (qwen/qwen3.8-27b) for real-time speed
        # 3. Configured settings.LLM_PROVIDER
        # 4. Default: "groq"
        if provider:
            chosen = provider.lower().strip()
        elif settings.GROQ_API_KEY:
            chosen = "groq"
        elif settings.LLM_PROVIDER:
            chosen = settings.LLM_PROVIDER.lower().strip()
        else:
            chosen = "groq"

        LLMFactory.provider = chosen

        primary_cls = GroqLLMClient if chosen == "groq" else GeminiLLMClient
        fallback_cls = GeminiLLMClient if chosen == "groq" else GroqLLMClient

        # Check if fallback is available
        fallback_available = bool(
            settings.GEMINI_API_KEY if chosen == "groq" else settings.GROQ_API_KEY
        )

        primary_client = primary_cls()
        fallback_client = fallback_cls() if fallback_available else None

        active_model = settings.GROQ_MODEL if chosen == "groq" else settings.GEMINI_MODEL
        fallback_desc = f"with fallback to {'GEMINI' if chosen == 'groq' else 'GROQ'}" if fallback_client else "no fallback"
        print(f"[LLMFactory] Initialized provider: '{chosen.upper()}' ({active_model}) [{fallback_desc}]")

        return ResilientLLMClient(primary_client, fallback_client, provider=chosen)


# Default shared instance used across interview agents and services
default_llm = LLMFactory.create()