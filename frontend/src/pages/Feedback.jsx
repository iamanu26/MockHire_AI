// Feedback.jsx — MockHire AI
// ── Features included ──────────────────────────────────────────
// ✅ Reads feedback from sessionStorage (set by Interview.jsx)
// ✅ Score bars with color coding
// ✅ SVG ring chart for overall score
// ✅ AI written summary
// ✅ Proctoring integrity report (violations log, score, breakdown)
// ✅ Error state if no session found
// ✅ Loading state

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import './Feedback.css';

export default function Feedback() {
  const [feedback,    setFeedback]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [procReport,  setProcReport]  = useState(null); // proctoring report
  const navigate  = useNavigate();
  const hasRun    = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // ── Read proctoring report saved by Interview.jsx ──────────
    const storedProc = sessionStorage.getItem("proctoringReport");
    if (storedProc) {
      try { setProcReport(JSON.parse(storedProc)); } catch {}
      sessionStorage.removeItem("proctoringReport");
    }

    // ── Read feedback stored by Interview.jsx ──────────────────
    const cached = sessionStorage.getItem("lastFeedback");
    if (cached) {
      try {
        setFeedback(JSON.parse(cached));
        sessionStorage.removeItem("lastFeedback");
        setLoading(false);
        return;
      } catch {}
    }

    // No feedback found — user came here directly without doing interview
    setError("No interview session found. Please complete an interview first.");
    setLoading(false);
  }, []);

  const scoreColor = (s) => {
    if (s >= 8) return "#4ade80";
    if (s >= 6) return "#c8f135";
    if (s >= 4) return "#f59e0b";
    return "#ef4444";
  };

  const scoreLabel = (s) => {
    if (s >= 8) return "Excellent";
    if (s >= 6) return "Good";
    if (s >= 4) return "Average";
    return "Needs Work";
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div className="fb-page">
      <div className="fb-orb-1"/><div className="fb-orb-2"/><div className="fb-grid"/>
      <div className="fb-loading">
        <div className="fb-loading-ring"/>
        <div className="fb-loading-label">Generating Report</div>
        <div className="fb-loading-sub">Analysing your interview responses…</div>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────
  if (error) return (
    <div className="fb-page">
      <div className="fb-orb-1"/><div className="fb-orb-2"/><div className="fb-grid"/>
      <div className="fb-empty">
        <div className="fb-empty-icon">⚠️</div>
        <h2>{error}</h2>
        <p>Complete a voice interview session first, then your report will appear here.</p>
        <button className="fb-cta-btn" onClick={() => navigate("/interview")}>
          Start Interview →
        </button>
      </div>
    </div>
  );

  const scores = [
    { key:"communication", label:"Communication", icon:"💬" },
    { key:"confidence",    label:"Confidence",    icon:"💪" },
    { key:"technical",     label:"Technical",     icon:"⚙️" },
    { key:"grammar",       label:"Grammar",       icon:"📝" },
  ];

  const overall       = feedback.overall ?? 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="fb-page">
      <div className="fb-orb-1"/><div className="fb-orb-2"/><div className="fb-grid"/>

      <div className="fb-content">

        {/* ── Header ── */}
        <div className="fb-header">
          <div className="fb-badge">
            <span className="fb-badge-dot"/> Interview Complete
          </div>
          <h1>Your <span className="fb-acid">Report.</span></h1>
          <p className="fb-header-sub">Here's a detailed breakdown of your mock interview performance.</p>
        </div>

        {/* ── Overall score ── */}
        <div className="fb-overall">
          <div>
            <div className="fb-overall-label">Overall Score</div>
            <div className="fb-overall-num" style={{ color:scoreColor(overall) }}>
              {overall}<span className="fb-overall-denom">/10</span>
            </div>
            <div className="fb-grade-pill" style={{
              color:       scoreColor(overall),
              borderColor: scoreColor(overall)+"60",
              background:  scoreColor(overall)+"15",
            }}>
              {scoreLabel(overall)}
            </div>
          </div>
          <div className="fb-overall-ring-wrap">
            <svg className="fb-ring-svg" viewBox="0 0 120 120">
              <circle className="fb-ring-track" cx="60" cy="60" r="54"/>
              <circle
                className="fb-ring-fill"
                cx="60" cy="60" r="54"
                stroke={scoreColor(overall)}
                strokeDasharray={`${(overall/10)*circumference} ${circumference}`}
              />
            </svg>
            <div className="fb-ring-inner" style={{ color:scoreColor(overall) }}>{overall}</div>
          </div>
        </div>

        {/* ── Score bars ── */}
        <div className="fb-scores">
          <div className="fb-section-label">Category Breakdown</div>
          {scores.map(({ key, label, icon }, idx) => {
            const val = feedback[key] ?? 0;
            return (
              <div key={key} className="fb-score-row" style={{ animationDelay:`${0.1+idx*0.08}s` }}>
                <div className="fb-score-meta">
                  <span className="fb-score-icon">{icon}</span>
                  <span className="fb-score-label">{label}</span>
                </div>
                <div className="fb-score-track">
                  <div className="fb-score-fill" style={{
                    width:     `${val*10}%`,
                    background: scoreColor(val),
                    boxShadow: `0 0 10px ${scoreColor(val)}70`,
                  }}/>
                </div>
                <div className="fb-score-val">{val}<span>/10</span></div>
              </div>
            );
          })}
        </div>

        {/* ── AI Summary ── */}
        {feedback.summary && (
          <div className="fb-summary">
            <div className="fb-section-label">AI Feedback</div>
            <div className="fb-summary-card">
              <div className="fb-summary-line"/>
              <div className="fb-summary-icon">🤖</div>
              <p className="fb-summary-text">{feedback.summary}</p>
            </div>
          </div>
        )}

        {/* ── Proctoring Integrity Report ── */}
        {procReport && (
          <div className="fb-proctor-card">
            <div className="fb-proctor-header">
              <div className="fb-proctor-title">
                <span>🔒</span> Integrity Report
              </div>
              <div className="fb-proctor-score" style={{
                color: procReport.integrity_score >= 8
                  ? "#4ade80"
                  : procReport.integrity_score >= 5
                  ? "#f59e0b"
                  : "#ef4444"
              }}>
                {procReport.integrity_score}/10
              </div>
            </div>

            <p className="fb-proctor-summary">{procReport.summary}</p>

            {/* Violation type breakdown */}
            {procReport.total_violations > 0 && (
              <div className="fb-proctor-breakdown">
                {Object.entries(procReport.violation_counts)
                  .filter(([, count]) => count > 0)
                  .map(([type, count]) => (
                    <div key={type} className="fb-proctor-row">
                      <span className="fb-proctor-type">
                        {type === "no_face"              && "👤 No Face Detected"}
                        {type === "multiple_faces"       && "👥 Multiple Faces"}
                        {type === "looking_away"         && "👀 Looking Away"}
                        {type === "tab_switch"           && "🔀 Tab Switch"}
                        {type === "screen_share_stopped" && "🖥️ Screen Share Stopped"}
                      </span>
                      <span className="fb-proctor-count">{count}x</span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Expandable violation timeline */}
            {procReport.violations_log?.length > 0 && (
              <details className="fb-proctor-log">
                <summary>View violation timeline</summary>
                <div className="fb-proctor-log-list">
                  {procReport.violations_log.map((v, i) => (
                    <div key={i} className="fb-proctor-log-row">
                      <span className="fb-log-time">{v.time}</span>
                      <span className="fb-log-msg">{v.message}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="fb-actions">
          <button className="fb-cta-btn" onClick={() => navigate("/interview")}>
            Start New Interview →
          </button>
          <button className="fb-ghost-btn" onClick={() => navigate("/profile")}>
            View History
          </button>
          <button className="fb-ghost-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}