import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import './Login.css';
import './auth-additions.css';

export default function ResendVerification() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
  }, []);

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
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

      <div className="fp-center">
        <div className="fp-card">
          {sent ? (
            <>
              <div className="fp-icon">✉</div>
              <h2>Email sent!</h2>
              <p>If your email is registered and unverified, you'll receive a new verification link shortly.</p>
              <Link to="/login" className="fp-back-btn">Back to Sign In</Link>
            </>
          ) : (
            <>
              <div className="fp-icon">📨</div>
              <h2>Resend verification</h2>
              <p>Enter the email you registered with and we'll send a fresh verification link.</p>

              {error && <div className="lr-error" style={{ margin: "0 0 16px" }}>⚠ {error}</div>}

              <div className="lr-field" style={{ marginBottom: 20 }}>
                <label className="lr-label">Email Address</label>
                <input
                  className="lr-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <button className="lr-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Sending..." : "Resend Verification →"}
              </button>

              <Link to="/login" className="fp-link">Back to Sign In</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}