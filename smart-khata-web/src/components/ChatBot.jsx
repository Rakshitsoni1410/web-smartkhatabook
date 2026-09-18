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
// UI TEXT
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
    faq: "Frequently asked questions",
    related: "Related questions",
    popular: "Popular",
    stock: "Stock",
    orders: "Orders",
    employees: "Employees",
    account: "Account & Reviews",
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
    faq: "अक्सर पूछे जाने वाले सवाल",
    related: "संबंधित सवाल",
    popular: "लोकप्रिय",
    stock: "स्टॉक",
    orders: "ऑर्डर",
    employees: "कर्मचारी",
    account: "खाता और समीक्षा",
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
    faq: "વારંવાર પૂછાતા પ્રશ્નો",
    related: "સંબંધિત પ્રશ્નો",
    popular: "લોકપ્રિય",
    stock: "સ્ટોક",
    orders: "ઓર્ડર",
    employees: "કર્મચારી",
    account: "એકાઉન્ટ અને રિવ્યુ",
    typing: "સહાયક લખી રહ્યો છે",
    inputHint: "મોકલવા માટે Enter દબાવો",
  },
};

// =====================================================
// AMAZON-STYLE FAQ DATA
// =====================================================

const FAQ_GROUPS = {
  en: {
    popular: [
      "How do I add stock?",
      "How do I track an order?",
      "How do I pay an employee?",
      "How do I reset my password?",
    ],

    stock: [
      "How do I add stock?",
      "How do I edit a product?",
      "What does low stock mean?",
      "How do I remove a product?",
    ],

    orders: [
      "How do I track an order?",
      "How do I place an order?",
      "What is a pending order?",
      "How do I buy stock from a supplier?",
    ],

    employees: [
      "How do I add an employee?",
      "How do I pay an employee?",
      "How do I check attendance?",
      "What does Present Today mean?",
    ],

    account: [
      "How do I reply to a review?",
      "What is the ledger?",
      "How do I reset my password?",
      "How do I create an account?",
    ],
  },

  hi: {
    popular: [
      "स्टॉक कैसे जोड़ें?",
      "ऑर्डर कैसे ट्रैक करें?",
      "कर्मचारी को भुगतान कैसे करें?",
      "पासवर्ड कैसे रीसेट करें?",
    ],

    stock: [
      "स्टॉक कैसे जोड़ें?",
      "प्रोडक्ट कैसे एडिट करें?",
      "लो स्टॉक क्या है?",
      "प्रोडक्ट कैसे हटाएं?",
    ],

    orders: [
      "ऑर्डर कैसे ट्रैक करें?",
      "नया ऑर्डर कैसे दें?",
      "पेंडिंग ऑर्डर क्या है?",
      "सप्लायर से ऑर्डर कैसे करें?",
    ],

    employees: [
      "कर्मचारी कैसे जोड़ें?",
      "कर्मचारी को भुगतान कैसे करें?",
      "अटेंडेंस कैसे देखें?",
      "Present Today क्या है?",
    ],

    account: [
      "रिव्यू का जवाब कैसे दें?",
      "लेजर क्या है?",
      "पासवर्ड कैसे रीसेट करें?",
      "नया खाता कैसे बनाएं?",
    ],
  },

  gu: {
    popular: [
      "સ્ટોક કેવી રીતે ઉમેરવો?",
      "ઓર્ડર કેવી રીતે ટ્રેક કરવો?",
      "કર્મચારીને ચુકવણી કેવી રીતે કરવી?",
      "પાસવર્ડ કેવી રીતે રીસેટ કરવો?",
    ],

    stock: [
      "સ્ટોક કેવી રીતે ઉમેરવો?",
      "પ્રોડક્ટ કેવી રીતે એડિટ કરવી?",
      "લો સ્ટોક શું છે?",
      "પ્રોડક્ટ કેવી રીતે ડિલીટ કરવી?",
    ],

    orders: [
      "ઓર્ડર કેવી રીતે ટ્રેક કરવો?",
      "નવો ઓર્ડર કેવી રીતે આપવો?",
      "પેન્ડિંગ ઓર્ડર શું છે?",
      "સપ્લાયર પાસેથી ઓર્ડર કેવી રીતે કરવો?",
    ],

    employees: [
      "કર્મચારી કેવી રીતે ઉમેરવો?",
      "કર્મચારીને ચુકવણી કેવી રીતે કરવી?",
      "હાજરી કેવી રીતે જોવી?",
      "Present Today શું છે?",
    ],

    account: [
      "રિવ્યુનો જવાબ કેવી રીતે આપવો?",
      "લેજર શું છે?",
      "પાસવર્ડ કેવી રીતે રીસેટ કરવો?",
      "નવું એકાઉન્ટ કેવી રીતે બનાવવું?",
    ],
  },
};

// =====================================================
// INTENT -> RELATED FAQ CATEGORY
// =====================================================

function getIntentCategory(intentId) {
  if (!intentId) {
    return "popular";
  }

  if (intentId.includes("stock") || intentId.includes("product")) {
    return "stock";
  }

  if (intentId.includes("order")) {
    return "orders";
  }

  if (
    intentId.includes("employee") ||
    intentId.includes("attendance") ||
    intentId.includes("salary")
  ) {
    return "employees";
  }

  if (
    intentId.includes("review") ||
    intentId.includes("ledger") ||
    intentId.includes("login") ||
    intentId.includes("register") ||
    intentId.includes("password") ||
    intentId.includes("support")
  ) {
    return "account";
  }

  return "popular";
}

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
    // Ignore storage errors.
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

// =====================================================
// TEXT NORMALIZATION
// =====================================================

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  const text = normalizeText(value);

  if (!text) {
    return [];
  }

  return text.split(" ").filter(Boolean);
}

// =====================================================
// SIMPLE ENGLISH SINGULAR SUPPORT
// =====================================================

function normalizeToken(token) {
  if (/^[a-z]+$/i.test(token) && token.length > 3 && token.endsWith("s")) {
    return token.slice(0, -1);
  }

  return token;
}

function tokenMatches(a, b) {
  return a === b || normalizeToken(a) === normalizeToken(b);
}

// =====================================================
// WORD ORDER MATCHING
// =====================================================

function tokensAppearInOrder(keywordTokens, inputTokens) {
  if (!keywordTokens.length || !inputTokens.length) {
    return false;
  }

  let keywordIndex = 0;

  for (const inputToken of inputTokens) {
    const keywordToken = keywordTokens[keywordIndex];

    if (tokenMatches(inputToken, keywordToken)) {
      keywordIndex += 1;

      if (keywordIndex === keywordTokens.length) {
        return true;
      }
    }
  }

  return false;
}

// =====================================================
// KEYWORD SCORE
// =====================================================

function getKeywordScore(inputText, inputTokens, keyword) {
  const keywordText = normalizeText(keyword);

  const keywordTokens = tokenize(keyword);

  if (!keywordText || !keywordTokens.length) {
    return 0;
  }

  // Exact question/phrase.
  if (inputText === keywordText) {
    return 100000 + keywordText.length;
  }

  // Exact phrase inside a longer message.
  if (` ${inputText} `.includes(` ${keywordText} `)) {
    return 70000 + keywordTokens.length * 100 + keywordText.length;
  }

  // Single-word intents.
  if (keywordTokens.length === 1) {
    const found = inputTokens.some((token) =>
      tokenMatches(token, keywordTokens[0]),
    );

    return found ? 20000 + keywordText.length : 0;
  }

  /*
    This solves:

    keyword:
    "pay employee"

    input:
    "How do I pay an employee?"

    It also works with:
    "How can I pay my employee?"
  */
  if (tokensAppearInOrder(keywordTokens, inputTokens)) {
    return 50000 + keywordTokens.length * 100 + keywordText.length;
  }

  return 0;
}

// =====================================================
// RULE MATCHER
// =====================================================

function matchRule(input, lang) {
  const text = normalizeText(input);

  const inputTokens = tokenize(input);

  const rules = RULES[lang] || RULES[DEFAULT_LANGUAGE] || [];

  let bestRule = null;
  let bestScore = 0;

  for (const rule of rules) {
    for (const keyword of rule.keywords || []) {
      const score = getKeywordScore(text, inputTokens, keyword);

      if (score > bestScore) {
        bestScore = score;

        bestRule = rule;
      }
    }
  }

  if (bestRule) {
    return {
      matched: true,

      ruleId: bestRule.id,

      response: bestRule.response,
    };
  }

  return {
    matched: false,

    ruleId: null,

    response: FALLBACK_RESPONSE[lang] || FALLBACK_RESPONSE[DEFAULT_LANGUAGE],
  };
}

// =====================================================
// MESSAGE
// =====================================================

let messageId = 0;

function createMessage(sender, text, extra = {}) {
  messageId += 1;

  return {
    id: `skb-${Date.now()}-${messageId}`,

    sender,

    text,

    createdAt: Date.now(),

    ...extra,
  };
}

// =====================================================
// BOLD FORMATTER
// =====================================================

function FormattedText({ text }) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        const bold = part.startsWith("**") && part.endsWith("**");

        return bold ? (
          <strong key={index}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
}

// =====================================================
// FAQ SEARCH SUGGESTIONS
// =====================================================

function getAllQuestions(lang) {
  const groups = FAQ_GROUPS[lang] || FAQ_GROUPS.en;

  return [...new Set(Object.values(groups).flat())];
}

function getQuestionSuggestions(value, lang) {
  const query = normalizeText(value);

  if (query.length < 2) {
    return [];
  }

  const queryTokens = tokenize(query);

  return getAllQuestions(lang)
    .map((question) => {
      const normalized = normalizeText(question);

      const questionTokens = tokenize(question);

      let score = 0;

      if (normalized.includes(query)) {
        score += 1000;
      }

      for (const queryToken of queryTokens) {
        if (
          questionTokens.some((questionToken) =>
            tokenMatches(queryToken, questionToken),
          )
        ) {
          score += 100;
        }
      }

      return {
        question,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.question);
}

// =====================================================
// CHATBOT
// =====================================================

export default function ChatBot() {
  const [lang, setLang] = useState(() => getStoredLanguage());

  const [open, setOpen] = useState(false);

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);

  const [darkMode, setDarkMode] = useState(() => getDarkMode());

  const [faqCategory, setFaqCategory] = useState("popular");

  const [lastIntentId, setLastIntentId] = useState(null);

  const [messages, setMessages] = useState(() => {
    const initialLang = getStoredLanguage();

    return [
      createMessage("bot", GREETING[initialLang] || GREETING[DEFAULT_LANGUAGE]),
    ];
  });

  const langMenuRef = useRef(null);

  const bottomRef = useRef(null);

  const textareaRef = useRef(null);

  const replyTimerRef = useRef(null);

  const ui = UI_TEXT[lang] || UI_TEXT.en;

  // =====================================================
  // FAQ DATA
  // =====================================================

  const faqGroups = FAQ_GROUPS[lang] || FAQ_GROUPS.en;

  const faqTabs = [
    {
      id: "popular",
      label: ui.popular,
    },

    {
      id: "stock",
      label: ui.stock,
    },

    {
      id: "orders",
      label: ui.orders,
    },

    {
      id: "employees",
      label: ui.employees,
    },

    {
      id: "account",
      label: ui.account,
    },
  ];

  const hasUserMessages = useMemo(
    () => messages.some((message) => message.sender === "user"),
    [messages],
  );

  const relatedCategory = getIntentCategory(lastIntentId);

  const relatedQuestions = faqGroups[relatedCategory] || faqGroups.popular;

  const inputSuggestions = useMemo(
    () => getQuestionSuggestions(input, lang),
    [input, lang],
  );

  // =====================================================
  // THEME
  // =====================================================

  useEffect(() => {
    const syncTheme = () => setDarkMode(getDarkMode());

    syncTheme();

    window.addEventListener("storage", syncTheme);

    window.addEventListener("focus", syncTheme);

    let timer = null;

    if (open) {
      timer = window.setInterval(syncTheme, 800);
    }

    return () => {
      window.removeEventListener("storage", syncTheme);

      window.removeEventListener("focus", syncTheme);

      if (timer) {
        clearInterval(timer);
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

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    bottomRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",

      block: "end",
    });
  }, [messages, typing, open, lastIntentId]);

  // =====================================================
  // FOCUS
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 180);

    return () => clearTimeout(timer);
  }, [open]);

  // =====================================================
  // TEXTAREA HEIGHT
  // =====================================================

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(textarea.scrollHeight, 90)}px`;
  }, [input]);

  // =====================================================
  // OUTSIDE LANGUAGE CLICK
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

    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [langMenuOpen]);

  // =====================================================
  // ESC
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (langMenuOpen) {
        setLangMenuOpen(false);
      } else {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
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

    replyTimerRef.current = setTimeout(() => {
      const result = matchRule(trimmed, replyLanguage);

      setMessages((previous) => [
        ...previous,

        createMessage("bot", result.response, {
          intentId: result.ruleId,
        }),
      ]);

      setLastIntentId(result.ruleId);

      setTyping(false);

      replyTimerRef.current = null;
    }, 400);
  };

  // =====================================================
  // LANGUAGE SWITCH
  // =====================================================

  const switchLang = (code) => {
    setLangMenuOpen(false);

    if (!LANGUAGES[code] || code === lang) {
      return;
    }

    setLang(code);

    setFaqCategory("popular");

    setLastIntentId(null);

    try {
      localStorage.setItem(LANG_STORAGE_KEY, code);
    } catch {
      // Ignore storage error.
    }

    setMessages((previous) => [
      ...previous,

      createMessage(
        "bot",
        LANGUAGE_SWITCH_NOTICE[code] ||
          LANGUAGE_SWITCH_NOTICE[DEFAULT_LANGUAGE],
      ),
    ]);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const clearConversation = () => {
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);

      replyTimerRef.current = null;
    }

    setTyping(false);

    setInput("");

    setLastIntentId(null);

    setFaqCategory("popular");

    setMessages([
      createMessage("bot", GREETING[lang] || GREETING[DEFAULT_LANGUAGE]),
    ]);
  };

  // =====================================================
  // KEYBOARD
  // =====================================================

  const handleKeyDown = (event) => {
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
  // TIME
  // =====================================================

  const formatMessageTime = (timestamp) => {
    const locales = {
      en: "en-IN",
      hi: "hi-IN",
      gu: "gu-IN",
    };

    try {
      return new Date(timestamp).toLocaleTimeString(locales[lang] || "en-IN", {
        hour: "2-digit",

        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* FLOATING BUTTON */}

      <button
        type="button"
        className={`skb-chat-fab ${open ? "skb-chat-fab--open" : ""}`}
        onClick={() => {
          setOpen((previous) => !previous);

          setLangMenuOpen(false);
        }}
        aria-label={open ? ui.close : ui.open}
        aria-expanded={open}
      >
        {open ? <FiX /> : <FiMessageCircle />}

        {!open && <span className="skb-chat-fab-dot" />}
      </button>

      {/* CHAT */}

      {open && (
        <section
          id="skb-chat-panel"
          className={`skb-chat-panel ${darkMode ? "skb-chat-panel--dark" : ""}`}
        >
          {/* HEADER */}

          <header className="skb-chat-header">
            <div className="skb-chat-header-left">
              <div className="skb-chat-avatar">
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

            <div className="skb-chat-header-actions">
              {/* LANGUAGE */}

              <div className="skb-lang-wrap" ref={langMenuRef}>
                <button
                  type="button"
                  className="skb-lang-trigger"
                  onClick={() => setLangMenuOpen((previous) => !previous)}
                >
                  <FiGlobe />

                  <span>{LANGUAGES[lang].label}</span>

                  <FiChevronDown
                    className={`skb-lang-caret ${
                      langMenuOpen ? "skb-lang-caret--up" : ""
                    }`}
                  />
                </button>

                {langMenuOpen && (
                  <div className="skb-lang-dropdown">
                    <div className="skb-lang-dropdown-title">
                      {ui.chooseLanguage}
                    </div>

                    {Object.entries(LANGUAGES).map(([code, meta]) => (
                      <button
                        type="button"
                        key={code}
                        className={`skb-lang-option ${
                          code === lang ? "skb-lang-option--selected" : ""
                        }`}
                        onClick={() => switchLang(code)}
                      >
                        <span className="skb-lang-radio">
                          {code === lang && (
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

                        {code === lang && (
                          <FiCheck className="skb-lang-check" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="skb-header-icon-btn"
                onClick={clearConversation}
                title={ui.clear}
              >
                <FiTrash2 />
              </button>

              <button
                type="button"
                className="skb-header-icon-btn"
                onClick={() => setOpen(false)}
                title={ui.close}
              >
                <FiX />
              </button>
            </div>
          </header>

          {/* BODY */}

          <div className="skb-chat-body">
            <div className="skb-chat-date-divider">
              <span>SmartKhataBook</span>
            </div>

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
                    <div className="skb-msg-avatar">
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
                <div className="skb-msg-avatar">
                  <FiBookOpen />
                </div>

                <div className="skb-msg skb-msg--bot skb-msg--typing">
                  <span className="skb-dot" />
                  <span className="skb-dot" />
                  <span className="skb-dot" />
                </div>
              </div>
            )}

            {/* AMAZON STYLE FAQ */}

            {!hasUserMessages && !typing && (
              <div className="skb-faq-box">
                <div className="skb-faq-heading">{ui.faq}</div>

                <div className="skb-faq-tabs">
                  {faqTabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      className={`skb-faq-tab ${
                        faqCategory === tab.id ? "skb-faq-tab--active" : ""
                      }`}
                      onClick={() => setFaqCategory(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="skb-faq-list">
                  {faqGroups[faqCategory].map((question) => (
                    <button
                      type="button"
                      key={question}
                      className="skb-faq-question"
                      onClick={() => send(question)}
                    >
                      <span>{question}</span>

                      <span className="skb-faq-arrow">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RELATED QUESTIONS */}

            {hasUserMessages && !typing && (
              <div className="skb-related-box">
                <div className="skb-related-title">{ui.related}</div>

                <div className="skb-related-list">
                  {relatedQuestions.slice(0, 4).map((question) => (
                    <button
                      type="button"
                      key={question}
                      onClick={() => send(question)}
                    >
                      {question}

                      <span>›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} className="skb-chat-bottom-anchor" />
          </div>

          {/* INPUT */}

          <footer className="skb-chat-input-area">
            {/* LIVE SEARCH SUGGESTIONS */}

            {inputSuggestions.length > 0 && input.trim() && (
              <div className="skb-input-suggestions">
                {inputSuggestions.map((question) => (
                  <button
                    type="button"
                    key={question}
                    onClick={() => send(question)}
                  >
                    <FiMessageCircle />

                    <span>{question}</span>
                  </button>
                ))}
              </div>
            )}

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
              />

              <button
                type="button"
                className="skb-send-btn"
                disabled={!input.trim() || typing}
                onClick={() => send(input)}
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
