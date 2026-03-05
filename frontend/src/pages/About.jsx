import { useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

:root {
  --ink: #05080f;
  --acid: #c8f135;
  --dim: #8a9ab0;
  --line: rgba(255,255,255,0.07);
  --card: rgba(255,255,255,0.03);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes blinkDot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes counterUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes barGrow {
  from { width: 0; }
  to   { width: var(--w); }
}
@keyframes orbFloat {
  0%, 100% { transform: translateY(0) translateX(0); }
  50%       { transform: translateY(-24px) translateX(16px); }
}

.about-page {
  font-family: 'DM Mono', monospace;
  background: var(--ink);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Background */
.about-bg-video {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.12;
}
.about-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, rgba(5,8,15,0.97) 40%, rgba(10,18,35,0.92) 100%);
  z-index: 1;
}
.about-grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 80px 80px;
  z-index: 2;
  pointer-events: none;
}
.about-orb-1 {
  position: fixed;
  top: 10%; right: 5%;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,241,53,0.06) 0%, transparent 70%);
  animation: orbFloat 12s ease-in-out infinite;
  z-index: 2;
  pointer-events: none;
}
.about-orb-2 {
  position: fixed;
  bottom: 10%; left: 0%;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
  animation: orbFloat 16s ease-in-out infinite reverse;
  z-index: 2;
  pointer-events: none;
}
.about-scanline {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(transparent, rgba(200,241,53,0.05), transparent);
  animation: scanline 8s linear infinite;
  pointer-events: none;
  z-index: 200;
}

/* All content above overlays */
.about-content {
  position: relative;
  z-index: 10;
}

/* ── HERO ── */
.ab-hero {
  max-width: 1300px;
  margin: 0 auto;
  padding: 160px 60px 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  animation: fadeUp 0.8s ease both;
}

.ab-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(200,241,53,0.35);
  border-radius: 100px;
  padding: 6px 16px;
  margin-bottom: 28px;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--acid);
  text-transform: uppercase;
}
.ab-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--acid);
  box-shadow: 0 0 8px var(--acid);
  animation: blinkDot 1.5s ease infinite;
}

.ab-hero h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(60px, 7vw, 96px);
  line-height: 0.9;
  color: #fff;
  letter-spacing: 1px;
  margin-bottom: 28px;
}
.ab-hero h1 .outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.2);
}
.ab-hero h1 .acid { color: var(--acid); }

.ab-hero-text {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 18px;
  line-height: 1.75;
  color: #7a8a9e;
  margin-bottom: 36px;
}

.ab-hero-quote {
  border-left: 2px solid var(--acid);
  padding: 16px 24px;
  background: rgba(200,241,53,0.04);
  border-radius: 0 8px 8px 0;
}
.ab-hero-quote p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 17px;
  color: #c8d8e8;
  line-height: 1.7;
}
.ab-hero-quote cite {
  font-size: 11px;
  color: var(--acid);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 10px;
  display: block;
}

/* Right side stat blocks */
.ab-hero-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  animation: fadeUp 0.8s 0.2s ease both;
  opacity: 0;
}
.ab-stat-box {
  padding: 36px 28px;
  border: 1px solid var(--line);
  background: var(--card);
  transition: background 0.3s ease, border-color 0.3s;
  position: relative;
  overflow: hidden;
}
.ab-stat-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--acid), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.ab-stat-box:hover { background: rgba(200,241,53,0.03); border-color: rgba(200,241,53,0.2); }
.ab-stat-box:hover::before { opacity: 1; }

.ab-stat-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 52px;
  color: var(--acid);
  line-height: 1;
  margin-bottom: 8px;
}
.ab-stat-label {
  font-size: 11px;
  color: var(--dim);
  letter-spacing: 2px;
  text-transform: uppercase;
  line-height: 1.5;
}

/* ── DIVIDER ── */
.ab-divider {
  border-top: 1px solid var(--line);
  position: relative;
  z-index: 10;
}

/* ── STORY SECTION ── */
.ab-story {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 80px;
  align-items: start;
}
.ab-story-label {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--dim);
  text-transform: uppercase;
  position: sticky;
  top: 120px;
}
.ab-story-label span {
  display: block;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 36px;
  color: #fff;
  letter-spacing: 1px;
  margin-top: 12px;
  line-height: 1;
}
.ab-story-body p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 18px;
  line-height: 1.8;
  color: #8a9ab8;
  margin-bottom: 28px;
  animation: fadeUp 0.7s ease both;
  opacity: 0;
}
.ab-story-body p:nth-child(1) { animation-delay: 0.1s; }
.ab-story-body p:nth-child(2) { animation-delay: 0.2s; }
.ab-story-body p:nth-child(3) { animation-delay: 0.3s; }
.ab-story-body p strong {
  color: #e2e8f0;
  font-style: normal;
}

/* ── CAPABILITIES ── */
.ab-caps {
  border-top: 1px solid var(--line);
  position: relative;
  z-index: 10;
}
.ab-caps-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
}
.ab-caps-header {
  margin-bottom: 60px;
  animation: fadeUp 0.7s ease both;
  opacity: 0;
}
.ab-caps-header h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(42px, 5vw, 64px);
  color: #fff;
  letter-spacing: 1px;
  line-height: 1;
}
.ab-caps-header p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  color: var(--dim);
  font-size: 17px;
  margin-top: 12px;
  max-width: 500px;
}

.ab-caps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.ab-cap-card {
  padding: 44px 36px;
  border: 1px solid var(--line);
  background: var(--card);
  position: relative;
  overflow: hidden;
  transition: background 0.3s, border-color 0.3s;
  animation: fadeUp 0.7s ease both;
  opacity: 0;
}
.ab-cap-card:nth-child(1) { animation-delay: 0.1s; }
.ab-cap-card:nth-child(2) { animation-delay: 0.2s; }
.ab-cap-card:nth-child(3) { animation-delay: 0.3s; }
.ab-cap-card:nth-child(4) { animation-delay: 0.4s; }
.ab-cap-card:nth-child(5) { animation-delay: 0.5s; }
.ab-cap-card:nth-child(6) { animation-delay: 0.6s; }

.ab-cap-card:hover { background: rgba(200,241,53,0.03); border-color: rgba(200,241,53,0.18); }
.ab-cap-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--acid), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.ab-cap-card:hover::after { opacity: 1; }

.ab-cap-icon {
  font-size: 28px;
  margin-bottom: 20px;
  display: block;
}
.ab-cap-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  color: rgba(255,255,255,0.04);
  position: absolute;
  top: 16px; right: 20px;
  line-height: 1;
}
.ab-cap-title {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 21px;
  color: #e2e8f0;
  margin-bottom: 12px;
}
.ab-cap-desc {
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--dim);
}

/* ── TECH STACK ── */
.ab-tech {
  border-top: 1px solid var(--line);
  background: rgba(255,255,255,0.015);
  position: relative;
  z-index: 10;
}
.ab-tech-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
}
.ab-tech-label {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--dim);
  text-transform: uppercase;
  margin-bottom: 48px;
}
.ab-tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}
.ab-tech-item {
  padding: 28px 24px;
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background 0.3s;
  animation: fadeUp 0.6s ease both;
  opacity: 0;
}
.ab-tech-item:nth-child(1) { animation-delay: 0.1s; }
.ab-tech-item:nth-child(2) { animation-delay: 0.2s; }
.ab-tech-item:nth-child(3) { animation-delay: 0.3s; }
.ab-tech-item:nth-child(4) { animation-delay: 0.4s; }
.ab-tech-item:nth-child(5) { animation-delay: 0.5s; }
.ab-tech-item:nth-child(6) { animation-delay: 0.6s; }
.ab-tech-item:nth-child(7) { animation-delay: 0.7s; }
.ab-tech-item:nth-child(8) { animation-delay: 0.8s; }
.ab-tech-item:hover { background: rgba(200,241,53,0.03); }

.ab-tech-name {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 500;
}
.ab-tech-role {
  font-size: 11px;
  color: var(--dim);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.ab-tech-bar-track {
  height: 2px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}
.ab-tech-bar-fill {
  height: 100%;
  background: var(--acid);
  border-radius: 2px;
  animation: barGrow 1.4s ease both;
  box-shadow: 0 0 6px rgba(200,241,53,0.4);
}

/* ── VALUES ── */
.ab-values {
  border-top: 1px solid var(--line);
  position: relative;
  z-index: 10;
}
.ab-values-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
}
.ab-values-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-bottom: 60px;
  align-items: end;
}
.ab-values-header h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(42px, 5vw, 64px);
  color: #fff;
  line-height: 0.95;
  letter-spacing: 1px;
}
.ab-values-header p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  color: var(--dim);
  font-size: 17px;
  line-height: 1.7;
}

.ab-values-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.ab-value-row {
  display: grid;
  grid-template-columns: 60px 200px 1fr;
  align-items: start;
  gap: 32px;
  padding: 36px 0;
  border-top: 1px solid var(--line);
  animation: fadeUp 0.7s ease both;
  opacity: 0;
}
.ab-value-row:nth-child(1) { animation-delay: 0.1s; }
.ab-value-row:nth-child(2) { animation-delay: 0.2s; }
.ab-value-row:nth-child(3) { animation-delay: 0.3s; }
.ab-value-row:nth-child(4) { animation-delay: 0.4s; }

.ab-value-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  color: rgba(255,255,255,0.15);
  padding-top: 4px;
}
.ab-value-title {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 20px;
  color: #e2e8f0;
  padding-top: 2px;
}
.ab-value-desc {
  font-size: 13px;
  line-height: 1.8;
  color: var(--dim);
}

/* ── TEAM ── */
.ab-team {
  border-top: 1px solid var(--line);
  background: rgba(255,255,255,0.015);
  position: relative;
  z-index: 10;
}
.ab-team-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
}
.ab-team-label {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--dim);
  text-transform: uppercase;
  margin-bottom: 16px;
}
.ab-team-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(42px, 5vw, 64px);
  color: #fff;
  margin-bottom: 60px;
}
.ab-team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}
.ab-team-card {
  padding: 40px 32px;
  border: 1px solid var(--line);
  background: var(--card);
  transition: background 0.3s, border-color 0.3s;
  animation: fadeUp 0.7s ease both;
  opacity: 0;
}
.ab-team-card:nth-child(1) { animation-delay: 0.1s; }
.ab-team-card:nth-child(2) { animation-delay: 0.2s; }
.ab-team-card:nth-child(3) { animation-delay: 0.3s; }
.ab-team-card:hover { background: rgba(200,241,53,0.03); border-color: rgba(200,241,53,0.15); }

.ab-team-avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(200,241,53,0.2), rgba(99,102,241,0.2));
  border: 1px solid rgba(200,241,53,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 20px;
}
.ab-team-name {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 20px;
  color: #e2e8f0;
  margin-bottom: 4px;
}
.ab-team-role {
  font-size: 10px;
  color: var(--acid);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.ab-team-bio {
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--dim);
}

/* ── CTA ── */
.ab-cta {
  border-top: 1px solid var(--line);
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 100px 60px;
  animation: fadeUp 0.7s 0.2s ease both;
  opacity: 0;
}
.ab-cta h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(48px, 6vw, 80px);
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: 1px;
}
.ab-cta p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  color: var(--dim);
  font-size: 18px;
  margin-bottom: 44px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
.ab-cta-btn {
  background: var(--acid);
  color: var(--ink);
  border: none;
  padding: 18px 52px;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 24px rgba(200,241,53,0.3);
}
.ab-cta-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 0 40px rgba(200,241,53,0.5);
}

@media (max-width: 1024px) {
  .ab-hero, .ab-story, .ab-values-header { grid-template-columns: 1fr; gap: 40px; }
  .ab-hero-stats { grid-template-columns: 1fr 1fr; }
  .ab-caps-grid, .ab-team-grid { grid-template-columns: 1fr 1fr; }
  .ab-tech-grid { grid-template-columns: 1fr 1fr; }
  .ab-value-row { grid-template-columns: 48px 160px 1fr; gap: 20px; }
}
@media (max-width: 700px) {
  .ab-hero, .ab-story, .ab-caps-inner, .ab-tech-inner, .ab-values-inner, .ab-team-inner, .ab-cta {
    padding-left: 24px; padding-right: 24px;
  }
  .ab-hero { padding-top: 110px; }
  .ab-caps-grid, .ab-team-grid, .ab-tech-grid { grid-template-columns: 1fr; }
  .ab-value-row { grid-template-columns: 1fr; gap: 8px; }
  .ab-hero-stats { grid-template-columns: 1fr 1fr; }
}
`;

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

export default function About() {
  const videoRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
    window.scrollTo(0, 0);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="about-page">
      {/* Background */}
      <video ref={videoRef} autoPlay loop muted playsInline className="about-bg-video">
        <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
      </video>
      <div className="about-overlay" />
      <div className="about-grid-bg" />
      <div className="about-orb-1" />
      <div className="about-orb-2" />
      <div className="about-scanline" />

      <div className="about-content">

        {/* ── HERO ── */}
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
              { num: "98%", label: "Transcription\nAccuracy" },
              { num: "4.9★", label: "Average\nUser Rating" },
              { num: "2", label: "Interview\nModes" },
            ].map((s, i) => (
              <div className="ab-stat-box" key={i}>
                <div className="ab-stat-num">{s.num}</div>
                <div className="ab-stat-label" style={{ whiteSpace: "pre-line" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="ab-divider" />

        {/* ── STORY ── */}
        <section className="ab-story">
          <div className="ab-story-label">
            — Background
            <span>Our<br />Origin</span>
          </div>
          <div className="ab-story-body">
            <p>
              MockHire AI began as a personal frustration. Too many brilliant engineers
              were failing interviews — not because they lacked knowledge, but because
              they had <strong>never practised under realistic conditions.</strong> Traditional mock
              interviews required scheduling, money, and access to the right network.
              Most candidates had none of these.
            </p>
            <p>
              We set out to build something different: a system that would be available
              at <strong>2am the night before your interview</strong>, ask you the exact type of
              questions a real recruiter would, and give you honest, data-driven feedback
              the moment you finished speaking. No scheduling. No cost. No judgment.
            </p>
            <p>
              Today, MockHire AI serves thousands of candidates across technical and HR
              interview preparation. Our LLaMA-powered engine has processed over twelve
              thousand interview sessions, and our adaptive difficulty system ensures
              that <strong>every session is a meaningful challenge</strong> — regardless of where
              you start.
            </p>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ── CAPABILITIES ── */}
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

        {/* ── TECH STACK ── */}
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

        {/* ── VALUES ── */}
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

        {/* ── TEAM ── */}
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

        {/* ── CTA ── */}
        <section className="ab-cta">
          <h2>Ready to start practising?</h2>
          <p>Join thousands of candidates already sharpening their skills with MockHire AI.</p>
          <a href="/login" className="ab-cta-btn">Begin Your Session</a>
        </section>

      </div>
    </div>
  );
}