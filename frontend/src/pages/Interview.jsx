import { useState, useRef, useEffect } from "react";

const PULSE_KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body { background: #080b12; }

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.12); opacity: 0.2; }
  100% { transform: scale(0.95); opacity: 0.6; }
}
@keyframes pulse-ring2 {
  0% { transform: scale(0.9); opacity: 0.4; }
  50% { transform: scale(1.22); opacity: 0.1; }
  100% { transform: scale(0.9); opacity: 0.4; }
}
@keyframes wave {
  0%, 100% { height: 6px; }
  50% { height: 28px; }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes orbFloat {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(-30px) translateX(20px); }
  66% { transform: translateY(20px) translateX(-15px); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
`;

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

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = PULSE_KEYFRAMES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setStatus("Speaking...");
    utterance.onend = () => setStatus("Your turn");
    speechSynthesis.speak(utterance);
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
  };

  const pauseInterview = () => { speechSynthesis.pause(); setInterviewState("paused"); setStatus("Paused"); setWaveActive(false); };
  const resumeInterview = () => { speechSynthesis.resume(); setInterviewState("running"); setStatus("Speaking..."); };
  const stopInterview = async () => {
    speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setInterviewState("ended");
    setStatus("Interview Complete");
    setWaveActive(false);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://127.0.0.1:8000/interview/stop", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch { console.error("Failed to stop interview"); }
  };

  const statusColor = {
    "Ready": "#64748b",
    "Listening...": "#22d3ee",
    "Processing...": "#f59e0b",
    "Speaking...": "#a78bfa",
    "Your turn": "#4ade80",
    "Paused": "#f97316",
    "Interview Complete": "#ef4444",
  }[status] || "#64748b";

  const isListening = status === "Listening...";
  const isSpeaking = status === "Speaking...";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080b12",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "100px 20px 60px 20px",
      fontFamily: "'Syne', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background orbs */}
      <div style={{
        position: "fixed", top: "-10%", left: "-10%", width: "500px", height: "500px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        animation: "orbFloat 12s ease-in-out infinite", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", right: "-10%", width: "600px", height: "600px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)",
        animation: "orbFloat 15s ease-in-out infinite reverse", pointerEvents: "none",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px", animation: "fadeSlideUp 0.6s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22d3ee", boxShadow: "0 0 12px #22d3ee" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", color: "#22d3ee", fontSize: "12px", letterSpacing: "4px", textTransform: "uppercase" }}>
            AI Interview Session
          </span>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22d3ee", boxShadow: "0 0 12px #22d3ee" }} />
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#fff",
          letterSpacing: "-1px", lineHeight: 1.1,
          background: "linear-gradient(135deg, #fff 30%, #a78bfa 70%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Voice Interview Room
        </h1>
      </div>

      {/* Type Toggle */}
      <div style={{
        display: "flex", gap: "0", marginBottom: "36px",
        background: "#0f1623", borderRadius: "12px", padding: "4px",
        border: "1px solid rgba(255,255,255,0.08)",
        animation: "fadeSlideUp 0.6s 0.1s ease both",
      }}>
        {["tech", "hr"].map((t) => (
          <button key={t} onClick={() => setType(t)} style={{
            padding: "10px 28px", borderRadius: "8px", border: "none", cursor: "pointer",
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px",
            letterSpacing: "1px", textTransform: "uppercase",
            background: type === t ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
            color: type === t ? "#fff" : "#4b5563",
            boxShadow: type === t ? "0 4px 20px rgba(99,102,241,0.4)" : "none",
            transition: "all 0.25s ease",
          }}>
            {t === "tech" ? "⚙️ Technical" : "🤝 HR"}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <div key={questionKey} style={{
        width: "100%", maxWidth: "680px", marginBottom: "36px",
        background: "linear-gradient(135deg, rgba(15,22,35,0.9), rgba(20,28,48,0.9))",
        border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: "20px", padding: "32px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.5)",
        animation: "fadeSlideUp 0.45s ease both",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent, #6366f1, #a78bfa, transparent)",
        }} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", color: "#6366f1", fontSize: "10px", letterSpacing: "3px", marginBottom: "10px", textTransform: "uppercase" }}>
              Interviewer
            </div>
            <p style={{
              color: "#e2e8f0", fontSize: "clamp(15px, 2.5vw, 18px)", lineHeight: 1.65,
              fontWeight: 400,
            }}>{question}</p>
          </div>
        </div>
      </div>

      {/* Answer preview */}
      {answer && (
        <div style={{
          width: "100%", maxWidth: "680px", marginBottom: "28px",
          background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)",
          borderRadius: "14px", padding: "16px 24px",
          animation: "fadeSlideUp 0.3s ease both",
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", color: "#22d3ee", fontSize: "10px", letterSpacing: "3px", marginBottom: "6px", textTransform: "uppercase" }}>
            Your Last Answer
          </div>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>{answer}</p>
        </div>
      )}

      {/* Status */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px",
        fontFamily: "'DM Mono', monospace", fontSize: "13px",
      }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: statusColor, boxShadow: `0 0 10px ${statusColor}`,
          animation: isListening || isSpeaking ? "blink 1s ease infinite" : "none",
        }} />
        <span style={{ color: statusColor, letterSpacing: "2px", textTransform: "uppercase" }}>{status}</span>
      </div>

      {/* Mic Button */}
      <div style={{ position: "relative", marginBottom: "36px" }}>
        {isListening && <>
          <div style={{
            position: "absolute", inset: "-20px", borderRadius: "50%",
            border: "2px solid rgba(34,211,238,0.4)",
            animation: "pulse-ring 1.8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: "-40px", borderRadius: "50%",
            border: "1px solid rgba(34,211,238,0.2)",
            animation: "pulse-ring2 1.8s 0.4s ease-in-out infinite",
          }} />
        </>}
        <button onClick={startListening}
          disabled={loading || interviewState === "ended"}
          style={{
            width: "96px", height: "96px", borderRadius: "50%", border: "none", cursor: loading || interviewState === "ended" ? "not-allowed" : "pointer",
            background: isListening
              ? "linear-gradient(135deg, #06b6d4, #22d3ee)"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: isListening
              ? "0 0 40px rgba(34,211,238,0.5), 0 8px 32px rgba(0,0,0,0.4)"
              : "0 0 30px rgba(99,102,241,0.4), 0 8px 32px rgba(0,0,0,0.4)",
            fontSize: "36px", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
            transform: isListening ? "scale(1.05)" : "scale(1)",
            opacity: loading || interviewState === "ended" ? 0.4 : 1,
          }}>
          🎙️
        </button>
      </div>

      {/* Wave bars */}
      <div style={{
        display: "flex", alignItems: "center", gap: "4px", height: "36px", marginBottom: "32px",
      }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} style={{
            width: "4px", borderRadius: "4px",
            background: isListening ? "#22d3ee" : "#1e293b",
            height: waveActive ? undefined : "6px",
            animation: waveActive ? `wave ${0.6 + i * 0.08}s ease-in-out ${i * 0.07}s infinite alternate` : "none",
            transition: "background 0.3s ease",
            boxShadow: isListening ? "0 0 8px rgba(34,211,238,0.6)" : "none",
          }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <ControlBtn
          onClick={pauseInterview}
          disabled={interviewState !== "running"}
          icon="⏸" label="Pause"
          color="#f97316"
        />
        <ControlBtn
          onClick={resumeInterview}
          disabled={interviewState !== "paused"}
          icon="▶" label="Resume"
          color="#4ade80"
        />
        <ControlBtn
          onClick={restartInterview}
          disabled={false}
          icon="🔄" label="Restart"
          color="#22d3ee"
        />
        <ControlBtn
          onClick={stopInterview}
          disabled={interviewState === "ended"}
          icon="⬛" label="End Session"
          color="#ef4444"
          danger
        />
      </div>

      {interviewState === "ended" && (
        <div style={{
          marginTop: "32px", padding: "20px 32px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "14px", textAlign: "center",
          animation: "fadeSlideUp 0.4s ease both",
        }}>
          <p style={{ color: "#fca5a5", fontFamily: "'DM Mono', monospace", fontSize: "13px", letterSpacing: "2px" }}>
            ✓ SESSION COMPLETE — FEEDBACK BEING GENERATED
          </p>
        </div>
      )}
    </div>
  );
}

function ControlBtn({ onClick, disabled, icon, label, color, danger }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "10px 22px", borderRadius: "10px", border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : color + "40"}`,
        background: hover && !disabled ? color + "20" : "rgba(255,255,255,0.03)",
        color: disabled ? "#374151" : color,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "13px",
        display: "flex", alignItems: "center", gap: "8px",
        transition: "all 0.2s ease",
        boxShadow: hover && !disabled ? `0 4px 20px ${color}30` : "none",
      }}>
      <span>{icon}</span> {label}
    </button>
  );
}