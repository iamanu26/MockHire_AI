import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./History.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const SCORE_COLOR = (s) =>
  s >= 8 ? "#4ade80" : s >= 6 ? "#c8f135" : s >= 4 ? "#f59e0b" : "#ef4444";

export default function History() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res  = await fetch(`${BASE_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          logout();
          navigate("/login?expired=true");
          return;
        }
        const json = await res.json();
        setHistory(json.history || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchHistory();
  }, [logout, navigate, token]);

  if (loading) return (
    <div className="hist-page">
      <div className="hist-loading"><div className="hist-spin" />Loading history...</div>
    </div>
  );

  return (
    <div className="hist-page">
      <div className="hist-orb-1" /><div className="hist-orb-2" /><div className="hist-grid" />

      <div className="hist-content">

        {/* Header */}
        <div className="hist-header">
          <button className="hist-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1 className="hist-title">Interview History</h1>
            <p className="hist-subtitle">{history.length} session{history.length !== 1 ? "s" : ""} recorded</p>
          </div>
        </div>

        {/* Cards */}
        {history.length === 0 ? (
          <div className="hist-empty">
            No sessions yet.
            <button className="hist-start-btn" onClick={() => navigate("/interview")}>
              Start Your First Interview →
            </button>
          </div>
        ) : (
          <div className="hist-list">
            {history.map((h, i) => (
              <div className="hist-card" key={h.id}>

                {/* Top row */}
                <div className="hist-card-top">
                  <span className="hist-card-num">Session #{history.length - i}</span>
                  <span className="hist-card-date">
                    {h.created_at
                      ? new Date(h.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })
                      : "—"}
                  </span>
                  <span className="hist-card-overall" style={{ color: SCORE_COLOR(h.overall) }}>
                    {h.overall}/10
                  </span>
                </div>

                {/* Score bars */}
                <div className="hist-scores">
                  {[
                    ["Communication", h.communication],
                    ["Confidence",    h.confidence],
                    ["Technical",     h.technical],
                    ["Grammar",       h.grammar],
                  ].map(([label, val]) => (
                    <div className="hist-score-row" key={label}>
                      <span className="hist-score-label">{label}</span>
                      <div className="hist-score-track">
                        <div
                          className="hist-score-fill"
                          style={{ width: `${(val || 0) * 10}%`, background: SCORE_COLOR(val || 0) }}
                        />
                      </div>
                      <span className="hist-score-val" style={{ color: SCORE_COLOR(val || 0) }}>
                        {val}/10
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {h.summary && (
                  <p className="hist-card-summary">{h.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}