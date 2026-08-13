# llm/llm_factory.py — Creates the correct LLM client
# Pattern: Factory Pattern
from llm.base_llm import BaseLLMClient
from llm.groq_client import GroqLLMClient


class LLMFactory:
    """
    Factory that returns the correct LLM client.
    To add Ollama: add "ollama" case and implement OllamaLLMClient.
    """

    @staticmethod
    def create(provider: str = "groq") -> BaseLLMClient:
        providers = {
            "groq": GroqLLMClient,
            # "openai":  OpenAILLMClient,   # plug in future providers here
            # "ollama":  OllamaLLMClient,
        }
        cls = providers.get(provider.lower())
        if not cls:
            raise ValueError(f"Unknown LLM provider: '{provider}'. Available: {list(providers.keys())}")
        return cls()


# Default shared instance used by all agents
default_llm = LLMFactory.create("groq")