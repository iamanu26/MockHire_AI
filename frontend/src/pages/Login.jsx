import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

:root {
  --ink: #05080f;
  --acid: #c8f135;
  --dim: #8a9ab0;
  --line: rgba(255,255,255,0.07);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
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
@keyframes orbFloat {
  0%, 100% { transform: translateY(0) translateX(0); }
  50%       { transform: translateY(-30px) translateX(20px); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 24px rgba(200,241,53,0.3), 0 8px 32px rgba(0,0,0,0.4); }
  50%       { box-shadow: 0 0 44px rgba(200,241,53,0.55), 0 8px 32px rgba(0,0,0,0.4); }
}
@keyframes inputFocus {
  from { border-color: rgba(255,255,255,0.08); }
  to   { border-color: rgba(200,241,53,0.5); }
}

.login-page {
  font-family: 'DM Mono', monospace;
  background: var(--ink);
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg-video {
  position: fixed;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.1;
}
.login-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(5,8,15,0.97) 0%, rgba(10,18,35,0.93) 100%);
  z-index: 1;
}
.login-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 80px 80px;
  z-index: 2;
  pointer-events: none;
}
.login-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
}
.login-orb-1 {
  width: 600px; height: 600px;
  top: -15%; right: -10%;
  background: radial-gradient(circle, rgba(200,241,53,0.07) 0%, transparent 65%);
  animation: orbFloat 14s ease-in-out infinite;
}
.login-orb-2 {
  width: 500px; height: 500px;
  bottom: -10%; left: -10%;
  background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%);
  animation: orbFloat 18s ease-in-out infinite reverse;
}
.login-scanline {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(transparent, rgba(200,241,53,0.05), transparent);
  animation: scanline 8s linear infinite;
  pointer-events: none;
  z-index: 200;
}

/* ── LAYOUT ── */
.login-layout {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 1100px;
  min-height: 600px;
  margin: 0 20px;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0,0,0,0.6);
  animation: fadeUp 0.7s ease both;
}

/* ── LEFT PANEL ── */
.login-left {
  background: rgba(200,241,53,0.04);
  border-right: 1px solid var(--line);
  padding: 60px 52px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--acid), transparent);
}

.ll-brand {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.ll-brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--acid);
  text-transform: uppercase;
  margin-bottom: 20px;
}
.ll-brand-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--acid);
  box-shadow: 0 0 8px var(--acid);
  animation: blinkDot 1.5s ease infinite;
}
.ll-brand h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 64px;
  color: #fff;
  line-height: 0.9;
  letter-spacing: 1px;
  margin-bottom: 24px;
}
.ll-brand h1 .acid { color: var(--acid); }
.ll-brand h1 .outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.2);
}
.ll-brand p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 16px;
  line-height: 1.7;
  color: var(--dim);
  max-width: 300px;
}

.ll-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.ll-feature {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 2px;
  background: rgba(255,255,255,0.02);
  transition: background 0.3s, border-color 0.3s;
}
.ll-feature:hover {
  background: rgba(200,241,53,0.04);
  border-color: rgba(200,241,53,0.15);
}
.ll-feature-icon { font-size: 18px; margin-top: 2px; }
.ll-feature-title {
  font-size: 13px;
  color: #e2e8f0;
  margin-bottom: 3px;
  font-weight: 500;
}
.ll-feature-desc {
  font-size: 11px;
  color: var(--dim);
  line-height: 1.6;
}

.ll-stats {
  display: flex;
  gap: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}
.ll-stat-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  color: var(--acid);
  line-height: 1;
}
.ll-stat-label {
  font-size: 10px;
  color: var(--dim);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 3px;
}

/* ── RIGHT PANEL (Form) ── */
.login-right {
  background: rgba(5,8,15,0.8);
  padding: 60px 52px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  backdrop-filter: blur(20px);
}

.lr-header {
  margin-bottom: 40px;
  animation: fadeUp 0.6s 0.15s ease both;
  opacity: 0;
}
.lr-header h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  color: #fff;
  letter-spacing: 1px;
  line-height: 1;
  margin-bottom: 8px;
}
.lr-header p {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 15px;
  color: var(--dim);
}

.lr-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeUp 0.6s 0.25s ease both;
  opacity: 0;
}

.lr-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lr-label {
  font-size: 10px;
  letter-spacing: 2.5px;
  color: var(--dim);
  text-transform: uppercase;
}
.lr-input {
  padding: 14px 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  color: #fff;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  outline: none;
  transition: border-color 0.25s ease, background 0.25s ease;
  width: 100%;
}
.lr-input::placeholder { color: #374151; }
.lr-input:focus {
  border-color: rgba(200,241,53,0.5);
  background: rgba(200,241,53,0.03);
}

.lr-btn {
  margin-top: 8px;
  padding: 16px;
  background: var(--acid);
  color: var(--ink);
  border: none;
  border-radius: 4px;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: glowPulse 3s ease infinite;
}
.lr-btn:hover { transform: translateY(-2px); }
.lr-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  animation: none;
}

.lr-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}
.lr-divider-line {
  flex: 1;
  height: 1px;
  background: var(--line);
}
.lr-divider-text {
  font-size: 10px;
  color: var(--dim);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.lr-error {
  padding: 12px 16px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 4px;
  font-size: 12px;
  color: #fca5a5;
  letter-spacing: 0.5px;
  animation: fadeUp 0.3s ease both;
}

.lr-footer {
  margin-top: 28px;
  font-size: 12px;
  color: var(--dim);
  text-align: center;
  animation: fadeUp 0.6s 0.35s ease both;
  opacity: 0;
}
.lr-footer a {
  color: var(--acid);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}
.lr-footer a:hover { opacity: 0.75; }

@media (max-width: 800px) {
  .login-layout { grid-template-columns: 1fr; max-width: 480px; }
  .login-left { display: none; }
  .login-right { padding: 60px 36px; }
}
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
    return () => document.head.removeChild(style);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        login(data.access_token);
        navigate("/interview");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("Unable to reach server. Please check your connection.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">
      <video ref={videoRef} autoPlay loop muted playsInline className="login-bg-video">
        <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
      </video>
      <div className="login-overlay" />
      <div className="login-grid" />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-scanline" />

      <div className="login-layout">

        {/* ── LEFT ── */}
        <div className="login-left">
          <div className="ll-brand">
            <div className="ll-brand-badge">
              <span className="ll-brand-dot" />
              AI Interview Platform
            </div>
            <h1>
              <span className="outline">Mock</span><br />
              <span style={{ color: "#fff" }}>Hire</span><br />
              <span className="acid">AI.</span>
            </h1>
            <p>Prepare smarter. Speak with confidence. Land the role you deserve.</p>
          </div>

          <div className="ll-features">
            {[
              { icon: "🤖", title: "LLaMA-Powered Questions", desc: "Adaptive AI that responds to your answers in real time." },
              { icon: "🎙️", title: "Full Voice Interview", desc: "Speak naturally — no typing, no clicking, just you." },
              { icon: "📊", title: "Instant Performance Report", desc: "Detailed feedback the moment your session ends." },
            ].map((f, i) => (
              <div className="ll-feature" key={i}>
                <span className="ll-feature-icon">{f.icon}</span>
                <div>
                  <div className="ll-feature-title">{f.title}</div>
                  <div className="ll-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ll-stats">
            {[
              { num: "12K+", label: "Sessions" },
              { num: "98%", label: "Accuracy" },
              { num: "4.9★", label: "Rating" },
            ].map((s, i) => (
              <div key={i}>
                <div className="ll-stat-num">{s.num}</div>
                <div className="ll-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT (Form) ── */}
        <div className="login-right">
          <div className="lr-header">
            <h2>Welcome<br />Back.</h2>
            <p>Sign in to continue your interview preparation.</p>
          </div>

          <div className="lr-form">
            {error && <div className="lr-error">⚠ {error}</div>}

            <div className="lr-field">
              <label className="lr-label">Email Address</label>
              <input
                className="lr-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="lr-field">
              <label className="lr-label">Password</label>
              <input
                className="lr-input"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button className="lr-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </div>

          <div className="lr-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one free</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;