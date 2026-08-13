import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")

TTS_API = "https://router.huggingface.co/hf-inference/models/coqui/XTTS-v2"

headers = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}

def text_to_speech(text: str) -> bytes:
    if not HF_API_KEY:
        raise RuntimeError("HF_API_KEY not set")

    payload = {
        "inputs": text,
        "parameters": {
            "speaker": "male",
            "language": "en"
        }
    }

    response = requests.post(
        TTS_API,
        headers=headers,
        json=payload,
        timeout=60
    )

    if response.status_code != 200:
        raise RuntimeError(f"TTS API error: {response.text}")

    return response.content  # audio bytes (wav)