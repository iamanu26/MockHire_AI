<div align="center">

# 🎙️ MockHire AI

### AI-Powered Interview & Speaking Skill Simulator

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev)
[![LLaMA](https://img.shields.io/badge/AI-LLaMA_3.1_via_Groq-F54E00?style=for-the-badge)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![OAuth](https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity)
[![License](https://img.shields.io/badge/License-MIT-4F46E5?style=for-the-badge)](LICENSE)

*Built by [Anurag Dubey](https://portfolio-iamanu26.vercel.app/)*

</div>

---

MockHire AI is a full-stack, AI-driven web application that simulates real-world job interviews through **live voice interaction** and delivers intelligent, structured performance feedback. The platform helps students and job seekers sharpen their interview readiness, communication skills, and technical confidence — in a realistic, pressure-free environment.

Now featuring **Google OAuth 2.0**, **email verification**, **resume-aware interviews**, an **AI Interview Coach**, and a production-grade **PostgreSQL** backend.

---

## ✨ Features at a Glance

| # | Feature | What It Does |
|---|---------|-------------|
| 🧠 | **AI Interview Simulation** | Conducts HR & Technical interviews tailored to your role, company type, and experience level |
| 🎙️ | **Voice-Based Interaction** | Fully hands-free — AI speaks questions, you answer verbally, Web Speech API handles everything |
| 📊 | **AI Feedback Report** | Auto-generates a scorecard across Communication, Confidence, Technical Skills, Grammar & Overall |
| 💻 | **DSA Practice Module** | LeetCode-style coding environment with AI-generated problems and code review |
| 📄 | **Resume-Aware Interview** *(NEW)* | Upload your PDF resume — AI parses your skills and tailors every question to your background |
| 🤖 | **AI Interview Coach** *(NEW)* | Dedicated Resources tab with an on-demand LLaMA 3.1 coaching chatbot |
| 🔐 | **OAuth + JWT + Email Verify** *(NEW)* | Google OAuth 2.0, email OTP verification, and JWT — all unified in one auth system |
| 🐘 | **PostgreSQL Backend** *(UPGRADED)* | Migrated from SQLite to PostgreSQL with Alembic migrations and connection pooling |

---

## 🏗️ System Architecture

The project follows a **decoupled, layered architecture** — Frontend, Backend API, AI Engine, and Data Layer each operate independently and communicate over clean interfaces.

```mermaid
graph TB
    subgraph FRONTEND ["Layer 1 — Frontend  React.js + Vite"]
        UI["UI + Router"] --- VOICE["Voice I/O"]
        VOICE --- RESUME_UI["Resume Upload\nPDF Drag & Drop"]
        RESUME_UI --- COACH_UI["Resources Tab\nCoach Chat UI"]
        COACH_UI --- AUTH_F["Auth Forms\nOAuth + Email OTP"]
    end

    subgraph BACKEND ["Layer 2 — Backend  FastAPI Python"]
        AUTH_R["/auth\nregister, login\nOAuth, verify-email"] --- INTERVIEW_R["/interview\nstart, answer, end"]
        RESUME_R["/resume\nupload, parse\nextract, store"] --- COACH_R["/coach\nchat, advice\ntips, strategy"]
        DSA_R["/dsa\ngenerate, evaluate"] --- FEEDBACK_R["/feedback\nreport, score"]
    end

    subgraph AI ["Layer 3 — AI Engine  LLaMA 3.1 via Groq"]
        QGEN["Question Gen\nResume-aware Agent"] --- FOLLOWUP["Follow-up Agent\nContext-aware"]
        RESUME_AI["Resume Parser\nPDF → skills JSON"] --- COACH_AI["Coach Agent\nCoaching prompts"]
        DSA_AI["DSA Evaluator\nComplexity review"] --- FEEDBACK_AI["Feedback Report\nScore generator"]
    end

    subgraph DB ["Layer 4 — Data Layer  PostgreSQL via SQLAlchemy"]
        USERS[("USERS\n+ oauth_provider\n+ is_verified")] --- SESSIONS[("SESSIONS\n+ resume_id FK")]
        RESUMES[("RESUMES\nNEW TABLE")] --- SCORES[("SCORES")]
        HISTORY[("HISTORY")] --- DSA_DB[("DSA RESULTS")]
    end

    FRONTEND -->|"HTTP / REST API"| BACKEND
    BACKEND -->|"Groq API Calls (LLaMA 3.1)"| AI
    BACKEND -->|"SQLAlchemy ORM"| DB
```

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | React.js + Vite + Web Speech API | User interface, voice I/O, resume uploader, coach chat |
| **Backend API** | FastAPI (Python) + JWT + OAuth + bcrypt | Routing, auth, resume handling, coach, business logic |
| **AI Engine** | LLaMA 3.1 via Groq API | Question gen, follow-ups, resume parsing, coaching, DSA eval, feedback |
| **Data Layer** | PostgreSQL via SQLAlchemy ORM + Alembic | Users, sessions, resumes, history, scores |

---

## 🔍 Feature Deep Dive

### 01 — 🎙️ Voice Interview Simulation

The AI acts as a real interviewer — it speaks questions aloud via speech synthesis, listens to your spoken answers through the browser's Web Speech API, and sends your response to LLaMA 3.1 to generate the next intelligent, context-aware follow-up.

- Technical & HR interview modes
- Questions tailored to **company type**, **job role**, and **experience level**
- **Resume-context injection** — opening questions reference your actual background
- Conversation-aware follow-ups (not random question lists)
- Session isolation — every interview starts fresh with no history bleed

---

### 02 — 📊 AI Feedback Report

After ending a session, your full conversation history is passed to LLaMA 3.1 which generates a detailed performance report — scored and written from what you *actually said*, not a generic template.

| Score Category | What's Evaluated |
|---|---|
| 💬 Communication | Clarity, structure, and coherence of answers |
| 🧘 Confidence | Assertiveness, filler words, hedging language |
| 🔧 Technical Skills | Accuracy and depth of technical responses |
| ✍️ Grammar | Language correctness and professionalism |
| ⭐ Overall | Holistic interview performance score |

> Includes a written **strengths & weaknesses summary** specific to your actual conversation. All scores persisted to PostgreSQL.

---

### 03 — 💻 DSA Practice Module

A LeetCode-style coding environment where every session brings 3 fresh AI-generated problems. Submit your solution and get a detailed code review from the AI.

- **3 problems per session** — Easy, Medium, Hard
- **4 languages supported** — Python, C++, Java, JavaScript
- **Browser-based editor** with line numbers and tab support
- AI reviews for **correctness**, **time complexity**, **space complexity**
- **Score out of 10** per submission

---

### 04 — 🔐 User Auth, OAuth & History

A unified authentication system supports both traditional and social sign-in, with mandatory email verification for new accounts.

- **Google OAuth 2.0** via Authlib — one-click sign-in
- **Email OTP verification** — sent on registration, required before first session (OAuth users are pre-verified)
- **JWT access tokens** for all protected endpoints — both auth paths issue the same JWT payload
- `oauth_provider` and `is_verified` columns added to the USERS table
- Full **per-user interview history** stored in PostgreSQL
- View past session scores and feedback anytime

---

### 05 — 📄 Resume-Aware Interview *(NEW)*

Upload your PDF resume before starting a session. The AI reads your background and asks questions that are directly relevant to your actual experience — not a generic template.

- **PDF upload & drag-and-drop UI** on the frontend
- **PyMuPDF** extracts raw text from your resume
- **LLaMA 3.1** summarizes extracted text into a compact `skills_json` (≤200 tokens) — minimal prompt overhead, maximum relevance
- `skills_json` injected into the interview system prompt at session start
- Resume stored in a new **RESUMES** table in PostgreSQL, linked to your user account via FK
- SESSIONS table now carries a `resume_id` FK — every interview session is tied to the resume used

---

### 06 — 🤖 AI Interview Coach — Resources Tab *(NEW)*

A dedicated **Resources** tab in the navigation gives you access to an AI coaching chatbot — completely separate from the interview simulation, available at any time.

- **Chat-based interface** powered by LLaMA 3.1 via Groq
- Stateless per-message calls with a coaching-specific system prompt
- Covers: interview tips, STAR method coaching, role-specific question banks (SWE, PM, Data), resume phrasing, technical concept explanations, offer negotiation
- Accessible via `/coach/chat` backend endpoint
- No session history required — ask anything, anytime

---

## 🛠️ Tech Stack

<div align="center">

**Frontend**

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Web Speech API](https://img.shields.io/badge/Web_Speech_API-Browser_Native-34A853?style=flat-square)

**Backend**

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-D71F00?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-Password_Hashing-6D4C41?style=flat-square)
![Authlib](https://img.shields.io/badge/Authlib-Google_OAuth_2.0-4285F4?style=flat-square&logo=google&logoColor=white)
![SendGrid](https://img.shields.io/badge/SendGrid-Email_OTP-1A82E2?style=flat-square)
![PyMuPDF](https://img.shields.io/badge/PyMuPDF-Resume_Parser-EC4899?style=flat-square)

**AI Engine**

![LLaMA](https://img.shields.io/badge/LLaMA_3.1-via_Groq-F54E00?style=flat-square)

**Database**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production_DB-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Alembic](https://img.shields.io/badge/Alembic-Migrations-gray?style=flat-square)

</div>

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (local or hosted — e.g. Supabase, Railway, Neon)
- A [Groq API key](https://console.groq.com/) (free tier available)
- A Google OAuth app (Client ID + Secret) from [Google Cloud Console](https://console.cloud.google.com/)
- A SendGrid API key (or any SMTP credentials) for email verification

### 1. Clone the Repository

```bash
git clone https://github.com/iamanu26/mockhire-ai.git
cd mockhire-ai
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
# AI
GROQ_API_KEY=your_groq_api_key_here

# Auth
SECRET_KEY=your_jwt_secret_key_here

# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/mockhire

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Email Verification
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
```

Run database migrations:

```bash
alembic upgrade head
```

Start the server:

```bash
uvicorn main:app --reload
# API runs on http://localhost:8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🗂️ Project Structure

```
mockhire-ai/
│
├── backend/
│   ├── main.py                # FastAPI app entry point
│   ├── models.py              # SQLAlchemy DB models (Users, Sessions, Resumes, Scores...)
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── auth.py                # JWT logic, bcrypt hashing, OAuth callback
│   ├── email_utils.py         # OTP generation & SendGrid/SMTP email sender
│   ├── interview_agent.py     # LLaMA interview session manager (resume-aware)
│   ├── resume_parser.py       # PyMuPDF extraction + LLaMA skills summariser
│   ├── coach_agent.py         # Stateless LLaMA coaching chatbot
│   ├── dsa_agent.py           # DSA problem generator & evaluator
│   ├── feedback.py            # Feedback report generator
│   ├── database.py            # PostgreSQL async connection & session
│   ├── alembic/               # Database migration scripts
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Route-level page components
│   │   │   ├── Interview.jsx
│   │   │   ├── Resources.jsx  # AI Coach chat page (NEW)
│   │   │   ├── ResumeUpload.jsx  # PDF upload page (NEW)
│   │   │   ├── Login.jsx      # JWT + Google OAuth login
│   │   │   └── VerifyEmail.jsx   # OTP verification page (NEW)
│   │   ├── hooks/             # Custom hooks (voice, auth, resume)
│   │   └── App.jsx            # Router & layout
│   ├── index.html
│   └── vite.config.js
│
└── README.md
```

---

## 🗄️ Database Schema

```
USERS
  id, username, email, password_hash
  oauth_provider (google | null)   ← NEW
  oauth_id                         ← NEW
  is_verified (bool)               ← NEW
  verification_token               ← NEW
  created_at, role

RESUMES                            ← NEW TABLE
  id, user_id (FK → USERS)
  file_path, extracted_text
  skills_json
  uploaded_at

SESSIONS
  id, user_id (FK → USERS)
  resume_id (FK → RESUMES)         ← NEW
  mode, status
  started_at, ended_at

HISTORY
  id, session_id (FK → SESSIONS)
  question, answer
  turn_index, timestamp

SCORES
  id, session_id (FK → SESSIONS)
  communication, confidence
  technical, grammar, overall

DSA_RESULTS
  id, user_id (FK → USERS)
  level, language
  score (out of 10)
  submitted_at
```

> **Connection string:** `postgresql+asyncpg://user:pass@host:5432/mockhire`
> Migrations managed via **Alembic** — run `alembic upgrade head` after any model changes.

---

## 🧠 Engineering Notes

Non-obvious problems solved during development:

- **Shared agent state bug** — Two separate `InterviewAgent` instances were being created per request, causing feedback to generate against an empty conversation history. Fixed by enforcing a single shared instance per session.

- **LLaMA JSON inconsistency** — LLaMA 3.1 sometimes returns scores as `"7/10"` strings or wraps JSON in markdown fences. Built a custom parser that handles all known output formats robustly, with server-side type coercion as a final safety net.

- **Session isolation** — Added a `/interview/start` endpoint that explicitly clears conversation history, ensuring scores always reflect the *current* interview only — never a previous session.

- **Prompt engineering for fair scoring** — Engineered explicit scoring rubrics in the system prompt to prevent the model from giving inflated scores for low-effort answers. A server-side score cap acts as a final guard.

- **PostgreSQL migration** — SQLite's single-writer lock blocked concurrent sessions and lacked connection pooling for production loads. Migrated to PostgreSQL via the `asyncpg` driver with zero data loss using Alembic migration scripts. Added the `RESUMES` table and all new foreign keys in the same migration.

- **OAuth + email verification unified** — Supporting Google OAuth and password-based login with a single session model required unifying two identity flows. Both paths now issue the same JWT payload; the `oauth_provider` column on USERS tracks the origin, and `is_verified` gates access to interviews regardless of login method.

- **Resume context injection** — Injecting a full PDF's text into every prompt risked blowing token limits and adding latency. PyMuPDF extracts the raw text; LLaMA then summarises it to a compact `skills_json` (≤200 tokens). Only the JSON is injected into the system prompt — minimal overhead, maximum relevance.

---

## 🗺️ User Flow

```
Login / Google OAuth
        ↓
Email OTP Verification (new accounts)
        ↓
Upload PDF Resume (optional — enhances question relevance)
        ↓
Select Interview Mode (Technical / HR)
        ↓
AI asks resume-tailored question via SpeechSynthesis
        ↓
You answer verbally via SpeechRecognition
        ↓
LLaMA generates context-aware follow-up  ←── loops until session ends
        ↓
AI generates 5-metric scorecard → saved to PostgreSQL
        ↓
[Anytime] Resources Tab → AI Coach (LLaMA 3.1) for on-demand guidance
```

---

<div align="center">

**⭐ If MockHire AI helped you prep smarter, give it a star.**

*Built by [Anurag Dubey](https://portfolio-iamanu26.vercel.app/)*

</div>
