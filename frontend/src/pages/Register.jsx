import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Register.css';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("All fields are required."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.detail || "Registration failed. Please try again.");
      }
    } catch {
      setError("Server error. Please check your connection.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleRegister(); };

  return (
    <div className="reg-page">
      <video ref={videoRef} autoPlay loop muted playsInline className="reg-bg-video">
        <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
      </video>
      <div className="reg-overlay" />
      <div className="reg-grid" />
      <div className="reg-orb reg-orb-1" />
      <div className="reg-orb reg-orb-2" />
      <div className="reg-scanline" />

      <div className="reg-layout">

        {/* ── LEFT PANEL ── */}
        <div className="reg-left">
          <div className="rl-brand">
            <div className="rl-brand-badge">
              <span className="rl-brand-dot" />
              Join MockHire AI
            </div>
            <h1>
              <span className="outline">Start</span><br />
              <span style={{ color: "#fff" }}>Your</span><br />
              <span className="acid">Journey.</span>
            </h1>
            <p>Create your account and take the first step toward interview confidence.</p>
          </div>

          <div className="rl-steps">
            {[
              { num: "01", title: "Create Your Account", desc: "Register in seconds — no credit card required." },
              { num: "02", title: "Choose Your Mode",    desc: "Pick Technical or HR interview preparation." },
              { num: "03", title: "Start Practising",    desc: "Speak your answers and receive instant AI feedback." },
            ].map((s, i) => (
              <div className="rl-step" key={i}>
                <div className="rl-step-num">{s.num}</div>
                <div>
                  <div className="rl-step-title">{s.title}</div>
                  <div className="rl-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rl-stats">
            {[
              { num: "Free", label: "Always" },
              { num: "2",    label: "Modes"   },
              { num: "4.9★", label: "Rating"  },
            ].map((s, i) => (
              <div key={i}>
                <div className="rl-stat-num">{s.num}</div>
                <div className="rl-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="reg-right">
          <div className="rr-header">
            <h2>Create<br />Account.</h2>
            <p>Fill in your details to get started.</p>
          </div>

          <div className="rr-form">
            {error && <div className="rr-error">⚠ {error}</div>}

            <div className="rr-field">
              <label className="rr-label">Full Name</label>
              <input
                className="rr-input"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="rr-field">
              <label className="rr-label">Email Address</label>
              <input
                className="rr-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="rr-field">
              <label className="rr-label">Password</label>
              <input
                className="rr-input"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button className="rr-btn" onClick={handleRegister} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </div>

          <div className="rr-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>

      </div>
    </div>
  );
}