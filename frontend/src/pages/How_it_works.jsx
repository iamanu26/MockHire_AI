import { useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

:root {
  --ink: #05080f;
  --acid: #c8f135;
  --dim: #8a9ab0;
  --line: rgba(255,255,255,0.07);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes ping {
  0%   { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes barGrow {
  from { width: 0; }
  to   { width: var(--w); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(200,241,53,0.3); }
  50%       { box-shadow: 0 0 40px rgba(200,241,53,0.6); }
}

.feat-page {
  font-family: 'DM Mono', monospace;
  background: var(--ink);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.feat-scanline {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(transparent, rgba(200,241,53,0.05), transparent);
  animation: scanline 7s linear infinite;
  pointer-events: none;
  z-index: 100;
}

.feat-grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
  z-index: 0;
}

/* ── HERO ── */
.feat-hero {
  position: relative;
  z-index: 10;
  max-width: 1300px;
  margin: 0 auto;
  padding: 160px 60px 80px;
  animation: fadeUp 0.7s ease both;
}

.feat-badge {
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
.feat-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--acid);
  box-shadow: 0 0 8px var(--acid);
  animation: blinkCursor 1.5s ease infinite;
}

.feat-hero h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(60px, 8vw, 108px);
  line-height: 0.9;
  color: #fff;
  letter-spacing: 1px;
  margin-bottom: 24px;
}
.feat-hero h1 .outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.2);
}
.feat-hero h1 .acid { color: var(--acid); }

.feat-hero p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 19px;
  color: var(--dim);
  max-width: 520px;
  line-height: 1.7;
}

/* ── DIVIDER ── */
.feat-divider {
  position: relative;
  z-index: 10;
  border-top: 1px solid var(--line);
}

/* ── STEPS ── */
.feat-steps {
  position: relative;
  z-index: 10;
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
}

.feat-steps-label {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--dim);
  text-transform: uppercase;
  margin-bottom: 60px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.step-card {
  padding: 44px 36px;
  border: 1px solid var(--line);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease, border-color 0.3s ease;
  animation: fadeUp 0.7s ease both;
  opacity: 0;
}
.step-card:nth-child(1) { animation-delay: 0.1s; }
.step-card:nth-child(2) { animation-delay: 0.2s; }
.step-card:nth-child(3) { animation-delay: 0.3s; }
.step-card:nth-child(4) { animation-delay: 0.4s; }
.step-card:nth-child(5) { animation-delay: 0.5s; }
.step-card:nth-child(6) { animation-delay: 0.6s; }

.step-card:hover {
  background: rgba(200,241,53,0.03);
  border-color: rgba(200,241,53,0.18);
}

.step-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--acid), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.step-card:hover::before { opacity: 1; }

.step-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 52px;
  color: rgba(255,255,255,0.05);
  line-height: 1;
  margin-bottom: 20px;
}

.step-icon {
  font-size: 26px;
  margin-bottom: 16px;
  display: block;
}

.step-title {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 22px;
  color: #e2e8f0;
  margin-bottom: 12px;
}

.step-desc {
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--dim);
}

/* ── METRICS ── */
.feat-metrics {
  position: relative;
  z-index: 10;
  border-top: 1px solid var(--line);
  background: rgba(255,255,255,0.015);
}

.feat-metrics-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 60px;
}

.metrics-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  color: #fff;
  letter-spacing: 1px;
  line-height: 1;
}

.metrics-sub {
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.metric-bars {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metric-row {
  display: grid;
  grid-template-columns: 200px 1fr 60px;
  align-items: center;
  gap: 20px;
  animation: fadeUp 0.6s ease both;
  opacity: 0;
}
.metric-row:nth-child(1) { animation-delay: 0.1s; }
.metric-row:nth-child(2) { animation-delay: 0.2s; }
.metric-row:nth-child(3) { animation-delay: 0.3s; }
.metric-row:nth-child(4) { animation-delay: 0.4s; }

.metric-name {
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.metric-track {
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--acid);
  animation: barGrow 1.2s ease both;
  box-shadow: 0 0 8px rgba(200,241,53,0.4);
}

.metric-pct {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  color: var(--acid);
  text-align: right;
}

/* ── FLOW ── */
.feat-flow {
  position: relative;
  z-index: 10;
  border-top: 1px solid var(--line);
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
}

.flow-label {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--dim);
  text-transform: uppercase;
  margin-bottom: 60px;
}

.flow-steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  position: relative;
}

.flow-steps::before {
  content: '';
  position: absolute;
  top: 28px; left: 28px; right: 28px;
  height: 1px;
  background: linear-gradient(90deg, var(--acid), rgba(200,241,53,0.2), transparent);
  z-index: 0;
}

.flow-step {
  flex: 1;
  position: relative;
  z-index: 1;
  animation: fadeUp 0.7s ease both;
  opacity: 0;
}
.flow-step:nth-child(1) { animation-delay: 0.1s; }
.flow-step:nth-child(2) { animation-delay: 0.25s; }
.flow-step:nth-child(3) { animation-delay: 0.4s; }
.flow-step:nth-child(4) { animation-delay: 0.55s; }

.flow-dot-wrap {
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
  position: relative;
}

.flow-dot {
  width: 56px; height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(200,241,53,0.35);
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: relative;
  z-index: 1;
}

.flow-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(200,241,53,0.08);
  animation: ping 2.5s ease-out infinite;
}

.flow-step-num {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: var(--acid);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.flow-step-title {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 18px;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.flow-step-desc {
  font-size: 12px;
  color: var(--dim);
  line-height: 1.7;
  max-width: 200px;
}

/* ── CTA ── */
.feat-cta {
  position: relative;
  z-index: 10;
  border-top: 1px solid var(--line);
  text-align: center;
  padding: 100px 60px;
  animation: fadeUp 0.7s 0.2s ease both;
  opacity: 0;
}

.feat-cta h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(48px, 6vw, 80px);
  color: #fff;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.feat-cta p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  color: var(--dim);
  font-size: 18px;
  margin-bottom: 44px;
}

.feat-cta-btn {
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
  animation: glowPulse 3s ease infinite;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s;
}
.feat-cta-btn:hover { transform: translateY(-3px) scale(1.02); }

@media (max-width: 900px) {
  .feat-hero, .feat-steps, .feat-metrics-inner, .feat-flow, .feat-cta {
    padding-left: 28px;
    padding-right: 28px;
  }
  .feat-hero { padding-top: 110px; }
  .steps-grid { grid-template-columns: 1fr; }
  .flow-steps { flex-direction: column; gap: 40px; }
  .flow-steps::before { display: none; }
  .metrics-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .metric-row { grid-template-columns: 140px 1fr 50px; }
}
`;

const STEPS = [
  { icon: "🎙️", title: "Voice Capture", desc: "Browser-native speech recognition captures every word with precision, enabling fluent real-time transcription." },
  { icon: "🧠", title: "LLaMA Processing", desc: "Your answer is analyzed by a fine-tuned LLaMA model that understands technical depth and communication style." },
  { icon: "🔄", title: "Dynamic Questions", desc: "The next question is generated on-the-fly based on your response — harder if you nailed it, supportive if you need it." },
  { icon: "📊", title: "Confidence Scoring", desc: "Each response is scored across clarity, completeness, and confidence using a multi-dimensional rubric." },
  { icon: "🗣️", title: "AI Voice Feedback", desc: "Questions are delivered via synthesized speech — a fully immersive, real interview environment." },
  { icon: "📋", title: "Session Report", desc: "At the end, receive a detailed breakdown with strengths, gaps, and improvement suggestions." },
];

const METRICS = [
  { name: "Transcription Accuracy", pct: 97 },
  { name: "Response Relevance", pct: 92 },
  { name: "Feedback Precision", pct: 89 },
  { name: "User Satisfaction", pct: 96 },
];

const FLOW = [
  { icon: "🔐", step: "01", title: "Login & Setup", desc: "Choose Technical or HR mode and begin your session." },
  { icon: "🎤", step: "02", title: "Speak Your Answer", desc: "Hit the mic button and respond naturally." },
  { icon: "⚡", step: "03", title: "AI Evaluates", desc: "LLaMA scores your answer and generates the next question." },
  { icon: "🏆", step: "04", title: "Get Your Report", desc: "End the session and receive your full performance report." },
];

export default function Features() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    window.scrollTo(0, 0);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="feat-page">
      <div className="feat-scanline" />
      <div className="feat-grid-bg" />

      {/* Hero */}
      <section className="feat-hero">
        <div className="feat-badge">
          <span className="feat-badge-dot" />
          How It Works
        </div>
        <h1>
          <span className="outline">Every</span><br />
          Feature<br />
          <span className="acid">Explained.</span>
        </h1>
        <p>From the moment you speak to the final report — here's exactly what MockHire AI does under the hood.</p>
      </section>

      <div className="feat-divider" />

      {/* Steps Grid */}
      <section className="feat-steps">
        <div className="feat-steps-label">— Core capabilities</div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-num">0{i + 1}</div>
              <span className="step-icon">{s.icon}</span>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <div className="feat-metrics">
        <div className="feat-metrics-inner">
          <div className="metrics-header">
            <div className="metrics-title">Performance<br />Benchmarks</div>
            <div className="metrics-sub">Measured across 12,000+ sessions</div>
          </div>
          <div className="metric-bars">
            {METRICS.map((m, i) => (
              <div className="metric-row" key={i}>
                <div className="metric-name">{m.name}</div>
                <div className="metric-track">
                  <div className="metric-fill" style={{ "--w": `${m.pct}%`, width: `${m.pct}%` }} />
                </div>
                <div className="metric-pct">{m.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flow */}
      <section className="feat-flow">
        <div className="flow-label">— Session flow</div>
        <div className="flow-steps">
          {FLOW.map((f, i) => (
            <div className="flow-step" key={i}>
              <div className="flow-dot-wrap">
                <div className="flow-dot">{f.icon}</div>
              </div>
              <div className="flow-step-num">STEP {f.step}</div>
              <div className="flow-step-title">{f.title}</div>
              <div className="flow-step-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="feat-cta">
        <h2>Ready to practice?</h2>
        <p>Join thousands of candidates already using MockHire AI to land their dream role.</p>
        <a href="/login" className="feat-cta-btn">Start Your Interview</a>
      </section>
    </div>
  );
}