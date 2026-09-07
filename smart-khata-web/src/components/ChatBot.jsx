import { useState, useRef, useEffect } from "react";
import { RULES, FALLBACK_RESPONSE, QUICK_REPLIES } from "./chatbotRules";
import "./ChatBot.css";

// ─────────────────────────────────────────────────────────────────────────
// Pure keyword-matching "intent" engine — no AI, no network calls.
// Longer / more specific keyword matches win, so more precise phrases
// (e.g. "pay employee") beat vaguer ones if both partially match.
// ─────────────────────────────────────────────────────────────────────────
function matchRule(input) {
  const text = input.toLowerCase().trim();
  let best = null;
  let bestScore = 0;

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        const score = kw.length; // longer phrase = more specific = wins
        if (score > bestScore) {
          bestScore = score;
          best = rule;
        }
      }
    }
  }
  return best ? best.response : FALLBACK_RESPONSE;
}

// Renders **bold** markdown-style segments inside bot replies.
function FormattedText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey! 👋 I'm the SmartKhataBook assistant. Ask me about Stock, Orders, Employees, Reviews, or your Account.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    // Small artificial delay so it feels conversational rather than instant/robotic.
    setTimeout(() => {
      const reply = matchRule(trimmed);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setTyping(false);
    }, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") send(input);
  };

  return (
    <>
      {/* ── Floating launcher button ── */}
      <button
        className="skb-chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="skb-chat-panel">
          <div className="skb-chat-header">
            <div className="skb-chat-avatar">📒</div>
            <div>
              <div className="skb-chat-title">SmartKhataBook Assistant</div>
              <div className="skb-chat-subtitle">App help only • rule-based</div>
            </div>
          </div>

          <div className="skb-chat-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`skb-msg ${m.sender === "user" ? "skb-msg--user" : "skb-msg--bot"}`}
              >
                <FormattedText text={m.text} />
              </div>
            ))}

            {typing && (
              <div className="skb-msg skb-msg--bot skb-msg--typing">
                <span className="skb-dot" />
                <span className="skb-dot" />
                <span className="skb-dot" />
              </div>
            )}

            {messages.length === 1 && (
              <div className="skb-quick-replies">
                {QUICK_REPLIES.map((q) => (
                  <button key={q} className="skb-chip" onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="skb-chat-input-row">
            <input
              type="text"
              placeholder="Ask about stock, orders, employees..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={() => send(input)} aria-label="Send message">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}