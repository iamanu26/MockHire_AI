import { useState, useRef, useEffect } from "react";
import './Resources.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const SUGGESTED = [
  "How do I answer 'Tell me about yourself'?",
  "What are the most common DSA interview questions?",
  "How to handle behavioural interview questions?",
  "What salary should I negotiate for a software engineer role?",
  "How do I explain a gap in my employment?",
  "What is system design and how do I prepare for it?",
  "Tips for Google / Amazon / Microsoft interviews?",
  "How do I answer 'What is your greatest weakness'?",
];

export default function Resources() {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [started,   setStarted]   = useState(false);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const abortRef    = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setStarted(true);

    const userMsg = { role: "user", content: userText, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build conversation history for context
    const history = [...messages, userMsg].map(m => ({
      role:    m.role,
      content: m.content,
    }));

    const systemPrompt = `You are MockHire AI's interview coach — an expert career advisor specialising in technical interviews, HR interviews, salary negotiation, system design, DSA (data structures and algorithms), behavioural questions, and career growth for software engineers and tech professionals.

Your tone is direct, confident, and practical — like a senior engineer mentor who has seen thousands of interviews. You give actionable, specific advice with real examples. You are not generic. You reference specific companies (Google, Amazon, Meta, Microsoft, etc.) and specific techniques (STAR method, PERT estimation, etc.) when relevant.

Keep responses concise but thorough. Use bullet points for lists. Use bold (**text**) for key terms. Always end with one actionable next step the person can take immediately.`;

    try {
      const response = await fetch(`${BASE_URL}/resources/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history, system: systemPrompt }),
        signal:  abortRef.current?.signal,
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const reply = data.reply || data.message || data.content || "Sorry, I couldn't generate a response.";

      setMessages(prev => [...prev, {
        role:    "assistant",
        content: reply,
        id:      Date.now() + 1,
      }]);
    } catch (err) {
      if (err.name === "AbortError") return;
      // Fallback: use the backend's LLaMA directly
      try {
        const res2 = await fetch(`${BASE_URL}/interview/hr?answer=${encodeURIComponent(
          `[INTERVIEW COACH MODE] User question: ${userText}. Give a direct, helpful answer as an interview coach.`
        )}`, { method: "POST" });
        const d2   = await res2.json();
        setMessages(prev => [...prev, {
          role:    "assistant",
          content: d2.question || "I'm having trouble connecting right now. Please try again.",
          id:      Date.now() + 1,
        }]);
      } catch {
        setMessages(prev => [...prev, {
          role:    "assistant",
          content: "I'm having trouble connecting right now. Please check your connection and try again.",
          id:      Date.now() + 1,
        }]);
      }
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStarted(false);
    setInput("");
  };

  // Format assistant messages — bold, bullets
  const formatMessage = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const formatted = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );

      if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={i}>{formatted.slice(1)}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="rc-ol-item">{formatted}</li>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i}>{formatted}</p>;
    });
  };

  return (
    <div className="rc-page">
      {/* Background */}
      <div className="rc-orb rc-orb-1" />
      <div className="rc-orb rc-orb-2" />
      <div className="rc-grid" />

      {/* ── HERO (shown before first message) ── */}
      {!started && (
        <div className="rc-hero">
          <div className="rc-hero-badge">
            <span className="rc-badge-dot" />
            Interview AI Coach
          </div>
          <h1 className="rc-hero-title">
            Ask Anything About<br />
            <span className="rc-acid">Interviews.</span>
          </h1>
          <p className="rc-hero-sub">
            Get instant, expert advice on technical interviews, HR rounds,
            salary negotiation, system design, and career growth — powered by AI.
          </p>

          {/* Suggested questions */}
          <div className="rc-suggestions">
            {SUGGESTED.map((q, i) => (
              <button
                key={i}
                className="rc-suggestion-btn"
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CHAT AREA ── */}
      {started && (
        <div className="rc-chat-area">
          <div className="rc-chat-header">
            <div className="rc-chat-title">
              <span className="rc-badge-dot" />
              MockHire AI Coach
            </div>
            <button className="rc-clear-btn" onClick={clearChat}>
              New Chat
            </button>
          </div>

          <div className="rc-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rc-msg rc-msg--${msg.role}`}
              >
                {msg.role === "assistant" && (
                  <div className="rc-avatar">🤖</div>
                )}
                <div className="rc-bubble">
                  {msg.role === "assistant"
                    ? <div className="rc-text">{formatMessage(msg.content)}</div>
                    : <div className="rc-text">{msg.content}</div>
                  }
                </div>
                {msg.role === "user" && (
                  <div className="rc-avatar rc-avatar--user">You</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="rc-msg rc-msg--assistant">
                <div className="rc-avatar">🤖</div>
                <div className="rc-bubble rc-bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* ── INPUT BAR ── */}
      <div className={`rc-input-wrap ${started ? "rc-input-wrap--chat" : ""}`}>
        <div className="rc-input-box">
          <textarea
            ref={inputRef}
            className="rc-textarea"
            placeholder="Ask about interview tips, salary, system design, DSA..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            className="rc-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <div className="rc-send-spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <div className="rc-input-hint">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}