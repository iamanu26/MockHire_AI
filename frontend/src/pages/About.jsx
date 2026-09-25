import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './About.css';

const CAPS = [
  { icon: "🤖", title: "Dual-Engine AI Interviewer", desc: "Powered by a resilient dual-engine architecture (Groq Qwen 3.8 & Google Gemini), our dynamic strategy agents conduct context-aware interviews tailored to your exact role, target company, and uploaded resume." },
  { icon: "🎙️", title: "Neural Voice & Speech", desc: "Integrated with HuggingFace Coqui XTTS-v2 neural voice synthesis and native Web Speech APIs for hands-free, hyper-realistic verbal dialogue. AI speaks questions naturally; you respond out loud." },
  { icon: "🛡️", title: "Client-Side Vision Proctoring", desc: "Built-in computer vision via face-api.js tracks camera presence, detects multiple faces or head turns, and flags tab switches in real time — providing authentic proctored exam readiness." },
  { icon: "📄", title: "Resume-Aware Tailoring", desc: "Upload your PDF resume. Our PyPDF and LLM extraction pipeline distills your skill vectors and past projects, injecting customized context directly into the interview question flow." },
  { icon: "📊", title: "Multi-Metric Feedback", desc: "Every session concludes with a 5-dimension scorecard across Technical Skills, Communication, Confidence, Grammar, and Overall Readiness, persisted to your PostgreSQL profile." },
  { icon: "⚙️", title: "Dual Interview Modes & DSA", desc: "Choose between Technical rounds (DSA, architecture, coding review) or Human Resources rounds (behavioural, STAR method, culture fit). Practice anytime with zero risk." },
];

const TECH = [
  { name: "Groq (Qwen 3.8)", role: "Primary LLM", pct: 96 },
  { name: "Google Gemini", role: "LLM Failover", pct: 92 },
  { name: "FastAPI", role: "Backend API", pct: 95 },
  { name: "React 19 & Vite", role: "Frontend UI", pct: 94 },
  { name: "Coqui XTTS-v2", role: "Neural Speech", pct: 90 },
  { name: "PostgreSQL", role: "Persistence (SQLAlchemy)", pct: 93 },
  { name: "face-api.js", role: "Vision Proctoring", pct: 88 },
  { name: "OAuth 2.0 & JWT", role: "Security Layer", pct: 91 },
];

const VALUES = [
  { title: "Accessibility First", desc: "High-quality interview coaching has historically been locked behind expensive bootcamps and exclusive networks. We believe every candidate — regardless of background, geography, or income — deserves access to world-class preparation tools." },
  { title: "Honest Feedback", desc: "We don't sugarcoat. Our AI provides direct, specific, and actionable feedback because that is the only kind of feedback that actually drives improvement. Candour, delivered with empathy, is at the core of every session report." },
  { title: "Continuous Learning", desc: "The hiring landscape evolves rapidly. Our models are continuously updated with new question banks, evaluation criteria, and industry-specific prompts to ensure your preparation remains relevant and competitive." },
  { title: "Privacy by Design", desc: "Your sessions, answers, and performance data belong to you alone. We implement end-to-end encryption, zero third-party data sharing, and full session deletion on request — because your vulnerability during practice deserves protection." },
];

const TEAM = [
  { avatar: "👨‍💻", name: "AI Engineering", role: "LLM & Inference", bio: "Architected the dual-engine LLM failover system (Groq & Gemini), prompt injection guardrails, resume skill vectorization, and adaptive interview strategy agents." },
  { avatar: "🎨", name: "Product & Design", role: "UX & Frontend", bio: "Crafted the voice-first interaction model, designed every screen with accessibility in mind, and built the React frontend that makes complex AI feel effortless." },
  { avatar: "⚙️", name: "Backend Systems", role: "API & Infrastructure", bio: "Engineered the layered FastAPI backend, repository pattern, PostgreSQL connection pooling, and automated scoring pipelines that power every session." },
];

// ── Smart CTA button — goes to /interview if logged in, else /login ──
function SmartInterviewBtn({ className, label }) {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <button
      className={className}
      onClick={() => navigate(token ? "/interview" : "/login")}
    >
      {label}
    </button>
  );
}

export default function About() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <video ref={videoRef} autoPlay loop muted playsInline className="about-bg-video">
        <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
      </video>
      <div className="about-overlay" />
      <div className="about-grid-bg" />
      <div className="about-orb-1" />
      <div className="about-orb-2" />
      <div className="about-scanline" />

      <div className="about-content">
        <section className="ab-hero">
          <div>
            <div className="ab-badge">
              <span className="ab-badge-dot" />
              Our Story
            </div>
            <h1>
              <span className="outline">Built for</span><br />
              <span style={{ color: "#fff" }}>Candidates</span><br />
              <span className="acid">Who Deserve</span><br />
              <span style={{ color: "#fff" }}>Better.</span>
            </h1>
            <p className="ab-hero-text">
              MockHire AI was founded on a single, uncomfortable truth: technical
              brilliance alone is not enough to land the job. Interviews are a
              skill — and like every skill, they demand deliberate, realistic practice.
            </p>
            <div className="ab-hero-quote">
              <p>
                "The gap between knowing the answer and communicating it under
                pressure is wider than most candidates realise. MockHire AI exists
                to close that gap — permanently."
              </p>
              <cite>— MockHire AI Mission Statement</cite>
            </div>
          </div>

          <div className="ab-hero-stats">
            {[
              { num: "12K+", label: "Interview\nSessions Run" },
              { num: "98%",  label: "Transcription\nAccuracy" },
              { num: "4.9★", label: "Average\nUser Rating" },
              { num: "2",    label: "Interview\nModes" },
            ].map((s, i) => (
              <div className="ab-stat-box" key={i}>
                <div className="ab-stat-num">{s.num}</div>
                <div className="ab-stat-label" style={{ whiteSpace: "pre-line" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="ab-divider" />

        <section className="ab-story">
          <div className="ab-story-label">
            — Background
            <span>Our<br />Origin</span>
          </div>
          <div className="ab-story-body">
            <p>MockHire AI began as a personal frustration. Too many brilliant engineers were failing interviews — not because they lacked knowledge, but because they had <strong>never practised under realistic conditions.</strong> Traditional mock interviews required scheduling, money, and access to the right network. Most candidates had none of these.</p>
            <p>We set out to build something different: a system that would be available at <strong>2am the night before your interview</strong>, ask you the exact type of questions a real recruiter would, and give you honest, data-driven feedback the moment you finished speaking. No scheduling. No cost. No judgment.</p>
            <p>Today, MockHire AI serves thousands of candidates across technical and HR interview preparation. Our dual-engine AI platform has processed over twelve thousand interview sessions, and our adaptive difficulty system ensures that <strong>every session is a meaningful challenge</strong> — regardless of where you start.</p>
          </div>
        </section>

        <div className="ab-divider" />

        <section className="ab-caps">
          <div className="ab-caps-inner">
            <div className="ab-caps-header">
              <h2>What MockHire<br />AI Can Do</h2>
              <p>Six core capabilities engineered to replicate and exceed the pressure of a real interview environment.</p>
            </div>
            <div className="ab-caps-grid">
              {CAPS.map((c, i) => (
                <div className="ab-cap-card" key={i}>
                  <div className="ab-cap-num">0{i + 1}</div>
                  <span className="ab-cap-icon">{c.icon}</span>
                  <div className="ab-cap-title">{c.title}</div>
                  <div className="ab-cap-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="ab-tech">
          <div className="ab-tech-inner">
            <div className="ab-tech-label">— Technology Stack</div>
            <div className="ab-tech-grid">
              {TECH.map((t, i) => (
                <div className="ab-tech-item" key={i}>
                  <div className="ab-tech-name">{t.name}</div>
                  <div className="ab-tech-role">{t.role}</div>
                  <div className="ab-tech-bar-track">
                    <div className="ab-tech-bar-fill" style={{ "--w": `${t.pct}%`, width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="ab-values">
          <div className="ab-values-inner">
            <div className="ab-values-header">
              <h2>The Values<br />We Build On</h2>
              <p>Every product decision we make is filtered through these four principles. They are not aspirational — they are operational.</p>
            </div>
            <div className="ab-values-list">
              {VALUES.map((v, i) => (
                <div className="ab-value-row" key={i}>
                  <div className="ab-value-num">0{i + 1}</div>
                  <div className="ab-value-title">{v.title}</div>
                  <div className="ab-value-desc">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="ab-team">
          <div className="ab-team-inner">
            <div className="ab-team-label">— The People Behind It</div>
            <div className="ab-team-title">Built by Engineers,<br />For Candidates.</div>
            <div className="ab-team-grid">
              {TEAM.map((t, i) => (
                <div className="ab-team-card" key={i}>
                  <div className="ab-team-avatar">{t.avatar}</div>
                  <div className="ab-team-name">{t.name}</div>
                  <div className="ab-team-role">{t.role}</div>
                  <div className="ab-team-bio">{t.bio}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="ab-cta">
          <h2>Ready to start practising?</h2>
          <p>Join thousands of candidates already sharpening their skills with MockHire AI.</p>
          <SmartInterviewBtn className="ab-cta-btn" label="Begin Your Session" />
        </section>
      </div>
    </div>
  );
}