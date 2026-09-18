import { useEffect, useMemo, useRef, useState } from "react";

import {
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiGlobe,
  FiMessageCircle,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";

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

// =====================================================
// STORAGE
// =====================================================

const LANG_STORAGE_KEY = "skb_chat_lang";

const THEME_STORAGE_KEY = "smartkhata-theme";

// =====================================================
// UI TRANSLATIONS
// =====================================================

const UI_TEXT = {
  en: {
    assistant: "SmartKhataBook Assistant",

    subtitle: "App help • Rule-based",

    chooseLanguage: "Choose a language",

    placeholder: "Ask about stock, orders, employees...",

    send: "Send message",

    close: "Close chat",

    open: "Open chat",

    clear: "Start new conversation",

    quickTitle: "You can ask:",

    typing: "Assistant is typing",

    inputHint: "Enter to send • Shift + Enter for new line",
  },

  hi: {
    assistant: "SmartKhataBook सहायक",

    subtitle: "ऐप सहायता • नियम आधारित",

    chooseLanguage: "भाषा चुनें",

    placeholder: "स्टॉक, ऑर्डर, कर्मचारी के बारे में पूछें...",

    send: "संदेश भेजें",

    close: "चैट बंद करें",

    open: "चैट खोलें",

    clear: "नई बातचीत शुरू करें",

    quickTitle: "आप पूछ सकते हैं:",

    typing: "सहायक लिख रहा है",

    inputHint: "भेजने के लिए Enter दबाएं",
  },

  gu: {
    assistant: "SmartKhataBook સહાયક",

    subtitle: "એપ મદદ • નિયમ આધારિત",

    chooseLanguage: "ભાષા પસંદ કરો",

    placeholder: "સ્ટોક, ઓર્ડર, કર્મચારી વિશે પૂછો...",

    send: "મેસેજ મોકલો",

    close: "ચેટ બંધ કરો",

    open: "ચેટ ખોલો",

    clear: "નવી વાતચીત શરૂ કરો",

    quickTitle: "તમે પૂછી શકો છો:",

    typing: "સહાયક લખી રહ્યો છે",

    inputHint: "મોકલવા માટે Enter દબાવો",
  },
};

// =====================================================
// HELPERS
// =====================================================

function getStoredLanguage() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);

    if (saved && LANGUAGES[saved]) {
      return saved;
    }
  } catch {
    // Ignore localStorage issues.
  }

  return DEFAULT_LANGUAGE;
}

function getDarkMode() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved === "dark") {
      return true;
    }

    if (saved === "light") {
      return false;
    }

    return Boolean(
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches,
    );
  } catch {
    return false;
  }
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// =====================================================
// REGEX
// =====================================================

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*
  No lookbehind is used here.

  This is friendlier across browsers while still
  respecting Unicode letters/numbers for English,
  Hindi and Gujarati.
*/
function buildKeywordRegex(keyword) {
  const escaped = escapeRegex(normalizeText(keyword));

  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "u");
}

// =====================================================
// RULE MATCHER
// =====================================================

function matchRule(input, lang) {
  const text = normalizeText(input);

  const rules = RULES[lang] || RULES[DEFAULT_LANGUAGE];

  let bestRule = null;

  let bestScore = 0;

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (buildKeywordRegex(normalizedKeyword).test(text)) {
        /*
          More words beat fewer words.
          Then longer phrases win.
        */
        const words = normalizedKeyword.split(" ").filter(Boolean).length;

        const score = words * 1000 + normalizedKeyword.length;

        if (score > bestScore) {
          bestScore = score;

          bestRule = rule;
        }
      }
    }
  }

  return (
    bestRule?.response ||
    FALLBACK_RESPONSE[lang] ||
    FALLBACK_RESPONSE[DEFAULT_LANGUAGE]
  );
}

// =====================================================
// MESSAGE
// =====================================================

let messageId = 0;

function createMessage(sender, text) {
  messageId += 1;

  return {
    id: `skb-message-${Date.now()}-${messageId}`,

    sender,

    text,

    createdAt: Date.now(),
  };
}

// =====================================================
// FORMATTED TEXT
// =====================================================

function FormattedText({ text }) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        const isBold = part.startsWith("**") && part.endsWith("**");

        if (isBold) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

// =====================================================
// CHATBOT
// =====================================================

export default function ChatBot() {
  // =====================================================
  // LANGUAGE
  // =====================================================

  const [lang, setLang] = useState(() => getStoredLanguage());

  const ui = UI_TEXT[lang] || UI_TEXT.en;

  // =====================================================
  // GENERAL STATE
  // =====================================================

  const [open, setOpen] = useState(false);

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);

  const [darkMode, setDarkMode] = useState(() => getDarkMode());

  // =====================================================
  // MESSAGES
  // =====================================================

  const [messages, setMessages] = useState(() => {
    const initialLanguage = getStoredLanguage();

    return [
      createMessage(
        "bot",
        GREETING[initialLanguage] || GREETING[DEFAULT_LANGUAGE],
      ),
    ];
  });

  // =====================================================
  // REFS
  // =====================================================

  const langMenuRef = useRef(null);

  const scrollRef = useRef(null);

  const bottomRef = useRef(null);

  const textareaRef = useRef(null);

  const replyTimerRef = useRef(null);

  // =====================================================
  // DERIVED
  // =====================================================

  const hasUserMessages = useMemo(
    () => messages.some((message) => message.sender === "user"),
    [messages],
  );

  const currentQuickReplies =
    QUICK_REPLIES[lang] || QUICK_REPLIES[DEFAULT_LANGUAGE];

  // =====================================================
  // THEME SYNC
  // =====================================================

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(getDarkMode());
    };

    syncTheme();

    window.addEventListener("storage", syncTheme);

    window.addEventListener("focus", syncTheme);

    /*
      smartkhata-theme changes in the same tab do not
      trigger a storage event, so while the chat is
      open we do a very light sync check.
    */
    let timer = null;

    if (open) {
      timer = window.setInterval(syncTheme, 800);
    }

    return () => {
      window.removeEventListener("storage", syncTheme);

      window.removeEventListener("focus", syncTheme);

      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [open]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    bottomRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",

      block: "end",
    });
  }, [messages, typing, open]);

  // =====================================================
  // FOCUS INPUT WHEN OPENING
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [open]);

  // =====================================================
  // TEXTAREA AUTO HEIGHT
  // =====================================================

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(textarea.scrollHeight, 92)}px`;
  }, [input]);

  // =====================================================
  // LANGUAGE DROPDOWN OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    if (!langMenuOpen) {
      return;
    }

    const handleOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [langMenuOpen]);

  // =====================================================
  // ESC KEY
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (langMenuOpen) {
        setLangMenuOpen(false);

        return;
      }

      setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, langMenuOpen]);

  // =====================================================
  // TIMER CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  // =====================================================
  // SEND
  // =====================================================

  const send = (value) => {
    const trimmed = String(value || "").trim();

    if (!trimmed || typing) {
      return;
    }

    const replyLanguage = lang;

    setMessages((previous) => [...previous, createMessage("user", trimmed)]);

    setInput("");

    setTyping(true);

    replyTimerRef.current = window.setTimeout(() => {
      const reply = matchRule(trimmed, replyLanguage);

      setMessages((previous) => [...previous, createMessage("bot", reply)]);

      setTyping(false);

      replyTimerRef.current = null;
    }, 420);
  };

  // =====================================================
  // LANGUAGE
  // =====================================================

  const switchLang = (code) => {
    setLangMenuOpen(false);

    if (code === lang || !LANGUAGES[code]) {
      return;
    }

    setLang(code);

    try {
      localStorage.setItem(LANG_STORAGE_KEY, code);
    } catch {
      // Ignore storage issues.
    }

    setMessages((previous) => [
      ...previous,

      createMessage(
        "bot",
        LANGUAGE_SWITCH_NOTICE[code] ||
          LANGUAGE_SWITCH_NOTICE[DEFAULT_LANGUAGE],
      ),
    ]);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  const clearConversation = () => {
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);

      replyTimerRef.current = null;
    }

    setTyping(false);

    setInput("");

    setMessages([
      createMessage("bot", GREETING[lang] || GREETING[DEFAULT_LANGUAGE]),
    ]);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // =====================================================
  // KEYBOARD
  // =====================================================

  const handleKeyDown = (event) => {
    /*
      Shift + Enter = new line
      Enter = send
    */

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      send(input);
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatMessageTime = (timestamp) => {
    const localeMap = {
      en: "en-IN",

      hi: "hi-IN",

      gu: "gu-IN",
    };

    try {
      return new Date(timestamp).toLocaleTimeString(
        localeMap[lang] || "en-IN",
        {
          hour: "2-digit",

          minute: "2-digit",
        },
      );
    } catch {
      return "";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* =====================================================
          FLOATING BUTTON
      ===================================================== */}

      <button
        type="button"
        className={`skb-chat-fab ${open ? "skb-chat-fab--open" : ""}`}
        onClick={() => {
          setOpen((previous) => !previous);

          setLangMenuOpen(false);
        }}
        aria-label={open ? ui.close : ui.open}
        aria-expanded={open}
        aria-controls="skb-chat-panel"
        title={open ? ui.close : ui.open}
      >
        {open ? <FiX /> : <FiMessageCircle />}

        {!open && <span className="skb-chat-fab-dot" />}
      </button>

      {/* =====================================================
          CHAT PANEL
      ===================================================== */}

      {open && (
        <section
          id="skb-chat-panel"
          className={`skb-chat-panel ${darkMode ? "skb-chat-panel--dark" : ""}`}
          aria-label={ui.assistant}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="skb-chat-header">
            <div className="skb-chat-header-left">
              <div className="skb-chat-avatar" aria-hidden="true">
                <FiBookOpen />
              </div>

              <div className="skb-chat-header-copy">
                <div className="skb-chat-title">{ui.assistant}</div>

                <div className="skb-chat-subtitle">
                  <span className="skb-chat-online-dot" />

                  {ui.subtitle}
                </div>
              </div>
            </div>

            {/* HEADER ACTIONS */}

            <div className="skb-chat-header-actions">
              {/* LANGUAGE */}

              <div className="skb-lang-wrap" ref={langMenuRef}>
                <button
                  type="button"
                  className="skb-lang-trigger"
                  onClick={() => setLangMenuOpen((previous) => !previous)}
                  aria-haspopup="listbox"
                  aria-expanded={langMenuOpen}
                  aria-label={ui.chooseLanguage}
                >
                  <FiGlobe />

                  <span className="skb-lang-current">
                    {LANGUAGES[lang].label}
                  </span>

                  <FiChevronDown
                    className={`skb-lang-caret ${
                      langMenuOpen ? "skb-lang-caret--up" : ""
                    }`}
                  />
                </button>

                {langMenuOpen && (
                  <div
                    className="skb-lang-dropdown"
                    role="listbox"
                    aria-label={ui.chooseLanguage}
                  >
                    <div className="skb-lang-dropdown-title">
                      {ui.chooseLanguage}
                    </div>

                    {Object.entries(LANGUAGES).map(([code, meta]) => {
                      const selected = lang === code;

                      return (
                        <button
                          type="button"
                          key={code}
                          role="option"
                          aria-selected={selected}
                          className={`skb-lang-option ${
                            selected ? "skb-lang-option--selected" : ""
                          }`}
                          onClick={() => switchLang(code)}
                        >
                          <span className="skb-lang-radio">
                            {selected && (
                              <span className="skb-lang-radio-dot" />
                            )}
                          </span>

                          <span className="skb-lang-option-text">
                            <span className="skb-lang-option-native">
                              {meta.name}
                            </span>

                            <span className="skb-lang-option-code">
                              {meta.label}
                            </span>
                          </span>

                          {selected && <FiCheck className="skb-lang-check" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CLEAR */}

              <button
                type="button"
                className="skb-header-icon-btn"
                onClick={clearConversation}
                aria-label={ui.clear}
                title={ui.clear}
              >
                <FiTrash2 />
              </button>

              {/* CLOSE */}

              <button
                type="button"
                className="skb-header-icon-btn skb-header-close-btn"
                onClick={() => {
                  setOpen(false);

                  setLangMenuOpen(false);
                }}
                aria-label={ui.close}
                title={ui.close}
              >
                <FiX />
              </button>
            </div>
          </header>

          {/* =================================================
              BODY
          ================================================= */}

          <div
            className="skb-chat-body"
            ref={scrollRef}
            aria-live="polite"
            aria-busy={typing}
          >
            {/* WELCOME LABEL */}

            <div className="skb-chat-date-divider">
              <span>SmartKhataBook</span>
            </div>

            {/* MESSAGES */}

            {messages.map((message) => {
              const isUser = message.sender === "user";

              return (
                <div
                  key={message.id}
                  className={`skb-msg-row ${
                    isUser ? "skb-msg-row--user" : "skb-msg-row--bot"
                  }`}
                >
                  {!isUser && (
                    <div className="skb-msg-avatar" aria-hidden="true">
                      <FiBookOpen />
                    </div>
                  )}

                  <div className="skb-msg-stack">
                    <div
                      className={`skb-msg ${
                        isUser ? "skb-msg--user" : "skb-msg--bot"
                      }`}
                    >
                      <div className="skb-msg-content">
                        <FormattedText text={message.text} />
                      </div>
                    </div>

                    <span className="skb-msg-time">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* TYPING */}

            {typing && (
              <div className="skb-msg-row skb-msg-row--bot">
                <div className="skb-msg-avatar" aria-hidden="true">
                  <FiBookOpen />
                </div>

                <div className="skb-msg-stack">
                  <div
                    className="skb-msg skb-msg--bot skb-msg--typing"
                    aria-label={ui.typing}
                  >
                    <span className="skb-dot" />

                    <span className="skb-dot" />

                    <span className="skb-dot" />
                  </div>
                </div>
              </div>
            )}

            {/* QUICK REPLIES */}

            {!hasUserMessages && !typing && (
              <div className="skb-quick-section">
                <span className="skb-quick-title">{ui.quickTitle}</span>

                <div className="skb-quick-replies">
                  {currentQuickReplies.map((question) => (
                    <button
                      type="button"
                      key={question}
                      className="skb-chip"
                      onClick={() => send(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              ref={bottomRef}
              className="skb-chat-bottom-anchor"
              aria-hidden="true"
            />
          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <footer className="skb-chat-input-area">
            <div className="skb-chat-input-row">
              <textarea
                ref={textareaRef}
                rows={1}
                lang={lang}
                maxLength={500}
                placeholder={ui.placeholder}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label={ui.placeholder}
              />

              <button
                type="button"
                className="skb-send-btn"
                onClick={() => send(input)}
                disabled={!input.trim() || typing}
                aria-label={ui.send}
                title={ui.send}
              >
                <FiSend />
              </button>
            </div>

            <div className="skb-chat-input-meta">
              <span>{ui.inputHint}</span>

              <span>
                {input.length}
                /500
              </span>
            </div>
          </footer>
        </section>
      )}
    </>
  );
}
