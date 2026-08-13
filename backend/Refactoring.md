# Backend Refactoring — SOLID + OOP + Design Patterns

## What Changed

The original backend was a procedural flat structure where `main.py` handled
routing, business logic, DB queries, auth, email, and AI calls all in one file.
This refactor restructures everything into clean layered architecture.

---

## Folder Structure

```
backend/
├── main.py                        # App factory only — registers routers
├── core/
│   ├── config.py                  # All env vars (Settings class)
│   ├── database.py                # DB engine + session factory
│   └── security.py                # JWT, hashing — pure functions
├── models/
│   ├── user.py                    # User SQLAlchemy model
│   └── interview_result.py        # InterviewResult model
├── schemas/
│   ├── auth.py                    # Auth Pydantic models
│   ├── interview.py               # Interview Pydantic models
│   └── profile.py                 # Profile Pydantic models
├── repositories/
│   ├── base.py                    # Abstract BaseRepository
│   ├── user_repository.py         # All User DB queries
│   └── interview_repository.py    # All InterviewResult DB queries
├── services/
│   ├── auth_service.py            # Auth business logic
│   ├── interview_service.py       # Interview session logic
│   └── profile_service.py         # Profile + stats logic
├── agents/
│   ├── base_agent.py              # Abstract BaseInterviewAgent
│   ├── tech_agent.py              # TechnicalInterviewAgent
│   ├── hr_agent.py                # HRInterviewAgent
│   └── agent_factory.py           # AgentFactory
├── llm/
│   ├── base_llm.py                # Abstract BaseLLMClient
│   ├── groq_client.py             # GroqLLMClient implementation
│   └── llm_factory.py             # LLMFactory
├── guards/
│   └── injection_guard.py         # Prompt injection detection
└── routers/
    ├── auth_router.py             # Auth HTTP endpoints
    ├── interview_router.py        # Interview HTTP endpoints
    ├── dsa_router.py              # DSA practice endpoints
    ├── profile_router.py          # Profile endpoints
    ├── resume_router.py           # Resume extraction endpoint
    └── resources_router.py        # AI coach chat endpoint
```

---

## SOLID Principles Applied

### S — Single Responsibility Principle
- `main.py`: ONLY registers routers and middleware (was doing everything)
- `UserRepository`: ONLY handles User DB queries
- `AuthService`: ONLY handles auth business logic
- `GroqLLMClient`: ONLY handles Groq API communication
- `InjectionGuard`: ONLY detects prompt injection

### O — Open/Closed Principle
- Adding a **System Design interview**: create `SystemDesignAgent(BaseInterviewAgent)` — zero changes to existing code
- Adding **OpenAI as LLM**: create `OpenAILLMClient(BaseLLMClient)` — zero changes to agents
- Adding a new **injection pattern**: extend `InjectionGuard` — zero changes to agents

### L — Liskov Substitution Principle
- `TechnicalInterviewAgent` and `HRInterviewAgent` both extend `BaseInterviewAgent`
- `InterviewService` accepts `BaseInterviewAgent` — either subclass works identically
- Anywhere `BaseInterviewAgent` is used, any subclass can replace it

### I — Interface Segregation Principle
- `BaseLLMClient` exposes only `complete()` — clients don't depend on unused methods
- `BaseRepository` defines only what all repositories share: `find_by_id`, `save`, `delete`
- Auth routes use only `get_current_user` — not the full auth system

### D — Dependency Inversion Principle
- Agents depend on `BaseLLMClient` (abstraction), not `GroqLLMClient` (concretion)
- Services depend on `BaseRepository` subclasses injected at call time
- Routes depend on service methods — never on `db.query()` directly

---

## Design Patterns Applied

### Repository Pattern (`repositories/`)
Separates data access from business logic. Services never write raw queries.
```python
# Before:  db.query(User).filter(User.email == email).first()
# After:   UserRepository(db).find_by_email(email)
```

### Strategy Pattern (`agents/`)
Each interview type is a separate strategy (subclass).
```python
class TechnicalInterviewAgent(BaseInterviewAgent): ...
class HRInterviewAgent(BaseInterviewAgent): ...
# Add new type: class SystemDesignAgent(BaseInterviewAgent): ...
```

### Factory Pattern (`agents/agent_factory.py`, `llm/llm_factory.py`)
Decouples object creation from usage.
```python
agent = AgentFactory.create("tech", default_llm)
llm   = LLMFactory.create("groq")
```

### Adapter Pattern (`llm/`)
Wraps Groq API in `BaseLLMClient` interface so providers are swappable.
```python
# Swap Groq for OpenAI: implement BaseLLMClient, change one line in LLMFactory
```

### Chain of Responsibility (`guards/`)
Guards can be chained — each checks its rule, passes to the next.
```python
injection = InjectionGuard()
injection.set_next(EmptyAnswerGuard())  # chain more guards without modifying existing
```

### Service Layer Pattern (`services/`)
Routes are thin controllers (3-5 lines). All logic lives in services.

---

## OOP Concepts Applied

- **Abstraction**: `BaseInterviewAgent`, `BaseLLMClient`, `BaseRepository` define interfaces
- **Inheritance**: `TechnicalInterviewAgent`, `HRInterviewAgent` inherit shared behavior
- **Encapsulation**: History management, injection guarding, prompt building — all private to `BaseInterviewAgent`
- **Polymorphism**: `InterviewService` calls `agent.ask()` on any subclass interchangeably