import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiRefreshCw, FiPackage, FiShoppingBag } from "react-icons/fi";

export default function Orders() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role?.trim().toLowerCase();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async () => {
    try {
      const url =
        role === "wholesaler"
          ? `http://localhost:4000/api/orders/wholesaler/${user._id}`
          : `http://localhost:4000/api/orders/retailer/${user._id}`;
      const res = await axios.get(url);
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending:   { color: "#fff", bg: "#f59e0b", label: "Pending",    shadow: "rgba(245,158,11,0.3)"  },
    approved:  { color: "#fff", bg: "#6366f1", label: "Approved",   shadow: "rgba(99,102,241,0.3)"  },
    onTheWay:  { color: "#fff", bg: "#0ea5e9", label: "On The Way", shadow: "rgba(14,165,233,0.3)"  },
    delivered: { color: "#fff", bg: "#22c55e", label: "Delivered",  shadow: "rgba(34,197,94,0.3)"   },
    rejected:  { color: "#fff", bg: "#ef4444", label: "Rejected",   shadow: "rgba(239,68,68,0.3)"   },
  };

  const getStatus = (status) =>
    statusConfig[status] || { color: "#fff", bg: "#94a3b8", label: status, shadow: "rgba(0,0,0,0.1)" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .or-page {
          min-height: 100vh;
          background: #eef2f7;
          font-family: 'Outfit', sans-serif;
          padding: 28px 32px;
        }

        /* Topbar */
        .or-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
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
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
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
        .or-refresh-btn {
          display: flex;
          align-items: center;
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
          box-shadow: 0 4px 12px rgba(14,165,233,0.35);
        }
        .or-refresh-btn:hover {
          background: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(14,165,233,0.4);
        }

        /* Summary row */
        .or-summary {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .or-summary-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          background: #fff;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .or-summary-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .or-summary-num {
          font-weight: 800;
          color: #0f172a;
        }

        /* Grid */
        .or-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        /* Card */
        .or-card {
          background: #fff;
          border-radius: 18px;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1.5px solid #f1f5f9;
        }
        .or-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1);
          border-color: #e2e8f0;
        }

        /* Colored top strip */
        .or-card-strip {
          height: 5px;
          width: 100%;
        }

        .or-card-body {
          padding: 18px 20px 20px;
        }

        /* Card top row */
        .or-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
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

        /* Status badge */
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
          justify-content: space-between;
          align-items: flex-end;
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

        /* Empty */
        .or-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 70px 20px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1.5px solid #f1f5f9;
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

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .or-card { animation: fadeUp 0.25s ease both; }
      `}</style>

      <div className="or-page">

        {/* Topbar */}
        <div className="or-topbar">
          <div className="or-topbar-left">
            <button className="or-back-btn" onClick={() => navigate("/dashboard")}>
              <FiArrowLeft />
            </button>
            <div>
              <div className="or-heading">
                <span className="or-title">Orders</span>
                {orders.length > 0 && (
                  <span className="or-count-badge">{orders.length}</span>
                )}
              </div>
              <div className="or-subtitle">Track and manage all your orders</div>
            </div>
          </div>

          <button className="or-refresh-btn" onClick={fetchOrders}>
            <FiRefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Summary pills */}
        {orders.length > 0 && (
          <div className="or-summary">
            {Object.entries(statusConfig).map(([key, val]) => {
              const count = orders.filter((o) => o.orderStatus === key).length;
              if (count === 0) return null;
              return (
                <div className="or-summary-pill" key={key}>
                  <span className="or-summary-dot" style={{ background: val.bg }} />
                  {val.label}
                  <span className="or-summary-num">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Grid */}
        <div className="or-grid">
          {loading ? (
            <div className="or-empty">
              <div className="or-empty-icon"><FiPackage /></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="or-empty">
              <div className="or-empty-icon"><FiShoppingBag /></div>
              <h3>No Orders Found</h3>
              <p>Place an order from the stock page.</p>
            </div>
          ) : (
            orders.map((item, idx) => {
              const s = getStatus(item.orderStatus);
              return (
                <div
                  key={item._id}
                  className="or-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => navigate(`/order/${item._id}`)}
                >
                  {/* colored top strip */}
                  <div className="or-card-strip" style={{ background: s.bg }} />

                  <div className="or-card-body">
                    <div className="or-card-top">
                      <div
                        className="or-card-icon-wrap"
                        style={{ background: s.bg + "18" }}
                      >
                        <FiPackage color={s.bg} />
                      </div>
                      <span
                        className="or-badge"
                        style={{
                          background: s.bg,
                          color: s.color,
                          boxShadow: `0 3px 10px ${s.shadow}`,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>

                    <div className="or-product-name">{item.productName}</div>
                    <div className="or-order-id">#{item._id?.slice(-6).toUpperCase()}</div>

                    <div className="or-divider" />

                    <div className="or-stats">
                      <div>
                        <span className="or-stat-label">Quantity</span>
                        <span className="or-stat-value">{item.quantity} units</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className="or-stat-label">Total</span>
                        <span className="or-stat-total">₹{item.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}