import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './Feedback.css';
const BASE_URL = import.meta.env.VITE_API_URL;

export default function Feedback() {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/interview/feedback`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => { setFeedback(data.feedback); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="fb-state-page">
      <div className="fb-state-orb-1" /><div className="fb-state-orb-2" />
      <div className="fb-grid" />
      <div className="fb-scanline" />
      <div className="fb-loading">
        <div className="fb-loading-ring" />
        <div className="fb-loading-label">Analysing Interview</div>
        <p className="fb-loading-sub">Our AI is reviewing your session performance...</p>
      </div>
    </div>
  );

  if (!feedback) return (
    <div className="fb-state-page">
      <div className="fb-state-orb-1" /><div className="fb-state-orb-2" />
      <div className="fb-grid" />
      <div className="fb-scanline" />
      <div className="fb-empty">
        <div className="fb-empty-icon">📭</div>
        <h2>No Feedback Available</h2>
        <p>Complete an interview session to generate your performance report.</p>
        <Link to="/interview" className="fb-cta-btn">Start a Session →</Link>
      </div>
    </div>
  );

  const scores = [
    { label: "Communication",   key: "communication", icon: "🗣️" },
    { label: "Confidence",      key: "confidence",    icon: "💪" },
    { label: "Technical Skills",key: "technical",     icon: "⚙️" },
    { label: "Grammar",         key: "grammar",       icon: "✍️" },
  ];

  const overall = feedback.overall ?? 0;
  const grade = overall >= 9 ? "Excellent" : overall >= 7 ? "Strong" : overall >= 5 ? "Average" : "Needs Work";
  const gradeColor = overall >= 9 ? "#4ade80" : overall >= 7 ? "#c8f135" : overall >= 5 ? "#f59e0b" : "#ef4444";

  return (
    <div className="fb-page">
      <div className="fb-orb-1" /><div className="fb-orb-2" />
      <div className="fb-grid" />
      <div className="fb-scanline" />

      <div className="fb-content">

        {/* ── HEADER ── */}
        <div className="fb-header">
          <div className="fb-badge">
            <span className="fb-badge-dot" />
            Session Report
          </div>
          <h1>Your Interview<br /><span className="fb-acid">Performance.</span></h1>
          <p className="fb-header-sub">Here's a full breakdown of how you performed across every dimension of your session.</p>
        </div>

        {/* ── OVERALL SCORE ── */}
        <div className="fb-overall">
          <div className="fb-overall-left">
            <div className="fb-overall-label">Overall Score</div>
            <div className="fb-overall-num" style={{ color: gradeColor }}>
              {overall}<span className="fb-overall-denom">/10</span>
            </div>
            <div className="fb-grade-pill" style={{ borderColor: gradeColor + "50", color: gradeColor }}>
              {grade}
            </div>
          </div>
          <div className="fb-overall-right">
            <div className="fb-overall-ring-wrap">
              <svg viewBox="0 0 120 120" className="fb-ring-svg">
                <circle cx="60" cy="60" r="50" className="fb-ring-track" />
                <circle
                  cx="60" cy="60" r="50"
                  className="fb-ring-fill"
                  style={{
                    stroke: gradeColor,
                    strokeDasharray: `${overall * 31.4} 314`,
                  }}
                />
              </svg>
              <div className="fb-ring-inner">
                <span style={{ color: gradeColor }}>{overall * 10}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCORE BARS ── */}
        <div className="fb-scores">
          <div className="fb-section-label">— Detailed Breakdown</div>
          {scores.map((s, i) => {
            const val = feedback[s.key] ?? 0;
            return (
              <div className="fb-score-row" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="fb-score-meta">
                  <span className="fb-score-icon">{s.icon}</span>
                  <span className="fb-score-label">{s.label}</span>
                </div>
                <div className="fb-score-track">
                  <div
                    className="fb-score-fill"
                    style={{
                      width: `${val * 10}%`,
                      background: val >= 8 ? "#4ade80" : val >= 6 ? "#c8f135" : val >= 4 ? "#f59e0b" : "#ef4444",
                      boxShadow: `0 0 10px ${val >= 8 ? "#4ade80" : val >= 6 ? "#c8f135" : val >= 4 ? "#f59e0b" : "#ef4444"}60`,
                    }}
                  />
                </div>
                <div className="fb-score-val">{val}<span>/10</span></div>
              </div>
            );
          })}
        </div>

        {/* ── SUMMARY ── */}
        <div className="fb-summary">
          <div className="fb-summary-header">
            <div className="fb-section-label">— AI Summary</div>
          </div>
          <div className="fb-summary-card">
            <div className="fb-summary-line" />
            <div className="fb-summary-icon">🤖</div>
            <p className="fb-summary-text">{feedback.summary}</p>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="fb-actions">
          <Link to="/interview" className="fb-cta-btn">Practice Again →</Link>
          <Link to="/" className="fb-ghost-btn">Back to Home</Link>
        </div>

      </div>
    </div>
  );
}