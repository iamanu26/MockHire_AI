# llm/groq_client.py — Groq API implementation of BaseLLMClient
# Pattern: Adapter Pattern — adapts Groq API to our BaseLLMClient interface
import re
import requests
from typing import List, Dict
from llm.base_llm import BaseLLMClient
from core.config import settings


class GroqAPIError(Exception):
    pass


class GroqLLMClient(BaseLLMClient):
    """
    Concrete LLM client using Groq's API.
    All Groq-specific logic is isolated here.
    """

    def complete(
        self,
        messages:   List[Dict[str, str]],
        max_tokens: int = 512,
    ) -> str:
        if not settings.GROQ_API_KEY:
            raise GroqAPIError("GROQ_API_KEY not set in environment.")

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type":  "application/json",
        }
        payload = {
            "model":       settings.GROQ_MODEL,
            "messages":    messages,
            "temperature": 0.7,
            "max_tokens":  max_tokens,
            "top_p":       1.0,
            "stream":      False,
        }

        print(f"[Groq] Calling Groq API with model: {settings.GROQ_MODEL}")
        try:
            response = requests.post(
                settings.GROQ_URL,
                headers=headers,
                json=payload,
                timeout=settings.GROQ_TIMEOUT,
            )
        except requests.exceptions.RequestException as e:
            raise GroqAPIError(f"Network error contacting Groq: {e}")

        if response.status_code != 200:
            raise GroqAPIError(f"Groq API error {response.status_code}: {response.text[:200]}")

        data = response.json()
        if "choices" not in data or not data["choices"]:
            raise GroqAPIError("Unexpected response format from Groq API")

        content = data["choices"][0]["message"]["content"]
        # Strip internal thinking tags if emitted by reasoning models (like Qwen)
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
        return content