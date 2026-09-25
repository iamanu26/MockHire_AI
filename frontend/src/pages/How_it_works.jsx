import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import './How_it_work.css';



const STEPS = [
  { icon: "🎙️", title: "Voice Capture", desc: "Browser-native speech recognition captures your spoken response with precision, converting your voice to text seamlessly." },
  { icon: "🧠", title: "Dual-Engine AI Reasoning", desc: "Your answer is processed by high-speed Groq LLM (Qwen 3.8) with Gemini fallback, assessing technical depth and clarity." },
  { icon: "🔄", title: "Adaptive Strategy Agents", desc: "Next questions are generated dynamically based on your role, target company, and uploaded resume background." },
  { icon: "🛡️", title: "Browser Vision Proctoring", desc: "Client-side computer vision (face-api.js) tracks attention, flags head-turns, and detects tab switches in real time." },
  { icon: "🗣️", title: "Neural Voice Delivery", desc: "Questions are synthesized with Coqui XTTS-v2 neural audio and Web Speech APIs for a realistic vocal experience." },
  { icon: "📋", title: "Holistic Scorecard", desc: "Receive a 5-dimension scorecard across Communication, Technical Depth, Confidence, and Grammar, saved to PostgreSQL." },
];

const METRICS = [
  { name: "Transcription Accuracy", pct: 97 },
  { name: "Response Relevance", pct: 92 },
  { name: "Feedback Precision", pct: 89 },
  { name: "User Satisfaction", pct: 96 },
];

const FLOW = [
  { icon: "🔐", step: "01", title: "Setup & Resume Upload", desc: "Configure role, seniority, and target company; upload your PDF resume for personalized questions." },
  { icon: "🛡️", step: "02", title: "Proctoring & Camera Check", desc: "Enable camera proctoring to simulate authentic exam conditions with live attention tracking." },
  { icon: "🎤", step: "03", title: "Speak Your Answer", desc: "Listen to the AI's spoken question and respond naturally through your microphone." },
  { icon: "⚡", step: "04", title: "AI Evaluates & Adapts", desc: "Dual-engine AI scores your response in real time and synthesizes targeted follow-ups." },
  { icon: "🏆", step: "05", title: "Review Your Scorecard", desc: "Receive your comprehensive report with actionable feedback, persisted to your profile." },
];

export default function How_it_works() {

  const { token } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="feat-page">
      <div className="feat-scanline" />
      <div className="feat-grid-bg" />

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

      <section className="feat-cta">
        <h2>Ready to practice?</h2>
        <p>Join thousands of candidates already using MockHire AI to land their dream role.</p>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", justifyContent: "center" }}>
          <Link to={token ? "/interview" : "/login"} className="feat-cta-btn">
            Start Your Interview
          </Link>
          <Link to="https://mock-hire-ai-documentation.vercel.app/" className="btn-ghost">
            Project Documentation & Architecture
          </Link>
        </div>
      </section>


    </div>
  );
}