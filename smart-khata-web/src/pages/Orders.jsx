import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api";

import { getStoredUser } from "../utils/session";

import {
  FiArrowLeft,
  FiRefreshCw,
  FiPackage,
  FiShoppingBag,
  FiMoon,
  FiSun,
} from "react-icons/fi";

// =====================================================
// MONEY
// =====================================================

const formatMoney = (value) => {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// ORDERS
// =====================================================

export default function Orders() {
  const navigate = useNavigate();

  const user = getStoredUser();

  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  // =====================================================
  // STATE
  // =====================================================

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");

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
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = useCallback(
    async (showRefresh = false) => {
      if (!user?._id) {
        setError("User information not found. Please log in again.");

        setLoading(false);

        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        }

        setError("");

        const url =
          role === "wholesaler"
            ? `/api/orders/wholesaler/${user._id}`
            : `/api/orders/retailer/${user._id}`;

        const res = await api.get(url);

        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.orders)
            ? res.data.orders
            : [];

        setOrders(list);
      } catch (err) {
        console.error("FETCH ORDERS ERROR:", err);

        setError(err?.response?.data?.message || "Unable to load orders.");
      } finally {
        setLoading(false);

        if (showRefresh) {
          setRefreshing(false);
        }
      }
    },
    [role, user?._id],
  );

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchOrders();

    const timer = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchOrders]);

  // =====================================================
  // STATUS CONFIG
  // =====================================================

  const statusConfig = {
    pending: {
      color: "#ffffff",
      bg: "#f59e0b",
      label: "Pending",
      shadow: "rgba(245,158,11,0.30)",
    },

    approved: {
      color: "#ffffff",
      bg: "#6366f1",
      label: "Approved",
      shadow: "rgba(99,102,241,0.30)",
    },

    advancePending: {
      color: "#ffffff",
      bg: "#f97316",
      label: "Advance Pending",
      shadow: "rgba(249,115,22,0.30)",
    },

    processing: {
      color: "#ffffff",
      bg: "#8b5cf6",
      label: "Processing",
      shadow: "rgba(139,92,246,0.30)",
    },

    onTheWay: {
      color: "#ffffff",
      bg: "#0ea5e9",
      label: "On The Way",
      shadow: "rgba(14,165,233,0.30)",
    },

    delivered: {
      color: "#ffffff",
      bg: "#22c55e",
      label: "Delivered",
      shadow: "rgba(34,197,94,0.30)",
    },

    completed: {
      color: "#ffffff",
      bg: "#10b981",
      label: "Completed",
      shadow: "rgba(16,185,129,0.30)",
    },

    rejected: {
      color: "#ffffff",
      bg: "#ef4444",
      label: "Rejected",
      shadow: "rgba(239,68,68,0.30)",
    },
  };

  const getStatus = (status) =>
    statusConfig[status] || {
      color: "#ffffff",
      bg: "#94a3b8",
      label: status || "Unknown",
      shadow: "rgba(0,0,0,0.10)",
    };

  // =====================================================
  // FILTERED ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }

    return orders.filter((order) => order.orderStatus === activeFilter);
  }, [orders, activeFilter]);

  // =====================================================
  // STATUS COUNT
  // =====================================================

  const getStatusCount = (status) =>
    orders.filter((order) => order.orderStatus === status).length;

  // =====================================================
  // CURRENT FILTER LABEL
  // =====================================================

  const currentFilterLabel =
    activeFilter === "all"
      ? "All Orders"
      : statusConfig[activeFilter]?.label || activeFilter;

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>{pageStyles}</style>

      <div className={`or-page ${darkMode ? "or-dark" : ""}`}>
        {/* =====================================
            TOP BAR
        ====================================== */}

        <div className="or-topbar">
          <div className="or-topbar-left">
            <button
              type="button"
              className="or-back-btn"
              onClick={() => navigate("/dashboard")}
              aria-label="Back to dashboard"
            >
              <FiArrowLeft />
            </button>

            <div className="or-heading-area">
              <div className="or-heading">
                <span className="or-title">Orders</span>

                {orders.length > 0 && (
                  <span className="or-count-badge">{orders.length}</span>
                )}
              </div>

              <div className="or-subtitle">
                Track and manage all your orders
              </div>
            </div>
          </div>

          <div className="or-topbar-actions">
            {/* DARK MODE */}

            <button
              type="button"
              className="or-theme-btn"
              onClick={() => setDarkMode((previous) => !previous)}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            {/* REFRESH */}

            <button
              type="button"
              className="or-refresh-btn"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "or-spin" : ""} />

              <span className="or-refresh-text">
                {refreshing ? "Refreshing" : "Refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* =====================================
            FILTERS
        ====================================== */}

        {orders.length > 0 && (
          <>
            <div className="or-summary">
              {/* ALL */}

              <button
                type="button"
                className={`or-summary-pill ${
                  activeFilter === "all" ? "or-summary-pill-active" : ""
                }`}
                onClick={() => setActiveFilter("all")}
              >
                <span
                  className="or-summary-dot"
                  style={{
                    background: "#64748b",
                  }}
                />

                <span>All Orders</span>

                <span className="or-summary-num">{orders.length}</span>
              </button>

              {/* STATUS */}

              {Object.entries(statusConfig).map(([key, value]) => {
                const count = getStatusCount(key);

                if (count === 0) {
                  return null;
                }

                return (
                  <button
                    type="button"
                    key={key}
                    className={`or-summary-pill ${
                      activeFilter === key ? "or-summary-pill-active" : ""
                    }`}
                    onClick={() => setActiveFilter(key)}
                  >
                    <span
                      className="or-summary-dot"
                      style={{
                        background: value.bg,
                      }}
                    />

                    <span>{value.label}</span>

                    <span className="or-summary-num">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* FILTER INFO */}

            <div className="or-filter-info">
              <span className="or-filter-text">
                Showing <strong>{filteredOrders.length}</strong>{" "}
                {currentFilterLabel.toLowerCase()}
              </span>
            </div>
          </>
        )}

        {/* =====================================
            ERROR
        ====================================== */}

        {!loading && error && (
          <div className="or-state-card or-error-card">
            <div className="or-empty-icon">
              <FiPackage />
            </div>

            <h3>Unable to load orders</h3>

            <p>{error}</p>

            <button
              type="button"
              className="or-retry-btn"
              onClick={() => fetchOrders(true)}
            >
              <FiRefreshCw />
              Try Again
            </button>
          </div>
        )}

        {/* =====================================
            ORDERS GRID
        ====================================== */}

        {!error && (
          <div className="or-grid">
            {/* LOADING */}

            {loading ? (
              <div className="or-empty">
                <div className="or-empty-icon">
                  <FiPackage />
                </div>

                <div className="or-loader" />

                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              /* NO ORDERS */

              <div className="or-empty">
                <div className="or-empty-icon">
                  <FiShoppingBag />
                </div>

                <h3>No Orders Found</h3>

                <p>
                  {role === "retailer"
                    ? "Place an order from the stock page."
                    : "No retailer orders have been received yet."}
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              /* FILTER EMPTY */

              <div className="or-empty">
                <div className="or-empty-icon">
                  <FiPackage />
                </div>

                <h3>No {currentFilterLabel} Found</h3>

                <p>No orders are currently available in this category.</p>
              </div>
            ) : (
              filteredOrders.map((item, index) => {
                const status = getStatus(item.orderStatus);

                return (
                  <article
                    key={item._id}
                    className="or-card"
                    style={{
                      animationDelay: `${Math.min(index, 8) * 0.04}s`,
                    }}
                    onClick={() => navigate(`/order/${item._id}`)}
                  >
                    {/* STATUS STRIP */}

                    <div
                      className="or-card-strip"
                      style={{
                        background: status.bg,
                      }}
                    />

                    <div className="or-card-body">
                      {/* CARD TOP */}

                      <div className="or-card-top">
                        <div
                          className="or-card-icon-wrap"
                          style={{
                            background: `${status.bg}18`,
                          }}
                        >
                          <FiPackage color={status.bg} />
                        </div>

                        <span
                          className="or-badge"
                          style={{
                            background: status.bg,

                            color: status.color,

                            boxShadow: `0 3px 10px ${status.shadow}`,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* PRODUCT */}

                      <div className="or-product-name">
                        {item.productName || "Unnamed Product"}
                      </div>

                      {/* ORDER ID */}

                      <div className="or-order-id">
                        #{item._id?.slice(-6).toUpperCase()}
                      </div>

                      <div className="or-divider" />

                      {/* DETAILS */}

                      <div className="or-stats">
                        <div className="or-stat-block">
                          <span className="or-stat-label">Quantity</span>

                          <span className="or-stat-value">
                            {item.quantity || 0} {item.unit || "units"}
                          </span>
                        </div>

                        <div className="or-stat-block or-stat-right">
                          <span className="or-stat-label">Total</span>

                          <span className="or-stat-total">
                            {formatMoney(item.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const pageStyles = `
  @import url(
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap'
  );

  /* =====================================================
     PAGE
  ===================================================== */

  .or-page,
  .or-page * {
    box-sizing: border-box;
  }

  .or-page {
    --or-bg: #eef2f7;
    --or-card: #ffffff;
    --or-card-soft: #f8fafc;

    --or-text: #0f172a;
    --or-secondary: #475569;
    --or-muted: #94a3b8;

    --or-border: #e8edf4;
    --or-divider: #f1f5f9;

    --or-hover: #f8fafc;

    --or-shadow:
      0 4px 14px
      rgba(
        15,
        23,
        42,
        0.05
      );

    min-width: 0;

    width: 100%;

    min-height: 100vh;
    min-height: 100dvh;

    padding:
      28px
      32px;

    overflow-x: hidden;

    background:
      radial-gradient(
        circle at 8% 0%,
        rgba(
          59,
          130,
          246,
          0.06
        ),
        transparent 30%
      ),
      var(--or-bg);

    color:
      var(--or-text);

    font-family:
      'Outfit',
      sans-serif;

    transition:
      background
        0.25s
        ease,
      color
        0.25s
        ease;
  }

  /* =====================================================
     DARK MODE
  ===================================================== */

  .or-page.or-dark {
    --or-bg: #090f1d;

    --or-card: #111827;

    --or-card-soft: #172033;

    --or-text: #f8fafc;

    --or-secondary: #cbd5e1;

    --or-muted: #94a3b8;

    --or-border: #263244;

    --or-divider: #1e293b;

    --or-hover: #172033;

    --or-shadow:
      0 7px 24px
      rgba(
        0,
        0,
        0,
        0.28
      );
  }

  /* =====================================================
     TOP BAR
  ===================================================== */

  .or-topbar {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 18px;

    margin-bottom: 25px;
  }

  .or-topbar-left {
    min-width: 0;

    display: flex;

    align-items: center;

    gap: 14px;
  }

  .or-heading-area {
    min-width: 0;
  }

  .or-heading {
    min-width: 0;

    display: flex;

    align-items: center;

    gap: 9px;
  }

  .or-title {
    color:
      var(--or-text);

    font-size: 27px;

    font-weight: 800;

    letter-spacing:
      -0.04em;
  }

  .or-count-badge {
    min-width: 25px;

    height: 24px;

    padding:
      0
      8px;

    border-radius: 20px;

    background:
      var(--or-text);

    color:
      var(--or-card);

    display: inline-flex;

    align-items: center;

    justify-content: center;

    font-size: 11px;

    font-weight: 800;
  }

  .or-subtitle {
    margin-top: 3px;

    color:
      var(--or-muted);

    font-size: 12px;

    line-height: 1.4;
  }

  /* =====================================================
     TOP ACTIONS
  ===================================================== */

  .or-topbar-actions {
    flex-shrink: 0;

    display: flex;

    align-items: center;

    gap: 8px;
  }

  .or-back-btn,
  .or-theme-btn {
    width: 42px;
    height: 42px;

    flex:
      0 0
      42px;

    border:
      1px solid
      var(--or-border);

    border-radius: 12px;

    background:
      var(--or-card);

    color:
      var(--or-secondary);

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 17px;

    cursor: pointer;

    box-shadow:
      var(--or-shadow);

    transition:
      transform
        0.18s
        ease,
      color
        0.18s
        ease,
      background
        0.18s
        ease;
  }

  .or-back-btn:hover {
    transform:
      translateX(-2px);

    background:
      var(--or-hover);

    color:
      var(--or-text);
  }

  .or-theme-btn:hover {
    transform:
      translateY(-2px);

    background:
      var(--or-hover);

    color:
      var(--or-text);
  }

  /* =====================================================
     REFRESH
  ===================================================== */

  .or-refresh-btn {
    min-height: 42px;

    padding:
      0
      16px;

    border: none;

    border-radius: 12px;

    background:
      linear-gradient(
        135deg,
        #0ea5e9,
        #2563eb
      );

    color: #ffffff;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    font-family: inherit;

    font-size: 12px;

    font-weight: 700;

    cursor: pointer;

    box-shadow:
      0
      5px
      15px
      rgba(
        37,
        99,
        235,
        0.22
      );

    transition:
      transform
        0.18s
        ease,
      filter
        0.18s
        ease;
  }

  .or-refresh-btn:hover:not(
    :disabled
  ) {
    transform:
      translateY(-2px);

    filter:
      brightness(1.05);
  }

  .or-refresh-btn:disabled {
    opacity: 0.7;

    cursor:
      not-allowed;
  }

  .or-spin {
    animation:
      orSpin
      0.75s linear infinite;
  }

  @keyframes orSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  /* =====================================================
     FILTERS
  ===================================================== */

  .or-summary {
    display: flex;

    align-items: center;

    gap: 8px;

    margin-bottom: 16px;

    flex-wrap: wrap;
  }

  .or-summary-pill {
    min-height: 38px;

    padding:
      7px
      12px;

    border:
      1px solid
      var(--or-border);

    border-radius: 11px;

    background:
      var(--or-card);

    color:
      var(--or-secondary);

    display: flex;

    align-items: center;

    gap: 7px;

    font-family: inherit;

    font-size: 11px;

    font-weight: 700;

    cursor: pointer;

    box-shadow:
      var(--or-shadow);

    transition:
      transform
        0.18s
        ease,
      background
        0.18s
        ease,
      border-color
        0.18s
        ease;
  }

  .or-summary-pill:hover {
    transform:
      translateY(-2px);

    background:
      var(--or-hover);
  }

  .or-summary-pill-active {
    border-color:
      #2563eb;

    background:
      #2563eb;

    color: #ffffff;

    box-shadow:
      0
      5px
      16px
      rgba(
        37,
        99,
        235,
        0.22
      );
  }

  .or-summary-pill-active:hover {
    background:
      #2563eb;
  }

  .or-summary-dot {
    width: 7px;
    height: 7px;

    flex:
      0 0
      7px;

    border-radius: 50%;
  }

  .or-summary-num {
    color:
      var(--or-text);

    font-weight: 800;
  }

  .or-summary-pill-active
  .or-summary-num {
    color: #ffffff;
  }

  /* =====================================================
     FILTER INFO
  ===================================================== */

  .or-filter-info {
    margin-bottom: 15px;
  }

  .or-filter-text {
    color:
      var(--or-muted);

    font-size: 11px;
  }

  .or-filter-text strong {
    color:
      var(--or-text);
  }

  /* =====================================================
     GRID
  ===================================================== */

  .or-grid {
    display: grid;

    grid-template-columns:
      repeat(
        auto-fill,
        minmax(
          min(
            100%,
            280px
          ),
          1fr
        )
      );

    gap: 16px;
  }

  /* =====================================================
     CARD
  ===================================================== */

  .or-card {
    min-width: 0;

    position: relative;

    overflow: hidden;

    border:
      1px solid
      var(--or-border);

    border-radius: 18px;

    background:
      var(--or-card);

    cursor: pointer;

    box-shadow:
      var(--or-shadow);

    transition:
      transform
        0.2s
        ease,
      box-shadow
        0.2s
        ease,
      border-color
        0.2s
        ease;

    animation:
      orFadeUp
      0.25s ease both;
  }

  .or-card:hover {
    transform:
      translateY(-4px);

    border-color:
      rgba(
        99,
        102,
        241,
        0.25
      );

    box-shadow:
      0
      12px
      28px
      rgba(
        15,
        23,
        42,
        0.10
      );
  }

  .or-dark
  .or-card:hover {
    box-shadow:
      0
      14px
      32px
      rgba(
        0,
        0,
        0,
        0.36
      );
  }

  @keyframes orFadeUp {
    from {
      opacity: 0;

      transform:
        translateY(
          10px
        );
    }

    to {
      opacity: 1;

      transform:
        translateY(
          0
        );
    }
  }

  .or-card-strip {
    width: 100%;

    height: 5px;
  }

  .or-card-body {
    padding:
      18px
      19px
      20px;
  }

  /* =====================================================
     CARD TOP
  ===================================================== */

  .or-card-top {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap: 12px;

    margin-bottom: 15px;
  }

  .or-card-icon-wrap {
    width: 43px;
    height: 43px;

    flex:
      0 0
      43px;

    border-radius: 12px;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 18px;
  }

  .or-badge {
    max-width: 160px;

    padding:
      5px
      11px;

    border-radius: 20px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    font-size: 10px;

    font-weight: 800;

    line-height: 1.3;

    text-align: center;

    white-space: normal;
  }

  /* =====================================================
     PRODUCT
  ===================================================== */

  .or-product-name {
    margin-bottom: 4px;

    color:
      var(--or-text);

    font-size: 16px;

    font-weight: 800;

    line-height: 1.4;

    overflow-wrap:
      anywhere;

    word-break:
      break-word;
  }

  .or-order-id {
    color:
      var(--or-muted);

    font-size: 10px;

    font-weight: 600;

    letter-spacing:
      0.06em;
  }

  .or-divider {
    width: 100%;

    height: 1px;

    margin:
      15px
      0;

    background:
      var(--or-divider);
  }

  /* =====================================================
     STATS
  ===================================================== */

  .or-stats {
    min-width: 0;

    display: flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap: 15px;
  }

  .or-stat-block {
    min-width: 0;
  }

  .or-stat-right {
    text-align: right;
  }

  .or-stat-label {
    display: block;

    margin-bottom: 3px;

    color:
      var(--or-muted);

    font-size: 9px;

    font-weight: 700;

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }

  .or-stat-value {
    color:
      var(--or-text);

    font-size: 14px;

    font-weight: 700;

    overflow-wrap:
      anywhere;
  }

  .or-stat-total {
    color: #22c55e;

    font-size: 17px;

    font-weight: 900;

    overflow-wrap:
      anywhere;
  }

  /* =====================================================
     EMPTY / STATE
  ===================================================== */

  .or-empty,
  .or-state-card {
    grid-column:
      1 / -1;

    min-height: 270px;

    padding:
      40px
      20px;

    border:
      1px solid
      var(--or-border);

    border-radius: 18px;

    background:
      var(--or-card);

    color:
      var(--or-muted);

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 8px;

    text-align: center;

    box-shadow:
      var(--or-shadow);
  }

  .or-empty-icon {
    width: 60px;
    height: 60px;

    margin-bottom: 4px;

    border-radius: 17px;

    background:
      var(--or-card-soft);

    color:
      var(--or-muted);

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 25px;
  }

  .or-empty h3,
  .or-state-card h3 {
    margin: 0;

    color:
      var(--or-text);

    font-size: 16px;

    font-weight: 800;
  }

  .or-empty p,
  .or-state-card p {
    max-width: 380px;

    margin: 0;

    color:
      var(--or-muted);

    font-size: 12px;

    line-height: 1.6;
  }

  .or-error-card {
    margin-bottom: 15px;
  }

  .or-retry-btn {
    min-height: 40px;

    margin-top: 7px;

    padding:
      8px
      15px;

    border: none;

    border-radius: 10px;

    background:
      #2563eb;

    color: #ffffff;

    display: flex;

    align-items: center;

    gap: 7px;

    font-family: inherit;

    font-weight: 700;

    cursor: pointer;
  }

  /* =====================================================
     LOADER
  ===================================================== */

  .or-loader {
    width: 27px;
    height: 27px;

    margin:
      4px
      0;

    border:
      3px solid
      var(--or-border);

    border-top-color:
      #2563eb;

    border-radius: 50%;

    animation:
      orSpin
      0.75s linear infinite;
  }

  /* =====================================================
     TABLET
  ===================================================== */

  @media (
    max-width: 1024px
  ) {
    .or-page {
      padding:
        23px
        20px;
    }

    .or-grid {
      grid-template-columns:
        repeat(
          auto-fill,
          minmax(
            min(
              100%,
              250px
            ),
            1fr
          )
        );
    }
  }

  /* =====================================================
     SMALL TABLET
  ===================================================== */

  @media (
    max-width: 768px
  ) {
    .or-page {
      padding:
        19px
        15px;
    }

    .or-topbar {
      margin-bottom: 21px;
    }

    .or-title {
      font-size: 23px;
    }

    .or-refresh-btn {
      width: 42px;

      padding: 0;
    }

    .or-refresh-text {
      display: none;
    }

    .or-grid {
      grid-template-columns:
        repeat(
          auto-fill,
          minmax(
            min(
              100%,
              230px
            ),
            1fr
          )
        );
    }
  }

  /* =====================================================
     MOBILE
  ===================================================== */

  @media (
    max-width: 560px
  ) {
    .or-page {
      padding:
        15px
        12px
        max(
          20px,
          env(
            safe-area-inset-bottom
          )
        );
    }

    /* TOPBAR */

    .or-topbar {
      align-items:
        flex-start;

      gap: 9px;

      margin-bottom: 18px;
    }

    .or-topbar-left {
      min-width: 0;

      flex: 1;

      gap: 9px;
    }

    .or-heading-area {
      min-width: 0;
    }

    .or-back-btn,
    .or-theme-btn {
      width: 39px;
      height: 39px;

      flex-basis: 39px;
    }

    .or-refresh-btn {
      width: 39px;
      height: 39px;

      min-height: 39px;
    }

    .or-title {
      font-size: 20px;
    }

    .or-count-badge {
      min-width: 22px;

      height: 22px;

      font-size: 10px;
    }

    .or-subtitle {
      max-width: 210px;

      font-size: 10px;

      overflow: hidden;

      text-overflow:
        ellipsis;

      white-space: nowrap;
    }

    /* FILTERS */

    .or-summary {
      width:
        calc(
          100% + 12px
        );

      margin-right: -12px;

      padding-right: 12px;

      padding-bottom: 6px;

      flex-wrap: nowrap;

      overflow-x: auto;

      -webkit-overflow-scrolling:
        touch;

      scrollbar-width: none;
    }

    .or-summary::-webkit-scrollbar {
      display: none;
    }

    .or-summary-pill {
      flex-shrink: 0;

      min-height: 36px;

      padding:
        7px
        10px;

      font-size: 10px;
    }

    /* GRID */

    .or-grid {
      grid-template-columns:
        1fr;

      gap: 12px;
    }

    .or-card {
      border-radius: 16px;
    }

    .or-card-body {
      padding:
        16px;
    }

    .or-product-name {
      font-size: 15px;
    }

    .or-stat-total {
      font-size: 16px;
    }

    .or-empty,
    .or-state-card {
      min-height: 240px;

      padding:
        32px
        16px;
    }
  }

  /* =====================================================
     SMALL PHONE
  ===================================================== */

  @media (
    max-width: 400px
  ) {
    .or-page {
      padding:
        12px
        9px
        18px;
    }

    .or-topbar {
      flex-wrap: wrap;
    }

    .or-topbar-left {
      width:
        calc(
          100% - 90px
        );
    }

    .or-title {
      font-size: 18px;
    }

    .or-subtitle {
      max-width: 180px;
    }

    .or-card-top {
      gap: 9px;
    }

    .or-badge {
      max-width: 130px;

      font-size: 9px;
    }

    .or-stats {
      align-items:
        flex-start;
    }
  }

  /* =====================================================
     VERY SMALL PHONE
  ===================================================== */

  @media (
    max-width: 340px
  ) {
    .or-page {
      padding:
        10px
        7px
        16px;
    }

    .or-topbar {
      position: relative;

      padding-bottom: 43px;
    }

    .or-topbar-left {
      width: 100%;
    }

    .or-topbar-actions {
      position: absolute;

      left: 48px;
      right: 0;
      bottom: 0;

      justify-content:
        space-between;
    }

    .or-subtitle {
      max-width: 205px;
    }

    .or-stats {
      flex-direction:
        column;

      align-items:
        stretch;

      gap: 10px;
    }

    .or-stat-right {
      text-align: left;
    }
  }

  /* =====================================================
     SHORT / LANDSCAPE
  ===================================================== */

  @media (
    max-height: 600px
  ) {
    .or-page {
      padding-top: 12px;

      padding-bottom: 14px;
    }

    .or-topbar {
      margin-bottom: 14px;
    }

    .or-card-body {
      padding-top: 14px;

      padding-bottom: 14px;
    }
  }

  /* =====================================================
     TOUCH
  ===================================================== */

  @media (
    hover: none
  ) {
    .or-card:hover,
    .or-summary-pill:hover,
    .or-back-btn:hover,
    .or-theme-btn:hover,
    .or-refresh-btn:hover:not(
      :disabled
    ) {
      transform: none;
    }
  }

  /* =====================================================
     REDUCED MOTION
  ===================================================== */

  @media (
    prefers-reduced-motion:
      reduce
  ) {
    .or-page *,
    .or-page *::before,
    .or-page *::after {
      animation-duration:
        0.01ms !important;

      transition-duration:
        0.01ms !important;
    }
  }
`;
