import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiArrowLeft,
  FiRefreshCw,
  FiPackage,
  FiShoppingBag,
} from "react-icons/fi";

export default function Orders() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const role = user.role?.trim().toLowerCase();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW — selected order category
  const [activeFilter, setActiveFilter] =
    useState("all");

  useEffect(() => {
    fetchOrders();

    const timer = setInterval(fetchOrders, 5000);

    return () => clearInterval(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const url =
        role === "wholesaler"
          ? `https://backend-of-smartkhata-book-vkcv.vercel.app/api/orders/wholesaler/${user._id}`
          : `https://backend-of-smartkhata-book-vkcv.vercel.app/api/orders/retailer/${user._id}`;

      const res = await axios.get(url);

      setOrders(res.data || []);
    } catch (error) {
      console.log("FETCH ORDERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ORDER STATUS CONFIG
  // ==========================================

  const statusConfig = {
    pending: {
      color: "#fff",
      bg: "#f59e0b",
      label: "Pending",
      shadow: "rgba(245,158,11,0.3)",
    },

    approved: {
      color: "#fff",
      bg: "#6366f1",
      label: "Approved",
      shadow: "rgba(99,102,241,0.3)",
    },

    advancePending: {
      color: "#fff",
      bg: "#f97316",
      label: "Advance Pending",
      shadow: "rgba(249,115,22,0.3)",
    },

    processing: {
      color: "#fff",
      bg: "#8b5cf6",
      label: "Processing",
      shadow: "rgba(139,92,246,0.3)",
    },

    onTheWay: {
      color: "#fff",
      bg: "#0ea5e9",
      label: "On The Way",
      shadow: "rgba(14,165,233,0.3)",
    },

    delivered: {
      color: "#fff",
      bg: "#22c55e",
      label: "Delivered",
      shadow: "rgba(34,197,94,0.3)",
    },

    completed: {
      color: "#fff",
      bg: "#10b981",
      label: "Completed",
      shadow: "rgba(16,185,129,0.3)",
    },

    rejected: {
      color: "#fff",
      bg: "#ef4444",
      label: "Rejected",
      shadow: "rgba(239,68,68,0.3)",
    },
  };

  const getStatus = (status) =>
    statusConfig[status] || {
      color: "#fff",
      bg: "#94a3b8",
      label: status || "Unknown",
      shadow: "rgba(0,0,0,0.1)",
    };

  // ==========================================
  // FILTER ORDERS
  // ==========================================

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.orderStatus === activeFilter
        );

  // ==========================================
  // STATUS COUNT
  // ==========================================

  const getStatusCount = (status) => {
    return orders.filter(
      (order) => order.orderStatus === status
    ).length;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .or-page {
          min-height: 100vh;
          background: #eef2f7;
          font-family: 'Outfit', sans-serif;
          padding: 28px 32px;
        }

        /* =====================================
           TOPBAR
        ===================================== */

        .or-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 20px;
        }

        .or-topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .or-back-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: #fff;
          color: #64748b;
          cursor: pointer;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 16px;

          box-shadow:
            0 1px 4px rgba(0, 0, 0, 0.08);

          transition: all 0.15s;
        }

        .or-back-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          transform: translateX(-2px);
        }

        .or-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .or-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .or-count-badge {
          display: inline-flex;
          align-items: center;

          padding: 3px 11px;

          background: #0f172a;
          color: #fff;

          border-radius: 20px;

          font-size: 12px;
          font-weight: 700;
        }

        .or-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 2px;
          font-weight: 400;
        }

        /* =====================================
           REFRESH BUTTON
        ===================================== */

        .or-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 10px 20px;

          border-radius: 12px;
          border: none;

          background: #0ea5e9;
          color: #fff;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          transition: all 0.15s;

          font-family: 'Outfit', sans-serif;

          box-shadow:
            0 4px 12px rgba(14, 165, 233, 0.35);
        }

        .or-refresh-btn:hover {
          background: #0284c7;

          transform: translateY(-1px);

          box-shadow:
            0 6px 16px rgba(14, 165, 233, 0.4);
        }

        /* =====================================
           FILTER / SUMMARY
        ===================================== */

        .or-summary {
          display: flex;
          gap: 10px;

          margin-bottom: 24px;

          flex-wrap: wrap;
        }

        .or-summary-pill {
          display: flex;
          align-items: center;
          gap: 7px;

          padding: 8px 14px;

          background: #fff;

          border-radius: 10px;
          border: 1.5px solid transparent;

          font-size: 12px;
          font-weight: 600;

          color: #64748b;

          cursor: pointer;

          font-family: 'Outfit', sans-serif;

          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06);

          transition: all 0.18s ease;
        }

        .or-summary-pill:hover {
          transform: translateY(-2px);

          border-color: #cbd5e1;

          box-shadow:
            0 5px 14px rgba(0, 0, 0, 0.08);
        }

        .or-summary-pill-active {
          background: #0f172a;

          color: #fff;

          border-color: #0f172a;

          box-shadow:
            0 5px 14px
            rgba(15, 23, 42, 0.2);
        }

        .or-summary-pill-active:hover {
          border-color: #0f172a;
        }

        .or-summary-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          flex-shrink: 0;
        }

        .or-summary-num {
          font-weight: 800;

          color: #0f172a;
        }

        .or-summary-pill-active
        .or-summary-num {
          color: #fff;
        }

        /* =====================================
           CURRENT FILTER INFO
        ===================================== */

        .or-filter-info {
          margin-bottom: 16px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;
        }

        .or-filter-text {
          font-size: 13px;

          color: #64748b;
        }

        .or-filter-text strong {
          color: #0f172a;
        }

        /* =====================================
           GRID
        ===================================== */

        .or-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fill,
              minmax(260px, 1fr)
            );

          gap: 16px;
        }

        /* =====================================
           ORDER CARD
        ===================================== */

        .or-card {
          background: #fff;

          border-radius: 18px;

          padding: 0;

          cursor: pointer;

          transition: all 0.2s;

          position: relative;

          overflow: hidden;

          box-shadow:
            0 2px 8px
            rgba(0, 0, 0, 0.06);

          border:
            1.5px solid #f1f5f9;

          animation:
            fadeUp 0.25s ease both;
        }

        .or-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 12px 28px
            rgba(0, 0, 0, 0.1);

          border-color:
            #e2e8f0;
        }

        .or-card-strip {
          height: 5px;
          width: 100%;
        }

        .or-card-body {
          padding: 18px 20px 20px;
        }

        /* =====================================
           CARD TOP
        ===================================== */

        .or-card-top {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          margin-bottom: 14px;
        }

        .or-card-icon-wrap {
          width: 42px;
          height: 42px;

          border-radius: 12px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 18px;
        }

        /* =====================================
           STATUS BADGE
        ===================================== */

        .or-badge {
          display: inline-flex;

          align-items: center;

          gap: 5px;

          padding: 5px 12px;

          border-radius: 20px;

          font-size: 11px;

          font-weight: 700;

          letter-spacing: 0.2px;
        }

        /* =====================================
           ORDER DETAILS
        ===================================== */

        .or-product-name {
          font-size: 16px;

          font-weight: 700;

          color: #0f172a;

          margin-bottom: 3px;
        }

        .or-order-id {
          font-size: 11px;

          color: #cbd5e1;

          font-weight: 500;

          letter-spacing: 0.5px;
        }

        .or-divider {
          height: 1px;

          background: #f1f5f9;

          margin: 14px 0;
        }

        .or-stats {
          display: flex;

          justify-content:
            space-between;

          align-items: flex-end;

          gap: 15px;
        }

        .or-stat-label {
          display: block;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 0.8px;

          text-transform: uppercase;

          color: #94a3b8;

          margin-bottom: 3px;
        }

        .or-stat-value {
          font-size: 16px;

          font-weight: 700;

          color: #0f172a;
        }

        .or-stat-total {
          font-size: 18px;

          font-weight: 800;

          color: #22c55e;
        }

        /* =====================================
           EMPTY
        ===================================== */

        .or-empty {
          grid-column: 1 / -1;

          text-align: center;

          padding: 70px 20px;

          background: #fff;

          border-radius: 18px;

          box-shadow:
            0 2px 8px
            rgba(0, 0, 0, 0.05);

          border:
            1.5px solid #f1f5f9;
        }

        .or-empty-icon {
          width: 64px;
          height: 64px;

          border-radius: 18px;

          background: #f8fafc;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 26px;

          color: #cbd5e1;

          margin: 0 auto 16px;
        }

        .or-empty h3 {
          font-size: 17px;

          font-weight: 700;

          color: #64748b;

          margin-bottom: 6px;
        }

        .or-empty p {
          font-size: 13px;

          color: #94a3b8;

          font-weight: 400;
        }

        /* =====================================
           ANIMATION
        ===================================== */

        @keyframes fadeUp {
          from {
            opacity: 0;

            transform:
              translateY(12px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }
        }

        /* =====================================
           TABLET
        ===================================== */

        @media (max-width: 768px) {
          .or-page {
            padding: 20px 16px;
          }

          .or-topbar {
            align-items: flex-start;
          }

          .or-title {
            font-size: 23px;
          }

          .or-refresh-btn {
            padding: 10px 14px;
          }

          .or-refresh-btn span {
            display: none;
          }

          .or-summary {
            gap: 8px;
          }

          .or-summary-pill {
            padding: 7px 11px;
          }

          .or-grid {
            grid-template-columns:
              repeat(
                auto-fill,
                minmax(220px, 1fr)
              );
          }
        }

        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 520px) {
          .or-page {
            padding: 18px 12px;
          }

          .or-topbar {
            margin-bottom: 20px;
          }

          .or-topbar-left {
            gap: 11px;
          }

          .or-back-btn {
            width: 38px;
            height: 38px;
          }

          .or-title {
            font-size: 21px;
          }

          .or-subtitle {
            font-size: 11px;
          }

          .or-refresh-btn {
            width: 40px;
            height: 40px;

            padding: 0;

            border-radius: 11px;
          }

          .or-refresh-text {
            display: none;
          }

          .or-summary {
            display: flex;

            flex-wrap: nowrap;

            overflow-x: auto;

            padding-bottom: 7px;

            scrollbar-width: none;
          }

          .or-summary::-webkit-scrollbar {
            display: none;
          }

          .or-summary-pill {
            flex-shrink: 0;
          }

          .or-filter-info {
            margin-bottom: 13px;
          }

          .or-grid {
            grid-template-columns: 1fr;
          }

          .or-card-body {
            padding: 17px;
          }
        }
      `}</style>

      <div className="or-page">

        {/* =====================================
            TOP BAR
        ===================================== */}

        <div className="or-topbar">
          <div className="or-topbar-left">

            <button
              className="or-back-btn"
              onClick={() =>
                navigate("/dashboard")
              }
              aria-label="Back"
            >
              <FiArrowLeft />
            </button>

            <div>
              <div className="or-heading">

                <span className="or-title">
                  Orders
                </span>

                {orders.length > 0 && (
                  <span className="or-count-badge">
                    {orders.length}
                  </span>
                )}

              </div>

              <div className="or-subtitle">
                Track and manage all your orders
              </div>
            </div>
          </div>

          <button
            className="or-refresh-btn"
            onClick={fetchOrders}
          >
            <FiRefreshCw size={14} />

            <span className="or-refresh-text">
              Refresh
            </span>
          </button>
        </div>

        {/* =====================================
            ORDER FILTERS
        ===================================== */}

        {orders.length > 0 && (
          <>
            <div className="or-summary">

              {/* ALL ORDERS */}

              <button
                type="button"
                className={`or-summary-pill ${
                  activeFilter === "all"
                    ? "or-summary-pill-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter("all")
                }
              >
                <span
                  className="or-summary-dot"
                  style={{
                    background: "#0f172a",
                  }}
                />

                All Orders

                <span className="or-summary-num">
                  {orders.length}
                </span>
              </button>

              {/* STATUS CATEGORIES */}

              {Object.entries(
                statusConfig
              ).map(([key, value]) => {
                const count =
                  getStatusCount(key);

                // Don't show empty categories
                if (count === 0) {
                  return null;
                }

                return (
                  <button
                    type="button"
                    key={key}
                    className={`or-summary-pill ${
                      activeFilter === key
                        ? "or-summary-pill-active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveFilter(key)
                    }
                  >
                    <span
                      className="or-summary-dot"
                      style={{
                        background:
                          value.bg,
                      }}
                    />

                    {value.label}

                    <span className="or-summary-num">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SELECTED CATEGORY */}

            <div className="or-filter-info">
              <span className="or-filter-text">
                Showing{" "}
                <strong>
                  {filteredOrders.length}
                </strong>{" "}
                {activeFilter === "all"
                  ? "orders"
                  : `${
                      statusConfig[
                        activeFilter
                      ]?.label ||
                      activeFilter
                    } orders`}
              </span>
            </div>
          </>
        )}

        {/* =====================================
            ORDERS GRID
        ===================================== */}

        <div className="or-grid">

          {/* LOADING */}

          {loading ? (
            <div className="or-empty">

              <div className="or-empty-icon">
                <FiPackage />
              </div>

              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (

            /* NO ORDERS AT ALL */

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

            /* EMPTY SELECTED CATEGORY */

            <div className="or-empty">

              <div className="or-empty-icon">
                <FiPackage />
              </div>

              <h3>
                No{" "}
                {statusConfig[
                  activeFilter
                ]?.label || ""}{" "}
                Orders
              </h3>

              <p>
                No orders are available in this
                category.
              </p>
            </div>

          ) : (

            /* =================================
               ORDER CARDS
            ================================= */

            filteredOrders.map(
              (item, index) => {
                const status =
                  getStatus(
                    item.orderStatus
                  );

                return (
                  <div
                    key={item._id}
                    className="or-card"
                    style={{
                      animationDelay: `${
                        index * 0.05
                      }s`,
                    }}
                    onClick={() =>
                      navigate(
                        `/order/${item._id}`
                      )
                    }
                  >

                    {/* STATUS COLOR */}

                    <div
                      className="or-card-strip"
                      style={{
                        background:
                          status.bg,
                      }}
                    />

                    <div className="or-card-body">

                      {/* CARD TOP */}

                      <div className="or-card-top">

                        <div
                          className="or-card-icon-wrap"
                          style={{
                            background:
                              status.bg +
                              "18",
                          }}
                        >
                          <FiPackage
                            color={
                              status.bg
                            }
                          />
                        </div>

                        <span
                          className="or-badge"
                          style={{
                            background:
                              status.bg,

                            color:
                              status.color,

                            boxShadow: `0 3px 10px ${status.shadow}`,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* PRODUCT */}

                      <div className="or-product-name">
                        {item.productName}
                      </div>

                      {/* ORDER ID */}

                      <div className="or-order-id">
                        #
                        {item._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </div>

                      <div className="or-divider" />

                      {/* ORDER DATA */}

                      <div className="or-stats">

                        <div>
                          <span className="or-stat-label">
                            Quantity
                          </span>

                          <span className="or-stat-value">
                            {item.quantity}{" "}
                            {item.unit ||
                              "units"}
                          </span>
                        </div>

                        <div
                          style={{
                            textAlign:
                              "right",
                          }}
                        >
                          <span className="or-stat-label">
                            Total
                          </span>

                          <span className="or-stat-total">
                            ₹
                            {Number(
                              item.totalAmount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </>
  );
}