# guards/injection_guard.py — Prompt injection detection
# SOLID: SRP — only injection detection, nothing else
# Pattern: Chain of Responsibility — guards can be chained
import re
from abc import ABC, abstractmethod


class BaseGuard(ABC):
    """Abstract guard in the chain of responsibility."""

    def __init__(self):
        self._next: "BaseGuard | None" = None

    def set_next(self, guard: "BaseGuard") -> "BaseGuard":
        self._next = guard
        return guard

    def check(self, text: str) -> bool:
        """Returns True if the input should be blocked."""
        result = self._check(text)
        if result:
            return True
        if self._next:
            return self._next.check(text)
        return False

    @abstractmethod
    def _check(self, text: str) -> bool:
        pass


class InjectionGuard(BaseGuard):
    """
    Detects prompt injection attempts.
    Patterns: 'act as', 'pretend to be', 'ignore instructions', etc.
    """

    PATTERNS = [
        r"suppose you are",
        r"pretend (to be|you are|you're)",
        r"act as",
        r"imagine you are",
        r"roleplay as",
        r"you are now",
        r"forget (your|all) (instructions|rules|prompt)",
        r"ignore (your|all) (instructions|rules|previous)",
        r"from now on you",
        r"your new (role|instruction|task|job) is",
        r"disregard (your|all|previous)",
    ]

    def _check(self, text: str) -> bool:
        lowered = text.lower().strip()
        return any(re.search(p, lowered) for p in self.PATTERNS)


class EmptyAnswerGuard(BaseGuard):
    """Detects trivially empty answers (less than 3 meaningful characters)."""

    def _check(self, text: str) -> bool:
        return len(text.strip()) < 3


# ── Pre-built guard chain ────────────────────────────────────────
def build_interview_guard() -> InjectionGuard:
    """
    Returns a guard chain: InjectionGuard → EmptyAnswerGuard.
    Add more guards here without modifying existing ones (OCP).
    """
    injection = InjectionGuard()
    # injection.set_next(EmptyAnswerGuard())  # chain more guards as needed
    return injection