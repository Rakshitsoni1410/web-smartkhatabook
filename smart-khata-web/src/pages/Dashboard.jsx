import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    stock: 0,
    employees: 0,
    orders: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetchDashboard();
    pickQuote();
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `https://backend-of-smartkhata-book.onrender.com/api/dashboard/${user.role}?userId=${user._id}`,
      );
      setStats(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const pickQuote = () => {
    const h = new Date().getHours();
    const pool =
      h < 12 ? QUOTES.morning : h < 17 ? QUOTES.afternoon : QUOTES.evening;
    setQuote(pool[Math.floor(Math.random() * pool.length)]);
  };

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 12) return { text: "Good Morning", emoji: "🌅" };
    if (h < 17) return { text: "Good Afternoon", emoji: "☀️" };
    return { text: "Good Evening", emoji: "🌙" };
  };

  const greeting = getGreeting();

  const cards = [
    {
      title: "Stock Items",
      value: stats.stock,
      icon: "📦",
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
      icon: "👥",
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
      icon: "🚚",
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
      icon: "⭐",
      color: "#D97706",
      bg: "#FFFBEB",
      accent: "#FDE68A",
      desc: "Customer feedback received",
      route: "/reviews",
      trend: "4.8 avg rating",
    },
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
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb-row">
              <span className="topbar-brand">SmartKhata</span>
              <span className="topbar-sep">/</span>
              <span className="topbar-current">Dashboard</span>
            </div>
            <p className="topbar-time">
              {time.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
            <button className="topbar-notify">
              <span className="notify-dot" />
              🔔
            </button>
            <div className="topbar-profile">
              <div className="topbar-avatar">{initials}</div>
              <div className="topbar-profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Greeting */}
        <section className="hero-card">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-orb orb3" />

          <div className="hero-left">
            <div className="hero-greeting-row">
              <span className="hero-emoji">{greeting.emoji}</span>
              <div>
                <p className="hero-greeting-label">{greeting.text}</p>
                <h1 className="hero-name">{user.name}</h1>
              </div>
            </div>
            <div className="hero-chips">
              {user.shopName && (
                <span className="hero-chip chip-shop">🏪 {user.shopName}</span>
              )}
              {user.businessType && (
                <span className="hero-chip chip-biz">{user.businessType}</span>
              )}
              <span className="hero-chip chip-role">{user.role}</span>
            </div>
            <blockquote className="hero-quote">
              <span className="qmark">"</span>
              {quote}
            </blockquote>
          </div>

          <div className="hero-right">
            <div className="hero-store-icon">🏪</div>
            <div className="hero-date-badge">
              <span className="hdb-day">
                {time.toLocaleDateString("en-IN", { day: "numeric" })}
              </span>
              <span className="hdb-month">
                {time.toLocaleDateString("en-IN", { month: "short" })}
              </span>
            </div>
          </div>
        </section>

        {/* Section header */}
        <div className="section-header">
          <div>
            <h2 className="section-title">Business Overview</h2>
            <p className="section-sub">Click any card to explore details</p>
          </div>
          <button className="refresh-btn" onClick={fetchDashboard}>
            ↻ Refresh
          </button>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>Fetching your data…</p>
          </div>
        ) : (
          <div className="stats-grid">
            {cards.map((item, i) => (
              <button
                key={i}
                className="stat-card"
                style={{
                  "--cc": item.color,
                  "--cb": item.bg,
                  "--ca": item.accent,
                }}
                onClick={() => navigate(item.route)}
              >
                <div className="sc-top">
                  <div className="sc-icon">{item.icon}</div>
                  <span className="sc-trend">{item.trend}</span>
                </div>
                <div className="sc-value">{item.value}</div>
                <div className="sc-title">{item.title}</div>
                <div className="sc-desc">{item.desc}</div>
                <div className="sc-footer">
                  <div className="sc-bar">
                    <div className="sc-bar-fill" />
                  </div>
                  <span className="sc-arrow">→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Row */}
        <div className="bottom-row">
          <div className="quick-card">
            <h3 className="quick-title">⚡ Quick Actions</h3>
            <div className="quick-grid">
              {[
                { label: "Add Stock", icon: "📦", route: "/stock" },
                { label: "New Order", icon: "🚚", route: "/orders" },
                { label: "Add Employee", icon: "👤", route: "/employees" },
                { label: "View Reviews", icon: "⭐", route: "/reviews" },
              ].map((a) => (
                <button
                  key={a.label}
                  className="quick-btn"
                  onClick={() => navigate(a.route)}
                >
                  <span className="quick-icon">{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="focus-card">
            <div className="focus-head">
              <span>🎯</span>
              <h3>Today's Focus</h3>
            </div>
            <ul className="focus-list">
              {[
                { text: "Check low-stock items", color: "#2563EB" },
                { text: "Review pending orders", color: "#059669" },
                { text: "Track employee performance", color: "#7C3AED" },
                { text: "Respond to new reviews", color: "#D97706" },
              ].map((f) => (
                <li key={f.text}>
                  <span className="fl-dot" style={{ background: f.color }} />
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

