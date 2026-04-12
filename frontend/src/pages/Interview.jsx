import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Interview.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const COUNTDOWN_SECONDS = 3;
const SILENCE_TIMEOUT   = 25000;  // 25 seconds — enough time to think and answer
const MAX_REASKS        = 1;

export default function Interview() {
  const [phase, setPhase]               = useState("setup");

  // Resume state
  const [resumeData, setResumeData]     = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadErr, setUploadErr]       = useState("");
  const [editMode, setEditMode]         = useState(false);
  const [editedData, setEditedData]     = useState(null);
  const [expInput, setExpInput]         = useState("0");

  // Interview state
  const [type, setType]                 = useState("tech");
  const [answer, setAnswer]             = useState("");
  const [question, setQuestion]         = useState("Welcome! Please introduce yourself.");
  const [status, setStatus]             = useState("Ready");
  const [loading, setLoading]           = useState(false);
  const [interviewState, setInterviewState] = useState("idle");
  const [waveActive, setWaveActive]     = useState(false);
  const [questionKey, setQuestionKey]   = useState(0);
  const [countdown, setCountdown]       = useState(null);
  const [reaskCount, setReaskCount]     = useState(0);

  // ── FIX 1: track ending state to show spinner instead of navigating instantly
  const [isEnding, setIsEnding]         = useState(false);

  const recognitionRef  = useRef(null);
  const countdownRef    = useRef(null);
  const silenceTimerRef = useRef(null);
  const currentQuestion = useRef("Welcome! Please introduce yourself.");
  const navigate        = useNavigate();

  // Setup SpeechRecognition
  if (!recognitionRef.current) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recog        = new SR();
      recog.lang         = "en-US";
      recog.continuous   = false;
      recognitionRef.current = recog;
    }
  }

  // ── Resume upload ──────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) { setUploadErr("Only PDF files are supported."); return; }
    setUploading(true);
    setUploadErr("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${BASE_URL}/resume/extract`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Extraction failed");
      setResumeData(data);
      setEditedData({ ...data });
      setExpInput(String(data.years_of_experience ?? 0));
    } catch (err) {
      setUploadErr(err.message);
    }
    setUploading(false);
  };

  const saveEdits = () => {
    const updated = {
      ...editedData,
      years_of_experience: parseInt(expInput) || 0,
      level: parseInt(expInput) > 0 ? "Experienced" : "Fresher",
    };
    setResumeData(updated);
    setEditedData(updated);
    setEditMode(false);
  };

  // ── Start interview ────────────────────────────────────────────
  const startInterview = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${BASE_URL}/interview/start`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(resumeData || {}),
    }).catch(() => {});
    setPhase("interview");
    setTimeout(() => beginCountdown(), 800);
  };

  // ── Countdown → listen ─────────────────────────────────────────
  const beginCountdown = useCallback(() => {
    if (interviewState === "ended" || interviewState === "paused") return;
    let count = COUNTDOWN_SECONDS;
    setCountdown(count);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownRef.current);
        setCountdown(null);
        startListening();
      }
    }, 1000);
  }, [interviewState]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setInterviewState("running");
    setStatus("Listening...");
    setWaveActive(true);
    clearTimeout(silenceTimerRef.current);

    silenceTimerRef.current = setTimeout(() => {
      recognitionRef.current?.stop();
      setWaveActive(false);
      if (reaskCount < MAX_REASKS) {
        setReaskCount(r => r + 1);
        setStatus("Re-asking...");
        speak(currentQuestion.current, false);
      } else {
        setReaskCount(0);
        setStatus("Moving on...");
        askQuestion("[No response — candidate did not answer]");
      }
    }, SILENCE_TIMEOUT);

    try { recognitionRef.current.start(); } catch {}

    recognitionRef.current.onresult = (event) => {
      clearTimeout(silenceTimerRef.current);
      const speechText = event.results[0][0].transcript;
      setAnswer(speechText);
      setStatus("Processing...");
      setWaveActive(false);
      setReaskCount(0);
      askQuestion(speechText);
    };

    recognitionRef.current.onend  = () => { setWaveActive(false); };
    recognitionRef.current.onerror = () => {
      clearTimeout(silenceTimerRef.current);
      setWaveActive(false);
      setStatus("Your turn");
    };
  }, [reaskCount]);

  // ── Speak + auto-countdown ─────────────────────────────────────
  const speak = useCallback((text, autoCountdown = true) => {
    speechSynthesis.cancel();
    setStatus("Speaking...");
    currentQuestion.current = text;

    const trySpeak = () => {
      const voices = speechSynthesis.getVoices();
      const preferred = [
        "Microsoft David Desktop", "Microsoft Mark",
        "Google UK English Male", "Google US English",
      ];
      let chosen = null;
      for (const name of preferred) {
        chosen = voices.find(v => v.name.includes(name) || v.lang === name);
        if (chosen) break;
      }
      if (!chosen) chosen = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("male"));

      const utterance    = new SpeechSynthesisUtterance(text);
      utterance.lang     = "en-US";
      utterance.rate     = 0.88;
      utterance.pitch    = 0.80;
      utterance.volume   = 1.0;
      if (chosen) utterance.voice = chosen;

      utterance.onstart = () => setStatus("Speaking...");
      utterance.onend   = () => {
        setStatus("Your turn");
        if (autoCountdown && interviewState !== "ended" && interviewState !== "paused") {
          beginCountdown();
        }
      };
      utterance.onerror = () => setStatus("Your turn");
      speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener("voiceschanged", trySpeak, { once: true });
    } else {
      trySpeak();
    }
  }, [interviewState, beginCountdown]);

  const askQuestion = async (userAnswer) => {
    setLoading(true);
    const endpoint = type === "tech"
      ? `${BASE_URL}/interview/tech`
      : `${BASE_URL}/interview/hr`;
    try {
      const res  = await fetch(`${endpoint}?answer=${encodeURIComponent(userAnswer)}`, { method: "POST" });
      const data = await res.json();
      setQuestion(data.question);
      currentQuestion.current = data.question;
      setQuestionKey(k => k + 1);
      speak(data.question, true);
    } catch {
      setStatus("Your turn");
    }
    setLoading(false);
  };

  const restartInterview = () => {
    clearInterval(countdownRef.current);
    clearTimeout(silenceTimerRef.current);
    speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setInterviewState("idle");
    setStatus("Ready");
    setWaveActive(false);
    setAnswer("");
    setCountdown(null);
    setReaskCount(0);
    setIsEnding(false);
    setQuestion("Welcome! Please introduce yourself.");
    setQuestionKey(k => k + 1);
    setLoading(false);
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/interview/start`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(resumeData || {}),
    }).catch(() => {});
    setTimeout(() => beginCountdown(), 800);
  };

  const pauseInterview = () => {
    clearInterval(countdownRef.current);
    clearTimeout(silenceTimerRef.current);
    speechSynthesis.pause();
    recognitionRef.current?.abort();
    setInterviewState("paused");
    setStatus("Paused");
    setWaveActive(false);
    setCountdown(null);
  };

  const resumeInterview = () => {
    speechSynthesis.resume();
    setInterviewState("running");
    setStatus("Speaking...");
  };

  // ── FIX 1: stopInterview — wait for feedback API, THEN navigate ──
  const stopInterview = async () => {
    clearInterval(countdownRef.current);
    clearTimeout(silenceTimerRef.current);
    speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setInterviewState("ended");
    setWaveActive(false);
    setCountdown(null);
    setIsEnding(true);
    setStatus("Generating Report...");

    try {
      const token = localStorage.getItem("token");

      // Stop the interview session
      await fetch(`${BASE_URL}/interview/stop`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      // ── KEY FIX: fetch feedback HERE and store it, then navigate ──
      const feedbackRes = await fetch(`${BASE_URL}/interview/feedback`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        // Store in sessionStorage so Feedback.jsx can read it immediately
        sessionStorage.setItem("lastFeedback", JSON.stringify(feedbackData.feedback));
        navigate("/feedback");
      } else {
        setStatus("Error generating report. Try again.");
        setIsEnding(false);
        setInterviewState("ended");
      }
    } catch {
      setStatus("Error generating report. Try again.");
      setIsEnding(false);
      setInterviewState("ended");
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(countdownRef.current);
      clearTimeout(silenceTimerRef.current);
      speechSynthesis.cancel();
    };
  }, []);

  const statusColor = {
    "Ready":            "#64748b",
    "Listening...":     "#22d3ee",
    "Processing...":    "#f59e0b",
    "Speaking...":      "#a78bfa",
    "Your turn":        "#4ade80",
    "Paused":           "#f97316",
    "Re-asking...":     "#f59e0b",
    "Moving on...":     "#94a3b8",
    "Generating Report...": "#c8f135",
    "Interview Complete":   "#ef4444",
  }[status] || "#64748b";

  const isListening = status === "Listening...";
  const isSpeaking  = status === "Speaking...";

  // ══════════════════════════════════════════════════════════════
  //  SETUP PHASE
  // ══════════════════════════════════════════════════════════════
  if (phase === "setup") {
    const d = editMode ? editedData : resumeData;
    return (
      <div className="iv-page">
        <div className="iv-orb-1" /><div className="iv-orb-2" /><div className="iv-grid" />

        <div className="iv-setup">
          <div className="iv-setup-header">
            <div className="iv-header-badge">
              <div className="iv-badge-dot" /><span>AI Interview Session</span><div className="iv-badge-dot" />
            </div>
            <h1 className="iv-title">Prepare Your Session</h1>
            <p className="iv-setup-sub">Upload your resume for a personalized interview, or skip to start immediately.</p>
          </div>

          <div className="iv-upload-box">
            <div className="iv-upload-icon">📄</div>
            <div className="iv-upload-title">Upload Resume <span className="iv-optional">(Optional)</span></div>
            <p className="iv-upload-desc">PDF only — AI will extract your skills, projects and experience to personalize questions.</p>
            <label className="iv-upload-btn">
              {uploading ? "Extracting..." : "Choose PDF"}
              <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={uploading} style={{ display: "none" }} />
            </label>
            {uploadErr && <div className="iv-upload-err">⚠ {uploadErr}</div>}
          </div>

          {d && (
            <div className="iv-resume-card">
              <div className="iv-resume-card-header">
                <div className="iv-resume-title">✅ Resume Extracted</div>
                <button className="iv-edit-btn" onClick={() => { setEditMode(!editMode); setEditedData({ ...resumeData }); }}>
                  {editMode ? "Cancel" : "✏ Edit"}
                </button>
              </div>

              <div className="iv-resume-grid">
                <div className="iv-resume-field">
                  <label>Name</label>
                  {editMode
                    ? <input className="iv-input" value={editedData.name || ""} onChange={e => setEditedData(p => ({ ...p, name: e.target.value }))} />
                    : <span>{d.name || "—"}</span>}
                </div>
                <div className="iv-resume-field">
                  <label>Years of Experience</label>
                  {editMode
                    ? <input className="iv-input" type="number" min="0" max="40" value={expInput} onChange={e => setExpInput(e.target.value)} />
                    : <span>{d.years_of_experience === 0 ? "Fresher" : `${d.years_of_experience} years`}</span>}
                </div>
                <div className="iv-resume-field">
                  <label>Current Role</label>
                  {editMode
                    ? <input className="iv-input" value={editedData.current_role || ""} onChange={e => setEditedData(p => ({ ...p, current_role: e.target.value }))} />
                    : <span>{d.current_role || "—"}</span>}
                </div>
                <div className="iv-resume-field">
                  <label>Education</label>
                  {editMode
                    ? <input className="iv-input" value={editedData.education || ""} onChange={e => setEditedData(p => ({ ...p, education: e.target.value }))} />
                    : <span>{d.education || "—"}</span>}
                </div>
              </div>

              <div className="iv-resume-field iv-resume-field--full">
                <label>Skills</label>
                {editMode
                  ? <input className="iv-input" value={(editedData.skills || []).join(", ")} onChange={e => setEditedData(p => ({ ...p, skills: e.target.value.split(",").map(s => s.trim()) }))} />
                  : <div className="iv-skills-wrap">{(d.skills || []).map((s, i) => <span key={i} className="iv-skill-tag">{s}</span>)}</div>}
              </div>

              {d.projects?.length > 0 && (
                <div className="iv-resume-field iv-resume-field--full">
                  <label>Projects</label>
                  <div className="iv-projects-list">
                    {(editMode ? editedData.projects : d.projects)?.map((p, i) => (
                      <div key={i} className="iv-project-item">
                        <div className="iv-project-name">{p.name}</div>
                        <div className="iv-project-desc">{p.description}</div>
                        <div className="iv-project-tech">{(p.tech || []).map((t, j) => <span key={j} className="iv-tech-tag">{t}</span>)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {d.summary && (
                <div className="iv-resume-field iv-resume-field--full">
                  <label>AI Summary</label>
                  <p className="iv-summary-text">{d.summary}</p>
                </div>
              )}

              {editMode && <button className="iv-save-btn" onClick={saveEdits}>Save Changes ✓</button>}
            </div>
          )}

          <div className="iv-setup-type">
            <div className="iv-setup-type-label">Interview Type</div>
            <div className="iv-toggle">
              <button onClick={() => setType("tech")} className={`iv-toggle-btn ${type === "tech" ? "iv-toggle-btn--active" : ""}`}>⚙️ Technical</button>
              <button onClick={() => setType("hr")}   className={`iv-toggle-btn ${type === "hr"   ? "iv-toggle-btn--active" : ""}`}>🤝 HR</button>
              <button onClick={() => navigate("/dsa-practice")} className="iv-toggle-btn iv-toggle-btn--dsa">🧩 DSA Practice</button>
            </div>
          </div>

          <div className="iv-setup-actions">
            <button className="iv-start-btn" onClick={startInterview}>
              {resumeData ? "Start Personalized Interview →" : "Start Interview →"}
            </button>
            {resumeData && (
              <button className="iv-skip-btn" onClick={() => { setResumeData(null); startInterview(); }}>
                Skip Resume & Start Fresh
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  //  ENDING OVERLAY — shown while fetching feedback
  // ══════════════════════════════════════════════════════════════
  if (isEnding) {
    return (
      <div className="iv-page">
        <div className="iv-orb-1" /><div className="iv-orb-2" /><div className="iv-grid" />
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ fontSize: 64 }}>🤖</div>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: "#fff",
            background: "linear-gradient(135deg,#c8f135,#a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Analysing Your Interview...
          </h2>
          <p style={{ color: "#4b5563", fontFamily: "'DM Mono', monospace", fontSize: 13, letterSpacing: 2 }}>
            AI IS GENERATING YOUR PERSONALISED FEEDBACK REPORT
          </p>
          {/* Animated dots */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%", background: "#c8f135",
                animation: `blink 1.2s ease ${i * 0.3}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  //  INTERVIEW PHASE
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="iv-page">
      <div className="iv-orb-1" /><div className="iv-orb-2" /><div className="iv-grid" />

      <div className="iv-header">
        <div className="iv-header-badge">
          <div className="iv-badge-dot" /><span>AI Interview Session</span><div className="iv-badge-dot" />
        </div>
        <h1 className="iv-title">Voice Interview Room</h1>
        {resumeData?.name && <div className="iv-candidate-badge">👤 {resumeData.name}</div>}
      </div>

      <div className="iv-toggle">
        <button onClick={() => setType("tech")} className={`iv-toggle-btn ${type === "tech" ? "iv-toggle-btn--active" : ""}`}>⚙️ Technical</button>
        <button onClick={() => setType("hr")}   className={`iv-toggle-btn ${type === "hr"   ? "iv-toggle-btn--active" : ""}`}>🤝 HR</button>
        <button onClick={() => navigate("/dsa-practice")} className="iv-toggle-btn iv-toggle-btn--dsa">🧩 DSA Practice</button>
      </div>

      <div key={questionKey} className="iv-question-card">
        <div className="iv-question-line" />
        <div className="iv-question-inner">
          <div className="iv-bot-avatar">🤖</div>
          <div className="iv-question-body">
            <div className="iv-question-label">Interviewer</div>
            <p className="iv-question-text">{question}</p>
          </div>
        </div>
      </div>

      {answer && (
        <div className="iv-answer-card">
          <div className="iv-answer-label">Your Last Answer</div>
          <p className="iv-answer-text">{answer}</p>
        </div>
      )}

      <div className="iv-status">
        <div className="iv-status-dot" style={{
          background:  statusColor,
          boxShadow:   `0 0 10px ${statusColor}`,
          animation:   isListening || isSpeaking ? "blink 1s ease infinite" : "none",
        }} />
        <span style={{ color: statusColor }}>{status}</span>
      </div>

      {/* ── FIX 2: Auto-only mic — no manual click, just visual feedback ── */}
      <div className="iv-mic-wrap">
        {countdown !== null ? (
          <div className="iv-countdown">
            <svg viewBox="0 0 100 100" className="iv-countdown-ring">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="#c8f135" strokeWidth="8"
                strokeDasharray={`${(countdown / COUNTDOWN_SECONDS) * 276} 276`}
                strokeLinecap="round" strokeDashoffset="0"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.9s linear" }}
              />
            </svg>
            <div className="iv-countdown-num">{countdown}</div>
          </div>
        ) : (
          // Visual-only mic indicator — NOT clickable
          <div className={`iv-mic-btn ${isListening ? "iv-mic-btn--listening" : ""}`}
            style={{ cursor: "default", opacity: interviewState === "ended" ? 0.3 : 1 }}
          >
            {isListening ? "🎙️" : isSpeaking ? "🔊" : loading ? "⏳" : "🎙️"}
            {isListening && <><div className="iv-pulse-ring" /><div className="iv-pulse-ring2" /></>}
          </div>
        )}
      </div>

      <div className="iv-wave">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="iv-wave-bar" style={{
            background: isListening ? "#22d3ee" : "#1e293b",
            boxShadow:  isListening ? "0 0 8px rgba(34,211,238,0.6)" : "none",
            animation:  waveActive  ? `wave ${0.6 + i * 0.08}s ease-in-out ${i * 0.07}s infinite alternate` : "none",
          }} />
        ))}
      </div>

      <div className="iv-controls">
        <ControlBtn onClick={pauseInterview}   disabled={interviewState !== "running"} icon="⏸" label="Pause"       color="#f97316" />
        <ControlBtn onClick={resumeInterview}  disabled={interviewState !== "paused"}  icon="▶" label="Resume"      color="#4ade80" />
        <ControlBtn onClick={restartInterview} disabled={false}                        icon="🔄" label="Restart"     color="#22d3ee" />
        <ControlBtn onClick={stopInterview}    disabled={interviewState === "ended"}   icon="⬛" label="End Session" color="#ef4444" />
      </div>

      {interviewState === "ended" && !isEnding && (
        <div className="iv-ended-banner">
          <p>✓ SESSION COMPLETE — FEEDBACK BEING GENERATED</p>
        </div>
      )}
    </div>
  );
}

function ControlBtn({ onClick, disabled, icon, label, color }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="iv-ctrl-btn"
      style={{
        border:     `1px solid ${disabled ? "rgba(255,255,255,0.06)" : color + "40"}`,
        background: hover && !disabled ? color + "20" : "rgba(255,255,255,0.03)",
        color:      disabled ? "#374151" : color,
        cursor:     disabled ? "not-allowed" : "pointer",
        boxShadow:  hover && !disabled ? `0 4px 20px ${color}30` : "none",
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}