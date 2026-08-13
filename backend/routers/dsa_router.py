# routers/dsa_router.py — DSA practice endpoints (thin controllers)
import json, re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from llm.llm_factory import default_llm
from schemas.interview import DSASubmitRequest

router = APIRouter(prefix="/dsa", tags=["DSA"])


def _clean_json(text: str) -> str:
    text  = re.sub(r"```(?:json)?", "", text).strip("` \n")
    start = text.find("{")
    if start == -1:
        return text
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == "{":   depth += 1
        elif ch == "}": depth -= 1
        if depth == 0:  return text[start:i+1]
    return text[start:]


FALLBACKS = {
    "easy":   {"title": "Two Sum", "topic": "Arrays & Hashing", "description": "Given an array of integers nums and a target, return indices of the two numbers that add up to target.", "examples": [{"input": "nums=[2,7,11,15], target=9", "output": "[0,1]", "explanation": "2+7=9"}], "constraints": ["2 <= nums.length <= 10^4"]},
    "medium": {"title": "Longest Substring Without Repeating Characters", "topic": "Sliding Window", "description": "Find the length of the longest substring without repeating characters.", "examples": [{"input": 's="abcabcbb"', "output": "3", "explanation": '"abc" has length 3'}], "constraints": ["0 <= s.length <= 5*10^4"]},
    "hard":   {"title": "Trapping Rain Water", "topic": "Two Pointers / DP", "description": "Given n non-negative integers representing an elevation map, compute how much water it can trap.", "examples": [{"input": "height=[0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6", "explanation": "6 units trapped"}], "constraints": ["1 <= n <= 2*10^4"]},
}


def _ask_one_problem(difficulty: str) -> dict:
    prompt = f"""Generate ONE {difficulty}-level DSA coding problem.
Output ONLY a JSON object. No explanation, no markdown.
{{"title":"...","topic":"...","description":"...","examples":[{{"input":"...","output":"...","explanation":"..."}}],"constraints":["..."]}}"""
    raw     = default_llm.complete([
        {"role": "system", "content": "Output only a raw JSON object."},
        {"role": "user",   "content": prompt},
    ], max_tokens=800)
    return json.loads(_clean_json(raw))


@router.post("/questions")
def generate_questions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    result = {}
    for key, label in [("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")]:
        try:
            result[key] = _ask_one_problem(label)
        except Exception:
            result[key] = FALLBACKS[key]
    return result


@router.post("/review")
def review_solution(
    body: DSASubmitRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    code_lines = [l for l in body.code.strip().splitlines()
                  if l.strip() and not l.strip().startswith(("#", "//"))]
    is_trivial = len(code_lines) <= 2

    prompt = f"""You are a STRICT DSA code reviewer.
Problem ({body.difficulty}): {body.question[:400]}
Code ({body.language}):
{body.code[:800]}

STRICT: trivial/incomplete code scores 0-2. Only 7+ for genuinely correct solutions.
Return ONLY valid JSON:
{{"score":<0-10>,"correctness":"...","time_complexity":"O(...)","space_complexity":"O(...)","is_optimal":true,"feedback":"...","hint":"..."}}"""

    try:
        raw  = default_llm.complete([
            {"role": "system", "content": "Strict DSA reviewer. Output only valid JSON."},
            {"role": "user",   "content": prompt},
        ], max_tokens=400)
        data = json.loads(_clean_json(raw))
        if is_trivial and data.get("score", 0) > 2:
            data.update({"score": 1, "correctness": "Not Attempted",
                         "feedback": "Code is too short to be a valid solution.",
                         "hint": "Write a complete function with proper algorithm logic."})
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")