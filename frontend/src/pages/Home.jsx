import { Link } from "react-router-dom";
import { useState } from "react";
import './Home.css';

const TICKER_ITEMS = [
  "Voice Analysis", "Real-Time Feedback", "LLaMA Intelligence",
  "Technical Rounds", "HR Simulation", "Confidence Scoring",
  "Voice Analysis", "Real-Time Feedback", "LLaMA Intelligence",
  "Technical Rounds", "HR Simulation", "Confidence Scoring",
];

export default function Home() {
  return (
    <div className="home-wrapper">
      <div className="scanline" />
      <div className="noise" />
      <div className="grid-bg" />

      <section className="hero">
        <div className="left">
          <div className="badge">
            <span className="badge-dot" />
            AI Interview Assistant — v2.0
          </div>

          <h1 className="display">
            <span className="accent">Mock</span>
            <br />
            <span style={{ color: "#fff" }}>Hire</span>
            <br />
            <span className="highlight">AI.</span>
          </h1>

          <p className="subtitle">
            Step into a high-fidelity interview environment powered by
            LLaMA intelligence. Refine your voice, master your presence,
            and conquer the technical stage.
          </p>

          <div className="cta-row">
            <Link to="/login" className="btn-primary">
              Start Interview
            </Link>
            <Link to="/how_it_works" className="btn-ghost">
              See how it works
            </Link>
          </div>

          <div className="stats">
            <div>
              <div className="stat-val">98%</div>
              <div className="stat-label">Accuracy rate</div>
            </div>
            <div>
              <div className="stat-val">12K+</div>
              <div className="stat-label">Sessions run</div>
            </div>
            <div>
              <div className="stat-val">4.9★</div>
              <div className="stat-label">User rating</div>
            </div>
          </div>
        </div>

        <div className="right">
          <div className="radar-wrap">
            <div className="radar-circle" />
            <div className="radar-circle" />
            <div className="radar-circle" />
            <div className="radar-circle" />
            <div className="radar-sweep" />
            <div className="crosshair-h" />
            <div className="crosshair-v" />
            <div className="blip blip-1" />
            <div className="blip blip-2" />
            <div className="blip blip-3" />
            <div className="blip-center" />

            <div className="terminal">
              <div className="terminal-header">
                <div className="t-dot" style={{ background: "#ef4444" }} />
                <div className="t-dot" style={{ background: "#f59e0b" }} />
                <div className="t-dot" style={{ background: "#4ade80" }} />
              </div>
              <div className="terminal-line"><span className="cmd">$</span> init_session --mode=tech</div>
              <div className="terminal-line"><span className="ok">✓</span> LLaMA model loaded</div>
              <div className="terminal-line"><span className="ok">✓</span> Voice engine ready</div>
              <div className="terminal-line"><span className="cmd">$</span> start<span className="cursor" /></div>
            </div>

            <div className="score-card">
              <div className="score-label">Confidence</div>
              <div className="score-val">87</div>
              <div className="score-sub">+12 from last session</div>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-inner">
          {TICKER_ITEMS.map((item, i) => (
            <span className="ticker-item" key={i}>
              {item}
              <span className="sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="features">
        {[
          { icon: "🎙️", title: "Voice Intelligence", desc: "Real-time transcription and analysis of your speech patterns, pacing, and clarity." },
          { icon: "🧠", title: "Adaptive Questions", desc: "LLaMA dynamically adjusts question difficulty based on your previous responses." },
          { icon: "📊", title: "Instant Feedback", desc: "Detailed scoring on communication, technical depth, and confidence after every session." },
        ].map((f, i) => (
          <div className="feat" key={i}>
            <div className="feat-num">0{i + 1}</div>
            <div className="feat-icon">{f.icon}</div>
            <div className="feat-title">{f.title}</div>
            <div className="feat-desc">{f.desc}</div>
          </div>
        ))}
      </section>
    </div>
  );
}