import os
import requests
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"
TIMEOUT = 30


class GroqAPIError(Exception):
    pass


def ask_llama(messages: List[Dict[str, str]], max_tokens: int = 256) -> str:
    """
    max_tokens=256  → fast, for interview questions
    max_tokens=512  → for feedback JSON (needs more space)
    """
    if not GROQ_API_KEY:
        raise GroqAPIError("GROQ_API_KEY not found. Check your .env file.")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": max_tokens,
        "top_p": 1.0,
        "stream": False
    }

    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise GroqAPIError(f"Network error: {e}")

    if response.status_code != 200:
        try:
            error_json = response.json()
        except Exception:
            error_json = response.text
        print("====== GROQ API ERROR ======")
        print(error_json)
        print("============================")
        raise GroqAPIError(f"Groq API returned {response.status_code}")

    data = response.json()
    if "choices" not in data or not data["choices"]:
        raise GroqAPIError("Invalid response format from Groq API")

    return data["choices"][0]["message"]["content"]