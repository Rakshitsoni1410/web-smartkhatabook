import { useState, useRef, useEffect } from "react";
import {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  RULES,
  FALLBACK_RESPONSE,
  QUICK_REPLIES,
  GREETING,
  LANGUAGE_SWITCH_NOTICE,
} from "./chatbotRules";
import "./ChatBot.css";

// ─────────────────────────────────────────────────────────────────────────
// Pure keyword-matching "intent" engine — no AI, no network calls.
// Longer / more specific keyword matches win, so more precise phrases
// beat vaguer ones if both partially match. Matching is scoped to
// whichever language is currently selected (RULES[lang]).
// ─────────────────────────────────────────────────────────────────────────
// Escapes regex special characters in a keyword before building a pattern.
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Builds a Unicode-aware "whole phrase" matcher — the keyword must not be
// glued to another letter/digit on either side. Using \p{L}/\p{N} (not \w)
// so this works correctly for English, Hindi, and Gujarati text alike;
// plain \b breaks on non-Latin scripts since \b is defined in terms of
// the ASCII \w class and doesn't recognise Devanagari/Gujarati letters.
function buildKeywordRegex(keyword) {
  const escaped = escapeRegex(keyword.toLowerCase());
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "u");
}

function matchRule(input, lang) {
  const text = input.toLowerCase().trim();
  const rules = RULES[lang] || RULES[DEFAULT_LANGUAGE];
  let best = null;
  let bestScore = 0;

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (buildKeywordRegex(kw).test(text)) {
        const score = kw.length; // longer phrase = more specific = wins
        if (score > bestScore) {
          bestScore = score;
          best = rule;
        }
      }
    }
  }
  return best ? best.response : FALLBACK_RESPONSE[lang] || FALLBACK_RESPONSE[DEFAULT_LANGUAGE];
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

const LANG_STORAGE_KEY = "skb_chat_lang";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(
    () => localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANGUAGE
  );
  const [messages, setMessages] = useState([
    { sender: "bot", text: GREETING[DEFAULT_LANGUAGE] },
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
      const reply = matchRule(trimmed, lang);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setTyping(false);
    }, 450);
  };

  const switchLang = (code) => {
    if (code === lang) return;
    setLang(code);
    localStorage.setItem(LANG_STORAGE_KEY, code);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: LANGUAGE_SWITCH_NOTICE[code] },
    ]);
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
            <div className="skb-chat-header-left">
              <div className="skb-chat-avatar">📒</div>
              <div>
                <div className="skb-chat-title">SmartKhataBook Assistant</div>
                <div className="skb-chat-subtitle">App help only • rule-based</div>
              </div>
            </div>

            {/* language switcher */}
            <div className="skb-lang-switch">
              {Object.entries(LANGUAGES).map(([code, meta]) => (
                <button
                  key={code}
                  className={`skb-lang-btn ${lang === code ? "skb-lang-btn--active" : ""}`}
                  onClick={() => switchLang(code)}
                  title={meta.name}
                >
                  {meta.label}
                </button>
              ))}
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
                {(QUICK_REPLIES[lang] || QUICK_REPLIES[DEFAULT_LANGUAGE]).map((q) => (
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