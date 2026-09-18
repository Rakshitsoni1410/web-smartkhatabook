import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCreditCard,
  FiMail,
  FiMapPin,
  FiMoon,
  FiPackage,
  FiPhone,
  FiSun,
  FiUser,
} from "react-icons/fi";

import { FaRupeeSign } from "react-icons/fa";

import { getStoredUser } from "../utils/session";

import "./Profile.css";

// =====================================================
// PROFILE
// =====================================================

export default function Profile() {
  const navigate = useNavigate();

  const user = getStoredUser() || {};

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

      return (
        window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("smartkhata-theme", darkMode ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  // =====================================================
  // SAFE VALUES
  // =====================================================

  const initial = String(user?.name || user?.shopName || "S")
    .trim()
    .charAt(0)
    .toUpperCase();

  const memberSince = useMemo(() => {
    if (!user?.createdAt) {
      return "2024";
    }

    const date = new Date(user.createdAt);

    if (Number.isNaN(date.getTime())) {
      return "2024";
    }

    return String(date.getFullYear());
  }, [user?.createdAt]);

  // If you later add real order stats
  // to the stored user object, these
  // will automatically use them.

  const totalOrders = Number(user?.orderStats?.total || 0);

  const completedOrders = Number(user?.orderStats?.completed || 0);

  const pendingOrders = Number(user?.orderStats?.pending || 0);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={`profile-page ${darkMode ? "profile-dark" : ""}`}>
      {/* =====================================
          TOP BAR
      ====================================== */}

      <div className="profile-topbar">
        <button
          type="button"
          className="profile-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft />
        </button>

        <button
          type="button"
          className="profile-theme-btn"
          onClick={() => setDarkMode((previous) => !previous)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>

      {/* =====================================
          PROFILE HEADER
      ====================================== */}

      <section className="profile-header">
        <div className="profile-header-glow profile-glow-one" />

        <div className="profile-header-glow profile-glow-two" />

        <div className="profile-avatar">{initial}</div>

        <div className="profile-header-info">
          <span className="profile-header-kicker">BUSINESS PROFILE</span>

          <h1>{user?.shopName || user?.name || "Shop"}</h1>

          <div className="profile-header-tags">
            <span className="profile-role-badge">{user?.role || "User"}</span>

            <span className="profile-active-badge">
              <span />
              Active
            </span>
          </div>
        </div>

        <div className="profile-header-right">
          <div className="profile-header-meta">
            <span>Member since</span>

            <strong>{memberSince}</strong>
          </div>

          <div className="profile-header-meta">
            <span>Business Type</span>

            <strong>{user?.businessType || "—"}</strong>
          </div>
        </div>
      </section>

      {/* =====================================
          INFO GRID
      ====================================== */}

      <section className="profile-grid">
        {/* BUSINESS INFO */}

        <article className="profile-card">
          <div className="profile-card-title">
            <div className="profile-card-icon profile-icon-business">
              <FiBriefcase />
            </div>

            <div>
              <span>Business</span>

              <h2>Business Information</h2>
            </div>
          </div>

          <div className="profile-card-content">
            <div className="profile-row">
              <div className="profile-row-label">
                <FiUser />

                <span>Owner</span>
              </div>

              <strong>{user?.name || "—"}</strong>
            </div>

            <div className="profile-row">
              <div className="profile-row-label">
                <FiBriefcase />

                <span>Business Type</span>
              </div>

              <strong>{user?.businessType || "—"}</strong>
            </div>

            <div className="profile-row">
              <div className="profile-row-label">
                <FiUser />

                <span>Role</span>
              </div>

              <span className="profile-role-pill">{user?.role || "—"}</span>
            </div>

            <div className="profile-row profile-address-row">
              <div className="profile-row-label">
                <FiMapPin />

                <span>Address</span>
              </div>

              <strong>{user?.address || "—"}</strong>
            </div>
          </div>
        </article>

        {/* CONTACT INFO */}

        <article className="profile-card">
          <div className="profile-card-title">
            <div className="profile-card-icon profile-icon-contact">
              <FiPhone />
            </div>

            <div>
              <span>Contact</span>

              <h2>Contact Information</h2>
            </div>
          </div>

          <div className="profile-card-content">
            <div className="profile-row">
              <div className="profile-row-label">
                <FiPhone />

                <span>Phone</span>
              </div>

              <strong>{user?.phone || "—"}</strong>
            </div>

            <div className="profile-row profile-email-row">
              <div className="profile-row-label">
                <FiMail />

                <span>Email</span>
              </div>

              <strong>{user?.email || "—"}</strong>
            </div>

            <div className="profile-row">
              <div className="profile-row-label">
                <FiCalendar />

                <span>Status</span>
              </div>

              <span className="profile-status-text">
                <span />
                Active
              </span>
            </div>
          </div>
        </article>

        {/* ORDER STATS */}

        <article className="profile-card">
          <div className="profile-card-title">
            <div className="profile-card-icon profile-icon-orders">
              <FiPackage />
            </div>

            <div>
              <span>Orders</span>

              <h2>Order Statistics</h2>
            </div>
          </div>

          <div className="profile-stats-grid">
            <div className="profile-stat-box profile-stat-total">
              <FiPackage />

              <strong>{totalOrders}</strong>

              <span>Total</span>
            </div>

            <div className="profile-stat-box profile-stat-completed">
              <FiPackage />

              <strong>{completedOrders}</strong>

              <span>Completed</span>
            </div>

            <div className="profile-stat-box profile-stat-pending">
              <FiPackage />

              <strong>{pendingOrders}</strong>

              <span>Pending</span>
            </div>
          </div>
        </article>

        {/* PAYMENT POLICY */}

        <article className="profile-card">
          <div className="profile-card-title">
            <div className="profile-card-icon profile-icon-payment">
              <FiCreditCard />
            </div>

            <div>
              <span>Payments</span>

              <h2>Payment Policy</h2>
            </div>
          </div>

          <div className="profile-card-content">
            <div className="profile-row">
              <div className="profile-row-label">
                <FaRupeeSign />

                <span>Advance Payment</span>
              </div>

              <span className="profile-advance-pill">
                {Number(user?.advancePercentage || 0)}%
              </span>
            </div>

            <div className="profile-row">
              <div className="profile-row-label">
                <FiCalendar />

                <span>Delivery Time</span>
              </div>

              <strong>5 Days</strong>
            </div>

            <div className="profile-policy-note">
              <span className="profile-policy-icon">💡</span>

              <span>
                Advance payment is collected before order processing begins.
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
