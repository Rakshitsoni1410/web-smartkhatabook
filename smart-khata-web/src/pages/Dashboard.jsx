import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api";

import { getStoredUser } from "../utils/session";

import Sidebar from "../components/Sidebar";

import "./Dashboard.css";

// =====================================================
// QUOTES
// =====================================================

const QUOTES = {
  morning: [
    "The secret of getting ahead is getting started.",
    "Your business grows when you show up every morning.",
    "Small steps every day build great businesses.",
  ],

  afternoon: [
    "Keep pushing — the best deals happen after noon.",
    "Consistency in the afternoon builds tomorrow's success.",
    "Stay focused, the day is still yours.",
  ],

  evening: [
    "Review today, plan tomorrow, win every day.",
    "Every evening is a chance to reflect and reset.",
    "Great businesses are built one day at a time.",
  ],
};

const getPeriod = (hour) => {
  if (hour < 12) {
    return "morning";
  }

  if (hour < 17) {
    return "afternoon";
  }

  return "evening";
};

const pickQuote = (period) => {
  const pool = QUOTES[period] || QUOTES.morning;

  return pool[Math.floor(Math.random() * pool.length)];
};

const formatCount = (value) => {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
};

// =====================================================
// DASHBOARD
// =====================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const user = getStoredUser() || {};

  // =====================================================
  // STATE
  // =====================================================

  const [stats, setStats] = useState({
    stock: 0,
    employees: 0,
    orders: 0,
    reviews: 0,
  });

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [time, setTime] = useState(() => new Date());

  const initialPeriod = getPeriod(new Date().getHours());

  const [quotePeriod, setQuotePeriod] = useState(initialPeriod);

  const [quote, setQuote] = useState(() => pickQuote(initialPeriod));

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("smartkhata-theme");

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
  });

  useEffect(() => {
    try {
      localStorage.setItem("smartkhata-theme", darkMode ? "dark" : "light");
    } catch {
      // Ignore storage errors.
    }
  }, [darkMode]);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = useCallback(
    async (manual = false) => {
      if (!user?.role || !user?._id) {
        setError("Missing user session. Please log in again.");

        setLoading(false);

        setRefreshing(false);

        return;
      }

      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get(
          `/api/dashboard/${user.role}?userId=${encodeURIComponent(user._id)}`,
        );

        const data = response?.data || {};

        setStats({
          stock: Number(data.stock || 0),

          employees: Number(data.employees || 0),

          orders: Number(data.orders || 0),

          reviews: Number(data.reviews || 0),
        });
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);

        setError(
          err?.response?.data?.message ||
            "Couldn't load your dashboard data. Check your connection and try again.",
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [user?._id, user?.role],
  );

  // =====================================================
  // INITIAL LOAD + CLOCK
  // =====================================================

  useEffect(() => {
    fetchDashboard();

    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchDashboard]);

  // =====================================================
  // UPDATE QUOTE WHEN DAY PERIOD CHANGES
  // =====================================================

  useEffect(() => {
    const currentPeriod = getPeriod(time.getHours());

    if (currentPeriod !== quotePeriod) {
      setQuotePeriod(currentPeriod);

      setQuote(pickQuote(currentPeriod));
    }
  }, [time, quotePeriod]);

  // =====================================================
  // GREETING
  // =====================================================

  const getGreeting = () => {
    const hour = time.getHours();

    if (hour < 12) {
      return {
        text: "Good Morning",

        icon: "ti-sun",
      };
    }

    if (hour < 17) {
      return {
        text: "Good Afternoon",

        icon: "ti-sun-high",
      };
    }

    return {
      text: "Good Evening",

      icon: "ti-moon",
    };
  };

  const greeting = getGreeting();

  // =====================================================
  // INITIALS
  // =====================================================

  const initials =
    String(user?.name || "User")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // =====================================================
  // CARDS
  // =====================================================

  const cards = [
    {
      title: "Stock Items",

      value: stats.stock,

      icon: "ti-package",

      color: "#2563eb",

      rgb: "37, 99, 235",

      description: "Products available in your inventory",

      badge: "Inventory",

      route: "/stock",
    },

    {
      title: "Employees",

      value: stats.employees,

      icon: "ti-users",

      color: "#7c3aed",

      rgb: "124, 58, 237",

      description: "Manage your business team",

      badge: "Team",

      route: "/employees",
    },

    {
      title: "Orders",

      value: stats.orders,

      icon: "ti-truck",

      color: "#059669",

      rgb: "5, 150, 105",

      description: "Orders placed and processed",

      badge: "Orders",

      route: "/orders",
    },

    {
      title: "Reviews",

      value: stats.reviews,

      icon: "ti-star",

      color: "#d97706",

      rgb: "217, 119, 6",

      description: "Customer feedback received",

      badge: "Feedback",

      route: "/reviews",
    },
  ];

  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  const quickActions = [
    {
      label: "Manage Stock",

      description: "Products & inventory",

      icon: "ti-package",

      route: "/stock",
    },

    {
      label: "View Orders",

      description: "Track order activity",

      icon: "ti-truck",

      route: "/orders",
    },

    {
      label: "Employees",

      description: "Manage your team",

      icon: "ti-user-plus",

      route: "/employees",
    },

    {
      label: "Reviews",

      description: "Customer feedback",

      icon: "ti-star",

      route: "/reviews",
    },
  ];

  // =====================================================
  // FOCUS ITEMS
  // =====================================================

  const focusItems = [
    {
      text: "Check low-stock items",

      description: "Keep important products available",

      color: "#2563eb",
    },

    {
      text: "Review pending orders",

      description: "Stay on top of order activity",

      color: "#059669",
    },

    {
      text: "Track employee performance",

      description: "Monitor your business team",

      color: "#7c3aed",
    },

    {
      text: "Respond to new reviews",

      description: "Keep customer communication active",

      color: "#d97706",
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={`dashboard-layout ${darkMode ? "dashboard-dark" : ""}`}>
      <Sidebar role={user?.role || ""} darkMode={darkMode} />

      <main className="dashboard-main">
        {/* =====================================
            TOP BAR
        ====================================== */}

        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <span className="dash-brand">Smart Khatabook</span>

            <div className="dash-title-row">
              <h1>Dashboard</h1>

              <span className="dash-live-badge">
                <span />
                Live
              </span>
            </div>

            <p className="dash-time">
              {time.toLocaleTimeString("en-IN", {
                hour: "2-digit",

                minute: "2-digit",
              })}

              <span>•</span>

              {time.toLocaleDateString("en-IN", {
                weekday: "long",

                day: "numeric",

                month: "long",

                year: "numeric",
              })}
            </p>
          </div>

          <div className="dash-topbar-right">
            {/* THEME */}

            <button
              type="button"
              className="dash-icon-btn"
              onClick={() => setDarkMode((previous) => !previous)}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              <i
                className={`ti ${darkMode ? "ti-sun" : "ti-moon"}`}
                aria-hidden="true"
              />
            </button>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              className="dash-icon-btn dash-notification-btn"
              aria-label="Notifications"
            >
              <span className="dash-notification-dot" />

              <i className="ti ti-bell" aria-hidden="true" />
            </button>

            {/* PROFILE */}

            <button
              type="button"
              className="dash-profile-pill"
              onClick={() => navigate("/profile")}
              title="View profile"
            >
              <div className="dash-avatar">{initials}</div>

              <div className="dash-profile-text">
                <strong>{user?.name || "User"}</strong>

                <span>{user?.role || "User"}</span>
              </div>

              <i
                className="ti ti-chevron-right dash-profile-arrow"
                aria-hidden="true"
              />
            </button>
          </div>
        </header>

        {/* =====================================
            HERO
        ====================================== */}

        <section className="dash-hero">
          <div
            className="dash-hero-decoration dash-hero-circle-one"
            aria-hidden="true"
          />

          <div
            className="dash-hero-decoration dash-hero-circle-two"
            aria-hidden="true"
          />

          <div
            className="dash-hero-decoration dash-hero-circle-three"
            aria-hidden="true"
          />

          <div className="dash-hero-left">
            <div className="dash-greeting">
              <div className="dash-greeting-icon">
                <i className={`ti ${greeting.icon}`} aria-hidden="true" />
              </div>

              <div>
                <span>{greeting.text}</span>

                <h2>{user?.name || "there"}</h2>
              </div>
            </div>

            <div className="dash-hero-chips">
              {user?.shopName && (
                <span className="dash-chip">
                  <i className="ti ti-building-store" />

                  {user.shopName}
                </span>
              )}

              {user?.businessType && (
                <span className="dash-chip">{user.businessType}</span>
              )}

              {user?.role && (
                <span className="dash-chip dash-chip-role">{user.role}</span>
              )}
            </div>

            <blockquote className="dash-quote">
              <span>“</span>

              {quote}
            </blockquote>
          </div>

          <div className="dash-hero-right">
            <div className="dash-date-card">
              <span className="dash-date-label">TODAY</span>

              <strong className="dash-date-day">
                {time.toLocaleDateString("en-IN", {
                  day: "numeric",
                })}
              </strong>

              <span className="dash-date-month">
                {time
                  .toLocaleDateString("en-IN", {
                    month: "short",
                  })
                  .toUpperCase()}
              </span>

              <span className="dash-date-weekday">
                {time.toLocaleDateString("en-IN", {
                  weekday: "long",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* =====================================
            OVERVIEW HEADER
        ====================================== */}

        <section className="dash-section-heading">
          <div>
            <span className="dash-section-kicker">OVERVIEW</span>

            <h2>Business Overview</h2>

            <p>Select any card to explore more details.</p>
          </div>

          <button
            type="button"
            className="dash-refresh-btn"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <i
              className={`ti ti-refresh ${refreshing ? "dash-spin" : ""}`}
              aria-hidden="true"
            />

            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </section>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="dash-error" role="alert">
            <div className="dash-error-icon">
              <i className="ti ti-alert-circle" />
            </div>

            <div className="dash-error-copy">
              <strong>Dashboard couldn't refresh</strong>

              <span>{error}</span>
            </div>

            <button type="button" onClick={() => fetchDashboard(true)}>
              Retry
            </button>
          </div>
        )}

        {/* =====================================
            STATS
        ====================================== */}

        {loading ? (
          <div className="dash-loading">
            <div className="dash-loader" />

            <h3>Loading dashboard</h3>

            <p>Getting your latest business information...</p>
          </div>
        ) : (
          <section className="dash-stats-grid" aria-live="polite">
            {cards.map((item) => (
              <button
                type="button"
                key={item.title}
                className="dash-stat-card"
                style={{
                  "--dash-accent": item.color,

                  "--dash-accent-rgb": item.rgb,
                }}
                onClick={() => navigate(item.route)}
                aria-label={`${item.title}: ${item.value}. ${item.description}`}
              >
                <span className="dash-stat-stripe" />

                <div className="dash-stat-top">
                  <div className="dash-stat-icon">
                    <i className={`ti ${item.icon}`} aria-hidden="true" />
                  </div>

                  <span className="dash-stat-badge">{item.badge}</span>
                </div>

                <strong className="dash-stat-value">
                  {formatCount(item.value)}
                </strong>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <div className="dash-stat-footer">
                  <div className="dash-stat-line">
                    <span />
                  </div>

                  <i className="ti ti-arrow-right" aria-hidden="true" />
                </div>
              </button>
            ))}
          </section>
        )}

        {/* =====================================
            LOWER GRID
        ====================================== */}

        <section className="dash-bottom-grid">
          {/* QUICK ACTIONS */}

          <div className="dash-panel">
            <div className="dash-panel-heading">
              <div className="dash-panel-icon dash-panel-icon-blue">
                <i className="ti ti-bolt" />
              </div>

              <div>
                <span>SHORTCUTS</span>

                <h3>Quick Actions</h3>
              </div>
            </div>

            <div className="dash-quick-grid">
              {quickActions.map((action) => (
                <button
                  type="button"
                  key={action.label}
                  className="dash-quick-btn"
                  onClick={() => navigate(action.route)}
                >
                  <div className="dash-quick-icon">
                    <i className={`ti ${action.icon}`} />
                  </div>

                  <div>
                    <strong>{action.label}</strong>

                    <span>{action.description}</span>
                  </div>

                  <i className="ti ti-chevron-right dash-quick-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* TODAY'S FOCUS */}

          <div className="dash-panel">
            <div className="dash-panel-heading">
              <div className="dash-panel-icon dash-panel-icon-purple">
                <i className="ti ti-target" />
              </div>

              <div>
                <span>PRIORITIES</span>

                <h3>Today's Focus</h3>
              </div>
            </div>

            <div className="dash-focus-list">
              {focusItems.map((item) => (
                <div className="dash-focus-item" key={item.text}>
                  <span
                    className="dash-focus-dot"
                    style={{
                      background: item.color,
                    }}
                  />

                  <div>
                    <strong>{item.text}</strong>

                    <span>{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="dash-footer">
          Smart Khatabook • Business management made simple
        </footer>
      </main>
    </div>
  );
}
