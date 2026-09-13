import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './Login.css';

// ── Email validator ──────────────────────────────────────────────────────────
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const videoRef  = useRef(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
  }, []);

  // Read URL flags set by backend redirects
  const justVerified    = searchParams.get("verified") === "true";
  const invalidToken    = searchParams.get("error")    === "invalid-token";
  const googleFailed    = searchParams.get("error")    === "google-failed";
  const sessionExpired  = searchParams.get("expired")  === "true";

  const handleLogin = async () => {
    if (!email || !password)  { setError("Please fill in all fields."); return; }
    if (!isValidEmail(email)) { setError("Please enter a valid email address (e.g. you@example.com)."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        login(data.access_token);
        navigate("/interview");
      } else {
        setError(data.detail || "Invalid email or password.");
      }
    } catch {
      setError("Unable to reach server. Please check your connection.");
    }
    setLoading(false);
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
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

        {/* ── LEFT PANEL ── */}
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
              { icon: "🤖", title: "LLaMA-Powered Questions",    desc: "Adaptive AI that responds to your answers in real time." },
              { icon: "🎙️", title: "Full Voice Interview",        desc: "Speak naturally — no typing, no clicking, just you." },
              { icon: "📊", title: "Instant Performance Report",  desc: "Detailed feedback the moment your session ends." },
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

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="lr-header">
            <h2>Welcome<br />Back.</h2>
            <p>Sign in to continue your interview preparation.</p>
          </div>

          <div className="lr-form">
            {/* Status banners */}
            {justVerified && (
              <div className="lr-success">
                ✓ Email verified! You can now sign in.
              </div>
            )}
            {invalidToken && (
              <div className="lr-error">
                ⚠ That verification link is invalid or already used.
              </div>
            )}
            {googleFailed && (
              <div className="lr-error">
                ⚠ Google sign-in failed. Please try again.
              </div>
            )}
            {sessionExpired && (
              <div className="lr-warning">
                ⏱ Your session has expired. Please sign in again.
              </div>
            )}
            {error && <div className="lr-error">⚠ {error}</div>}

            {/* Google button */}
            <button className="lr-google-btn" onClick={handleGoogle} type="button">
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="lr-divider">
              <span>or sign in with email</span>
            </div>

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
              <div className="lr-forgot">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            </div>

            <button className="lr-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing In..." : "Sign In →"}
            </button>

            <div className="lr-resend">
              Didn't get a verification email?{" "}
              <Link to="/resend-verification">Resend it</Link>
            </div>
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