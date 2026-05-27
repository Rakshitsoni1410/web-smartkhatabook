import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [stats, setStats] = useState({
    stock: 0,
    employees: 0,
    orders: 0,
    reviews: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
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

  const cards = [
    {
      title: "Stock Items",
      value: stats.stock,
      icon: "📦",
      color: "#3B82F6",
      bg: "#EFF6FF",
      accent: "#BFDBFE",
    },
    {
      title: "Employees",
      value: stats.employees,
      icon: "👥",
      color: "#8B5CF6",
      bg: "#F5F3FF",
      accent: "#DDD6FE",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: "🚚",
      color: "#10B981",
      bg: "#ECFDF5",
      accent: "#A7F3D0",
    },
    {
      title: "Reviews",
      value: stats.reviews,
      icon: "⭐",
      color: "#F59E0B",
      bg: "#FFFBEB",
      accent: "#FDE68A",
    },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} />

      <div className="dashboard-main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">Dashboard</h2>
            <p className="topbar-sub">
              Welcome back, <span>{user.name || "User"}</span>
            </p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </div>
            <div className="topbar-avatar">
              {(user.name || "U")[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Welcome */}
        <div className="welcome-card">
          <div className="welcome-card-left">
            <div className="welcome-tag">SmartKhata</div>
            <h2>
              {getGreeting()}, {user.name} 👋
            </h2>
            <p className="welcome-shop">{user.shopName}</p>
            <span className="biz-badge">{user.businessType}</span>
          </div>
          <div className="welcome-card-right">
            <div className="welcome-icon-big">🏪</div>
          </div>
        </div>

        {/* Section label */}
        <div className="section-label">
          <span>Overview</span>
          <div className="section-divider" />
        </div>

        {/* Cards */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>Loading your data…</p>
          </div>
        ) : (
          <div className="stats-grid">
            {cards.map((item, index) => (
              <div
                key={index}
                className="stat-card"
                style={{
                  "--card-color": item.color,
                  "--card-bg": item.bg,
                  "--card-accent": item.accent,
                }}
              >
                <div className="stat-top">
                  <div className="stat-icon-wrap">{item.icon}</div>
                  <span className="stat-title">{item.title}</span>
                </div>
                <h1 className="stat-value">{item.value}</h1>
                <div className="stat-footer">
                  <div className="stat-bar">
                    <div className="stat-bar-fill" />
                  </div>
                  <span className="stat-label">Total</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Focus */}
        <div className="focus-card">
          <div className="focus-icon-wrap">🎯</div>
          <div className="focus-content">
            <h3>Today's Focus</h3>
            <p>Monitor stock, orders, employees and business growth.</p>
          </div>
          <div className="focus-arrow">→</div>
        </div>
      </div>
    </div>
  );
}
