import { useEffect } from "react";
import { Link } from "react-router-dom";
import './Services.css';

const SERVICES = [
  {
    num: "01",
    icon: "🤝",
    title: "HR Interview Simulation",
    tag: "Behavioural",
    desc: "Practice real-world HR scenarios — from culture-fit questions to situational judgement tests. Our LLaMA model adapts to your tone, probes your reasoning, and pushes back like a real recruiter.",
    bullets: ["Behavioural question banks", "Situational judgement rounds", "Tone & confidence analysis"],
  },
  {
    num: "02",
    icon: "⚙️",
    title: "Technical Interview Simulation",
    tag: "Engineering",
    desc: "Deep-dive into data structures, algorithms, system design, and language-specific concepts. Questions scale in difficulty based on your answers — no hand-holding, no shortcuts.",
    bullets: ["DSA & algorithm rounds", "System design questions", "Adaptive difficulty engine"],
  },
  {
    num: "03",
    icon: "🔄",
    title: "Real-Time Q&A Interaction",
    tag: "Live AI",
    desc: "Every session is a live dialogue. Speak your answer, and the AI immediately processes your response and fires back the next question — exactly like a real interview feels under the clock.",
    bullets: ["Sub-second AI response time", "Context-aware follow-ups", "Full voice-to-voice flow"],
  },
  {
    num: "04",
    icon: "🎙️",
    title: "Speaking Practice",
    tag: "Confidence",
    desc: "Master the art of verbal communication under pressure. Our system analyses your pacing, filler word usage, clarity, and articulation — helping you sound as good as you think.",
    bullets: ["Pacing & clarity scoring", "Filler word detection", "Articulation feedback"],
  },
  {
    num: "05",
    icon: "📊",
    title: "Feedback & Performance Analysis",
    tag: "Insights",
    desc: "Every session ends with a full performance report. Technical accuracy, communication quality, confidence metrics, and a ranked list of improvement areas — all generated instantly.",
    bullets: ["Multi-dimensional scoring", "Improvement roadmap", "Session history tracking"],
  },
];

const STATS = [
  { num: "5",    label: "Core Services"    },
  { num: "12K+", label: "Sessions Run"     },
  { num: "98%",  label: "Accuracy Rate"    },
  { num: "Free", label: "Always"           },
];

export default function Services() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="svc-page">
      <div className="svc-scanline" />
      <div className="svc-grid" />
      <div className="svc-orb-1" />
      <div className="svc-orb-2" />

      {/* ── HERO ── */}
      <section className="svc-hero">
        <div className="svc-badge">
          <span className="svc-badge-dot" />
          What We Offer
        </div>
        <h1>
          <span className="svc-outline">Five Ways</span><br />
          <span className="svc-white">We Make You</span><br />
          <span className="svc-acid">Interview-Ready.</span>
        </h1>
        <p className="svc-hero-sub">
          From voice-first HR simulations to adaptive technical rounds —
          every service is engineered to replicate and exceed the pressure of the real thing.
        </p>

        <div className="svc-stats">
          {STATS.map((s, i) => (
            <div className="svc-stat" key={i}>
              <div className="svc-stat-num">{s.num}</div>
              <div className="svc-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="svc-divider" />

      {/* ── SERVICES LIST ── */}
      <section className="svc-list">
        {SERVICES.map((s, i) => (
          <div className="svc-row" key={i}>
            <div className="svc-row-left">
              <div className="svc-row-num">{s.num}</div>
              <div className="svc-row-tag">{s.tag}</div>
            </div>

            <div className="svc-row-center">
              <div className="svc-row-icon">{s.icon}</div>
              <h2 className="svc-row-title">{s.title}</h2>
              <p className="svc-row-desc">{s.desc}</p>
              <ul className="svc-row-bullets">
                {s.bullets.map((b, j) => (
                  <li key={j}><span className="svc-bullet-dot" />{b}</li>
                ))}
              </ul>
            </div>

            <div className="svc-row-right">
              <div className="svc-row-index">{s.num}</div>
            </div>
          </div>
        ))}
      </section>

      <div className="svc-divider" />

      {/* ── CTA ── */}
      <section className="svc-cta">
        <h2>All five services.<br />One platform.<br /><span className="svc-acid">Zero cost.</span></h2>
        <p>No subscriptions, no paywalls — just you and the interview you've been preparing for.</p>
        <Link to="/login" className="svc-cta-btn">Begin Your Session →</Link>
      </section>
    </div>
  );
}