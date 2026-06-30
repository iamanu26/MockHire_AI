import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import './How_it_work.css';



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