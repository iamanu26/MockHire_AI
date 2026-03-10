import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./DSAPractice.css"; // rename your css file to DSAPractice.css OR change this to Dsapractice.css

// ── Constants ─────────────────────────────────────────────────────
const LANGUAGES = [
  { id: "python",     label: "Python",     icon: "🐍" },
  { id: "cpp",        label: "C++",        icon: "⚡" },
  { id: "java",       label: "Java",       icon: "☕" },
  { id: "javascript", label: "JavaScript", icon: "🌐" },
];

const STARTER = {
  python:     `def solution(nums):\n    # Write your solution here\n    pass\n\n# Example usage\nprint(solution([]))`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n    \n};\n\nint main() {\n    Solution sol;\n    // Test your solution\n    return 0;\n}`,
  java:       `import java.util.*;\n\nclass Solution {\n    // Write your solution here\n    \n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        // Test your solution\n    }\n}`,
  javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction solution(nums) {\n    // Write your solution here\n    \n}\n\n// Test\nconsole.log(solution([]));`,
};

const DIFF_COLOR  = { Easy: "#4ade80", Medium: "#f59e0b", Hard: "#ef4444" };
const DIFF_BG     = { Easy: "rgba(74,222,128,0.08)", Medium: "rgba(245,158,11,0.08)", Hard: "rgba(239,68,68,0.08)" };
const KEYS        = ["easy", "medium", "hard"];
const LABELS      = ["Easy", "Medium", "Hard"];

export default function DSAPractice() {
  const navigate = useNavigate();
  const [phase, setPhase]           = useState("loading");
  const [questions, setQuestions]   = useState(null);
  const [current, setCurrent]       = useState(0);
  const [lang, setLang]             = useState("python");
  const [codes, setCodes]           = useState({ 0: STARTER.python, 1: STARTER.python, 2: STARTER.python });
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews]       = useState([null, null, null]);
  const [error, setError]           = useState("");
  const [loadErr, setLoadErr]       = useState("");
  const [activeTab, setActiveTab]   = useState("problem"); // "problem" | "solution" (mobile)
  const textareaRef                 = useRef(null);

  const loadCalledRef = useRef(false);

  // ── Load questions ────────────────────────────────────────────
  const loadQuestions = () => {
    setPhase("loading");
    setLoadErr("");
    setReviews([null, null, null]);
    setCurrent(0);
    setLang("python");
    setCodes({ 0: STARTER.python, 1: STARTER.python, 2: STARTER.python });

    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:8000/dsa/questions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.easy && data.medium && data.hard) {
          setQuestions(data);
          setPhase("practice");
        } else {
          setLoadErr("Questions could not be generated. Please try again.");
        }
      })
      .catch(() => setLoadErr("Cannot connect to server. Is the backend running?"));
  };

  useEffect(() => {
    if (loadCalledRef.current) return;
    loadCalledRef.current = true;
    loadQuestions();
  }, []);

  // ── Code change ───────────────────────────────────────────────
  const setCode = (val) => setCodes(prev => ({ ...prev, [current]: val }));
  const code = codes[current] ?? STARTER[lang];

  // When language changes, reset only if still on starter template
  const handleLangChange = (newLang) => {
    setLang(newLang);
    if (code === STARTER[lang]) {
      setCodes(prev => ({ ...prev, [current]: STARTER[newLang] }));
    }
  };

  // ── Tab key in editor ─────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const updated = code.substring(0, s) + "    " + code.substring(end);
      setCode(updated);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 4; }, 0);
    }
  };

  // ── Submit ────────────────────────────────────────────────────
  const submitSolution = async () => {
    if (!code.trim() || code.trim() === STARTER[lang].trim()) {
      setError("Please write your solution before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    const q = questions[KEYS[current]];

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/dsa/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: `${q.title}\n\n${q.description}`,
          difficulty: LABELS[current],
          language: lang,
          code,
        }),
      });
      const review = await res.json();
      const updated = [...reviews];
      updated[current] = { ...review, code, lang, title: q.title };
      setReviews(updated);

      if (current < 2) {
        setCurrent(c => c + 1);
        setLang("python");
      } else {
        setPhase("results");
      }
    } catch {
      setError("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  const skipQuestion = () => {
    const updated = [...reviews];
    updated[current] = {
      score: 0, correctness: "Skipped",
      feedback: "This question was skipped.",
      hint: "Try to attempt all questions for a full evaluation.",
      time_complexity: "N/A", space_complexity: "N/A",
      is_optimal: false, code: "", lang,
      title: questions[KEYS[current]].title,
    };
    setReviews(updated);
    if (current < 2) { setCurrent(c => c + 1); setLang("python"); }
    else setPhase("results");
  };

  // ── LOADING SCREEN ─────────────────────────────────────────────
  if (phase === "loading") return (
    <div className="dsa-page">
      <div className="dsa-grid" /><div className="dsa-orb-1" /><div className="dsa-orb-2" />
      <div className="dsa-loading">
        <div className="dsa-spinner" />
        <div className="dsa-loading-label">GENERATING PROBLEMS</div>
        <p className="dsa-loading-sub">AI is crafting your Easy · Medium · Hard set...</p>
        {loadErr && (
          <div className="dsa-load-err">
            ⚠ {loadErr}
            <button onClick={loadQuestions} className="dsa-retry-btn">Retry</button>
          </div>
        )}
      </div>
    </div>
  );

  // ── RESULTS SCREEN ─────────────────────────────────────────────
  if (phase === "results") {
    const total = reviews.reduce((s, r) => s + (r?.score ?? 0), 0);
    const grade = total >= 24 ? ["Excellent", "#4ade80"]
                : total >= 18 ? ["Strong",    "#c8f135"]
                : total >= 12 ? ["Average",   "#f59e0b"]
                              : ["Needs Work","#ef4444"];
    return (
      <div className="dsa-page">
        <div className="dsa-grid" /><div className="dsa-orb-1" /><div className="dsa-orb-2" />
        <div className="dsa-results">

          {/* Header */}
          <div className="dsa-res-header">
            <div className="dsa-res-badge"><span className="dsa-res-dot" />DSA Report</div>
            <h1 className="dsa-res-title">Your DSA<br /><span style={{color:"#c8f135"}}>Performance.</span></h1>
            <div className="dsa-res-score" style={{color: grade[1]}}>
              {total}<span className="dsa-res-max">/30</span>
              <span className="dsa-res-grade" style={{borderColor: grade[1]+"50", color: grade[1]}}>{grade[0]}</span>
            </div>
          </div>

          {/* Per-question cards */}
          {reviews.map((r, i) => r && (
            <div className="dsa-res-card" key={i} style={{borderColor: DIFF_COLOR[LABELS[i]]+"30"}}>
              <div className="dsa-res-card-top">
                <span className="dsa-res-diff" style={{color: DIFF_COLOR[LABELS[i]], background: DIFF_BG[LABELS[i]]}}>{LABELS[i]}</span>
                <span className="dsa-res-qtitle">{r.title}</span>
                <span className="dsa-res-qscore" style={{color: r.score >= 7 ? "#4ade80" : r.score >= 4 ? "#f59e0b" : "#ef4444"}}>
                  {r.score}<span style={{fontSize:14,color:"#4b5563"}}>/10</span>
                </span>
              </div>
              <div className="dsa-res-pills">
                <span className="dsa-pill">{r.correctness}</span>
                <span className="dsa-pill">⏱ {r.time_complexity}</span>
                <span className="dsa-pill">💾 {r.space_complexity}</span>
                {r.is_optimal && <span className="dsa-pill dsa-pill-green">✓ Optimal</span>}
                <span className="dsa-pill">{r.lang}</span>
              </div>
              <p className="dsa-res-feedback">{r.feedback}</p>
              {r.hint && r.hint !== "Great solution!" && (
                <div className="dsa-res-hint">💡 {r.hint}</div>
              )}
            </div>
          ))}

          <div className="dsa-res-actions">
            <button className="dsa-btn-primary" onClick={loadQuestions}>Practice Again →</button>
            <button className="dsa-btn-ghost" onClick={() => navigate("/interview")}>← Back to Interview</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PRACTICE SCREEN ────────────────────────────────────────────
  const q = questions[KEYS[current]];
  const lineCount = code.split("\n").length;

  return (
    <div className="dsa-page dsa-page--practice">
      <div className="dsa-grid" /><div className="dsa-orb-1" /><div className="dsa-orb-2" />

      <div className="dsa-workspace">

        {/* ── TOP BAR ── */}
        <div className="dsa-topbar">
          <button className="dsa-back-btn" onClick={() => navigate("/interview")}>← Interview</button>

          {/* Progress pills */}
          <div className="dsa-progress">
            {LABELS.map((label, i) => (
              <div
                key={i}
                className={`dsa-prog-pill ${i === current ? "dsa-prog-pill--active" : ""} ${reviews[i] ? "dsa-prog-pill--done" : ""}`}
                style={{
                  borderColor: i === current ? DIFF_COLOR[label] : reviews[i] ? "#4ade80" : "rgba(255,255,255,0.08)",
                  color: i === current ? DIFF_COLOR[label] : reviews[i] ? "#4ade80" : "#4b5563",
                  background: i === current ? DIFF_BG[label] : reviews[i] ? "rgba(74,222,128,0.08)" : "transparent",
                }}
              >
                {reviews[i] ? "✓" : `${i + 1}.`} {label}
              </div>
            ))}
          </div>

          <div className="dsa-topbar-right">
            <span className="dsa-q-counter">{current + 1} / 3</span>
          </div>
        </div>

        {/* ── MOBILE TAB SWITCHER ── */}
        <div className="dsa-mobile-tabs">
          <button className={`dsa-mob-tab ${activeTab === "problem" ? "dsa-mob-tab--active" : ""}`} onClick={() => setActiveTab("problem")}>Problem</button>
          <button className={`dsa-mob-tab ${activeTab === "solution" ? "dsa-mob-tab--active" : ""}`} onClick={() => setActiveTab("solution")}>Code Editor</button>
        </div>

        {/* ── SPLIT PANEL ── */}
        <div className="dsa-split">

          {/* LEFT — Problem */}
          <div className={`dsa-problem-panel ${activeTab === "solution" ? "dsa-hidden-mobile" : ""}`}>
            <div className="dsa-problem-scroll">
              <div className="dsa-diff-tag" style={{color: DIFF_COLOR[LABELS[current]], background: DIFF_BG[LABELS[current]], borderColor: DIFF_COLOR[LABELS[current]]+"40"}}>
                {LABELS[current]}
              </div>
              <h2 className="dsa-prob-title">{q.title}</h2>
              <div className="dsa-prob-topic">🏷 {q.topic}</div>
              <p className="dsa-prob-desc">{q.description}</p>

              {q.examples?.map((ex, i) => (
                <div className="dsa-example" key={i}>
                  <div className="dsa-ex-label">Example {i + 1}</div>
                  <div className="dsa-ex-row"><span>Input:</span><code>{ex.input}</code></div>
                  <div className="dsa-ex-row"><span>Output:</span><code>{ex.output}</code></div>
                  {ex.explanation && <div className="dsa-ex-row"><span>Note:</span><span className="dsa-ex-note">{ex.explanation}</span></div>}
                </div>
              ))}

              {q.constraints?.length > 0 && (
                <div className="dsa-constraints">
                  <div className="dsa-con-label">Constraints</div>
                  {q.constraints.map((c, i) => (
                    <div key={i} className="dsa-con-row"><span className="dsa-con-dot" />{c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Code Editor */}
          <div className={`dsa-editor-panel ${activeTab === "problem" ? "dsa-hidden-mobile" : ""}`}>

            {/* Lang tabs */}
            <div className="dsa-lang-bar">
              <div className="dsa-lang-tabs">
                {LANGUAGES.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleLangChange(l.id)}
                    className={`dsa-lang-tab ${lang === l.id ? "dsa-lang-tab--on" : ""}`}
                  >
                    {l.icon} {l.label}
                  </button>
                ))}
              </div>
              <div className="dsa-fname">solution.{lang === "cpp" ? "cpp" : lang === "java" ? "java" : lang === "javascript" ? "js" : "py"}</div>
            </div>

            {/* Editor */}
            <div className="dsa-editor-body">
              <div className="dsa-line-nums">
                {Array.from({length: lineCount}, (_, i) => (
                  <div key={i} className="dsa-lnum">{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className="dsa-textarea"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            {/* Error */}
            {error && <div className="dsa-err">{error}</div>}

            {/* Action bar */}
            <div className="dsa-action-bar">
              <button className="dsa-btn-reset" onClick={() => setCode(STARTER[lang])}>↺ Reset</button>
              <button className="dsa-btn-skip"  onClick={skipQuestion}>Skip</button>
              <button className="dsa-btn-submit" onClick={submitSolution} disabled={submitting}>
                {submitting
                  ? <><span className="dsa-submit-spin" />Reviewing...</>
                  : current < 2 ? "Submit & Next →" : "Submit & Finish ✓"
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}