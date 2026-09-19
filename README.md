<div align="center">

# 🎙️ MockHire AI

### AI-Powered Interview & Speaking Skill Simulator

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.135-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_|_Vite_7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev)
[![AI Engine](https://img.shields.io/badge/AI-Groq_(Qwen_3.8)_|_Gemini_Fallback-F54E00?style=for-the-badge)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_|_SQLAlchemy_2.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Auth](https://img.shields.io/badge/Auth-Google_OAuth_2.0_|_JWT_|_Argon2-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity)
[![Proctoring](https://img.shields.io/badge/Proctoring-face--api.js_|_Computer_Vision-8A2BE2?style=for-the-badge)](https://github.com/justadudewhohacks/face-api.js)
[![TTS](https://img.shields.io/badge/Voice-Coqui_XTTS--v2_|_Web_Speech-FF6F00?style=for-the-badge&logo=huggingface&logoColor=white)](https://huggingface.co/coqui/XTTS-v2)
[![License](https://img.shields.io/badge/License-MIT-4F46E5?style=for-the-badge)](LICENSE)

*Built by [Anurag Dubey](https://portfolio-iamanu26.vercel.app/)*

</div>

---

MockHire AI is a full-stack, enterprise-grade AI interview platform that simulates realistic job interviews through **live voice conversations**, automated **browser-based computer vision proctoring**, and intelligent **performance feedback analytics**.

The platform is architected around **SOLID principles** and proven design patterns (Repository, Strategy, Factory, and Resilient Decorator), featuring **dual-engine AI failover (Groq + Gemini)**, **Coqui XTTS-v2 neural voice synthesis**, **resume extraction via PyPDF**, **Google OAuth 2.0 / Argon2id security**, and a production **PostgreSQL** persistence layer.

---

## ✨ Features at a Glance

| # | Feature | What It Does |
|---|---------|-------------|
| 🧠 | **AI Interview Simulation** | Conducts Technical & HR interviews customized to target role, company type, and seniority level using modular strategy agents. |
| 🎙️ | **Dual-Engine Voice I/O** | Real-time speech synthesis using HuggingFace Coqui XTTS-v2 neural voice with browser Web Speech API fallback for hands-free audio. |
| 🛡️ | **Client-Side AI Proctoring** | Real-time browser proctoring powered by `face-api.js` — detects absence, multiple faces, tab switching, and window blur with live warnings. |
| 📊 | **Multi-Metric AI Feedback** | Generates detailed scorecards across Communication, Confidence, Technical Skills, Grammar & Overall performance with actionable feedback. |
| 💻 | **DSA Practice Module** | Interactive LeetCode-style algorithm arena with AI-driven correctness, time complexity, and space complexity evaluation. |
| 📄 | **Resume-Aware Personalization** | PyPDF parses candidate resumes; LLM distills key skill vectors to contextually tailor opening and follow-up questions. |
| 🤖 | **AI Interview Coach** | Dedicated on-demand coaching chatbot for STAR methodology, negotiation tactics, role guidance, and technical mock questions. |
| ⚡ | **Resilient Multi-LLM Failover** | Zero-downtime architecture prioritizing high-speed Groq (Qwen 3.8) with automated graceful fallback to Google Gemini (3.6 Flash). |
| 🔐 | **Enterprise Auth & Security** | Google OAuth 2.0, dual-hash support (Argon2id + Bcrypt), email OTP verification via FastAPI-Mail, and SlowAPI rate limiting. |
| 🐘 | **Production PostgreSQL & Clean Architecture** | Decoupled layered architecture with SQLAlchemy 2.0, repository pattern, and resilient connection pooling. |

---

## 🏗️ System Architecture

MockHire AI is built using a **decoupled, layered architecture adhering strictly to SOLID principles**. The system separates concerns between Client Experience, API Routing, Domain Intelligence, Data Persistence, and Third-Party Integrations.

```mermaid
flowchart TD

subgraph group_frontend["Frontend Experience"]
  node_app["React Application<br/>[App.jsx]"]
  node_auth_ui["Auth Context<br/>[AuthContext.jsx]"]
  node_interview_ui["Interview Workspace<br/>[Interview.jsx]"]
  node_proctoring["Browser Proctoring<br/>[useProctoring.js]"]
  node_dsa_ui["DSA Practice Arena<br/>[Dsapractice.jsx]"]
  node_coach_ui["Coach Resources Hub<br/>[Resources.jsx]"]
end

subgraph group_api["Backend API (Routers)"]
  node_api_main["FastAPI Application<br/>[main.py]"]
  node_auth_router["Auth Router<br/>[auth_router.py]"]
  node_interview_router["Interview Router<br/>[interview_router.py]"]
  node_resume_router["Resume Router<br/>[resume_router.py]"]
  node_dsa_router["DSA Router<br/>[dsa_router.py]"]
  node_resources_router["Resources Router<br/>[resources_router.py]"]
end

subgraph group_services["Domain & Intelligence Services"]
  node_auth_service["Auth Service<br/>[auth_service.py]"]
  node_interview_service["Interview Service<br/>[interview_service.py]"]
  node_agent_factory["Agent Factory<br/>[agent_factory.py]"]
  node_agents["HR & Tech Agents<br/>[base_agent.py]"]
  node_llm_adapter{{"Resilient LLM Adapter<br/>[llm_factory.py]"}}
end

subgraph group_data["Persistence Layer"]
  node_user_repo["User Repository<br/>[user_repository.py]"]
  node_session_repo["Session Repository<br/>[session_repository.py]"]
  node_interview_repo["Interview Repository<br/>[interview_repository.py]"]
  node_postgres[("PostgreSQL Database<br/>[database.py]")]
end

subgraph group_integrations["External Integrations & Providers"]
  node_tts["Speech Synthesis<br/>[text_to_speech.py]"]
  node_email_service["Email Delivery<br/>[email_utils.py]"]
  node_google["Google OAuth 2.0"]
  node_llm_provider{{"AI Providers (Groq / Gemini)"}}
end

node_user(("Job Seeker"))

node_user -->|"interacts with"| node_app
node_app -->|"wraps with"| node_auth_ui
node_auth_ui -->|"authenticates"| node_auth_router
node_auth_router -->|"delegates to"| node_auth_service
node_auth_router -->|"sends OTP via"| node_email_service
node_auth_router -.->|"exchanges OAuth"| node_google
node_auth_service -->|"queries / persists"| node_user_repo
node_user_repo -->|"CRUD operations"| node_postgres

node_app -->|"routes to"| node_interview_ui
node_interview_ui -->|"uploads PDF"| node_resume_router
node_resume_router -->|"extracts skills JSON"| node_llm_adapter
node_interview_ui -->|"starts session & submits answers"| node_interview_router
node_interview_ui -->|"initializes"| node_proctoring
node_proctoring -->|"reports violations & warnings"| node_interview_ui
node_interview_router -->|"delegates to"| node_interview_service
node_interview_router -->|"synthesizes speech"| node_tts
node_interview_service -->|"creates strategy via"| node_agent_factory
node_agent_factory -->|"instantiates"| node_agents
node_agents -->|"requests completions"| node_llm_adapter
node_llm_adapter -->|"calls active model"| node_llm_provider
node_interview_service -->|"persists session & resume"| node_session_repo
node_interview_service -->|"persists evaluation report"| node_interview_repo
node_session_repo -->|"writes to"| node_postgres
node_interview_repo -->|"writes to"| node_postgres

node_app -->|"routes to"| node_dsa_ui
node_dsa_ui -->|"requests & submits code"| node_dsa_router
node_dsa_router -->|"generates & evaluates"| node_llm_adapter

node_app -->|"routes to"| node_coach_ui
node_coach_ui -->|"requests coaching"| node_resources_router
node_resources_router -->|"completes advice"| node_llm_adapter

node_api_main -->|"mounts"| node_auth_router
node_api_main -->|"mounts"| node_interview_router
node_api_main -->|"mounts"| node_resume_router
node_api_main -->|"mounts"| node_dsa_router
node_api_main -->|"mounts"| node_resources_router

click node_app "https://github.com/iamanu26/mockhire_ai/blob/main/frontend/src/App.jsx"
click node_auth_ui "https://github.com/iamanu26/mockhire_ai/blob/main/frontend/src/context/AuthContext.jsx"
click node_interview_ui "https://github.com/iamanu26/mockhire_ai/blob/main/frontend/src/pages/Interview.jsx"
click node_proctoring "https://github.com/iamanu26/mockhire_ai/blob/main/frontend/src/hooks/useProctoring.js"
click node_dsa_ui "https://github.com/iamanu26/mockhire_ai/blob/main/frontend/src/pages/Dsapractice.jsx"
click node_coach_ui "https://github.com/iamanu26/mockhire_ai/blob/main/frontend/src/pages/Resources.jsx"
click node_api_main "https://github.com/iamanu26/mockhire_ai/blob/main/backend/main.py"
click node_auth_router "https://github.com/iamanu26/mockhire_ai/blob/main/backend/routers/auth_router.py"
click node_interview_router "https://github.com/iamanu26/mockhire_ai/blob/main/backend/routers/interview_router.py"
click node_resume_router "https://github.com/iamanu26/mockhire_ai/blob/main/backend/routers/resume_router.py"
click node_dsa_router "https://github.com/iamanu26/mockhire_ai/blob/main/backend/routers/dsa_router.py"
click node_resources_router "https://github.com/iamanu26/mockhire_ai/blob/main/backend/routers/resources_router.py"
click node_auth_service "https://github.com/iamanu26/mockhire_ai/blob/main/backend/services/auth_service.py"
click node_interview_service "https://github.com/iamanu26/mockhire_ai/blob/main/backend/services/interview_service.py"
click node_agent_factory "https://github.com/iamanu26/mockhire_ai/blob/main/backend/agents/agent_factory.py"
click node_agents "https://github.com/iamanu26/mockhire_ai/blob/main/backend/agents/base_agent.py"
click node_llm_adapter "https://github.com/iamanu26/mockhire_ai/blob/main/backend/llm/llm_factory.py"
click node_user_repo "https://github.com/iamanu26/mockhire_ai/blob/main/backend/repositories/user_repository.py"
click node_session_repo "https://github.com/iamanu26/mockhire_ai/blob/main/backend/repositories/session_repository.py"
click node_interview_repo "https://github.com/iamanu26/mockhire_ai/blob/main/backend/repositories/interview_repository.py"
click node_postgres "https://github.com/iamanu26/mockhire_ai/blob/main/backend/core/database.py"
click node_tts "https://github.com/iamanu26/mockhire_ai/blob/main/backend/text_to_speech.py"
click node_email_service "https://github.com/iamanu26/mockhire_ai/blob/main/backend/email_utils.py"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_app,node_auth_ui,node_interview_ui,node_proctoring,node_dsa_ui,node_coach_ui toneBlue
class node_api_main,node_auth_router,node_interview_router,node_resume_router,node_dsa_router,node_resources_router toneAmber
class node_auth_service,node_interview_service,node_agent_factory,node_agents,node_llm_adapter toneMint
class node_postgres,node_user_repo,node_session_repo,node_interview_repo toneRose
class node_tts,node_email_service,node_google,node_llm_provider,node_user toneIndigo
```

### Layer Breakdown

| Architectural Layer | Core Technologies | Primary Responsibilities |
|---|---|---|
| **Frontend Experience** | React 19, Vite 7, React Router 7, `face-api.js`, Web Speech API | Reactive UI, client-side vision proctoring, speech synthesis & recognition, auth context |
| **Backend API (Routers)** | FastAPI 0.135, Pydantic v2, SlowAPI Rate Limiting | Thin controllers (`auth`, `interview`, `resume`, `dsa`, `resources`, `profile`) |
| **Domain & Intelligence Services** | Agent Factory, Strategy Agents, Resilient LLM Adapter | Business logic orchestration, interview strategies, multi-LLM failover (Groq + Gemini) |
| **Persistence Layer** | PostgreSQL, SQLAlchemy 2.0 ORM, Repository Pattern | Decoupled data queries via `UserRepository`, `SessionRepository`, `InterviewRepository` |
| **External Integrations & Providers** | Coqui XTTS-v2 (HuggingFace), FastAPI-Mail, Google OAuth 2.0, Cloud LLMs | Neural speech synthesis, transactional OTP emails, OAuth token exchange, AI model completions |

---

## 🔍 Feature Deep Dive

### 01 — 🎙️ Voice Interview Simulation

The AI interviewer dynamically acts as a live technical lead or HR director, asking questions through neural audio, listening through Web Speech APIs, and evaluating candidate responses with conversational continuity.

- **Strategy-Driven Agents**: Employs `TechnicalInterviewAgent` and `HRInterviewAgent` generated dynamically via `AgentFactory`.
- **Targeted Customization**: Configured per session by company tier (*Product, Service, Startup*), role (*Software Engineer, Frontend, Backend, etc.*), and seniority level (*Junior, Intermediate, Senior*).
- **Dual-Voice Engine**: Utilizes **HuggingFace Coqui XTTS-v2** high-fidelity speech inference with transparent client-side `SpeechSynthesis` fallback.
- **Contextual Follow-ups**: Evaluates answers against interview history; avoids canned lists by synthesizing targeted follow-ups.
- **Adversarial Defense**: Protected by `InjectionGuard` (Chain of Responsibility) to block prompt injection attacks and malicious overrides.

---

### 02 — 🛡️ Real-Time Browser Proctoring

MockHire AI features an automated browser proctoring system built directly into `useProctoring.js` using client-side computer vision:

- **Face Presence Tracking**: Leverages `face-api.js` (Tiny Face Detector / SSD MobileNet) to ensure candidate presence in front of the camera.
- **Multiple Face Detection**: Instantly alerts the candidate and records an infraction if more than one face appears in the video frame.
- **Tab & Window Vigilance**: Listens to `visibilitychange` and window `blur` events to detect off-tab research or background app switching.
- **Real-Time Violation Counter**: Informs the user of detected warnings, ensuring integrity while remaining completely client-side without sending raw video streams over the wire.

---

### 03 — 📊 Multi-Metric AI Feedback Report

Upon interview completion, the candidate's transcript is passed to the LLM for multi-faceted rubric scoring:

| Metric | Focus Area | What the Model Analyzes |
|---|---|---|
| 💬 **Communication** | Clarity & Articulation | Answer conciseness, structured thinking (STAR method), and pace |
| 🧘 **Confidence** | Poise & Conviction | Use of filler words, assertive tone vs. defensive hesitation |
| 🔧 **Technical Skills** | Technical Depth | Accuracy of architectural explanations, trade-off understanding |
| ✍️ **Grammar** | Professionalism | Linguistic correctness, corporate vocabulary, professional tone |
| ⭐ **Overall** | Holistic Verdict | Aggregate interview readiness benchmark |

> All session telemetry and structured scorecards are persisted via `InterviewRepository` to PostgreSQL and surfaced in the user's permanent history.

---

### 04 — 💻 DSA Coding Practice Module

An integrated algorithm environment designed to test Data Structures & Algorithms competency:

- **AI-Generated Problems**: Offers Easy, Medium, and Hard challenges dynamically tailored to modern interview rubrics.
- **Multi-Language Support**: Write and test solutions in Python, C++, Java, and JavaScript.
- **Multi-Dimensional AI Review**: Evaluates code submissions for algorithmic correctness, asymptotic time complexity ($O$), auxiliary space complexity, and edge case coverage.
- **Scored Feedback**: Returns an automated evaluation score out of 10 with actionable optimization advice.

---

### 05 — 🔐 Enterprise Auth, Google OAuth & Security

A secure, unified identity and authentication layer:

- **Google OAuth 2.0 Integration**: One-click social sign-in with automatic token exchange and account provisioning.
- **Dual Password Hashing**: Modern **Argon2id** password hashing with backward-compatible **Bcrypt** verification via `passlib`.
- **JWT Authentication**: Stateles JSON Web Tokens (`HS256`) securing all protected routes with automated expiration.
- **Email Verification**: Transactional OTP emails dispatched via `fastapi-mail` for account confirmation and password recovery.
- **Rate Limiting**: Defends endpoints against brute force and DDoS using **SlowAPI** memory-backed limiting.

---

### 06 — 📄 Resume-Aware Interview Personalization

Candidates can upload their resume to receive bespoke questions tuned to their actual background:

- **PyPDF Document Parsing**: Extracts raw text from uploaded PDF resumes asynchronously on upload.
- **Skill Distillation**: The LLM extracts skills, project tech stacks, and domain specializations into a structured `skills_json` payload.
- **Prompt Context Injection**: Injected into the initial interview prompt, allowing the agent to reference specific projects and past engineering experiences.
- **Session Persistence**: Saved alongside the `InterviewSession` entity for auditability and post-interview review.

---

### 07 — 🤖 AI Interview Coach (Resources Hub)

A 24/7 dedicated career and interview preparation assistant accessible from the Resources tab:

- **Stateless Career Consultation**: Instant answers on behavioral questions, system design approaches, salary negotiation, and resume optimization.
- **Curated Learning Paths**: Role-specific question banks for Software Engineers, Product Managers, and Data Scientists.
- **Interactive Roleplay**: Practice challenging questions in a low-stakes conversational sandbox before starting a scored session.

---

## 🛠️ Tech Stack

<div align="center">

### Frontend Ecosystem

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![React Router](https://img.shields.io/badge/React_Router-7.1-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![face-api.js](https://img.shields.io/badge/face--api.js-0.22-8A2BE2?style=flat-square)](https://github.com/justadudewhohacks/face-api.js)
[![Web Speech API](https://img.shields.io/badge/Web_Speech_API-Native_Browser-34A853?style=flat-square)](#)
[![MediaDevices](https://img.shields.io/badge/MediaDevices_API-WebRTC_Streams-FF6C37?style=flat-square)](#)

### Backend Ecosystem

[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square)](https://www.sqlalchemy.org)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2.12-E92063?style=flat-square&logo=pydantic&logoColor=white)](https://docs.pydantic.dev)
[![SlowAPI](https://img.shields.io/badge/SlowAPI-Rate_Limiter-gray?style=flat-square)](https://github.com/laurentS/slowapi)
[![FastAPI-Mail](https://img.shields.io/badge/FastAPI--Mail-1.6-008080?style=flat-square)](https://github.com/sabuhish/fastapi-mail)
[![PyPDF](https://img.shields.io/badge/PyPDF-Text_Extraction-FF0000?style=flat-square)](https://pypdf.readthedocs.io)

### AI, Machine Learning & Voice

[![Groq](https://img.shields.io/badge/Groq-Qwen_3.8--27b-F54E00?style=flat-square)](https://groq.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash_(Fallback)-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Coqui XTTS-v2](https://img.shields.io/badge/Coqui_XTTS--v2-HuggingFace_Inference-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://huggingface.co/coqui/XTTS-v2)
[![InjectionGuard](https://img.shields.io/badge/Guard-Prompt_Injection_Filter-22C55E?style=flat-square)](#)

### Database & Security

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-psycopg2-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/python--jose-JWT_Tokens-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Argon2](https://img.shields.io/badge/Argon2-cffi_|_Bcrypt-5A3E85?style=flat-square)](https://passlib.readthedocs.io)
[![Google OAuth](https://img.shields.io/badge/Google_OAuth-2.0-EA4335?style=flat-square&logo=google&logoColor=white)](https://developers.google.com/identity)

</div>

---

## ⚙️ Installation & Setup

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18 or higher (LTS recommended)
- **PostgreSQL**: 14+ (Local instance or cloud hosted e.g., Supabase, Neon, Railway)
- **Groq API Key**: Obtainable from the [Groq Console](https://console.groq.com/)
- **Google Gemini API Key** *(Optional Fallback)*: Available from [Google AI Studio](https://aistudio.google.com/)
- **HuggingFace API Key**: For Coqui XTTS-v2 neural voice synthesis
- **Google OAuth Credentials**: Client ID & Secret from [Google Cloud Console](https://console.cloud.google.com/)
- **SMTP Credentials**: Gmail or transactional SMTP credentials for OTP mail

---

### 1. Clone the Repository

```bash
git clone https://github.com/iamanu26/mockhire_ai.git
cd mockhire_ai
```

---

### 2. Backend Configuration & Setup

1. Navigate to the backend directory and create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   # ── Database (PostgreSQL) ──────────────────────────
   DATABASE_URL=postgresql://postgres:password@localhost:5432/mockhire_db

   # ── Security & JWT ──────────────────────────────────
   SECRET_KEY=your_super_secret_jwt_key_here
   ACCESS_TOKEN_EXPIRE_MINUTES=10080

   # ── Primary AI Provider (Groq) ──────────────────────
   GROQ_API_KEY=gsk_your_groq_api_key
   GROQ_MODEL=qwen/qwen3.8-27b

   # ── Secondary AI Provider (Google Gemini Fallback) ──
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-3.6-flash

   # ── Text-to-Speech (HuggingFace Inference) ──────────
   HF_API_KEY=hf_your_huggingface_key

   # ── Google OAuth 2.0 ────────────────────────────────
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # ── Email Service (SMTP) ────────────────────────────
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password

   # ── Service URLs ────────────────────────────────────
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:8000
   ```

4. Launch the backend API service:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The FastAPI server starts at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be live at `http://localhost:5173`.*

---

## 🗂️ Project Structure

The project has been refactored from a monolithic setup into a modular, clean, layered architecture:

```
mockhire_ai/
│
├── backend/
│   ├── main.py                        # FastAPI entry point & router registration
│   ├── requirements.txt               # Backend dependencies
│   ├── text_to_speech.py              # Coqui XTTS-v2 HuggingFace TTS client
│   ├── email_utils.py                 # FastAPI-Mail async email helper
│   │
│   ├── core/                          # Cross-cutting foundational modules
│   │   ├── config.py                  # Pydantic/Settings environment configuration
│   │   ├── database.py                # PostgreSQL engine & session factory
│   │   └── security.py                # JWT creation, Argon2 & bcrypt hashing
│   │
│   ├── models/                        # SQLAlchemy Declarative ORM entities
│   │   ├── user.py                    # User account & OAuth entity
│   │   ├── interview_session.py       # Session, resume context & dialogue history
│   │   └── interview_result.py        # Final scorecard & metrics entity
│   │
│   ├── repositories/                  # Data Access Layer (Repository Pattern)
│   │   ├── base.py                    # Generic abstract BaseRepository
│   │   ├── user_repository.py         # User queries & profile mutations
│   │   ├── session_repository.py      # Session lifecycle & history persistence
│   │   └── interview_repository.py    # Results & score storage
│   │
│   ├── services/                      # Pure Business Logic Layer
│   │   ├── auth_service.py            # Registration, login, OTP & OAuth logic
│   │   ├── interview_service.py       # Session orchestration & agent coordination
│   │   └── profile_service.py         # Candidate stats & analytics calculation
│   │
│   ├── agents/                        # Interview Agents (Strategy Pattern)
│   │   ├── base_agent.py              # Abstract BaseInterviewAgent
│   │   ├── tech_agent.py              # Technical interview question strategy
│   │   ├── hr_agent.py                # HR behavioral interview strategy
│   │   └── agent_factory.py           # Factory for dynamic agent instantiation
│   │
│   ├── llm/                           # LLM Provider Layer (Adapter & Failover)
│   │   ├── base_llm.py                # Abstract BaseLLMClient contract
│   │   ├── groq_client.py             # High-speed Groq inference client
│   │   ├── gemini_client.py           # Google Gemini fallback client
│   │   └── llm_factory.py             # Resilient decorator with automated failover
│   │
│   ├── guards/                        # Security & Validation Pipeline
│   │   └── injection_guard.py         # Adversarial prompt injection detector
│   │
│   └── routers/                       # Thin HTTP Controllers
│       ├── auth_router.py             # Authentication & OAuth endpoints
│       ├── interview_router.py        # Interview session & answer exchange endpoints
│       ├── resume_router.py           # PyPDF extraction & parsing endpoint
│       ├── dsa_router.py              # DSA challenge generation & code review
│       ├── resources_router.py        # AI Coach dialogue endpoint
│       └── profile_router.py          # User statistics & history endpoints
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root application router & layout
│   │   ├── main.jsx                   # React 19 entry point
│   │   ├── index.css                  # Global styles & design system tokens
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global auth token & user state context
│   │   │
│   │   ├── hooks/
│   │   │   └── useProctoring.js       # face-api.js computer vision proctor hook
│   │   │
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Navbar.jsx             # Navigation bar & status
│   │   │   ├── Footer.jsx             # Global footer
│   │   │   └── ProtectedRoute.jsx     # Route authentication guard
│   │   │
│   │   └── pages/                     # Full-page route views
│   │       ├── Home.jsx               # Landing page & feature showcase
│   │       ├── Interview.jsx          # Live interview chamber with voice & video
│   │       ├── Feedback.jsx           # Comprehensive AI scorecard report
│   │       ├── Dsapractice.jsx        # LeetCode-style algorithm practice editor
│   │       ├── Resources.jsx          # AI Coach chat interface
│   │       ├── Profile.jsx            # Performance analytics & past sessions
│   │       ├── History.jsx            # Detailed interview review logs
│   │       ├── Login.jsx              # Credentials & Google OAuth login
│   │       ├── Register.jsx           # User registration
│   │       └── VerifyEmail.jsx        # OTP email verification
│   │
│   ├── package.json                   # React 19 & Vite dependencies
│   └── vite.config.js                 # Vite bundler configuration
│
└── README.md
```

---

## 🗄️ Database Architecture

The persistence model is managed via SQLAlchemy 2.0 with PostgreSQL, featuring automated index optimization and cascade deletions:

```
users
  ├── id (PK, Integer)
  ├── name (VARCHAR)
  ├── email (VARCHAR, Unique, Indexed)
  ├── password (VARCHAR, Nullable for OAuth users)
  ├── bio, college, role_title, avatar_url
  ├── is_verified (Boolean)
  ├── verify_token, reset_token, reset_token_expires
  ├── google_id (VARCHAR, Unique, Nullable)
  └── created_at (TIMESTAMP)
        │
        ├── 1:N ──> interview_sessions
        │             ├── id (PK, UUID String)
        │             ├── user_id (FK → users.id, Indexed)
        │             ├── interview_type ("tech" | "hr")
        │             ├── company, role, level
        │             ├── status ("in_progress" | "completed" | "stopped")
        │             ├── resume_context (JSON)
        │             ├── history (JSON Array: [{role, content}])
        │             └── created_at, updated_at
        │
        └── 1:N ──> interview_results
                      ├── id (PK, Integer, Indexed)
                      ├── user_id (FK → users.id)
                      ├── communication (0-100)
                      ├── confidence (0-100)
                      ├── technical (0-100)
                      ├── grammar (0-100)
                      ├── overall (0-100)
                      ├── summary (TEXT)
                      └── created_at (TIMESTAMP)
```

> **Connection Strategy**: Uses `create_engine` with `pool_pre_ping=True`, `pool_size=5`, `max_overflow=10`, and `pool_recycle=300` to prevent stale socket terminations on managed databases like Supabase or Neon.

---

## 🧠 Software Engineering & Design Patterns

### 1. SOLID Principles Implementation
- **Single Responsibility Principle (SRP)**: Handlers, services, repositories, and models are strictly isolated. `main.py` is an application factory only.
- **Open/Closed Principle (OCP)**: Adding new interview archetypes (e.g., `SystemDesignAgent`) or AI providers (e.g., `OpenAILLMClient`) requires zero modifications to existing classes.
- **Liskov Substitution Principle (LSP)**: `TechnicalInterviewAgent` and `HRInterviewAgent` seamlessly fulfill `BaseInterviewAgent`. Any client expects identical behavior.
- **Interface Segregation Principle (ISP)**: Repositories and LLM clients expose tight, single-purpose interfaces without bloated dependencies.
- **Dependency Inversion Principle (DIP)**: Services depend on abstract repositories and base LLM clients injected at runtime rather than concrete implementations.

### 2. Applied Design Patterns
- **Repository Pattern**: All database queries are encapsulated within `UserRepository`, `SessionRepository`, and `InterviewRepository`.
- **Strategy Pattern**: The interview engine selects between technical and behavioral strategies dynamically based on user setup.
- **Resilient Decorator Pattern**: `ResilientLLMClient` wraps primary LLMs (Groq) and catches timeouts or rate limits to transparently divert calls to secondary providers (Google Gemini) without dropping candidate requests.
- **Factory Pattern**: Centralized `AgentFactory` and `LLMFactory` decouple instantiation logic from consumer workflows.
- **Chain of Responsibility**: `InjectionGuard` filters incoming responses through rule-based sanity checks before LLM token consumption.

---

## 🗺️ Candidate Journey & User Flow

```
[ Candidate Enters Platform ]
             │
             ▼
[ Authentication ] ──(Google OAuth 2.0 or Email OTP Login)
             │
             ▼
[ Setup Interview Chamber ]
  ├── 1. Select Interview Type (Technical / HR)
  ├── 2. Configure Company, Role, & Experience Level
  └── 3. Upload Resume (PyPDF generates skill context)
             │
             ▼
[ Live Interactive Interview ]
  ├── Camera stream activated ──> face-api.js monitors attention & multi-face
  ├── AI speaks question ───────> Coqui XTTS-v2 / SpeechSynthesis
  ├── Candidate speaks answer ──> Web Speech API captures transcript
  └── LLM completes follow-up ──> Groq (Qwen 3.8) with Gemini fallback
             │
      (Loop 5-7 turns)
             │
             ▼
[ Session Completion & Analytics ]
  ├── Transcript submitted to feedback pipeline
  ├── 5-dimension scorecard calculated
  └── Stored in PostgreSQL & rendered on Candidate Profile
             │
             ▼
[ Continued Preparation (Anytime) ]
  ├── DSA Practice Module (Interactive coding sandbox)
  └── AI Coach / Resources (STAR prep & negotiation strategies)
```

---

<div align="center">

**⭐ If MockHire AI helped you prepare for your dream role, please star the repository!**

Built with ❤️ by [Anurag Dubey](https://portfolio-iamanu26.vercel.app/)

</div>
