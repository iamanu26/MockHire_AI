# llm/base_llm.py — Abstract LLM client interface
# SOLID: OCP — add new LLM providers by extending, not modifying
# SOLID: DIP — agents depend on this abstraction, not on Groq directly
# Pattern: Adapter Pattern
from abc import ABC, abstractmethod
from typing import List, Dict


class BaseLLMClient(ABC):
    """
    Abstract interface for any LLM provider.
    Swap Groq for OpenAI/Ollama/Anthropic by implementing this interface.
    """

    @abstractmethod
    def complete(
        self,
        messages:   List[Dict[str, str]],
        max_tokens: int = 256,
    ) -> str:
        """Send messages and return the text response."""
        pass