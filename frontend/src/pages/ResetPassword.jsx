import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import './Login.css';
import './auth-additions.css';

export default function ResetPassword() {
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [searchParams] = useSearchParams();
  const navigate   = useNavigate();
  const videoRef   = useRef(null);
  const token      = searchParams.get("token");

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.6;
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleReset = async () => {
    if (!password || !confirm)   { setError("Please fill in both fields."); return; }
    if (password !== confirm)    { setError("Passwords do not match."); return; }
    if (password.length < 8)     { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.detail || "Reset failed. The link may have expired.");
      }
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
          {success ? (
            <>
              <div className="fp-icon" style={{ color: "#4ade80" }}>✓</div>
              <h2>Password updated!</h2>
              <p>Your password has been changed successfully. Redirecting you to sign in...</p>
              <Link to="/login" className="fp-back-btn">Sign In now</Link>
            </>
          ) : (
            <>
              <div className="fp-icon">🔒</div>
              <h2>Set new password</h2>
              <p>Choose a strong password for your MockHire AI account.</p>

              {error && <div className="lr-error" style={{ margin: "0 0 16px" }}>⚠ {error}</div>}

              <div className="lr-field" style={{ marginBottom: 16 }}>
                <label className="lr-label">New Password</label>
                <input
                  className="lr-input"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="lr-field" style={{ marginBottom: 24 }}>
                <label className="lr-label">Confirm Password</label>
                <input
                  className="lr-input"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                />
              </div>

              {/* Password strength hint */}
              {password && (
                <div className="fp-strength">
                  <div className={`fp-strength-bar ${password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak"}`} />
                  <span>{password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : "Too short"}</span>
                </div>
              )}

              <button
                className="lr-btn"
                onClick={handleReset}
                disabled={loading || !token}
              >
                {loading ? "Updating..." : "Update Password →"}
              </button>

              <Link to="/forgot-password" className="fp-link">Request a new link</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}