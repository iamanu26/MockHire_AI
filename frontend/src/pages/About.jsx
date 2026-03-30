import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './About.css';

const CAPS = [
  { icon: "🤖", title: "Intelligent Interviewer", desc: "Powered by a fine-tuned LLaMA model, our AI conducts dynamic, context-aware interviews. It listens to your answers, understands the depth of your response, and probes further — exactly like a seasoned technical recruiter would." },
  { icon: "🎙️", title: "Voice-First Experience", desc: "Built on the Web Speech API with advanced Text-to-Speech synthesis, MockHire AI enables fully spoken interviews. No typing, no clicking — just you, your voice, and a realistic interview environment." },
  { icon: "📊", title: "Detailed Performance Report", desc: "Every session ends with a rich evaluation: technical accuracy scores, sentiment analysis, communication clarity ratings, and a list of specific improvement areas tailored to your responses." },
  { icon: "🔄", title: "Adaptive Difficulty Engine", desc: "The system continuously adjusts question complexity based on your performance. Strong answers unlock harder challenges. Weaker responses trigger supportive, scaffolded follow-ups to help you grow." },
  { icon: "🛡️", title: "Zero-Risk Practice Environment", desc: "Remove the anxiety of real interviews entirely. Mistakes are learning opportunities here — not career setbacks. Practice as many times as needed with no consequences, only progress." },
  { icon: "⚙️", title: "Dual Interview Modes", desc: "Choose between a rigorous Technical round (data structures, system design, algorithms) or a Human Resources round (behavioural, situational, culture fit). Both are fully voice-enabled and AI-evaluated." },
];

const TECH = [
  { name: "LLaMA 3", role: "Core LLM", pct: 95 },
  { name: "FastAPI", role: "Backend API", pct: 90 },
  { name: "React", role: "Frontend UI", pct: 92 },
  { name: "Web Speech API", role: "Voice Engine", pct: 88 },
  { name: "Python", role: "AI Pipeline", pct: 94 },
  { name: "JWT Auth", role: "Security Layer", pct: 85 },
  { name: "SQLite / ORM", role: "Data Storage", pct: 80 },
  { name: "Vite", role: "Build Tool", pct: 87 },
];

const VALUES = [
  { title: "Accessibility First", desc: "High-quality interview coaching has historically been locked behind expensive bootcamps and exclusive networks. We believe every candidate — regardless of background, geography, or income — deserves access to world-class preparation tools." },
  { title: "Honest Feedback", desc: "We don't sugarcoat. Our AI provides direct, specific, and actionable feedback because that is the only kind of feedback that actually drives improvement. Candour, delivered with empathy, is at the core of every session report." },
  { title: "Continuous Learning", desc: "The hiring landscape evolves rapidly. Our models are continuously updated with new question banks, evaluation criteria, and industry-specific prompts to ensure your preparation remains relevant and competitive." },
  { title: "Privacy by Design", desc: "Your sessions, answers, and performance data belong to you alone. We implement end-to-end encryption, zero third-party data sharing, and full session deletion on request — because your vulnerability during practice deserves protection." },
];

const TEAM = [
  { avatar: "👨‍💻", name: "AI Engineering", role: "LLM & Inference", bio: "Responsible for fine-tuning the LLaMA model on interview-specific datasets, optimising inference latency, and building the adaptive question generation pipeline." },
  { avatar: "🎨", name: "Product & Design", role: "UX & Frontend", bio: "Crafted the voice-first interaction model, designed every screen with accessibility in mind, and built the React frontend that makes complex AI feel effortless." },
  { avatar: "⚙️", name: "Backend Systems", role: "API & Infrastructure", bio: "Architected the FastAPI backend, JWT authentication system, session management layer, and the real-time feedback scoring engine that powers every report." },
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
            <p>Today, MockHire AI serves thousands of candidates across technical and HR interview preparation. Our LLaMA-powered engine has processed over twelve thousand interview sessions, and our adaptive difficulty system ensures that <strong>every session is a meaningful challenge</strong> — regardless of where you start.</p>
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