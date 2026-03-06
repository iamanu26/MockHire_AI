import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './Login.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
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

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

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
              { icon: "🎙️", title: "Full Voice Interview",    desc: "Speak naturally — no typing, no clicking, just you." },
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
              { num: "98%",  label: "Accuracy" },
              { num: "4.9★", label: "Rating"   },
            ].map((s, i) => (
              <div key={i}>
                <div className="ll-stat-num">{s.num}</div>
                <div className="ll-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

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