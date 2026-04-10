import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Register.css';

export default function Register() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const navigate  = useNavigate();
  const videoRef  = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("All fields are required."); return; }
    if (password.length < 8)          { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.detail || "Registration failed. Please try again.");
      }
    } catch {
      setError("Server error. Please check your connection.");
    }
    setLoading(false);
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleRegister(); };

  // ── Post-register success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="reg-page">
        <video ref={videoRef} autoPlay loop muted playsInline className="reg-bg-video">
          <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
        </video>
        <div className="reg-overlay" />
        <div className="reg-grid" />
        <div className="reg-orb reg-orb-1" />
        <div className="reg-orb reg-orb-2" />

        <div className="reg-success-card">
          <div className="reg-success-icon">✉</div>
          <h2>Check your inbox</h2>
          <p>
            We sent a verification link to <strong>{email}</strong>.<br />
            Click it to activate your account, then come back to sign in.
          </p>
          <Link to="/login" className="reg-success-btn">Go to Sign In →</Link>
          <button
            className="reg-resend-link"
            onClick={async () => {
              await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email }),
              });
              alert("Verification email resent!");
            }}
          >
            Didn't receive it? Resend
          </button>
        </div>
      </div>
    );
  }

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

            {/* Google button */}
            <button className="rr-google-btn" onClick={handleGoogle} type="button">
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="rr-divider">
              <span>or register with email</span>
            </div>

            <div className="rr-field">
              <label className="rr-label">Full Name</label>
              <input className="rr-input" type="text" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} />
            </div>

            <div className="rr-field">
              <label className="rr-label">Email Address</label>
              <input className="rr-input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
            </div>

            <div className="rr-field">
              <label className="rr-label">Password</label>
              <input className="rr-input" type="password" placeholder="Min. 8 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
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