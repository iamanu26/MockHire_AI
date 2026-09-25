import { useEffect } from "react";
import { Link } from "react-router-dom";
import './Services.css';

const SERVICES = [
  {
    num: "01",
    icon: "🤝",
    title: "HR Interview Simulation",
    tag: "Behavioural",
    desc: "Practice real-world HR scenarios — from culture-fit questions to situational judgement tests. Our conversational HR AI agents adapt to your tone, probe behavioral depth, and challenge your responses.",
    bullets: ["STAR method coaching", "Situational judgement rounds", "Tone & confidence analysis"],
  },
  {
    num: "02",
    icon: "⚙️",
    title: "Technical Interview Simulation",
    tag: "Engineering",
    desc: "Deep-dive into data structures, algorithms, system design, and language-specific concepts. Questions scale in difficulty dynamically based on your answers and target role.",
    bullets: ["Role & company-specific targeting", "System design & architecture", "Adaptive difficulty engine"],
  },
  {
    num: "03",
    icon: "🎙️",
    title: "Neural Voice & Speech Flow",
    tag: "Hands-Free",
    desc: "Every session is a live spoken dialogue. Hear questions read aloud via HuggingFace Coqui XTTS-v2 neural speech synthesis and respond verbally with sub-second processing.",
    bullets: ["Coqui XTTS-v2 neural voice", "Browser Web Speech transcription", "Full vocal conversational flow"],
  },
  {
    num: "04",
    icon: "📄",
    title: "Resume-Aware Tailoring",
    tag: "Personalized",
    desc: "Upload your PDF resume to have our AI extract your specific skills, projects, and work history. Opening and follow-up questions directly probe your actual background.",
    bullets: ["PyPDF extraction pipeline", "Skill vector distillation", "Project-specific question probes"],
  },
  {
    num: "05",
    icon: "💻",
    title: "DSA Coding Practice Arena",
    tag: "Algorithms",
    desc: "Solve Easy, Medium, and Hard LeetCode-style algorithm problems across Python, C++, Java, and JavaScript with automated AI reviews on correctness, time, and space complexity.",
    bullets: ["Multi-language editor", "Time & space complexity review", "Score out of 10 with hints"],
  },
  {
    num: "06",
    icon: "🛡️",
    title: "Browser Computer Vision Proctoring",
    tag: "Integrity",
    desc: "Client-side computer vision (face-api.js) tracks head orientation, multiple faces, and tab switches without streaming your video to external servers — ensuring authentic exam simulation.",
    bullets: ["Looking-away detection", "Multi-face presence alerts", "Tab-switch integrity logging"],
  },
  {
    num: "07",
    icon: "📊",
    title: "Multi-Metric Performance Scorecard",
    tag: "Insights",
    desc: "Conclude each session with an instant 5-dimension scorecard across Communication, Confidence, Technical Skills, Grammar, and Overall Performance, stored permanently in PostgreSQL.",
    bullets: ["5-dimension rubric", "Qualitative feedback summary", "Persistent historical analytics"],
  },
];

const STATS = [
  { num: "7",    label: "Core Modules"     },
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
          <span className="svc-outline">Seven Ways</span><br />
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