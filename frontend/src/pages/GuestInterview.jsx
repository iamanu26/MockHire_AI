// GuestInterview.jsx — Route: /guest-interview?token=xxx
// Guest from Project A — no login, no MockHire account
// After interview: sends feedback back to Project A and redirects

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import "./Interview.css";
import "./Dsapractice.css";

const BASE_URL          = import.meta.env.VITE_API_URL;
const COUNTDOWN_SECONDS = 3;
const SILENCE_TIMEOUT   = 8000;
const MAX_REASKS        = 1;

export default function GuestInterview() {
  const [searchParams] = useSearchParams();
  const guestToken     = searchParams.get("token");

  // ── Phases: verifying → mode-select → interview → dsa → done ──
  const [phase,      setPhase]      = useState("verifying");
  const [guestUser,  setGuestUser]  = useState(null);
  const [authError,  setAuthError]  = useState("");
  const [mode,       setMode]       = useState("tech"); // tech | hr | dsa

  // ── Interview state ────────────────────────────────────────────
  const [question,       setQuestion]       = useState("Welcome! Please introduce yourself.");
  const [answer,         setAnswer]         = useState("");
  const [status,         setStatus]         = useState("Ready");
  const [loading,        setLoading]        = useState(false);
  const [interviewState, setInterviewState] = useState("idle");
  const [waveActive,     setWaveActive]     = useState(false);
  const [questionKey,    setQuestionKey]    = useState(0);
  const [countdown,      setCountdown]      = useState(null);
  const [reaskCount,     setReaskCount]     = useState(0);
  const [submitting,     setSubmitting]     = useState(false);

  const recognitionRef  = useRef(null);
  const countdownRef    = useRef(null);
  const silenceTimerRef = useRef(null);
  const currentQuestion = useRef("Welcome! Please introduce yourself.");

  // ── Step 1: Verify token ───────────────────────────────────────
  useEffect(() => {
    if (!guestToken) {
      setAuthError("No access token. Please return to the original platform.");
      setPhase("error");
      return;
    }
    fetch(`${BASE_URL}/guest/verify?token=${encodeURIComponent(guestToken)}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setGuestUser(d); setPhase("mode-select"); }
        else { setAuthError("Session link expired. Please go back and try again."); setPhase("error"); }
      })
      .catch(() => { setAuthError("Cannot connect to server."); setPhase("error"); });
  }, [guestToken]);

  // ── Speech recognition setup ───────────────────────────────────
  if (!recognitionRef.current) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR(); r.lang = "en-US"; r.continuous = false;
      recognitionRef.current = r;
    }
  }

  // ── Start interview session ────────────────────────────────────
  const startInterview = async () => {
    await fetch(`${BASE_URL}/interview/start`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
    setPhase("interview");
    setTimeout(() => beginCountdown(), 800);
  };

  // ── Auto-listen ────────────────────────────────────────────────
  const beginCountdown = useCallback(() => {
    if (interviewState === "ended") return;
    let c = COUNTDOWN_SECONDS;
    setCountdown(c);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      c--;
      if (c > 0) { setCountdown(c); }
      else { clearInterval(countdownRef.current); setCountdown(null); startListening(); }
    }, 1000);
  }, [interviewState]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setInterviewState("running"); setStatus("Listening..."); setWaveActive(true);
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      recognitionRef.current?.stop(); setWaveActive(false);
      if (reaskCount < MAX_REASKS) { setReaskCount(r => r + 1); speak(currentQuestion.current, false); }
      else { setReaskCount(0); askQuestion("[No response]"); }
    }, SILENCE_TIMEOUT);
    try { recognitionRef.current.start(); } catch {}
    recognitionRef.current.onresult = (e) => {
      clearTimeout(silenceTimerRef.current);
      const text = e.results[0][0].transcript;
      setAnswer(text); setStatus("Processing..."); setWaveActive(false); setReaskCount(0);
      askQuestion(text);
    };
    recognitionRef.current.onend  = () => setWaveActive(false);
    recognitionRef.current.onerror = () => { clearTimeout(silenceTimerRef.current); setWaveActive(false); setStatus("Your turn"); };
  }, [reaskCount]);

  const speak = useCallback((text, autoCountdown = true) => {
    speechSynthesis.cancel(); setStatus("Speaking..."); currentQuestion.current = text;
    const trySpeak = () => {
      const voices    = speechSynthesis.getVoices();
      const preferred = ["Microsoft David Desktop","Microsoft Mark","Google UK English Male","Google US English"];
      let chosen = null;
      for (const n of preferred) { chosen = voices.find(v => v.name.includes(n) || v.lang === n); if (chosen) break; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.88; u.pitch = 0.80; u.volume = 1.0;
      if (chosen) u.voice = chosen;
      u.onstart = () => setStatus("Speaking...");
      u.onend   = () => { setStatus("Your turn"); if (autoCountdown && interviewState !== "ended") beginCountdown(); };
      u.onerror = () => setStatus("Your turn");
      speechSynthesis.speak(u);
    };
    speechSynthesis.getVoices().length === 0
      ? speechSynthesis.addEventListener("voiceschanged", trySpeak, { once: true })
      : trySpeak();
  }, [interviewState, beginCountdown]);

  const askQuestion = async (userAnswer) => {
    setLoading(true);
    const endpoint = mode === "tech" ? `${BASE_URL}/interview/tech` : `${BASE_URL}/interview/hr`;
    try {
      const res  = await fetch(`${endpoint}?answer=${encodeURIComponent(userAnswer)}`, { method: "POST" });
      const data = await res.json();
      setQuestion(data.question); currentQuestion.current = data.question;
      setQuestionKey(k => k + 1); speak(data.question, true);
    } catch { setStatus("Your turn"); }
    setLoading(false);
  };

  // ── End session → generate feedback → send back to Project A ───
  const endSession = async () => {
    clearInterval(countdownRef.current); clearTimeout(silenceTimerRef.current);
    speechSynthesis.cancel(); recognitionRef.current?.abort();
    setInterviewState("ended"); setStatus("Generating Report...");
    setWaveActive(false); setCountdown(null);
    setSubmitting(true);

    try {
      // Generate feedback using MockHire's existing feedback endpoint
      // We pass a dummy token since we don't have a real MockHire user
      // Instead we call a guest-specific feedback endpoint
      const feedbackRes = await fetch(`${BASE_URL}/guest/complete`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_token:    guestToken,
          interview_type: mode,
          // Feedback generation happens server-side from agent history
          communication:  0, confidence: 0, technical: 0, grammar: 0, overall: 0,
          summary:        "",
          completed_at:   new Date().toISOString(),
        }),
      });
      const { redirect_url } = await feedbackRes.json();

      // Brief pause so user sees the "done" state before redirect
      setTimeout(() => { window.location.href = redirect_url; }, 2000);
    } catch {
      setStatus("Session Complete");
      setSubmitting(false);
    }
  };

  useEffect(() => () => {
    clearInterval(countdownRef.current); clearTimeout(silenceTimerRef.current);
    speechSynthesis.cancel();
  }, []);

  const statusColor = {
    "Ready":"#64748b","Listening...":"#22d3ee","Processing...":"#f59e0b",
    "Speaking...":"#a78bfa","Your turn":"#4ade80","Generating Report...":"#f59e0b",
    "Session Complete":"#ef4444",
  }[status] || "#64748b";

  const isListening = status === "Listening...";
  const isSpeaking  = status === "Speaking...";

  // ── VERIFYING ─────────────────────────────────────────────────
  if (phase === "verifying") return (
    <div className="iv-page">
      <div className="iv-orb-1"/><div className="iv-orb-2"/><div className="iv-grid"/>
      <div style={{textAlign:"center",color:"#4b5563",fontFamily:"'DM Mono',monospace",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{width:48,height:48,borderRadius:"50%",border:"3px solid rgba(200,241,53,0.15)",borderTopColor:"#c8f135",animation:"spin 0.8s linear infinite"}}/>
        Verifying your access...
      </div>
    </div>
  );

  // ── ERROR ─────────────────────────────────────────────────────
  if (phase === "error") return (
    <div className="iv-page">
      <div className="iv-orb-1"/><div className="iv-orb-2"/><div className="iv-grid"/>
      <div style={{textAlign:"center",maxWidth:420,padding:32,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{fontSize:36}}>⚠️</div>
        <p style={{color:"#fca5a5",fontFamily:"'DM Mono',monospace",fontSize:13,lineHeight:1.7,margin:0}}>{authError}</p>
        <button onClick={() => window.history.back()} style={{padding:"10px 24px",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#94a3b8",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
          ← Go Back
        </button>
      </div>
    </div>
  );

  // ── MODE SELECT ───────────────────────────────────────────────
  if (phase === "mode-select") return (
    <div className="iv-page">
      <div className="iv-orb-1"/><div className="iv-orb-2"/><div className="iv-grid"/>
      <div style={{textAlign:"center",maxWidth:520,width:"100%",animation:"fadeSlideUp 0.5s ease both"}}>
        <div className="iv-header-badge" style={{justifyContent:"center",marginBottom:12}}>
          <div className="iv-badge-dot"/>
          <span>AI Interview · Guest Mode</span>
          <div className="iv-badge-dot"/>
        </div>
        <h1 className="iv-title" style={{marginBottom:8}}>
          Welcome, {guestUser?.name?.split(" ")[0] || "Guest"}
        </h1>
        <p style={{color:"#4b5563",fontFamily:"'DM Mono',monospace",fontSize:13,marginBottom:32,lineHeight:1.7}}>
          Choose your interview type below.<br/>
          Your results will be sent back to your dashboard after completion.
        </p>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
          {[
            { id:"tech", icon:"⚙️", label:"Technical Interview", desc:"Data structures, algorithms, system design, coding concepts" },
            { id:"hr",   icon:"🤝", label:"HR Interview",         desc:"Behavioural, situational, communication, leadership" },
            { id:"dsa",  icon:"🧩", label:"DSA Practice",         desc:"Solve Easy, Medium, Hard coding problems with AI review" },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              style={{
                padding:       "16px 20px",
                borderRadius:  12,
                border:        `2px solid ${mode === opt.id ? "#c8f135" : "rgba(255,255,255,0.08)"}`,
                background:    mode === opt.id ? "rgba(200,241,53,0.08)" : "rgba(255,255,255,0.03)",
                color:         mode === opt.id ? "#c8f135" : "#94a3b8",
                display:       "flex",
                alignItems:    "flex-start",
                gap:           14,
                cursor:        "pointer",
                textAlign:     "left",
                transition:    "all 0.2s",
              }}
            >
              <span style={{fontSize:24,flexShrink:0}}>{opt.icon}</span>
              <div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:4,fontFamily:"'DM Mono',monospace"}}>{opt.label}</div>
                <div style={{fontSize:12,opacity:0.7,fontFamily:"'DM Mono',monospace"}}>{opt.desc}</div>
              </div>
              {mode === opt.id && <span style={{marginLeft:"auto",flexShrink:0}}>✓</span>}
            </button>
          ))}
        </div>

        <button
          onClick={() => mode === "dsa" ? setPhase("dsa") : startInterview()}
          style={{width:"100%",padding:"16px",background:"#c8f135",color:"#05080f",border:"none",borderRadius:12,fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 0 30px rgba(200,241,53,0.2)",transition:"all 0.2s"}}
        >
          Start {mode === "tech" ? "Technical" : mode === "hr" ? "HR" : "DSA"} {mode === "dsa" ? "Practice" : "Interview"} →
        </button>
      </div>
    </div>
  );

  // ── DSA MODE — embed DSA directly ────────────────────────────
  if (phase === "dsa") return (
    <div className="iv-page">
      <div className="iv-orb-1"/><div className="iv-orb-2"/><div className="iv-grid"/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"20px 0",color:"#c8f135",fontFamily:"'DM Mono',monospace",fontSize:13,letterSpacing:2}}>
        DSA PRACTICE · GUEST MODE
        <div style={{marginTop:8,color:"#4b5563",fontSize:11}}>
          Your results will be sent back to your platform when you finish.
        </div>
      </div>
      {/* Reuse existing DSAPractice component logic inline or navigate */}
      <div style={{position:"relative",zIndex:1,textAlign:"center",marginTop:40}}>
        <p style={{color:"#94a3b8",fontFamily:"'DM Mono',monospace",fontSize:14,marginBottom:24}}>
          DSA Practice opens in the same session.
        </p>
        <a
          href={`/dsa-practice?guest=true&token=${encodeURIComponent(guestToken)}`}
          style={{padding:"14px 32px",background:"#c8f135",color:"#05080f",borderRadius:10,fontFamily:"'DM Mono',monospace",fontWeight:700,textDecoration:"none",fontSize:14}}
        >
          Open DSA Practice →
        </a>
        <div style={{marginTop:16}}>
          <button onClick={() => setPhase("mode-select")} style={{background:"transparent",border:"none",color:"#4b5563",fontFamily:"'DM Mono',monospace",fontSize:13,cursor:"pointer"}}>
            ← Choose different type
          </button>
        </div>
      </div>
    </div>
  );

  // ── INTERVIEW ─────────────────────────────────────────────────
  return (
    <div className="iv-page">
      <div className="iv-orb-1"/><div className="iv-orb-2"/><div className="iv-grid"/>

      {/* Minimal header — NO full navbar */}
      <div className="iv-header">
        <div className="iv-header-badge">
          <div className="iv-badge-dot"/>
          <span>Guest · {mode === "tech" ? "Technical" : "HR"} Interview</span>
          <div className="iv-badge-dot"/>
        </div>
        <h1 className="iv-title">Voice Interview Room</h1>
      </div>

      {/* Question */}
      <div key={questionKey} className="iv-question-card">
        <div className="iv-question-line"/>
        <div className="iv-question-inner">
          <div className="iv-bot-avatar">🤖</div>
          <div className="iv-question-body">
            <div className="iv-question-label">Interviewer</div>
            <p className="iv-question-text">{question}</p>
          </div>
        </div>
      </div>

      {/* Answer */}
      {answer && (
        <div className="iv-answer-card">
          <div className="iv-answer-label">Your Last Answer</div>
          <p className="iv-answer-text">{answer}</p>
        </div>
      )}

      {/* Status */}
      <div className="iv-status">
        <div className="iv-status-dot" style={{background:statusColor,boxShadow:`0 0 10px ${statusColor}`,animation:isListening||isSpeaking?"blink 1s ease infinite":"none"}}/>
        <span style={{color:statusColor}}>{status}</span>
      </div>

      {/* Countdown or mic */}
      <div className="iv-mic-wrap">
        {countdown !== null ? (
          <div className="iv-countdown">
            <svg viewBox="0 0 100 100" className="iv-countdown-ring">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="#c8f135" strokeWidth="8"
                strokeDasharray={`${(countdown/COUNTDOWN_SECONDS)*276} 276`} strokeLinecap="round"
                style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%",transition:"stroke-dasharray 0.9s linear"}}
              />
            </svg>
            <div className="iv-countdown-num">{countdown}</div>
          </div>
        ) : (
          <>
            {isListening && <><div className="iv-pulse-ring"/><div className="iv-pulse-ring2"/></>}
            <button
              onClick={startListening}
              disabled={loading || interviewState === "ended"}
              className={`iv-mic-btn ${isListening?"iv-mic-btn--listening":""}`}
              style={{opacity:loading||interviewState==="ended"?0.4:1}}
            >🎙️</button>
          </>
        )}
      </div>

      {/* Wave */}
      <div className="iv-wave">
        {[...Array(9)].map((_,i) => (
          <div key={i} className="iv-wave-bar" style={{
            background: isListening?"#22d3ee":"#1e293b",
            boxShadow:  isListening?"0 0 8px rgba(34,211,238,0.6)":"none",
            animation:  waveActive?`wave ${0.6+i*0.08}s ease-in-out ${i*0.07}s infinite alternate`:"none",
          }}/>
        ))}
      </div>

      {/* End button */}
      <div className="iv-controls">
        <button
          onClick={endSession}
          disabled={interviewState === "ended" || submitting}
          className="iv-ctrl-btn"
          style={{border:"1px solid rgba(239,68,68,0.4)",background:"rgba(239,68,68,0.08)",color:"#ef4444",cursor:interviewState==="ended"||submitting?"not-allowed":"pointer",opacity:submitting?0.6:1}}
        >
          {submitting ? "Generating Report..." : "⬛ End Session"}
        </button>
      </div>

      {interviewState === "ended" && !submitting && (
        <div className="iv-ended-banner">
          <p>✓ REPORT GENERATED — REDIRECTING TO YOUR DASHBOARD...</p>
        </div>
      )}
    </div>
  );
}