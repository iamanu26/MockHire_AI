# llm/gemini_client.py — Google Gemini implementation of BaseLLMClient
# Pattern: Adapter Pattern — adapts Google Gemini API to our BaseLLMClient interface
import requests
from typing import List, Dict
from llm.base_llm import BaseLLMClient
from core.config import settings


class GeminiAPIError(Exception):
    pass


class GeminiLLMClient(BaseLLMClient):
    """
    Concrete LLM client using Google Gemini API.
    Uses Google's official OpenAI-compatible chat completions endpoint.
    Compatible with gemini-3.6-flash, gemini-2.5-pro, etc.
    """

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

    def complete(
        self,
        messages:   List[Dict[str, str]],
        max_tokens: int = 512,
    ) -> str:
        if not settings.GEMINI_API_KEY:
            raise GeminiAPIError(
                "GEMINI_API_KEY not set in environment. "
                "Please add GEMINI_API_KEY to your backend/.env file."
            )

        headers = {
            "Authorization": f"Bearer {settings.GEMINI_API_KEY}",
            "Content-Type":  "application/json",
        }

        # Google's OpenAI-compatible endpoint accepts model and standard messages.
        # Gemini 3.x Flash includes internal reasoning tokens in max_tokens.
        # Setting reasoning_effort="low" and ensuring adequate headroom prevents JSON truncation.
        effective_max_tokens = max(max_tokens, 2048)
        payload = {
            "model":            settings.GEMINI_MODEL,
            "messages":         messages,
            "temperature":      0.2,
            "max_tokens":       effective_max_tokens,
            "reasoning_effort": "low",
            "stream":           False,
        }

        print(f"[Gemini] Calling Google Gemini API with model: {settings.GEMINI_MODEL}")
        try:
            response = requests.post(
                self.BASE_URL,
                headers=headers,
                params={"key": settings.GEMINI_API_KEY},
                json=payload,
                timeout=settings.GEMINI_TIMEOUT,
            )
        except requests.exceptions.RequestException as e:
            raise GeminiAPIError(f"Network error contacting Google Gemini API: {e}")

        if response.status_code != 200:
            err_msg = response.text[:300]
            raise GeminiAPIError(f"Gemini API error {response.status_code}: {err_msg}")

        data = response.json()
        if "choices" not in data or not data["choices"]:
            raise GeminiAPIError(f"Unexpected response format from Gemini API: {data}")

        choice = data["choices"][0]
        content = choice.get("message", {}).get("content", "")
        return content or ""
