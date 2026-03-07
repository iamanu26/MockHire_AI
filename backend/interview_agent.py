from prompts import HR_PROMPT, TECH_PROMPT
from llama_client import ask_llama

class InterviewAgent:
    def __init__(self, company, role, level):
        self.company = company
        self.role = role
        self.level = level
        self.history = []

    def _ask(self, system_prompt, user_answer):
        messages = [{"role": "system", "content": system_prompt}]
        for role, content in self.history:
            messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_answer})
        reply = ask_llama(messages)
        self.history.append(("user", user_answer))
        self.history.append(("assistant", reply))
        return reply

    def hr_interviewer(self, answer):
        return self._ask(
            HR_PROMPT.format(company=self.company, level=self.level),
            answer
        )

    def tech_interviewer(self, answer):
        return self._ask(
            TECH_PROMPT.format(company=self.company, role=self.role, level=self.level),
            answer
        )

    def generate_feedback(self):
        # Count how many exchanges happened
        num_exchanges = len(self.history) // 2

        feedback_prompt = f"""
You are a STRICT and HONEST interview evaluator. You do NOT give high scores easily.

Here is the full interview conversation ({num_exchanges} exchanges):
{self.history}

STRICT SCORING RULES — follow these exactly:
- If the candidate gave only 1-2 short answers: maximum overall score is 4/10
- If the candidate gave vague or generic answers: deduct 2-3 points
- If the candidate showed no technical depth: technical score must be below 5
- If the candidate spoke very little: confidence score must reflect that
- NEVER give 8+ unless the candidate gave detailed, structured, impressive answers
- A score of 7 means "good but room to improve"
- A score of 5 means "average, needs significant work"
- A score of 3 means "poor, very little substance"

IMPORTANT: Base your evaluation ONLY on what was actually said in the conversation above.
If the conversation is very short (1-2 lines), scores MUST be low (3-5 range).

Respond ONLY with valid JSON. No explanation, no markdown, no code fences.
Exact format:
{{
  "communication": <integer 1-10>,
  "confidence": <integer 1-10>,
  "technical": <integer 1-10>,
  "grammar": <integer 1-10>,
  "overall": <integer 1-10>,
  "summary": "<honest 2-3 sentence assessment mentioning specific things said or not said>"
}}
""".strip()

        messages = [
            {
                "role": "system",
                "content": "You are a strict, honest interview evaluator. You output only valid JSON. You never give inflated scores."
            },
            {
                "role": "user",
                "content": feedback_prompt
            }
        ]

        return ask_llama(messages, max_tokens=512)