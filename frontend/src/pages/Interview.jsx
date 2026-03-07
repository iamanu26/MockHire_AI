import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Interview.css';

export default function Interview() {
  const [type, setType] = useState("tech");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("Welcome! Please introduce yourself.");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [interviewState, setInterviewState] = useState("idle");
  const [waveActive, setWaveActive] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Clear backend history every time a new session starts
  useEffect(() => {
    fetch("http://127.0.0.1:8000/interview/start", { method: "POST" })
      .catch(() => console.warn("Could not reset interview session"));
  }, []);

  if (!recognitionRef.current) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "en-US";
      recog.continuous = false;
      recognitionRef.current = recog;
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) { alert("Speech Recognition not supported"); return; }
    if (interviewState === "paused" || interviewState === "ended") return;
    setInterviewState("running");
    setStatus("Listening...");
    setWaveActive(true);
    recognitionRef.current.start();
    recognitionRef.current.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setAnswer(speechText);
      setStatus("Processing...");
      setWaveActive(false);
      askQuestion(speechText);
    };
    recognitionRef.current.onend = () => setWaveActive(false);
  };

  const speak = (text) => {
    // Best voice available in browser — picks the deepest male voice automatically
    speechSynthesis.cancel();
    setStatus("Speaking...");

    const trySpeak = () => {
      const voices = speechSynthesis.getVoices();

      // Priority list: pick the most natural male voice available
      const preferred = [
        "Microsoft David Desktop",   // Windows — deep, clear
        "Microsoft Mark",            // Windows — professional
        "Google UK English Male",    // Chrome — natural British
        "Google US English",         // Chrome — clear American
        "en-GB",                     // fallback British
        "en-US",                     // fallback American
      ];

      let chosen = null;
      for (const name of preferred) {
        chosen = voices.find(v =>
          v.name.includes(name) || v.lang === name
        );
        if (chosen) break;
      }

      // Last resort: any English male voice
      if (!chosen) {
        chosen = voices.find(v =>
          v.lang.startsWith("en") && v.name.toLowerCase().includes("male")
        );
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang    = "en-US";
      utterance.rate    = 0.88;   // slower = more authoritative
      utterance.pitch   = 0.80;   // lower = deeper, more professional
      utterance.volume  = 1.0;
      if (chosen) utterance.voice = chosen;

      utterance.onstart = () => setStatus("Speaking...");
      utterance.onend   = () => setStatus("Your turn");
      utterance.onerror = () => setStatus("Your turn");

      speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet on first call
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener("voiceschanged", trySpeak, { once: true });
    } else {
      trySpeak();
    }
  };

  const askQuestion = async (userAnswer) => {
    setLoading(true);
    const endpoint = type === "tech"
      ? "http://127.0.0.1:8000/interview/tech"
      : "http://127.0.0.1:8000/interview/hr";
    try {
      const res = await fetch(`${endpoint}?answer=${encodeURIComponent(userAnswer)}`, { method: "POST" });
      const data = await res.json();
      setQuestion(data.question);
      setQuestionKey(k => k + 1);
      speak(data.question);
    } catch {
      alert("Error communicating with server");
    }
    setLoading(false);
    setStatus("Your turn");
  };

  const restartInterview = () => {
    speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setInterviewState("idle");
    setStatus("Ready");
    setWaveActive(false);
    setAnswer("");
    setQuestion("Welcome! Please introduce yourself.");
    setQuestionKey(k => k + 1);
    setLoading(false);
    // ✅ Clear backend history on restart too
    fetch("http://127.0.0.1:8000/interview/start", { method: "POST" })
      .catch(() => console.warn("Could not reset interview session"));
  };

  const pauseInterview  = () => { speechSynthesis.pause();  setInterviewState("paused");  setStatus("Paused");      setWaveActive(false); };
  const resumeInterview = () => { speechSynthesis.resume(); setInterviewState("running"); setStatus("Speaking..."); };

  const stopInterview = async () => {
    speechSynthesis.cancel();
    recognitionRef.current?.abort();
    // Stop any playing XTTS audio
    document.querySelectorAll("audio").forEach(a => { a.pause(); a.src = ""; });
    setInterviewState("ended");
    setStatus("Generating Report...");
    setWaveActive(false);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://127.0.0.1:8000/interview/stop", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // ✅ FIX 3: Navigate to feedback page after session ends
      navigate("/feedback");
    } catch {
      console.error("Failed to stop interview");
      setStatus("Interview Complete");
    }
  };

  const statusColor = {
    "Ready":              "#64748b",
    "Listening...":       "#22d3ee",
    "Processing...":      "#f59e0b",
    "Speaking...":        "#a78bfa",
    "Your turn":          "#4ade80",
    "Paused":             "#f97316",
    "Interview Complete": "#ef4444",
  }[status] || "#64748b";

  const isListening = status === "Listening...";
  const isSpeaking  = status === "Speaking...";

  return (
    <div className="iv-page">

      {/* Background orbs */}
      <div className="iv-orb-1" />
      <div className="iv-orb-2" />
      <div className="iv-grid" />

      {/* Header */}
      <div className="iv-header">
        <div className="iv-header-badge">
          <div className="iv-badge-dot" />
          <span>AI Interview Session</span>
          <div className="iv-badge-dot" />
        </div>
        <h1 className="iv-title">Voice Interview Room</h1>
      </div>

      {/* Type Toggle */}
      <div className="iv-toggle">
        {["tech", "hr"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`iv-toggle-btn ${type === t ? "iv-toggle-btn--active" : ""}`}
          >
            {t === "tech" ? "⚙️ Technical" : "🤝 HR"}
          </button>
        ))}
      </div>

      {/* Question Card */}
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

      {/* Answer Preview */}
      {answer && (
        <div className="iv-answer-card">
          <div className="iv-answer-label">Your Last Answer</div>
          <p className="iv-answer-text">{answer}</p>
        </div>
      )}

      {/* Status */}
      <div className="iv-status">
        <div
          className="iv-status-dot"
          style={{
            background: statusColor,
            boxShadow: `0 0 10px ${statusColor}`,
            animation: isListening || isSpeaking ? "blink 1s ease infinite" : "none",
          }}
        />
        <span style={{ color: statusColor }}>{status}</span>
      </div>

      {/* Mic Button */}
      <div className="iv-mic-wrap">
        {isListening && (
          <>
            <div className="iv-pulse-ring" />
            <div className="iv-pulse-ring2" />
          </>
        )}
        <button
          onClick={startListening}
          disabled={loading || interviewState === "ended"}
          className={`iv-mic-btn ${isListening ? "iv-mic-btn--listening" : ""}`}
          style={{ opacity: loading || interviewState === "ended" ? 0.4 : 1 }}
        >
          🎙️
        </button>
      </div>

      {/* Wave Bars */}
      <div className="iv-wave">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="iv-wave-bar"
            style={{
              background: isListening ? "#22d3ee" : "#1e293b",
              boxShadow: isListening ? "0 0 8px rgba(34,211,238,0.6)" : "none",
              animation: waveActive
                ? `wave ${0.6 + i * 0.08}s ease-in-out ${i * 0.07}s infinite alternate`
                : "none",
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="iv-controls">
        <ControlBtn onClick={pauseInterview}  disabled={interviewState !== "running"} icon="⏸" label="Pause"       color="#f97316" />
        <ControlBtn onClick={resumeInterview} disabled={interviewState !== "paused"}  icon="▶" label="Resume"      color="#4ade80" />
        <ControlBtn onClick={restartInterview} disabled={false}                       icon="🔄" label="Restart"     color="#22d3ee" />
        <ControlBtn onClick={stopInterview}   disabled={interviewState === "ended"}   icon="⬛" label="End Session" color="#ef4444" />
      </div>

      {interviewState === "ended" && (
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
        border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : color + "40"}`,
        background: hover && !disabled ? color + "20" : "rgba(255,255,255,0.03)",
        color: disabled ? "#374151" : color,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: hover && !disabled ? `0 4px 20px ${color}30` : "none",
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}