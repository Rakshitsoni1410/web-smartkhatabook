import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../api";

import { getStoredUser } from "../utils/session";

import FakePaymentModal from "../components/FakePaymentModal";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiPackage,
  FiClock,
  FiHash,
  FiMoon,
  FiSun,
} from "react-icons/fi";

// =====================================================
// RUPEE ICON
// =====================================================

const RupeeIcon = ({ size = 13, color = "currentColor" }) => {
  return (
    <span
      style={{
        fontSize: size,
        color,
        fontWeight: 800,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      ₹
    </span>
  );
};

// =====================================================
// MONEY FORMATTER
// =====================================================

const formatMoney = (value) => {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// ORDER DETAILS
// =====================================================

export default function OrderDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

  const user = getStoredUser();

  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  // =====================================================
  // STATE
  // =====================================================

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [advanceInput, setAdvanceInput] = useState("");

  const [toast, setToast] = useState({
    msg: "",
    type: "success",
  });

  const [paymentModal, setPaymentModal] = useState({
    open: false,
    type: "",
    amount: 0,
  });

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
        window.matchMedia?.("(prefers-color-scheme: dark)").matches || false
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
  // TOAST
  // =====================================================

  const showToast = (msg, type = "success") => {
    setToast({
      msg,
      type,
    });

    setTimeout(() => {
      setToast({
        msg: "",
        type: "success",
      });
    }, 3000);
  };

  // =====================================================
  // FETCH ORDER
  // =====================================================

  const fetchOrder = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    try {
      const url =
        role === "wholesaler"
          ? `/api/orders/wholesaler/${user._id}`
          : `/api/orders/retailer/${user._id}`;

      const res = await api.get(url);

      const orderList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.orders)
          ? res.data.orders
          : [];

      const found = orderList.find((item) => String(item._id) === String(id));

      setOrder(found || null);
    } catch (error) {
      console.error("FETCH ORDER ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [id, role, user?._id]);

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchOrder();

    const timer = setInterval(fetchOrder, 5000);

    return () => clearInterval(timer);
  }, [fetchOrder]);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (status) => {
    if (updating) {
      return;
    }

    try {
      setUpdating(true);

      await api.patch(`/api/orders/${id}/status`, {
        status,
      });

      showToast(
        status === "rejected" ? "Order rejected" : `Order marked as ${status}`,
      );

      await fetchOrder();
    } catch (error) {
      console.error("STATUS UPDATE ERROR:", error);

      showToast(
        error?.response?.data?.message || "Failed to update order status",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // OPEN PAYMENT
  // =====================================================

  const openPaymentGateway = (type, amount) => {
    setPaymentModal({
      open: true,
      type,
      amount: Number(amount || 0),
    });
  };

  // =====================================================
  // CLOSE PAYMENT
  // =====================================================

  const closePaymentGateway = () => {
    if (updating) {
      return;
    }

    setPaymentModal({
      open: false,
      type: "",
      amount: 0,
    });
  };

  // =====================================================
  // FAKE PAYMENT
  // =====================================================

  const handleFakePaymentConfirm = async ({
    paymentType,
    transactionId,
    paymentMethod,
    amount,
  }) => {
    try {
      setUpdating(true);

      if (paymentType === "advance") {
        await api.patch(`/api/orders/${id}/pay-advance`, {
          mockPayment: true,
          transactionId,
          paymentMethod,
          amount,
        });

        showToast(`Advance payment successful • ${transactionId}`);
      } else if (paymentType === "final") {
        await api.patch(`/api/orders/${id}/complete-payment`, {
          mockPayment: true,
          transactionId,
          paymentMethod,
          amount,
        });

        showToast(`Final payment successful • ${transactionId}`);
      } else {
        throw new Error("Unknown payment type");
      }

      await fetchOrder();
    } catch (error) {
      console.error("FAKE PAYMENT ERROR:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to process demo payment",
        "error",
      );

      throw error;
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // REQUEST ADVANCE
  // =====================================================

  const requestAdvancePayment = async () => {
    const percentage = Number(advanceInput);

    if (advanceInput === "") {
      showToast("Enter advance percentage", "error");

      return;
    }

    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      showToast("Enter percentage between 0 and 100", "error");

      return;
    }

    try {
      setUpdating(true);

      await api.patch(`/api/orders/${id}/request-advance`, {
        advancePercentage: percentage,
      });

      showToast(`Advance request sent (${percentage}%)`);

      setAdvanceInput("");

      await fetchOrder();
    } catch (error) {
      console.error("ADVANCE REQUEST ERROR:", error);

      showToast(
        error?.response?.data?.message || "Failed to request advance payment",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // REQUEST FINAL PAYMENT
  // =====================================================

  const requestFinalPayment = async () => {
    try {
      setUpdating(true);

      await api.patch(`/api/orders/${id}/request-final-payment`);

      showToast("Final payment requested");

      await fetchOrder();
    } catch (error) {
      console.error("FINAL PAYMENT REQUEST ERROR:", error);

      showToast(
        error?.response?.data?.message || "Failed to request final payment",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

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
      bg: "#f59e0b",
      label: "Advance Pending",
      shadow: "rgba(245,158,11,0.30)",
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

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const paymentStatusConfig = {
    unpaid: {
      label: "Unpaid",
      color: "#f59e0b",
      bg: "#f59e0b18",
    },

    advanceRequested: {
      label: "Advance Requested",
      color: "#0ea5e9",
      bg: "#0ea5e918",
    },

    advancePaid: {
      label: "Advance Paid",
      color: "#8b5cf6",
      bg: "#8b5cf618",
    },

    partial: {
      label: "Partial",
      color: "#f59e0b",
      bg: "#f59e0b18",
    },

    paid: {
      label: "Paid",
      color: "#22c55e",
      bg: "#22c55e18",
    },
  };

  const getStatus = (status) =>
    statusConfig[status] || {
      color: "#ffffff",
      bg: "#94a3b8",
      label: status,
      shadow: "rgba(0,0,0,0.10)",
    };

  const getPaymentStatus = (status) =>
    paymentStatusConfig[status] || {
      label: status || "Unknown",
      color: "#94a3b8",
      bg: "#94a3b818",
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className={`od-page ${darkMode ? "od-dark" : ""}`}>
        <style>{pageStyles}</style>

        <div className="od-loading">
          <div className="od-loading-icon">
            <FiPackage size={26} />
          </div>

          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!order) {
    return (
      <div className={`od-page ${darkMode ? "od-dark" : ""}`}>
        <style>{pageStyles}</style>

        <div className="od-loading">
          <div className="od-loading-icon">
            <FiXCircle size={26} />
          </div>

          <p>Order not found</p>

          <button className="od-simple-btn" onClick={() => navigate("/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // CURRENT STATUS
  // =====================================================

  const s = getStatus(order.orderStatus);

  const ps = getPaymentStatus(order.paymentStatus);

  // =====================================================
  // TERMINAL STATUS
  //
  // Delivered:
  // every status button locked.
  //
  // Completed:
  // every status button locked.
  //
  // Rejected:
  // every status button locked.
  // =====================================================

  const isDelivered =
    order.orderStatus === "delivered" || order.orderStatus === "completed";

  const isRejected = order.orderStatus === "rejected";

  const statusLocked = isDelivered || isRejected;

  // =====================================================
  // STATUS PERMISSIONS
  // =====================================================

  const canApprove = !statusLocked && order.orderStatus === "pending";

  const canReject = !statusLocked && order.orderStatus === "pending";

  const canOnTheWay = !statusLocked && order.orderStatus === "processing";

  const canDeliver = !statusLocked && order.orderStatus === "onTheWay";

  // =====================================================
  // PAYMENT PERMISSIONS
  // =====================================================

  const canRequestAdvance =
    !statusLocked &&
    (order.orderStatus === "approved" || order.orderStatus === "processing") &&
    !order.advanceRequested;

  const canRequestFinal =
    order.orderStatus === "delivered" &&
    !order.finalPaymentRequested &&
    !order.fullPaymentDone;

  // =====================================================
  // STATUS BUTTONS
  // =====================================================

  const statusButtons = [
    {
      label: "Approve",

      clickStatus: "approved",

      icon: <FiCheckCircle size={15} />,

      bg: "#6366f1",

      shadow: "rgba(99,102,241,0.35)",

      isActive: ["approved", "advancePending", "processing"].includes(
        order.orderStatus,
      ),

      isDone: ["onTheWay", "delivered", "completed", "rejected"].includes(
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

      isDone: ["delivered", "completed", "rejected"].includes(
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

      // Delivered remains active
      // even after payment completes.
      isActive: ["delivered", "completed"].includes(order.orderStatus),

      isDone: order.orderStatus === "rejected",

      canClick: canDeliver,
    },

    {
      label: "Reject",

      clickStatus: "rejected",

      icon: <FiXCircle size={15} />,

      bg: "#ef4444",

      shadow: "rgba(239,68,68,0.35)",

      isActive: order.orderStatus === "rejected",

      // Reject only belongs to
      // pending stage.
      //
      // Once order moves forward,
      // reject becomes permanently
      // inactive.
      isDone: !["pending", "rejected"].includes(order.orderStatus),

      canClick: canReject,
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>{pageStyles}</style>

      <div className={`od-page ${darkMode ? "od-dark" : ""}`}>
        {/* =============================================
            TOAST
        ============================================== */}

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

        {/* =============================================
            TOP BAR
        ============================================== */}

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

          <div className="od-topbar-actions">
            {/* DARK MODE */}

            <button
              type="button"
              className="od-theme-btn"
              onClick={() => setDarkMode((previous) => !previous)}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* ORDER STATUS */}

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
        </div>

        {/* =============================================
            PRODUCT CARD
        ============================================== */}

        <div className="od-card">
          <div
            className="od-card-strip"
            style={{
              background: s.bg,
            }}
          />

          <div className="od-card-body">
            <div className="od-product-header">
              <div
                className="od-product-icon"
                style={{
                  background: `${s.bg}18`,
                }}
              >
                <FiPackage size={22} color={s.bg} />
              </div>

              <div>
                <div className="od-product-name">{order.productName}</div>

                <div className="od-product-label">Product Details</div>
              </div>
            </div>

            {/* QUANTITY */}

            <div className="od-info-row">
              <span className="od-info-label">
                <FiPackage size={13} />
                Quantity
              </span>

              <span className="od-info-value">
                {order.quantity} {order.unit || "units"}
              </span>
            </div>

            {/* PRICE */}

            <div className="od-info-row">
              <span className="od-info-label">
                <RupeeIcon />
                Price / Unit
              </span>

              <span className="od-info-value">
                {formatMoney(order.pricePerUnit)}
              </span>
            </div>

            {/* TOTAL */}

            <div className="od-info-row">
              <span className="od-info-label">
                <RupeeIcon />
                Total Amount
              </span>

              <span className="od-info-value od-total">
                {formatMoney(order.totalAmount)}
              </span>
            </div>

            {/* PAYMENT STATUS */}

            <div
              className="od-info-row"
              style={{
                border: "none",
              }}
            >
              <span className="od-info-label">
                <FiClock size={13} />
                Payment Status
              </span>

              <span
                className="od-payment-badge"
                style={{
                  color: ps.color,

                  background: ps.bg,
                }}
              >
                {ps.label}
              </span>
            </div>
          </div>
        </div>

        {/* =============================================
            PAYMENT DETAILS
        ============================================== */}

        <div className="od-card">
          <div
            className="od-card-strip"
            style={{
              background: "#22c55e",
            }}
          />

          <div className="od-card-body">
            <div className="od-product-header">
              <div
                className="od-product-icon"
                style={{
                  background: "#22c55e18",
                }}
              >
                <RupeeIcon size={22} color="#22c55e" />
              </div>

              <div>
                <div className="od-product-name">Payment Details</div>

                <div className="od-product-label">
                  Wholesaler payment policy
                </div>
              </div>
            </div>

            {/* ADVANCE POLICY */}

            <div className="od-info-row">
              <span className="od-info-label">
                <RupeeIcon />
                Advance Policy
              </span>

              <span
                className="od-info-value"
                style={{
                  color:
                    Number(order.advancePercentage) > 0 ? "#f59e0b" : "#22c55e",
                }}
              >
                {Number(order.advancePercentage) > 0
                  ? `${order.advancePercentage}%`
                  : "No Advance"}
              </span>
            </div>

            {/* ADVANCE AMOUNT */}

            {Number(order.advancePercentage) > 0 && (
              <div className="od-info-row">
                <span className="od-info-label">
                  <RupeeIcon />
                  Advance Amount
                </span>

                <span
                  className="od-info-value"
                  style={{
                    color: order.advancePaid ? "#22c55e" : "#f59e0b",
                  }}
                >
                  {formatMoney(order.advanceAmount)}

                  {order.advancePaid && (
                    <span className="od-paid-small">✓ Paid</span>
                  )}
                </span>
              </div>
            )}

            {/* REMAINING */}

            <div className="od-info-row">
              <span className="od-info-label">
                <RupeeIcon />
                Remaining Amount
              </span>

              <span className="od-info-value">
                {formatMoney(order.remainingAmount)}
              </span>
            </div>

            {/* DELIVERY */}

            <div className="od-info-row">
              <span className="od-info-label">
                <FiTruck size={13} />
                Delivery Date
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

            {/* PAYMENT STATUS */}

            <div
              className="od-info-row"
              style={{
                border: "none",
              }}
            >
              <span className="od-info-label">
                <FiClock size={13} />
                Payment Status
              </span>

              <span
                className="od-payment-badge"
                style={{
                  background: ps.bg,

                  color: ps.color,
                }}
              >
                {ps.label}
              </span>
            </div>
          </div>
        </div>

        {/* =============================================
            WHOLESALER ACTIONS
        ============================================== */}

        {role === "wholesaler" && (
          <div className="od-actions-card">
            <div className="od-actions-title">Update Order Status</div>

            {/* STATUS BUTTONS */}

            <div className="od-actions-grid">
              {statusButtons.map((btn) => {
                const disabled =
                  updating || !btn.canClick || btn.isActive || btn.isDone;

                return (
                  <button
                    key={btn.clickStatus}
                    className="od-action-btn"
                    disabled={disabled}
                    onClick={() => updateStatus(btn.clickStatus)}
                    style={{
                      background: btn.isActive ? btn.bg : "var(--od-card)",

                      color: btn.isActive ? "#ffffff" : btn.bg,

                      border: `1.5px solid ${
                        btn.isActive ? btn.bg : `${btn.bg}55`
                      }`,

                      boxShadow: btn.isActive
                        ? `0 4px 14px ${btn.shadow}`
                        : "none",

                      opacity: disabled && !btn.isActive ? 0.35 : 1,
                    }}
                  >
                    {btn.icon}

                    {btn.label}

                    {btn.isActive && <span className="od-check">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* =========================================
                TERMINAL STATUS INFO
            ========================================== */}

            {isDelivered && (
              <div className="od-terminal-message od-success-message">
                <FiCheckCircle size={16} />
                Order delivered. Status can no longer be changed.
              </div>
            )}

            {isRejected && (
              <div className="od-terminal-message od-error-message">
                <FiXCircle size={16} />
                Order rejected. Status can no longer be changed.
              </div>
            )}

            {/* =========================================
                PAYMENT REQUESTS
            ========================================== */}

            <div className="od-payment-actions">
              {/* REQUEST ADVANCE */}

              {canRequestAdvance && (
                <div className="od-request-box od-warning-box">
                  <div className="od-request-title">
                    Request Advance Payment
                  </div>

                  <input
                    type="number"
                    placeholder="Enter advance percentage"
                    value={advanceInput}
                    min="0"
                    max="100"
                    onChange={(e) => {
                      const raw = e.target.value;

                      if (raw === "") {
                        setAdvanceInput("");

                        return;
                      }

                      let value = Number(raw);

                      if (value < 0) {
                        value = 0;
                      }

                      if (value > 100) {
                        value = 100;
                      }

                      setAdvanceInput(value);
                    }}
                  />

                  <div className="od-request-buttons">
                    <button
                      className="od-action-btn od-orange-btn"
                      onClick={requestAdvancePayment}
                      disabled={updating}
                    >
                      <RupeeIcon size={15} />
                      Send Request
                    </button>

                    <button
                      className="od-action-btn od-clear-btn"
                      onClick={() => setAdvanceInput("")}
                      disabled={updating}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* ADVANCE STATUS */}

              {order.advanceRequested && (
                <div
                  className={
                    order.advancePaid
                      ? "od-status-message od-green-message"
                      : "od-status-message od-orange-message"
                  }
                >
                  <RupeeIcon size={14} />

                  {order.advancePaid
                    ? `✓ Advance received — ${formatMoney(order.advanceAmount)}`
                    : `Advance requested — waiting for retailer (${formatMoney(
                        order.advanceAmount,
                      )})`}
                </div>
              )}

              {/* REQUEST FINAL */}

              {canRequestFinal && (
                <button
                  className="od-action-btn od-final-btn"
                  onClick={requestFinalPayment}
                  disabled={updating}
                >
                  <FiCheckCircle size={15} />
                  Request Final Payment ({formatMoney(order.remainingAmount)})
                </button>
              )}

              {/* FINAL REQUESTED */}

              {order.finalPaymentRequested && !order.fullPaymentDone && (
                <div className="od-status-message od-green-message">
                  <FiClock size={14} />
                  Final payment requested — waiting for retailer (
                  {formatMoney(order.remainingAmount)})
                </div>
              )}

              {/* FULL PAYMENT */}

              {order.fullPaymentDone && (
                <div className="od-status-message od-green-message">
                  <FiCheckCircle size={14} />✓ Full payment received —{" "}
                  {formatMoney(order.totalAmount)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================
            RETAILER PAYMENT ACTIONS
        ============================================== */}

        {role === "retailer" && (
          <div className="od-actions-card">
            <div className="od-actions-title">Payment Actions</div>

            <div className="od-payment-actions">
              {/* ADVANCE PAYMENT */}

              {order.advanceRequested && !order.advancePaid && (
                <div className="od-request-box od-warning-box">
                  <div className="od-request-title">
                    ⚠️ Advance Payment Requested
                  </div>

                  <div className="od-request-description">
                    Your wholesaler requires a <b>{order.advancePercentage}%</b>{" "}
                    advance before dispatching.
                    <br />
                    Amount due:{" "}
                    <strong className="od-orange-text">
                      {formatMoney(order.advanceAmount)}
                    </strong>
                  </div>

                  <button
                    className="od-action-btn od-orange-btn od-full-btn"
                    onClick={() =>
                      openPaymentGateway("advance", order.advanceAmount)
                    }
                    disabled={updating}
                  >
                    <RupeeIcon size={15} />
                    Pay Advance {formatMoney(order.advanceAmount)}
                  </button>
                </div>
              )}

              {/* ADVANCE PAID */}

              {order.advancePaid && !order.finalPaymentRequested && (
                <div className="od-center-message od-purple-message">
                  <div className="od-center-title">
                    ✓ Advance Paid — {formatMoney(order.advanceAmount)}
                  </div>

                  <div className="od-center-subtitle">
                    Waiting for delivery & final payment request
                  </div>
                </div>
              )}

              {/* FINAL PAYMENT */}

              {order.finalPaymentRequested && !order.fullPaymentDone && (
                <div className="od-request-box od-success-box">
                  <div className="od-request-title">
                    ✅ Final Payment Requested
                  </div>

                  <div className="od-request-description">
                    Your order has been delivered.
                    <br />
                    Remaining amount:{" "}
                    <strong className="od-green-text">
                      {formatMoney(order.remainingAmount)}
                    </strong>
                  </div>

                  <button
                    className="od-action-btn od-final-btn od-full-btn"
                    onClick={() =>
                      openPaymentGateway("final", order.remainingAmount)
                    }
                    disabled={updating}
                  >
                    <RupeeIcon size={15} />
                    Complete Payment {formatMoney(order.remainingAmount)}
                  </button>
                </div>
              )}

              {/* FULLY PAID */}

              {order.fullPaymentDone && (
                <div className="od-center-message od-green-message">
                  <FiCheckCircle size={18} />

                  <div className="od-center-title">
                    Order fully paid — {formatMoney(order.totalAmount)}
                  </div>
                </div>
              )}

              {/* WAITING */}

              {!order.advanceRequested &&
                !order.finalPaymentRequested &&
                !order.fullPaymentDone &&
                order.paymentStatus !== "paid" && (
                  <div className="od-waiting-message">
                    {order.orderStatus === "pending"
                      ? "⏳ Waiting for wholesaler to approve your order"
                      : order.orderStatus === "rejected"
                        ? "❌ This order was rejected"
                        : order.orderStatus === "delivered"
                          ? "⏳ Waiting for final payment request"
                          : "⏳ Waiting for wholesaler payment request"}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* =============================================
          PAYMENT MODAL
      ============================================== */}

      <FakePaymentModal
        open={paymentModal.open}
        amount={paymentModal.amount}
        paymentType={paymentModal.type}
        orderId={id}
        onClose={closePaymentGateway}
        onConfirm={handleFakePaymentConfirm}
      />
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

 .od-page {
  --od-bg: #eef2f7;
  --od-card: #ffffff;
  --od-card-soft: #f8fafc;
  --od-text: #0f172a;
  --od-secondary: #475569;
  --od-muted: #94a3b8;
  --od-border: #f1f5f9;
  --od-row-border: #f1f5f9;
  --od-hover: #f1f5f9;
  --od-input: #ffffff;
  --od-input-border: #cbd5e1;
  --od-shadow: rgba(15, 23, 42, 0.06);

  width: 100%;
  min-width: 0;

  min-height: 100vh;
  min-height: 100dvh;

  background: var(--od-bg);
  color: var(--od-text);

  font-family:
    'Outfit',
    sans-serif;

  padding: 28px 32px;

  overflow-x: hidden;

  transition:
    background 0.25s ease,
    color 0.25s ease;
}`;
