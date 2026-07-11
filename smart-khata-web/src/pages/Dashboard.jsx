import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

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

const getPeriod = (hour) => (hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening");

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
  const navigate = useNavigate();

  const [stats, setStats] = useState({ stock: 0, employees: 0, orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(getPeriod(new Date().getHours()));
  const [quote, setQuote] = useState(
    QUOTES[getPeriod(new Date().getHours())][
      Math.floor(Math.random() * QUOTES[getPeriod(new Date().getHours())].length)
    ]
  );
  const [time, setTime] = useState(new Date());

  const fetchDashboard = useCallback(
    async (isManualRefresh = false) => {
      if (!user.role || !user._id) {
        setError("Missing user session. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        if (isManualRefresh) setRefreshing(true);
        setError(null);

        const res = await axios.get(
          `https://backend-of-smartkhata-book-vkcv.vercel.app/api/dashboard/${user.role}?userId=${user._id}`
        );
        setStats(res.data);
      } catch (err) {
        console.log(err);
        setError("Couldn't load your dashboard data. Check your connection and try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user.role, user._id]
  );

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [fetchDashboard]);

  // Re-pick a quote whenever the time-of-day period changes (morning -> afternoon -> evening)
  useEffect(() => {
    const currentPeriod = getPeriod(time.getHours());
    if (currentPeriod !== period) {
      setPeriod(currentPeriod);
      const pool = QUOTES[currentPeriod];
      setQuote(pool[Math.floor(Math.random() * pool.length)]);
    }
  }, [time, period]);

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 12) return { text: "Good Morning", icon: "ti-sun" };
    if (h < 17) return { text: "Good Afternoon", icon: "ti-sun-high" };
    return { text: "Good Evening", icon: "ti-moon" };
  };

  const greeting = getGreeting();

  const cards = [
    {
      title: "Stock Items",
      value: stats.stock,
      icon: "ti-package",
      color: "#2563EB",
      bg: "#EFF6FF",
      accent: "#BFDBFE",
      desc: "Total products in inventory",
      route: "/stock",
      trend: "+4 this week",
    },
    {
      title: "Employees",
      value: stats.employees,
      icon: "ti-users",
      color: "#7C3AED",
      bg: "#F5F3FF",
      accent: "#DDD6FE",
      desc: "Active team members",
      route: "/employees",
      trend: "All active",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: "ti-truck",
      color: "#059669",
      bg: "#ECFDF5",
      accent: "#A7F3D0",
      desc: "Orders placed & processed",
      route: "/orders",
      trend: "+12 today",
    },
    {
      title: "Reviews",
      value: stats.reviews,
      icon: "ti-star",
      color: "#D97706",
      bg: "#FFFBEB",
      accent: "#FDE68A",
      desc: "Customer feedback received",
      route: "/reviews",
      trend: "4.8 avg rating",
    },
  ];

  const quickActions = [
    { label: "Add Stock", icon: "ti-package", route: "/stock" },
    { label: "New Order", icon: "ti-truck", route: "/orders" },
    { label: "Add Employee", icon: "ti-user-plus", route: "/employees" },
    { label: "View Reviews", icon: "ti-star", route: "/reviews" },
  ];

  const focusItems = [
    { text: "Check low-stock items", color: "#2563EB" },
    { text: "Review pending orders", color: "#059669" },
    { text: "Track employee performance", color: "#7C3AED" },
    { text: "Respond to new reviews", color: "#D97706" },
  ];

  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} />

      <div className="dashboard-main">
        {/* ── Topbar ── */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="tb-brand">SmartKhatabook</div>
            <div className="tb-page">Dashboard</div>
            <p className="tb-time">
              {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              &nbsp;·&nbsp;
              {time.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="topbar-right">
            <button className="notif-btn" aria-label="Notifications">
              <span className="notif-dot" />
              <i className="ti ti-bell" aria-hidden="true" />
            </button>

            {/* Clickable profile → /profile */}
            <button
              className="profile-pill"
              onClick={() => navigate("/profile")}
              title="View profile"
            >
              <div className="tb-avatar">{initials}</div>
              <div className="profile-text">
                <span className="profile-name">{user.name || "User"}</span>
                <span className="profile-role">{user.role || "—"}</span>
              </div>
              <i className="ti ti-chevron-right profile-chevron" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="hero-card">
          <div className="hero-blobs" aria-hidden="true">
            <div className="blob b1" />
            <div className="blob b2" />
            <div className="blob b3" />
          </div>

          <div className="hero-left">
            <div className="hero-greet-row">
              <i className={`ti ${greeting.icon} hero-greet-icon`} aria-hidden="true" />
              <div>
                <p className="hero-label">{greeting.text}</p>
                <h1 className="hero-name">{user.name || "there"}</h1>
              </div>
            </div>

            <div className="hero-chips">
              {user.shopName && (
                <span className="chip chip-shop">
                  <i className="ti ti-building-store" aria-hidden="true" />
                  {user.shopName}
                </span>
              )}
              {user.businessType && <span className="chip chip-biz">{user.businessType}</span>}
              {user.role && <span className="chip chip-role">{user.role}</span>}
            </div>

            <blockquote className="hero-quote">
              <span className="qmark">"</span>
              {quote}
            </blockquote>
          </div>

          <div className="hero-right">
            <div className="date-badge">
              <span className="date-day">
                {time.toLocaleDateString("en-IN", { day: "numeric" })}
              </span>
              <span className="date-month">
                {time.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
              </span>
              <span className="date-dow">
                {time.toLocaleDateString("en-IN", { weekday: "long" })}
              </span>
            </div>
          </div>
        </section>

        {/* ── Section header ── */}
        <div className="section-hdr">
          <div>
            <h2 className="section-title">Business Overview</h2>
            <p className="section-sub">Click any card to explore details</p>
          </div>
          <button
            className="refresh-btn"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <i
              className={`ti ti-refresh ${refreshing ? "spin" : ""}`}
              aria-hidden="true"
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="error-banner" role="alert">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            <span>{error}</span>
            <button className="error-retry" onClick={() => fetchDashboard(true)}>
              Retry
            </button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>Fetching your data…</p>
          </div>
        ) : (
          <div className="stats-grid" aria-live="polite">
            {cards.map((item, i) => (
              <button
                key={i}
                className="stat-card"
                style={{ "--cc": item.color, "--cb": item.bg, "--ca": item.accent }}
                onClick={() => navigate(item.route)}
                aria-label={`${item.title}: ${item.value}. ${item.desc}`}
              >
                <div className="sc-stripe" />
                <div className="sc-top">
                  <div className="sc-icon-wrap">
                    <i className={`ti ${item.icon} sc-icon`} aria-hidden="true" />
                  </div>
                  <span className="sc-badge">{item.trend}</span>
                </div>
                <div className="sc-value">{item.value}</div>
                <div className="sc-title">{item.title}</div>
                <div className="sc-desc">{item.desc}</div>
                <div className="sc-foot">
                  <div className="sc-bar">
                    <div className="sc-bar-fill" />
                  </div>
                  <i className="ti ti-arrow-right sc-arrow" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Bottom Row ── */}
        <div className="bottom-row">
          <div className="quick-card">
            <h3 className="quick-title">
              <i className="ti ti-bolt" aria-hidden="true" />
              Quick Actions
            </h3>
            <div className="quick-grid">
              {quickActions.map((a) => (
                <button key={a.label} className="quick-btn" onClick={() => navigate(a.route)}>
                  <i className={`ti ${a.icon} quick-icon`} aria-hidden="true" />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="focus-card">
            <h3 className="focus-title">
              <i className="ti ti-target" aria-hidden="true" />
              Today's Focus
            </h3>
            <ul className="focus-list">
              {focusItems.map((f) => (
                <li key={f.text}>
                  <span className="focus-dot" style={{ background: f.color }} />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}