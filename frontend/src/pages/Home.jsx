import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #05080f;
  --paper: #f2ede6;
  --acid: #c8f135;
  --dim: #8a9ab0;
  --line: rgba(255,255,255,0.07);
}

body { background: var(--ink); overflow-x: hidden; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes radarSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes ping {
  0%   { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes typeText {
  from { width: 0; }
  to   { width: 100%; }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(200,241,53,0.3), 0 0 60px rgba(200,241,53,0.1); }
  50%       { box-shadow: 0 0 40px rgba(200,241,53,0.6), 0 0 100px rgba(200,241,53,0.2); }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.home-wrapper {
  font-family: 'DM Mono', monospace;
  background: var(--ink);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Scanline effect */
.scanline {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(transparent, rgba(200,241,53,0.06), transparent);
  animation: scanline 6s linear infinite;
  pointer-events: none;
  z-index: 100;
}

/* Noise texture overlay */
.noise {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 50;
  opacity: 0.5;
}

/* Grid */
.grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
  z-index: 0;
}

/* Hero */
.hero {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  max-width: 1300px;
  margin: 0 auto;
  padding: 120px 60px 80px;
  gap: 40px;
}

.left {
  animation: fadeUp 0.8s 0.1s ease both;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(200,241,53,0.4);
  border-radius: 100px;
  padding: 6px 16px;
  margin-bottom: 32px;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--acid);
  text-transform: uppercase;
}

.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--acid);
  box-shadow: 0 0 8px var(--acid);
  animation: blinkCursor 1.5s ease infinite;
}

h1.display {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(72px, 8vw, 110px);
  line-height: 0.92;
  color: #fff;
  letter-spacing: 1px;
  margin-bottom: 28px;
}

h1.display .accent {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.25);
}

h1.display .highlight {
  color: var(--acid);
}

.subtitle {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 19px;
  line-height: 1.65;
  color: #7a8a9e;
  max-width: 440px;
  margin-bottom: 48px;
}

.cta-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-primary {
  background: var(--acid);
  color: var(--ink);
  border: none;
  padding: 16px 40px;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: glowPulse 3s ease infinite;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  background: #d4ff40;
}

.btn-ghost {
  color: var(--dim);
  font-size: 13px;
  letter-spacing: 1.5px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}
.btn-ghost:hover { color: #fff; }
.btn-ghost::after { content: '→'; transition: transform 0.2s; }
.btn-ghost:hover::after { transform: translateX(4px); }

/* Stats row */
.stats {
  display: flex;
  gap: 40px;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid var(--line);
  animation: fadeUp 0.8s 0.4s ease both;
  opacity: 0;
}

.stat-val {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 36px;
  color: #fff;
  letter-spacing: 1px;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--dim);
  text-transform: uppercase;
  margin-top: 4px;
}

/* Right side — Radar visual */
.right {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: fadeUp 0.8s 0.25s ease both;
}

.radar-wrap {
  position: relative;
  width: 420px;
  height: 420px;
  animation: floatY 5s ease-in-out infinite;
}

.radar-circle {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(200,241,53,0.12);
}
.radar-circle:nth-child(2) {
  inset: 15%;
  border-color: rgba(200,241,53,0.18);
}
.radar-circle:nth-child(3) {
  inset: 30%;
  border-color: rgba(200,241,53,0.25);
}
.radar-circle:nth-child(4) {
  inset: 45%;
  border-color: rgba(200,241,53,0.35);
}

.radar-sweep {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: radarSpin 4s linear infinite;
  background: conic-gradient(from 0deg, transparent 330deg, rgba(200,241,53,0.25) 360deg);
}

/* Crosshair lines */
.crosshair-h, .crosshair-v {
  position: absolute;
  background: rgba(200,241,53,0.08);
}
.crosshair-h { left: 0; right: 0; top: 50%; height: 1px; }
.crosshair-v { top: 0; bottom: 0; left: 50%; width: 1px; }

/* Blip dots */
.blip {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--acid);
  box-shadow: 0 0 10px var(--acid), 0 0 20px rgba(200,241,53,0.4);
}
.blip::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--acid);
  animation: ping 2s ease-out infinite;
}
.blip-1 { top: 28%; left: 62%; animation-delay: 0s; }
.blip-2 { top: 58%; left: 30%; animation-delay: 0.8s; }
.blip-3 { top: 70%; left: 65%; animation-delay: 1.4s; }
.blip-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--acid);
  box-shadow: 0 0 20px var(--acid);
}

/* Terminal card */
.terminal {
  position: absolute;
  bottom: -20px;
  left: -40px;
  background: rgba(5,8,15,0.95);
  border: 1px solid rgba(200,241,53,0.2);
  border-radius: 8px;
  padding: 16px 20px;
  width: 240px;
  backdrop-filter: blur(20px);
  animation: fadeUp 0.8s 0.6s ease both;
  opacity: 0;
}

.terminal-header {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}
.t-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
}

.terminal-line {
  font-size: 11px;
  color: var(--dim);
  line-height: 1.8;
}
.terminal-line .cmd { color: var(--acid); }
.terminal-line .ok  { color: #4ade80; }
.cursor {
  display: inline-block;
  width: 7px; height: 12px;
  background: var(--acid);
  animation: blinkCursor 1s ease infinite;
  vertical-align: middle;
  margin-left: 2px;
}

/* Score card */
.score-card {
  position: absolute;
  top: 20px;
  right: -30px;
  background: rgba(5,8,15,0.95);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 16px 20px;
  width: 180px;
  backdrop-filter: blur(20px);
  animation: fadeUp 0.8s 0.7s ease both;
  opacity: 0;
}
.score-label { font-size: 10px; color: var(--dim); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
.score-val { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: var(--acid); line-height: 1; }
.score-sub { font-size: 10px; color: var(--dim); margin-top: 4px; }

/* Ticker */
.ticker {
  position: relative;
  z-index: 10;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  overflow: hidden;
  height: 40px;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.02);
}

.ticker-inner {
  display: flex;
  gap: 0;
  animation: marquee 18s linear infinite;
  white-space: nowrap;
}

.ticker-item {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--dim);
  text-transform: uppercase;
  padding: 0 40px;
}

.ticker-item .sep {
  color: var(--acid);
  margin: 0 16px;
}

/* Features bar */
.features {
  position: relative;
  z-index: 10;
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 60px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.feat {
  padding: 40px 36px;
  border: 1px solid var(--line);
  transition: background 0.3s ease;
  animation: fadeUp 0.8s ease both;
}
.feat:hover { background: rgba(255,255,255,0.03); }
.feat:nth-child(1) { animation-delay: 0.1s; opacity: 0; }
.feat:nth-child(2) { animation-delay: 0.2s; opacity: 0; }
.feat:nth-child(3) { animation-delay: 0.3s; opacity: 0; }

.feat-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  color: rgba(255,255,255,0.06);
  line-height: 1;
  margin-bottom: 20px;
}

.feat-icon {
  font-size: 22px;
  margin-bottom: 16px;
}

.feat-title {
  font-family: 'Instrument Serif', serif;
  font-size: 22px;
  color: #e2e8f0;
  margin-bottom: 12px;
  font-style: italic;
}

.feat-desc {
  font-size: 13px;
  line-height: 1.7;
  color: var(--dim);
}

@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; padding: 100px 28px 60px; }
  .right { display: none; }
  .features { grid-template-columns: 1fr; padding: 60px 28px; }
  .stats { flex-wrap: wrap; gap: 24px; }
}
`;

const TICKER_ITEMS = [
  "Voice Analysis", "Real-Time Feedback", "LLaMA Intelligence",
  "Technical Rounds", "HR Simulation", "Confidence Scoring",
  "Voice Analysis", "Real-Time Feedback", "LLaMA Intelligence",
  "Technical Rounds", "HR Simulation", "Confidence Scoring",
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    setMounted(true);
    return () => document.head.removeChild(style);
  }, []);

  if (!mounted) return null;

  return (
    <div className="home-wrapper">
      <div className="scanline" />
      <div className="noise" />
      <div className="grid-bg" />

      {/* Hero */}
      <section className="hero">
        {/* Left */}
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
            <Link to="/How_it_works.jsx" className="btn-ghost">
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

        {/* Right — Radar */}
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

            {/* Terminal card */}
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

            {/* Score card */}
            <div className="score-card">
              <div className="score-label">Confidence</div>
              <div className="score-val">87</div>
              <div className="score-sub">+12 from last session</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
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

      {/* Features */}
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