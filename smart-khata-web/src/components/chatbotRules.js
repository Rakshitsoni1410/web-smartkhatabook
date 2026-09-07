// ─────────────────────────────────────────────────────────────────────────
// Rule-based knowledge base for the SmartKhataBook chatbot.
// No AI / API calls — pure keyword matching, so the bot can ONLY ever
// answer things you've explicitly written a rule for.
//
// HOW TO ADD A NEW RULE:
//   1. Pick an `id` (unique, for your own reference).
//   2. List `keywords` — any phrase a user might type that should trigger
//      this rule. Keep them lowercase. Longer/more specific phrases score
//      higher, so it's fine to have overlapping keywords across rules.
//   3. Write the `response`. You can use **bold** — the ChatBot component
//      renders basic markdown-style bold automatically.
// ─────────────────────────────────────────────────────────────────────────

export const RULES = [
  // ── Greetings / small talk (kept minimal on purpose) ──────────────────
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "yo", "namaste"],
    response:
      "Hey! 👋 I'm the SmartKhataBook assistant. Ask me about Stock, Orders, Employees, Reviews, or your Account.",
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank you", "thx", "ty"],
    response: "You're welcome! Anything else about SmartKhataBook I can help with?",
  },

  // ── App overview ────────────────────────────────────────────────────────
  {
    id: "what-is-app",
    keywords: ["what is this app", "what is smartkhatabook", "what does this app do", "about this app"],
    response:
      "SmartKhataBook is a business management app for retailers and wholesalers — track stock, manage employees, place/track orders, and view customer reviews, all in one dashboard.",
  },
  {
    id: "dashboard-overview",
    keywords: ["dashboard", "overview", "home screen", "main screen"],
    response:
      "Your Dashboard shows a quick summary: total Stock Items, active Employees, Orders placed, and your average Review rating. Tap any card to jump straight to that section.",
  },

  // ── Stock ───────────────────────────────────────────────────────────────
  {
    id: "add-stock",
    keywords: ["add stock", "add product", "new product", "create product", "how to add item"],
    response:
      "To add a product: go to **Stock** → click **+ Add Product** → enter name, category, selling price, and quantity → Save.",
  },
  {
    id: "edit-delete-stock",
    keywords: ["edit product", "delete product", "remove product", "update stock"],
    response:
      "On the **Stock** page, each product card has an edit (pencil) icon and a delete (trash) icon in the top-right corner. Tap either to update or remove that product.",
  },
  {
    id: "low-stock",
    keywords: ["low stock", "stock alert", "out of stock", "running low"],
    response:
      "Products are automatically flagged **Low Stock** once quantity drops to a low threshold, so you know to restock before you run out.",
  },

  // ── Employees ───────────────────────────────────────────────────────────
  {
    id: "add-employee",
    keywords: ["add employee", "new employee", "hire", "add staff"],
    response:
      "Go to **Employees** → click **+ Add Employee** → fill in name, phone number, and role (e.g. Salesman) → Save.",
  },
  {
    id: "pay-employee",
    keywords: ["pay employee", "pay salary", "salary payment", "pending salary"],
    response:
      "On the **Employees** page, each employee card shows Paid vs Total salary with a progress bar. Tap the orange **Pay** button to record a new payment.",
  },
  {
    id: "employee-attendance",
    keywords: ["attendance", "present today", "employee present", "mark attendance"],
    response:
      "\"Present Today\" on the Employees page shows how many staff have been marked present for the current day.",
  },

  // ── Orders ──────────────────────────────────────────────────────────────
  {
    id: "order-status",
    keywords: ["order status", "track order", "pending order", "completed order", "processing order"],
    response:
      "Orders can be **Pending**, **Processing**, or **Completed**. Check the **Orders** page — each card shows the current status, quantity, and total amount.",
  },
  {
    id: "place-order",
    keywords: ["place order", "new order", "create order", "buy stock", "order from supplier"],
    response:
      "As a retailer, you can browse the supplier marketplace and place a restock order directly from a wholesaler's product listing.",
  },

  // ── Reviews ─────────────────────────────────────────────────────────────
  {
    id: "reviews",
    keywords: ["review", "rating", "customer feedback", "reply to review"],
    response:
      "The **Reviews** page shows your average rating and recent customer reviews. You can tap a review to write a reply directly.",
  },

  // ── Account / auth ──────────────────────────────────────────────────────
  {
    id: "login-help",
    keywords: ["login", "log in", "sign in", "can't login", "cannot login"],
    response:
      "Log in with your registered phone number and password from the **Sign in** screen. If it's not working, try **Forgot password?** below the password field.",
  },
  {
    id: "register-help",
    keywords: ["register", "sign up", "create account", "new account"],
    response:
      "Tap **Create account** on the login screen, then fill in your business details to get started. New users also get a quick app walkthrough.",
  },
  {
    id: "forgot-password",
    keywords: ["forgot password", "reset password", "change password"],
    response:
      "Tap **Forgot password?** on the login screen and follow the steps to reset it via your registered phone number.",
  },

  // ── Human handoff ───────────────────────────────────────────────────────
  {
    id: "human-support",
    keywords: ["talk to human", "real person", "customer support", "contact support", "help desk"],
    response:
      "I'm an automated assistant for app usage questions only. For account-specific issues, please reach out to SmartKhataBook support through the Settings page.",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Shown when NOTHING in RULES matches — this is what keeps the bot
// scoped to "app + web" topics only. Anything outside the keyword list
// (general knowledge, other apps, unrelated chit-chat) falls through here.
// ─────────────────────────────────────────────────────────────────────────
export const FALLBACK_RESPONSE =
  "I can only help with questions about using SmartKhataBook — things like Stock, Orders, Employees, Reviews, or your Account. Try asking one of those!";

// Suggestion chips shown on first open, to nudge users toward in-scope topics.
export const QUICK_REPLIES = [
  "How do I add stock?",
  "How do I pay an employee?",
  "How do I track an order?",
  "How do I reply to a review?",
];