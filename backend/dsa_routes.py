# dsa_routes.py — DSA Practice routes for MockHire AI
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth import get_current_user, get_db
from models import User
from sqlalchemy.orm import Session
from llama_client import ask_llama
import json, re

router = APIRouter(prefix="/dsa", tags=["DSA"])


def clean_json(text: str) -> str:
    """Strip markdown fences and return the first complete JSON object."""
    # Remove code fences
    text = re.sub(r"```(?:json)?", "", text).strip("` \n")
    # Find the outermost { ... } block
    start = text.find("{")
    if start == -1:
        return text
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start:i+1]
    return text[start:]


def ask_one_problem(difficulty: str) -> dict:
    """Ask LLaMA for a single DSA problem."""
    prompt = f"""Generate ONE {difficulty}-level DSA coding problem.
Output ONLY a JSON object. No explanation, no markdown, no text before or after.

{{
  "title": "...",
  "topic": "...",
  "description": "...",
  "examples": [{{"input": "...", "output": "...", "explanation": "..."}}],
  "constraints": ["...", "..."]
}}"""

    messages = [
        {"role": "system", "content": "You output only a raw JSON object. No markdown. No explanation. No text outside the JSON."},
        {"role": "user",   "content": prompt}
    ]
    raw = ask_llama(messages, max_tokens=800)
    ##print(f"[DSA DEBUG] {difficulty} raw response:\n{raw[:300]}\n---")
    cleaned = clean_json(raw)
    ##print(f"[DSA DEBUG] {difficulty} cleaned:\n{cleaned[:300]}\n---")
    return json.loads(cleaned)


FALLBACKS = {
    "easy": {
        "title": "Two Sum",
        "topic": "Arrays & Hashing",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
        "examples": [{"input": "nums=[2,7,11,15], target=9", "output": "[0,1]", "explanation": "nums[0]+nums[1]=9"}],
        "constraints": ["2 <= nums.length <= 10^4", "Each input has exactly one solution"]
    },
    "medium": {
        "title": "Longest Substring Without Repeating Characters",
        "topic": "Sliding Window",
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "examples": [{"input": 's="abcabcbb"', "output": "3", "explanation": '"abc" is the longest with length 3'}],
        "constraints": ["0 <= s.length <= 5*10^4", "s consists of English letters, digits, symbols and spaces"]
    },
    "hard": {
        "title": "Trapping Rain Water",
        "topic": "Two Pointers / Dynamic Programming",
        "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "examples": [{"input": "height=[0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6", "explanation": "6 units of rain water are trapped"}],
        "constraints": ["n == height.length", "1 <= n <= 2*10^4", "0 <= height[i] <= 10^5"]
    }
}


@router.post("/questions")
def generate_dsa_problems(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = {}
    for key, label in [("easy","Easy"), ("medium","Medium"), ("hard","Hard")]:
        try:
            result[key] = ask_one_problem(label)
            ##print(f"[DSA] ✅ {label} generated successfully: {result[key].get('title')}")
        except Exception as e:
            ##print(f"[DSA] ❌ {label} failed ({e}), using fallback")
            result[key] = FALLBACKS[key]

    return result


# ── Evaluate submitted solution ───────────────────────────────────
class SubmitRequest(BaseModel):
    question: str
    difficulty: str
    language: str
    code: str


@router.post("/review")
def evaluate_solution(
    body: SubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Detect trivially short / empty code
    code_lines = [l for l in body.code.strip().splitlines() if l.strip() and not l.strip().startswith("#") and not l.strip().startswith("//")]
    is_trivial = len(code_lines) <= 2

    prompt = f"""You are a STRICT DSA code reviewer. Be honest and harsh.

Problem ({body.difficulty}): {body.question[:400]}

Submitted {body.language} code:
```
{body.code[:800]}
```

STRICT RULES:
- If the code is only 1-3 lines or clearly incomplete: score MUST be 0-2
- If code has no real algorithm logic: score MUST be 0-3
- If code is just a number, variable, or print statement: score is 0
- Only give 7+ if the solution is genuinely correct and handles edge cases
- Only give 9-10 if solution is correct AND optimal complexity

Return ONLY valid JSON, no markdown:
{{
  "score": <integer 0-10>,
  "correctness": "Correct / Partially Correct / Incorrect / Not Attempted",
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "is_optimal": true or false,
  "feedback": "2-3 sentences: be specific about what is right or wrong",
  "hint": "one concrete improvement suggestion"
}}"""

    messages = [
        {"role": "system", "content": "You are a strict DSA code reviewer. Never give high scores for trivial or incomplete code. Output only valid JSON."},
        {"role": "user",   "content": prompt}
    ]

    try:
        raw = ask_llama(messages, max_tokens=400)
        ##print(f"[DSA REVIEW DEBUG] raw:\n{raw[:300]}")
        cleaned = clean_json(raw)
        data = json.loads(cleaned)

        # Server-side score cap for trivially short submissions
        if is_trivial and data.get("score", 0) > 2:
            ##print(f"[DSA REVIEW] Trivial code detected, capping score from {data['score']} to 1")
            data["score"] = 1
            data["correctness"] = "Not Attempted"
            data["feedback"] = "The submitted code is too short to be a valid solution. A proper algorithm is required."
            data["hint"] = "Write a complete function that processes the input and returns the correct output."

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")