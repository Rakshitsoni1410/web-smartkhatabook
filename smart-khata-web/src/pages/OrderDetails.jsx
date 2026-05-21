import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiPackage,
  FiClock,
  FiDollarSign,
  FiHash,
} from "react-icons/fi";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role?.trim().toLowerCase();

  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
    const timer = setInterval(fetchOrder, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrder = async () => {
    try {
      const url =
        role === "wholesaler"
          ? `http://localhost:4000/api/orders/wholesaler/${user._id}`
          : `http://localhost:4000/api/orders/retailer/${user._id}`;
      const res = await axios.get(url);
      const found = res.data.find((item) => item._id === id);
      setOrder(found);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      await axios.patch(`http://localhost:4000/api/orders/${id}/status`, {
        status,
      });
      setToast({ msg: `Order marked as ${status}`, type: "success" });
      fetchOrder();
      setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
    } catch (error) {
      setToast({ msg: "Failed to update status", type: "error" });
      setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
    } finally {
      setUpdating(false);
    }
  };

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
      label: status,
      shadow: "rgba(0,0,0,0.1)",
    };

  const actionButtons = [
    {
      label: "Approve",
      status: "approved",
      icon: <FiCheckCircle size={15} />,
      bg: "#6366f1",
      shadow: "rgba(99,102,241,0.35)",
    },
    {
      label: "On The Way",
      status: "onTheWay",
      icon: <FiTruck size={15} />,
      bg: "#0ea5e9",
      shadow: "rgba(14,165,233,0.35)",
    },
    {
      label: "Delivered",
      status: "delivered",
      icon: <FiCheckCircle size={15} />,
      bg: "#22c55e",
      shadow: "rgba(34,197,94,0.35)",
    },
    {
      label: "Reject",
      status: "rejected",
      icon: <FiXCircle size={15} />,
      bg: "#ef4444",
      shadow: "rgba(239,68,68,0.35)",
    },
  ];

  if (!order) {
    return (
      <div
        className="od-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{pageStyles}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <FiPackage size={26} color="#cbd5e1" />
          </div>
          <p
            style={{
              color: "#94a3b8",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
            }}
          >
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  const s = getStatus(order.orderStatus);

  return (
    <>
      <style>{pageStyles}</style>

      <div className="od-page">
        {/* Toast */}
        {toast.msg && (
          <div
            className="od-toast"
            style={{
              background: toast.type === "success" ? "#22c55e" : "#ef4444",
            }}
          >
            {toast.type === "success" ? (
              <FiCheckCircle size={14} />
            ) : (
              <FiXCircle size={14} />
            )}
            {toast.msg}
          </div>
        )}

        {/* Topbar */}
        <div className="od-topbar">
          <div className="od-topbar-left">
            <button className="od-back-btn" onClick={() => navigate("/orders")}>
              <FiArrowLeft />
            </button>
            <div>
              <div className="od-title">Order Details</div>
              <div className="od-subtitle">
                <FiHash size={10} />
                {id?.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span
            className="od-status-badge"
            style={{
              background: s.bg,
              color: s.color,
              boxShadow: `0 4px 12px ${s.shadow}`,
            }}
          >
            <span className="od-status-dot" />
            {s.label}
          </span>
        </div>

        {/* Product Card */}
        <div className="od-card">
          {/* colored top strip */}
          <div className="od-card-strip" style={{ background: s.bg }} />

          <div className="od-card-body">
            {/* Product header */}
            <div className="od-product-header">
              <div
                className="od-product-icon"
                style={{ background: s.bg + "18" }}
              >
                <FiPackage size={22} color={s.bg} />
              </div>
              <div>
                <div className="od-product-name">{order.productName}</div>
                <div className="od-product-label">Product Details</div>
              </div>
            </div>

            {/* Info rows */}
            <div className="od-info-row">
              <span className="od-info-label">
                <FiPackage size={13} color="#94a3b8" /> Quantity
              </span>
              <span className="od-info-value">{order.quantity} units</span>
            </div>

            <div className="od-info-row">
              <span className="od-info-label">
                <FiDollarSign size={13} color="#94a3b8" /> Price / Unit
              </span>
              <span className="od-info-value">₹{order.pricePerUnit}</span>
            </div>

            <div className="od-info-row">
              <span className="od-info-label">
                <FiDollarSign size={13} color="#94a3b8" /> Total Amount
              </span>
              <span className="od-info-value od-total">
                ₹{order.totalAmount}
              </span>
            </div>

            <div className="od-info-row" style={{ border: "none" }}>
              <span className="od-info-label">
                <FiClock size={13} color="#94a3b8" /> Payment Status
              </span>
              <span
                className="od-info-value"
                style={{
                  color: order.paymentStatus === "paid" ? "#22c55e" : "#f59e0b",
                  background:
                    order.paymentStatus === "paid" ? "#22c55e18" : "#f59e0b18",
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Wholesaler Action Buttons */}
        {role === "wholesaler" && (
          <div className="od-actions-card">
            <div className="od-actions-title">Update Order Status</div>
            <div className="od-actions-grid">
              {actionButtons.map((btn) => {
                const isActive = order.orderStatus === btn.status;
                return (
                  <button
                    key={btn.status}
                    className="od-action-btn"
                    disabled={updating || isActive}
                    onClick={() => updateStatus(btn.status)}
                    style={{
                      background: isActive ? btn.bg : "#fff",
                      color: isActive ? "#fff" : btn.bg,
                      border: `1.5px solid ${isActive ? btn.bg : btn.bg + "40"}`,
                      boxShadow: isActive ? `0 4px 14px ${btn.shadow}` : "none",
                      opacity: isActive ? 0.85 : 1,
                    }}
                  >
                    {btn.icon}
                    {btn.label}
                    {isActive && <span style={{ fontSize: 11 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .od-page {
    min-height: 100vh;
    background: #eef2f7;
    font-family: 'Outfit', sans-serif;
    padding: 28px 32px;
  }

  /* Toast */
  .od-toast {
    position: fixed;
    top: 20px; right: 20px;
    color: white;
    padding: 11px 18px;
    border-radius: 12px;
    z-index: 999;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    animation: slideIn 0.2s ease;
    font-family: 'Outfit', sans-serif;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* Topbar */
  .od-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .od-topbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .od-back-btn {
    width: 40px; height: 40px;
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
  .od-back-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
    transform: translateX(-2px);
  }
  .od-title {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
  }
  .od-subtitle {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  /* Status badge */
  .od-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }
  .od-status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.7);
  }

  /* Card */
  .od-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border: 1.5px solid #f1f5f9;
    margin-bottom: 16px;
    animation: fadeUp 0.25s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Colored strip */
  .od-card-strip {
    height: 5px;
    width: 100%;
  }
  .od-card-body {
    padding: 22px 22px 18px;
  }

  /* Product header */
  .od-product-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid #f1f5f9;
  }
  .od-product-icon {
    width: 50px; height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .od-product-name {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
  }
  .od-product-label {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 400;
    margin-top: 3px;
  }

  /* Info rows */
  .od-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 0;
    border-bottom: 1px solid #f8fafc;
  }
  .od-info-label {
    font-size: 13px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
  .od-info-value {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }
  .od-total {
    font-size: 18px;
    font-weight: 800;
    color: #22c55e;
  }

  /* Actions card */
  .od-actions-card {
    background: #fff;
    border-radius: 18px;
    padding: 22px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border: 1.5px solid #f1f5f9;
    animation: fadeUp 0.3s ease both;
  }
  .od-actions-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 14px;
  }
  .od-actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  /* Action buttons */
  .od-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
    font-family: 'Outfit', sans-serif;
  }
  .od-action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 6px 18px rgba(0,0,0,0.12) !important;
  }
  .od-action-btn:disabled {
    cursor: not-allowed;
    transform: none;
  }
`;
