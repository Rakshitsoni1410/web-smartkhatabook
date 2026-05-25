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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };
  const [advanceInput, setAdvanceInput] = useState("");
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
      showToast(`Order marked as ${status}`);
      fetchOrder();
    } catch (error) {
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const payAdvance = async () => {
    try {
      setUpdating(true);
      await axios.patch(`http://localhost:4000/api/orders/${id}/pay-advance`);
      showToast("Advance payment successful");
      fetchOrder();
    } catch (error) {
      showToast("Failed to process advance payment", "error");
    } finally {
      setUpdating(false);
    }
  };

  const completePayment = async () => {
    try {
      setUpdating(true);
      await axios.patch(
        `http://localhost:4000/api/orders/${id}/complete-payment`,
      );
      showToast("Payment completed successfully");
      fetchOrder();
    } catch (error) {
      showToast("Failed to complete payment", "error");
    } finally {
      setUpdating(false);
    }
  };

  const requestAdvancePayment = async () => {
    try {
      if (!advanceInput) {
        showToast("Enter advance percentage", "error");

        return;
      }

      if (Number(advanceInput) < 0 || Number(advanceInput) > 100) {
        showToast("Enter valid percentage", "error");

        return;
      }

      setUpdating(true);

      await axios.patch(
        `http://localhost:4000/api/orders/${id}/request-advance`,

        {
          advancePercentage: Number(advanceInput),
        },
      );

      showToast(`Advance request sent (${advanceInput}%)`);

      setAdvanceInput("");

      fetchOrder();
    } catch (error) {
      showToast("Failed to request advance", "error");
    } finally {
      setUpdating(false);
    }
  };

  const requestFinalPayment = async () => {
    try {
      setUpdating(true);
      await axios.patch(
        `http://localhost:4000/api/orders/${id}/request-final-payment`,
      );
      showToast("Final payment requested");
      fetchOrder();
    } catch (error) {
      showToast("Failed to request final payment", "error");
    } finally {
      setUpdating(false);
    }
  };

  // ─── ALL statuses from backend model ───────────────────────────────────────
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
      bg: "#f59e0b",
      label: "Advance Pending",
      shadow: "rgba(245,158,11,0.3)",
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

  // ─── Payment status label & color ──────────────────────────────────────────
  const paymentStatusConfig = {
    unpaid: { label: "Unpaid", color: "#f59e0b", bg: "#f59e0b18" },
    advanceRequested: {
      label: "Advance Requested",
      color: "#0ea5e9",
      bg: "#0ea5e918",
    },
    advancePaid: { label: "Advance Paid", color: "#8b5cf6", bg: "#8b5cf618" },
    partial: { label: "Partial", color: "#f59e0b", bg: "#f59e0b18" },
    paid: { label: "Paid", color: "#22c55e", bg: "#22c55e18" },
  };

  const getStatus = (status) =>
    statusConfig[status] || {
      color: "#fff",
      bg: "#94a3b8",
      label: status,
      shadow: "rgba(0,0,0,0.1)",
    };

  const getPaymentStatus = (ps) =>
    paymentStatusConfig[ps] || { label: ps, color: "#94a3b8", bg: "#94a3b818" };

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
  const ps = getPaymentStatus(order.paymentStatus);

  const canApprove = order.orderStatus === "pending";
  const canReject = order.orderStatus === "pending";

  const canOnTheWay = order.orderStatus === "processing";

  const canDeliver = order.orderStatus === "onTheWay";

  const canRequestAdvance =
    (order.orderStatus === "approved" || order.orderStatus === "processing") &&
    !order.advanceRequested;

  // Final payment: only after delivery, only once
  const canRequestFinal =
    order.orderStatus === "delivered" && !order.finalPaymentRequested;

  return (
    <>
      <style>{pageStyles}</style>

      <div className="od-page">
        {/* ── TOAST ── */}
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

        {/* ── TOPBAR ── */}
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

        {/*         PRODUCT CARD           */}

        <div className="od-card">
          <div className="od-card-strip" style={{ background: s.bg }} />
          <div className="od-card-body">
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
                  color: ps.color,
                  background: ps.bg,
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {ps.label}
              </span>
            </div>
          </div>
        </div>

        {/*       PAYMENT DETAILS          */}
        <div className="od-card">
          <div className="od-card-strip" style={{ background: "#22c55e" }} />
          <div className="od-card-body">
            <div className="od-product-header">
              <div
                className="od-product-icon"
                style={{ background: "#22c55e18" }}
              >
                <FiDollarSign size={22} color="#22c55e" />
              </div>
              <div>
                <div className="od-product-name">Payment Details</div>
                <div className="od-product-label">
                  Wholesaler payment policy
                </div>
              </div>
            </div>

            {/* Advance Policy */}
            <div className="od-info-row">
              <span className="od-info-label">
                <FiDollarSign size={13} color="#94a3b8" /> Advance Policy
              </span>
              <span
                className="od-info-value"
                style={{
                  color: order.advancePercentage > 0 ? "#f59e0b" : "#22c55e",
                }}
              >
                {order.advancePercentage > 0
                  ? `${order.advancePercentage}%`
                  : "No Advance"}
              </span>
            </div>

            {/* Advance Amount — only show if policy > 0 */}
            {order.advancePercentage > 0 && (
              <div className="od-info-row">
                <span className="od-info-label">
                  <FiDollarSign size={13} color="#94a3b8" /> Advance Amount
                </span>
                <span
                  className="od-info-value"
                  style={{ color: order.advancePaid ? "#22c55e" : "#f59e0b" }}
                >
                  ₹{order.advanceAmount || 0}
                  {order.advancePaid && (
                    <span
                      style={{ marginLeft: 6, fontSize: 11, color: "#22c55e" }}
                    >
                      ✓ Paid
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Remaining Amount */}
            <div className="od-info-row">
              <span className="od-info-label">
                <FiDollarSign size={13} color="#94a3b8" /> Remaining Amount
              </span>
              <span className="od-info-value">
                ₹{order.remainingAmount || 0}
              </span>
            </div>

            {/* Delivery Date */}
            <div className="od-info-row">
              <span className="od-info-label">
                <FiTruck size={13} color="#94a3b8" /> Delivery Date
              </span>
              <span className="od-info-value">
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not Assigned"}
              </span>
            </div>

            {/* Payment Status */}
            <div className="od-info-row" style={{ border: "none" }}>
              <span className="od-info-label">
                <FiClock size={13} color="#94a3b8" /> Payment Status
              </span>
              <span
                className="od-info-value"
                style={{
                  background: ps.bg,
                  color: ps.color,
                  padding: "4px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {ps.label}
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/*            WHOLESALER ACTIONS                  */}
        {/* ═══════════════════════════════════════════════ */}
        {role === "wholesaler" && (
          <div className="od-actions-card">
            <div className="od-actions-title">Update Order Status</div>

            {/* ── STATUS BUTTONS — always shown, active = current status ── */}
            <div className="od-actions-grid">
              {[
                {
                  label: "Approve",
                  clickStatus: "approved",
                  icon: <FiCheckCircle size={15} />,
                  bg: "#6366f1",
                  shadow: "rgba(99,102,241,0.35)",
                  // active when order is at the "approved" stage (any sub-status)
                  isActive: [
                    "approved",
                    "advancePending",
                    "processing",
                  ].includes(order.orderStatus),
                  // past when we've moved beyond the approved stage
                  isDone: ["onTheWay", "delivered", "completed"].includes(
                    order.orderStatus,
                  ),
                  canClick: canApprove,
                },
                {
                  label: "On The Way",
                  clickStatus: "onTheWay",
                  icon: <FiTruck size={15} />,
                  bg: "#0ea5e9",
                  shadow: "rgba(14,165,233,0.35)",
                  isActive: order.orderStatus === "onTheWay",
                  isDone: ["delivered", "completed"].includes(
                    order.orderStatus,
                  ),
                  canClick: canOnTheWay,
                },
                {
                  label: "Delivered",
                  clickStatus: "delivered",
                  icon: <FiCheckCircle size={15} />,
                  bg: "#22c55e",
                  shadow: "rgba(34,197,94,0.35)",
                  isActive: ["delivered", "completed"].includes(
                    order.orderStatus,
                  ),
                  isDone: false,
                  canClick: canDeliver,
                },
                {
                  label: "Reject",
                  clickStatus: "rejected",
                  icon: <FiXCircle size={15} />,
                  bg: "#ef4444",
                  shadow: "rgba(239,68,68,0.35)",
                  isActive: order.orderStatus === "rejected",
                  isDone: false,
                  canClick: canReject,
                },
              ].map((btn) => (
                <button
                  key={btn.clickStatus}
                  className="od-action-btn"
                  disabled={
                    updating || !btn.canClick || btn.isActive || btn.isDone
                  }
                  onClick={() => updateStatus(btn.clickStatus)}
                  style={{
                    background: btn.isActive ? btn.bg : "#fff",
                    color: btn.isActive ? "#fff" : btn.bg,
                    border: `1.5px solid ${btn.isActive ? btn.bg : btn.bg + "40"}`,
                    boxShadow: btn.isActive
                      ? `0 4px 14px ${btn.shadow}`
                      : "none",
                    opacity: btn.isDone ? 0.4 : 1,
                  }}
                >
                  {btn.icon}
                  {btn.label}
                  {btn.isActive && <span style={{ fontSize: 11 }}>✓</span>}
                </button>
              ))}
            </div>

            {/* ── PAYMENT REQUEST BUTTONS — below status grid ── */}
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {/* REQUEST ADVANCE */}
              {canRequestAdvance && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#fff7ed",
                    border: "1px solid #fdba74",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#9a3412",
                      marginBottom: 12,
                    }}
                  >
                    Request Advance Payment
                  </div>

                  <input
                    type="number"
                    placeholder="Enter advance percentage"
                    value={advanceInput}
                    min="0"
                    max="100"
                    onChange={(e) => {
                      let value = Number(e.target.value);

                      // LESS THAN 0
                      if (value < 0) {
                        value = 0;
                      }

                      // GREATER THAN 100
                      if (value > 100) {
                        value = 100;
                      }

                      setAdvanceInput(value);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      outline: "none",
                      marginBottom: 14,
                      fontSize: 14,
                      fontFamily: "Outfit",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <button
                      className="od-action-btn"
                      onClick={requestAdvancePayment}
                      disabled={updating}
                      style={{
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        flex: 1,
                        boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                      }}
                    >
                      <FiDollarSign size={15} />
                      Send Request
                    </button>

                    <button
                      className="od-action-btn"
                      onClick={() => setAdvanceInput("")}
                      style={{
                        background: "#e2e8f0",
                        color: "#334155",
                        border: "none",
                        flex: 1,
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* ADVANCE ALREADY REQUESTED — show as done chip */}
              {order.advanceRequested && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: order.advancePaid ? "#22c55e18" : "#f59e0b18",
                    border: `1px solid ${order.advancePaid ? "#22c55e40" : "#f59e0b40"}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: order.advancePaid ? "#22c55e" : "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiDollarSign size={14} />
                  {order.advancePaid
                    ? `✓ Advance received — ₹${order.advanceAmount}`
                    : `Advance requested — waiting for retailer (₹${order.advanceAmount})`}
                </div>
              )}

              {/* REQUEST FINAL PAYMENT */}
              {canRequestFinal && (
                <button
                  className="od-action-btn"
                  onClick={requestFinalPayment}
                  disabled={updating}
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                    gridColumn: "1 / -1",
                  }}
                >
                  <FiCheckCircle size={15} />
                  Request Final Payment (₹{order.remainingAmount})
                </button>
              )}

              {/* FINAL ALREADY REQUESTED */}
              {order.finalPaymentRequested && !order.fullPaymentDone && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#22c55e18",
                    border: "1px solid #22c55e40",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiClock size={14} />
                  Final payment requested — waiting for retailer (₹
                  {order.remainingAmount})
                </div>
              )}

              {/* FULLY PAID */}
              {order.fullPaymentDone && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#22c55e18",
                    border: "1px solid #22c55e40",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FiCheckCircle size={14} />✓ Full payment received — ₹
                  {order.totalAmount}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/*            RETAILER PAYMENT ACTIONS            */}
        {/* ═══════════════════════════════════════════════ */}
        {role === "retailer" && (
          <div className="od-actions-card">
            <div className="od-actions-title">Payment Actions</div>
            <div className="od-actions-grid">
              {/* ── PAY ADVANCE ──
                  Wholesaler requested advance and retailer hasn't paid yet */}
              {order.advanceRequested && !order.advancePaid && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#f59e0b15",
                    border: "1px solid #f59e0b40",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 6,
                    }}
                  >
                    ⚠️ Advance Payment Requested
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginBottom: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    Your wholesaler requires a <b>{order.advancePercentage}%</b>{" "}
                    advance before dispatching.
                    <br />
                    Amount due:{" "}
                    <b style={{ color: "#f59e0b" }}>₹{order.advanceAmount}</b>
                  </div>
                  <button
                    className="od-action-btn"
                    onClick={payAdvance}
                    disabled={updating}
                    style={{
                      background: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      width: "100%",
                    }}
                  >
                    <FiDollarSign size={15} />
                    Pay Advance ₹{order.advanceAmount}
                  </button>
                </div>
              )}

              {/* ── ADVANCE PAID CONFIRMATION ── */}
              {order.advancePaid && !order.finalPaymentRequested && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#8b5cf618",
                    border: "1px solid #8b5cf640",
                    borderRadius: 14,
                    padding: 16,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#8b5cf6",
                      marginBottom: 4,
                    }}
                  >
                    ✓ Advance Paid — ₹{order.advanceAmount}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    Waiting for delivery & final payment request
                  </div>
                </div>
              )}

              {/* ── PAY FINAL ──
                  Wholesaler requested final payment after delivery */}
              {order.finalPaymentRequested && !order.fullPaymentDone && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#22c55e15",
                    border: "1px solid #22c55e40",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 6,
                    }}
                  >
                    ✅ Final Payment Requested
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginBottom: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    Your order has been delivered. Remaining amount:
                    <b style={{ color: "#22c55e" }}>
                      {" "}
                      ₹{order.remainingAmount}
                    </b>
                  </div>
                  <button
                    className="od-action-btn"
                    onClick={completePayment}
                    disabled={updating}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      width: "100%",
                    }}
                  >
                    <FiCheckCircle size={15} />
                    Complete Payment ₹{order.remainingAmount}
                  </button>
                </div>
              )}

              {/* ── ORDER FULLY PAID ── */}
              {order.fullPaymentDone && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "#22c55e18",
                    border: "1px solid #22c55e40",
                    borderRadius: 14,
                    padding: 16,
                    textAlign: "center",
                    color: "#22c55e",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  <FiCheckCircle size={18} style={{ marginBottom: 6 }} />
                  <div>Order fully paid — ₹{order.totalAmount}</div>
                </div>
              )}

              {/* ── WAITING (no action needed from retailer yet) ── */}
              {!order.advanceRequested &&
                !order.finalPaymentRequested &&
                !order.fullPaymentDone &&
                order.paymentStatus !== "paid" && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "16px",
                      borderRadius: "14px",
                      background: "#e2e8f0",
                      color: "#475569",
                      fontWeight: "600",
                      textAlign: "center",
                      fontSize: 13,
                    }}
                  >
                    {order.orderStatus === "pending"
                      ? "⏳ Waiting for wholesaler to approve your order"
                      : order.orderStatus === "rejected"
                        ? "❌ This order was rejected"
                        : "⏳ Waiting for wholesaler payment request"}
                  </div>
                )}
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
    margin-bottom: 16px;
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
    opacity: 0.65;
    transform: none;
  }
`;
