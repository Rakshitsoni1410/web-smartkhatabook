import { useCallback, useEffect, useRef, useState } from "react";

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
  FiRefreshCw,
  FiAlertCircle,
  FiCreditCard,
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
// MONEY
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

  const [refreshing, setRefreshing] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [pageError, setPageError] = useState("");

  const [advanceInput, setAdvanceInput] = useState("");

  const [toast, setToast] = useState({
    msg: "",
    type: "success",
  });

  const toastTimerRef = useRef(null);

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
      // ignore
    }
  }, [darkMode]);

  // =====================================================
  // TOAST
  // =====================================================

  const showToast = (msg, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      msg,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast({
        msg: "",
        type: "success",
      });
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // =====================================================
  // FETCH ORDER
  // =====================================================

  const fetchOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!user?._id || !id) {
        setPageError("Unable to load this order.");

        setLoading(false);

        return;
      }

      if (role !== "retailer" && role !== "wholesaler") {
        setPageError("You do not have access to this order.");

        setLoading(false);

        return;
      }

      try {
        if (!silent) {
          setRefreshing(true);
        }

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

        setPageError("");
      } catch (error) {
        console.error("FETCH ORDER ERROR:", error);

        setPageError(
          error?.response?.data?.message || "Unable to load order details.",
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [id, role, user?._id],
  );

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchOrder();

    const timer = setInterval(() => {
      fetchOrder({
        silent: true,
      });
    }, 5000);

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

      await fetchOrder({
        silent: true,
      });
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
  // PAYMENT MODAL
  // =====================================================

  const openPaymentGateway = (type, amount) => {
    setPaymentModal({
      open: true,
      type,
      amount: Number(amount || 0),
    });
  };

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

      setPaymentModal({
        open: false,
        type: "",
        amount: 0,
      });

      await fetchOrder({
        silent: true,
      });
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

    /*
        Prevent 0%.
      */
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      showToast("Enter percentage between 1 and 100", "error");

      return;
    }

    try {
      setUpdating(true);

      await api.patch(`/api/orders/${id}/request-advance`, {
        advancePercentage: percentage,
      });

      showToast(`Advance request sent (${percentage}%)`);

      setAdvanceInput("");

      await fetchOrder({
        silent: true,
      });
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
  // REQUEST FINAL
  // =====================================================

  const requestFinalPayment = async () => {
    try {
      setUpdating(true);

      await api.patch(`/api/orders/${id}/request-final-payment`);

      showToast("Final payment requested");

      await fetchOrder({
        silent: true,
      });
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
      shadow: "rgba(245,158,11,.30)",
    },

    approved: {
      color: "#ffffff",
      bg: "#6366f1",
      label: "Approved",
      shadow: "rgba(99,102,241,.30)",
    },

    advancePending: {
      color: "#ffffff",
      bg: "#f59e0b",
      label: "Advance Pending",
      shadow: "rgba(245,158,11,.30)",
    },

    processing: {
      color: "#ffffff",
      bg: "#8b5cf6",
      label: "Processing",
      shadow: "rgba(139,92,246,.30)",
    },

    onTheWay: {
      color: "#ffffff",
      bg: "#0ea5e9",
      label: "On The Way",
      shadow: "rgba(14,165,233,.30)",
    },

    delivered: {
      color: "#ffffff",
      bg: "#22c55e",
      label: "Delivered",
      shadow: "rgba(34,197,94,.30)",
    },

    completed: {
      color: "#ffffff",
      bg: "#10b981",
      label: "Completed",
      shadow: "rgba(16,185,129,.30)",
    },

    rejected: {
      color: "#ffffff",
      bg: "#ef4444",
      label: "Rejected",
      shadow: "rgba(239,68,68,.30)",
    },
  };

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
      label: status || "Unknown",
      shadow: "rgba(0,0,0,.10)",
    };

  const getPaymentStatus = (status) =>
    paymentStatusConfig[status] || {
      label: status || "Unknown",
      color: "#64748b",
      bg: "#64748b18",
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className={`od-page ${darkMode ? "od-dark" : ""}`}>
          <div className="od-state-card">
            <div className="od-loader" />

            <h2>Loading order</h2>

            <p>Fetching the latest order details...</p>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (pageError && !order) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className={`od-page ${darkMode ? "od-dark" : ""}`}>
          <div className="od-state-card">
            <FiAlertCircle size={34} />

            <h2>Unable to load order</h2>

            <p>{pageError}</p>

            <div className="od-state-actions">
              <button className="od-primary-btn" onClick={() => fetchOrder()}>
                <FiRefreshCw />
                Retry
              </button>

              <button
                className="od-simple-btn"
                onClick={() => navigate("/orders")}
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!order) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className={`od-page ${darkMode ? "od-dark" : ""}`}>
          <div className="od-state-card">
            <FiXCircle size={34} />

            <h2>Order not found</h2>

            <p>This order may no longer be available.</p>

            <button
              className="od-primary-btn"
              onClick={() => navigate("/orders")}
            >
              <FiArrowLeft />
              Back to Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // CURRENT STATE
  // =====================================================

  const s = getStatus(order.orderStatus);

  const ps = getPaymentStatus(order.paymentStatus);

  const isDelivered =
    order.orderStatus === "delivered" || order.orderStatus === "completed";

  const isRejected = order.orderStatus === "rejected";

  const statusLocked = isDelivered || isRejected;

  const canApprove = !statusLocked && order.orderStatus === "pending";

  const canReject = !statusLocked && order.orderStatus === "pending";

  const canOnTheWay = !statusLocked && order.orderStatus === "processing";

  const canDeliver = !statusLocked && order.orderStatus === "onTheWay";

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
      icon: <FiCheckCircle />,
      bg: "#6366f1",

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
      icon: <FiTruck />,
      bg: "#0ea5e9",

      isActive: order.orderStatus === "onTheWay",

      isDone: ["delivered", "completed", "rejected"].includes(
        order.orderStatus,
      ),

      canClick: canOnTheWay,
    },

    {
      label: "Delivered",
      clickStatus: "delivered",
      icon: <FiCheckCircle />,
      bg: "#22c55e",

      isActive: ["delivered", "completed"].includes(order.orderStatus),

      isDone: order.orderStatus === "rejected",

      canClick: canDeliver,
    },

    {
      label: "Reject",
      clickStatus: "rejected",
      icon: <FiXCircle />,
      bg: "#ef4444",

      isActive: order.orderStatus === "rejected",

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
        {/* TOAST */}

        {toast.msg && (
          <div
            className={`od-toast ${
              toast.type === "success" ? "od-toast-success" : "od-toast-error"
            }`}
          >
            {toast.type === "success" ? <FiCheckCircle /> : <FiXCircle />}

            <span>{toast.msg}</span>
          </div>
        )}

        <div className="od-shell">
          {/* TOPBAR */}

          <header className="od-topbar">
            <div className="od-topbar-left">
              <button
                type="button"
                className="od-icon-btn od-back-btn"
                onClick={() => navigate("/orders")}
                aria-label="Back to orders"
              >
                <FiArrowLeft />
              </button>

              <div className="od-heading">
                <h1>Order Details</h1>

                <div className="od-order-id">
                  <FiHash />

                  <span>{id?.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="od-topbar-actions">
              <button
                type="button"
                className="od-icon-btn"
                onClick={() => fetchOrder()}
                disabled={refreshing}
                aria-label="Refresh order"
                title="Refresh"
              >
                <FiRefreshCw className={refreshing ? "od-spin" : ""} />
              </button>

              <button
                type="button"
                className="od-icon-btn"
                onClick={() => setDarkMode((previous) => !previous)}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? <FiSun /> : <FiMoon />}
              </button>

              <span
                className="od-status-badge"
                style={{
                  background: s.bg,
                  color: s.color,
                  boxShadow: `0 5px 15px ${s.shadow}`,
                }}
              >
                <span className="od-status-dot" />

                {s.label}
              </span>
            </div>
          </header>

          {/* SUMMARY */}

          <section className="od-summary-grid">
            {/* PRODUCT */}

            <article className="od-card">
              <div
                className="od-card-strip"
                style={{
                  background: s.bg,
                }}
              />

              <div className="od-card-body">
                <div className="od-card-heading">
                  <div
                    className="od-card-icon"
                    style={{
                      background: `${s.bg}18`,
                      color: s.bg,
                    }}
                  >
                    <FiPackage />
                  </div>

                  <div>
                    <h2>{order.productName || "Product"}</h2>

                    <p>Product Details</p>
                  </div>
                </div>

                <div className="od-detail-list">
                  <DetailRow
                    icon={<FiPackage />}
                    label="Quantity"
                    value={`${order.quantity || 0} ${order.unit || "units"}`}
                  />

                  <DetailRow
                    icon={<RupeeIcon />}
                    label="Price / Unit"
                    value={formatMoney(order.pricePerUnit)}
                  />

                  <DetailRow
                    icon={<RupeeIcon />}
                    label="Total Amount"
                    value={formatMoney(order.totalAmount)}
                    strong
                  />

                  <DetailRow
                    icon={<FiClock />}
                    label="Payment Status"
                    noBorder
                    value={
                      <span
                        className="od-payment-badge"
                        style={{
                          color: ps.color,
                          background: ps.bg,
                        }}
                      >
                        {ps.label}
                      </span>
                    }
                  />
                </div>
              </div>
            </article>

            {/* PAYMENT */}

            <article className="od-card">
              <div className="od-card-strip od-green-strip" />

              <div className="od-card-body">
                <div className="od-card-heading">
                  <div className="od-card-icon od-green-icon">
                    <FiCreditCard />
                  </div>

                  <div>
                    <h2>Payment Details</h2>

                    <p>Wholesaler payment policy</p>
                  </div>
                </div>

                <div className="od-detail-list">
                  <DetailRow
                    icon={<RupeeIcon />}
                    label="Advance Policy"
                    value={
                      Number(order.advancePercentage) > 0
                        ? `${order.advancePercentage}%`
                        : "No Advance"
                    }
                  />

                  {Number(order.advancePercentage) > 0 && (
                    <DetailRow
                      icon={<RupeeIcon />}
                      label="Advance Amount"
                      value={
                        <span className="od-advance-value">
                          {formatMoney(order.advanceAmount)}

                          {order.advancePaid && (
                            <span className="od-paid-small">✓ Paid</span>
                          )}
                        </span>
                      }
                    />
                  )}

                  <DetailRow
                    icon={<RupeeIcon />}
                    label="Remaining Amount"
                    value={formatMoney(order.remainingAmount)}
                    strong
                  />

                  <DetailRow
                    icon={<FiTruck />}
                    label="Delivery Date"
                    value={
                      order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "Not Assigned"
                    }
                  />

                  <DetailRow
                    icon={<FiClock />}
                    label="Payment Status"
                    noBorder
                    value={
                      <span
                        className="od-payment-badge"
                        style={{
                          color: ps.color,
                          background: ps.bg,
                        }}
                      >
                        {ps.label}
                      </span>
                    }
                  />
                </div>
              </div>
            </article>
          </section>

          {/* WHOLESALER */}

          {role === "wholesaler" && (
            <section className="od-actions-card">
              <div className="od-section-heading">
                <div>
                  <h2>Update Order Status</h2>

                  <p>Manage fulfillment and payment requests.</p>
                </div>
              </div>

              <div className="od-actions-grid">
                {statusButtons.map((btn) => {
                  const disabled =
                    updating || !btn.canClick || btn.isActive || btn.isDone;

                  return (
                    <button
                      type="button"
                      key={btn.clickStatus}
                      className={`od-action-btn ${
                        btn.isActive ? "od-action-btn-active" : ""
                      }`}
                      disabled={disabled}
                      onClick={() => updateStatus(btn.clickStatus)}
                      style={{
                        "--action-color": btn.bg,

                        background: btn.isActive ? btn.bg : "var(--od-card)",

                        color: btn.isActive ? "#fff" : btn.bg,

                        borderColor: btn.isActive ? btn.bg : `${btn.bg}66`,
                      }}
                    >
                      {btn.icon}

                      <span>{btn.label}</span>

                      {btn.isActive && (
                        <span className="od-action-check">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isDelivered && (
                <div className="od-terminal-message od-terminal-success">
                  <FiCheckCircle />

                  <span>Order delivered. Status can no longer be changed.</span>
                </div>
              )}

              {isRejected && (
                <div className="od-terminal-message od-terminal-error">
                  <FiXCircle />

                  <span>Order rejected. Status can no longer be changed.</span>
                </div>
              )}

              <div className="od-payment-actions">
                {canRequestAdvance && (
                  <div className="od-request-box od-warning-box">
                    <div className="od-request-heading">
                      <div>
                        <h3>Request Advance Payment</h3>

                        <p>Choose a percentage required before dispatch.</p>
                      </div>
                    </div>

                    <div className="od-advance-form">
                      <div className="od-percentage-input-wrap">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Example: 20"
                          value={advanceInput}
                          onChange={(event) => {
                            const raw = event.target.value;

                            if (raw === "") {
                              setAdvanceInput("");

                              return;
                            }

                            let value = Number(raw);

                            if (value < 1) {
                              value = 1;
                            }

                            if (value > 100) {
                              value = 100;
                            }

                            setAdvanceInput(value);
                          }}
                        />

                        <span>%</span>
                      </div>

                      <button
                        type="button"
                        className="od-request-btn od-warning-btn"
                        onClick={requestAdvancePayment}
                        disabled={updating}
                      >
                        <RupeeIcon />
                        Send Request
                      </button>
                    </div>
                  </div>
                )}

                {order.advanceRequested && (
                  <div
                    className={`od-status-message ${
                      order.advancePaid
                        ? "od-status-success"
                        : "od-status-warning"
                    }`}
                  >
                    <RupeeIcon />

                    <span>
                      {order.advancePaid
                        ? `Advance received — ${formatMoney(
                            order.advanceAmount,
                          )}`
                        : `Advance requested — waiting for retailer (${formatMoney(
                            order.advanceAmount,
                          )})`}
                    </span>
                  </div>
                )}

                {canRequestFinal && (
                  <button
                    type="button"
                    className="od-request-btn od-final-btn"
                    onClick={requestFinalPayment}
                    disabled={updating}
                  >
                    <FiCheckCircle />
                    Request Final Payment ({formatMoney(order.remainingAmount)})
                  </button>
                )}

                {order.finalPaymentRequested && !order.fullPaymentDone && (
                  <div className="od-status-message od-status-info">
                    <FiClock />

                    <span>
                      Final payment requested — waiting for retailer (
                      {formatMoney(order.remainingAmount)})
                    </span>
                  </div>
                )}

                {order.fullPaymentDone && (
                  <div className="od-status-message od-status-success">
                    <FiCheckCircle />

                    <span>
                      Full payment received — {formatMoney(order.totalAmount)}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* RETAILER */}

          {role === "retailer" && (
            <section className="od-actions-card">
              <div className="od-section-heading">
                <div>
                  <h2>Payment Actions</h2>

                  <p>Complete requested payments for this order.</p>
                </div>
              </div>

              <div className="od-payment-actions">
                {order.advanceRequested && !order.advancePaid && (
                  <div className="od-request-box od-warning-box">
                    <div className="od-request-heading">
                      <div>
                        <h3>Advance Payment Requested</h3>

                        <p>
                          Your wholesaler requires{" "}
                          <strong>{order.advancePercentage}%</strong> before
                          dispatch.
                        </p>
                      </div>
                    </div>

                    <div className="od-payment-due">
                      <span>Amount due</span>

                      <strong>{formatMoney(order.advanceAmount)}</strong>
                    </div>

                    <button
                      type="button"
                      className="od-request-btn od-warning-btn od-full-btn"
                      onClick={() =>
                        openPaymentGateway("advance", order.advanceAmount)
                      }
                      disabled={updating}
                    >
                      <RupeeIcon />
                      Pay Advance {formatMoney(order.advanceAmount)}
                    </button>
                  </div>
                )}

                {order.advancePaid &&
                  !order.finalPaymentRequested &&
                  !order.fullPaymentDone && (
                    <div className="od-center-message od-purple-message">
                      <FiCheckCircle />

                      <div>
                        <strong>
                          Advance Paid — {formatMoney(order.advanceAmount)}
                        </strong>

                        <span>
                          Waiting for delivery & final payment request
                        </span>
                      </div>
                    </div>
                  )}

                {order.finalPaymentRequested && !order.fullPaymentDone && (
                  <div className="od-request-box od-success-box">
                    <div className="od-request-heading">
                      <div>
                        <h3>Final Payment Requested</h3>

                        <p>The remaining balance is ready for payment.</p>
                      </div>
                    </div>

                    <div className="od-payment-due od-payment-due-green">
                      <span>Remaining</span>

                      <strong>{formatMoney(order.remainingAmount)}</strong>
                    </div>

                    <button
                      type="button"
                      className="od-request-btn od-final-btn od-full-btn"
                      onClick={() =>
                        openPaymentGateway("final", order.remainingAmount)
                      }
                      disabled={updating}
                    >
                      <RupeeIcon />
                      Complete Payment {formatMoney(order.remainingAmount)}
                    </button>
                  </div>
                )}

                {order.fullPaymentDone && (
                  <div className="od-center-message od-green-message">
                    <FiCheckCircle />

                    <div>
                      <strong>
                        Order fully paid — {formatMoney(order.totalAmount)}
                      </strong>

                      <span>No further payment is required.</span>
                    </div>
                  </div>
                )}

                {!order.advanceRequested &&
                  !order.finalPaymentRequested &&
                  !order.fullPaymentDone &&
                  order.paymentStatus !== "paid" && (
                    <div className="od-waiting-message">
                      <FiClock />

                      <span>
                        {order.orderStatus === "pending"
                          ? "Waiting for wholesaler to approve your order."
                          : order.orderStatus === "rejected"
                            ? "This order was rejected."
                            : order.orderStatus === "delivered"
                              ? "Waiting for final payment request."
                              : "Waiting for wholesaler payment request."}
                      </span>
                    </div>
                  )}
              </div>
            </section>
          )}
        </div>

        {/* PAYMENT MODAL */}

        <FakePaymentModal
          open={paymentModal.open}
          amount={paymentModal.amount}
          paymentType={paymentModal.type}
          orderId={id}
          onClose={closePaymentGateway}
          onConfirm={handleFakePaymentConfirm}
        />
      </div>
    </>
  );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({ icon, label, value, strong = false, noBorder = false }) {
  return (
    <div className={`od-info-row ${noBorder ? "od-info-row-last" : ""}`}>
      <span className="od-info-label">
        <span className="od-info-label-icon">{icon}</span>

        {label}
      </span>

      <span className={`od-info-value ${strong ? "od-info-value-strong" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// =====================================================
// ALL STYLES IN THIS FILE
// =====================================================

const pageStyles = `
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap");

/* =========================================================
   PAGE RESET
   ========================================================= */

.od-page,
.od-page *,
.od-page *::before,
.od-page *::after {
  box-sizing: border-box;
}

/* =========================================================
   VARIABLES
   ========================================================= */

.od-page {
  --od-bg: #f3f6fb;
  --od-card: #ffffff;
  --od-card-soft: #f8fafc;
  --od-text: #0f172a;
  --od-secondary: #475569;
  --od-muted: #94a3b8;
  --od-border: #e6ebf2;
  --od-row-border: #edf1f6;
  --od-hover: #f1f5f9;
  --od-input: #ffffff;
  --od-input-border: #cbd5e1;
  --od-shadow: 0 12px 35px rgba(15, 23, 42, 0.065);

  width: 100%;
  min-width: 0;

  min-height: 100vh;
  min-height: 100dvh;

  margin: 0;

  padding:
    max(22px, env(safe-area-inset-top))
    max(22px, env(safe-area-inset-right))
    max(28px, env(safe-area-inset-bottom))
    max(22px, env(safe-area-inset-left));

  overflow-x: hidden;

  background: var(--od-bg);
  color: var(--od-text);

  font-family:
    "Outfit",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  transition:
    background .2s ease,
    color .2s ease;
}

/* =========================================================
   DARK
   ========================================================= */

.od-page.od-dark {
  --od-bg: #090f1d;
  --od-card: #111827;
  --od-card-soft: #172033;
  --od-text: #f8fafc;
  --od-secondary: #cbd5e1;
  --od-muted: #8290a5;
  --od-border: #283548;
  --od-row-border: #223044;
  --od-hover: #182438;
  --od-input: #111827;
  --od-input-border: #37465d;
  --od-shadow: 0 18px 45px rgba(0,0,0,.26);

  color-scheme: dark;
}

/* =========================================================
   SHELL
   ========================================================= */

.od-shell {
  width: min(100%, 1120px);

  margin-inline: auto;

  display: flex;
  flex-direction: column;

  gap: 18px;
}

/* =========================================================
   TOP BAR
   ========================================================= */

.od-topbar {
  width: 100%;

  min-width: 0;

  padding: 16px;

  border: 1px solid var(--od-border);
  border-radius: 18px;

  background: var(--od-card);

  box-shadow: var(--od-shadow);

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;
}

.od-topbar-left {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 12px;
}

.od-heading {
  min-width: 0;
}

.od-heading h1 {
  margin: 0;

  color: var(--od-text);

  font-size: clamp(19px, 2.5vw, 25px);
  font-weight: 800;

  line-height: 1.2;

  letter-spacing: -.035em;
}

.od-order-id {
  margin-top: 5px;

  color: var(--od-muted);

  display: flex;
  align-items: center;

  gap: 3px;

  font-size: 11px;
  font-weight: 700;

  letter-spacing: .04em;
}

.od-order-id svg {
  width: 11px;
  height: 11px;
}

.od-topbar-actions {
  flex-shrink: 0;

  display: flex;
  align-items: center;

  gap: 8px;
}

/* =========================================================
   ICON BUTTON
   ========================================================= */

.od-icon-btn {
  width: 40px;
  height: 40px;

  flex: 0 0 40px;

  padding: 0;

  border: 1px solid var(--od-border);
  border-radius: 11px;

  background: var(--od-card-soft);
  color: var(--od-secondary);

  display: grid;
  place-items: center;

  cursor: pointer;

  transition:
    transform .15s ease,
    background .15s ease,
    color .15s ease,
    border-color .15s ease;
}

.od-icon-btn svg {
  width: 18px;
  height: 18px;
}

.od-icon-btn:hover:not(:disabled) {
  transform: translateY(-1px);

  background: var(--od-hover);

  color: #6366f1;

  border-color: rgba(99,102,241,.28);
}

.od-icon-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.od-back-btn {
  color: #6366f1;
}

/* =========================================================
   STATUS
   ========================================================= */

.od-status-badge {
  min-height: 36px;

  padding: 8px 13px;

  border-radius: 20px;

  display: inline-flex;
  align-items: center;

  gap: 7px;

  font-size: 11px;
  font-weight: 800;

  white-space: nowrap;
}

.od-status-dot {
  width: 7px;
  height: 7px;

  flex: 0 0 7px;

  border-radius: 50%;

  background: currentColor;

  opacity: .9;
}

/* =========================================================
   GRID
   ========================================================= */

.od-summary-grid {
  width: 100%;

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 18px;
}

/* =========================================================
   CARD
   ========================================================= */

.od-card,
.od-actions-card {
  min-width: 0;

  border: 1px solid var(--od-border);

  border-radius: 18px;

  background: var(--od-card);

  overflow: hidden;

  box-shadow: var(--od-shadow);
}

.od-card {
  position: relative;
}

.od-card-strip {
  width: 100%;
  height: 4px;
}

.od-green-strip {
  background: #22c55e;
}

.od-card-body {
  padding: 20px;
}

.od-card-heading {
  min-width: 0;

  margin-bottom: 18px;

  display: flex;
  align-items: center;

  gap: 12px;
}

.od-card-icon {
  width: 43px;
  height: 43px;

  flex: 0 0 43px;

  border-radius: 12px;

  display: grid;
  place-items: center;
}

.od-card-icon svg {
  width: 21px;
  height: 21px;
}

.od-green-icon {
  background: rgba(34,197,94,.11);

  color: #22c55e;
}

.od-card-heading > div:last-child {
  min-width: 0;
}

.od-card-heading h2 {
  margin: 0;

  overflow-wrap: anywhere;

  color: var(--od-text);

  font-size: 15px;
  font-weight: 800;

  line-height: 1.3;
}

.od-card-heading p {
  margin: 3px 0 0;

  color: var(--od-muted);

  font-size: 10px;
  font-weight: 500;

  line-height: 1.4;
}

/* =========================================================
   DETAIL LIST
   ========================================================= */

.od-detail-list {
  display: flex;
  flex-direction: column;
}

.od-info-row {
  min-width: 0;

  min-height: 49px;

  padding: 11px 0;

  border-bottom: 1px solid var(--od-row-border);

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;
}

.od-info-row-last {
  border-bottom: none;
}

.od-info-label {
  min-width: 0;

  color: var(--od-muted);

  display: flex;
  align-items: center;

  gap: 7px;

  font-size: 11px;
  font-weight: 600;
}

.od-info-label-icon {
  width: 18px;
  height: 18px;

  flex: 0 0 18px;

  display: grid;
  place-items: center;
}

.od-info-label-icon svg {
  width: 13px;
  height: 13px;
}

.od-info-value {
  min-width: 0;

  color: var(--od-text);

  font-size: 12px;
  font-weight: 700;

  text-align: right;

  overflow-wrap: anywhere;
}

.od-info-value-strong {
  color: #6366f1;

  font-size: 14px;

  font-weight: 800;
}

.od-payment-badge {
  max-width: 100%;

  padding: 5px 9px;

  border-radius: 20px;

  display: inline-flex;

  font-size: 10px;

  font-weight: 800;

  line-height: 1.2;

  white-space: normal;
}

.od-advance-value {
  display: inline-flex;
  align-items: center;

  justify-content: flex-end;

  gap: 5px;

  flex-wrap: wrap;
}

.od-paid-small {
  padding: 2px 6px;

  border-radius: 20px;

  background: rgba(34,197,94,.11);

  color: #22c55e;

  font-size: 9px;
}

/* =========================================================
   ACTION CARD
   ========================================================= */

.od-actions-card {
  padding: 21px;
}

.od-section-heading {
  margin-bottom: 17px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.od-section-heading h2 {
  margin: 0;

  color: var(--od-text);

  font-size: 16px;

  font-weight: 800;
}

.od-section-heading p {
  margin: 4px 0 0;

  color: var(--od-muted);

  font-size: 10px;

  line-height: 1.5;
}

/* =========================================================
   STATUS ACTION GRID
   ========================================================= */

.od-actions-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 9px;
}

.od-action-btn {
  min-width: 0;

  min-height: 43px;

  padding: 9px 11px;

  border: 1.5px solid;

  border-radius: 11px;

  font-family: inherit;

  font-size: 10px;
  font-weight: 800;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  cursor: pointer;

  transition:
    transform .15s ease,
    filter .15s ease,
    opacity .15s ease,
    box-shadow .15s ease;
}

.od-action-btn svg {
  width: 14px;
  height: 14px;

  flex-shrink: 0;
}

.od-action-btn:hover:not(:disabled) {
  transform: translateY(-1px);

  filter: brightness(.98);
}

.od-action-btn:disabled {
  cursor: not-allowed;

  opacity: .38;
}

.od-action-btn-active:disabled {
  opacity: 1;
}

.od-action-check {
  font-size: 11px;
}

/* =========================================================
   TERMINAL MESSAGE
   ========================================================= */

.od-terminal-message {
  margin-top: 13px;

  padding: 11px 13px;

  border-radius: 11px;

  display: flex;
  align-items: center;

  gap: 8px;

  font-size: 10px;

  font-weight: 700;

  line-height: 1.45;
}

.od-terminal-message svg {
  flex-shrink: 0;
}

.od-terminal-success {
  border: 1px solid rgba(34,197,94,.22);

  background: rgba(34,197,94,.08);

  color: #16a34a;
}

.od-terminal-error {
  border: 1px solid rgba(239,68,68,.22);

  background: rgba(239,68,68,.08);

  color: #ef4444;
}

/* =========================================================
   PAYMENT ACTIONS
   ========================================================= */

.od-payment-actions {
  margin-top: 16px;

  display: flex;
  flex-direction: column;

  gap: 11px;
}

.od-request-box {
  padding: 16px;

  border: 1px solid;

  border-radius: 14px;
}

.od-warning-box {
  border-color: rgba(245,158,11,.22);

  background: rgba(245,158,11,.065);
}

.od-success-box {
  border-color: rgba(34,197,94,.22);

  background: rgba(34,197,94,.065);
}

.od-request-heading {
  margin-bottom: 13px;
}

.od-request-heading h3 {
  margin: 0;

  color: var(--od-text);

  font-size: 13px;

  font-weight: 800;
}

.od-request-heading p {
  margin: 4px 0 0;

  color: var(--od-muted);

  font-size: 10px;

  line-height: 1.55;
}

.od-advance-form {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr) auto;

  gap: 9px;
}

.od-percentage-input-wrap {
  position: relative;

  min-width: 0;
}

.od-percentage-input-wrap input {
  width: 100%;

  min-height: 42px;

  padding: 9px 38px 9px 12px;

  border: 1px solid var(--od-input-border);

  border-radius: 10px;

  outline: none;

  background: var(--od-input);

  color: var(--od-text);

  font-family: inherit;

  font-size: 12px;

  transition:
    border-color .15s ease,
    box-shadow .15s ease;
}

.od-percentage-input-wrap input:focus {
  border-color: #6366f1;

  box-shadow:
    0 0 0 3px rgba(99,102,241,.10);
}

.od-percentage-input-wrap > span {
  position: absolute;

  right: 13px;
  top: 50%;

  transform: translateY(-50%);

  color: var(--od-muted);

  font-size: 12px;

  font-weight: 800;
}

/* =========================================================
   REQUEST BUTTONS
   ========================================================= */

.od-request-btn {
  min-height: 42px;

  padding: 10px 15px;

  border: none;

  border-radius: 10px;

  color: #ffffff;

  font-family: inherit;

  font-size: 10px;

  font-weight: 800;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  cursor: pointer;

  transition:
    transform .15s ease,
    filter .15s ease,
    opacity .15s ease,
    box-shadow .15s ease;
}

.od-request-btn:hover:not(:disabled) {
  transform: translateY(-1px);

  filter: brightness(1.04);
}

.od-request-btn:disabled {
  opacity: .55;

  cursor: not-allowed;
}

.od-warning-btn {
  background:
    linear-gradient(135deg,#f59e0b,#ea580c);

  box-shadow:
    0 6px 18px rgba(245,158,11,.22);
}

.od-final-btn {
  background:
    linear-gradient(135deg,#16a34a,#22c55e);

  box-shadow:
    0 6px 18px rgba(34,197,94,.20);
}

.od-full-btn {
  width: 100%;
}

/* =========================================================
   PAYMENT DUE
   ========================================================= */

.od-payment-due {
  margin-bottom: 12px;

  padding: 11px 13px;

  border-radius: 10px;

  background: rgba(245,158,11,.09);

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.od-payment-due span {
  color: var(--od-muted);

  font-size: 10px;

  font-weight: 700;
}

.od-payment-due strong {
  color: #f59e0b;

  font-size: 15px;

  font-weight: 800;
}

.od-payment-due-green {
  background: rgba(34,197,94,.09);
}

.od-payment-due-green strong {
  color: #22c55e;
}

/* =========================================================
   STATUS MESSAGES
   ========================================================= */

.od-status-message,
.od-waiting-message {
  min-width: 0;

  padding: 12px 13px;

  border: 1px solid;

  border-radius: 11px;

  display: flex;
  align-items: center;

  gap: 8px;

  font-size: 10px;

  font-weight: 700;

  line-height: 1.5;

  overflow-wrap: anywhere;
}

.od-status-message svg,
.od-waiting-message svg {
  flex-shrink: 0;
}

.od-status-success {
  border-color: rgba(34,197,94,.22);

  background: rgba(34,197,94,.08);

  color: #16a34a;
}

.od-status-warning {
  border-color: rgba(245,158,11,.24);

  background: rgba(245,158,11,.08);

  color: #d97706;
}

.od-status-info {
  border-color: rgba(14,165,233,.22);

  background: rgba(14,165,233,.08);

  color: #0284c7;
}

.od-waiting-message {
  border-color: var(--od-border);

  background: var(--od-card-soft);

  color: var(--od-secondary);
}

/* =========================================================
   CENTER MESSAGES
   ========================================================= */

.od-center-message {
  min-width: 0;

  padding: 16px;

  border: 1px solid;

  border-radius: 13px;

  display: flex;
  align-items: center;

  gap: 11px;
}

.od-center-message > svg {
  width: 20px;
  height: 20px;

  flex-shrink: 0;
}

.od-center-message > div {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 3px;
}

.od-center-message strong {
  font-size: 11px;

  font-weight: 800;

  overflow-wrap: anywhere;
}

.od-center-message span {
  font-size: 9px;

  line-height: 1.5;

  opacity: .75;
}

.od-purple-message {
  border-color: rgba(139,92,246,.22);

  background: rgba(139,92,246,.08);

  color: #8b5cf6;
}

.od-green-message {
  border-color: rgba(34,197,94,.22);

  background: rgba(34,197,94,.08);

  color: #16a34a;
}

/* =========================================================
   TOAST
   ========================================================= */

.od-toast {
  position: fixed;

  top:
    max(18px, env(safe-area-inset-top));

  left: 50%;

  z-index: 99999;

  max-width:
    calc(100vw - 32px);

  padding: 11px 15px;

  border-radius: 11px;

  color: #ffffff;

  display: flex;
  align-items: center;

  gap: 7px;

  font-size: 11px;

  font-weight: 800;

  box-shadow:
    0 12px 35px rgba(15,23,42,.22);

  transform:
    translateX(-50%);

  animation:
    odToastIn .2s ease;
}

.od-toast svg {
  flex-shrink: 0;
}

.od-toast-success {
  background: #16a34a;
}

.od-toast-error {
  background: #dc2626;
}

@keyframes odToastIn {
  from {
    opacity: 0;

    transform:
      translate(-50%, -8px);
  }

  to {
    opacity: 1;

    transform:
      translate(-50%, 0);
  }
}

/* =========================================================
   LOADING / ERROR STATE
   ========================================================= */

.od-state-card {
  width:
    min(100%, 410px);

  min-height: 260px;

  margin:
    min(12vh, 100px) auto 0;

  padding: 30px;

  border: 1px solid var(--od-border);

  border-radius: 18px;

  background: var(--od-card);

  color: var(--od-text);

  box-shadow: var(--od-shadow);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.od-state-card > svg {
  margin-bottom: 12px;

  color: #6366f1;
}

.od-state-card h2 {
  margin: 0 0 6px;

  font-size: 17px;

  font-weight: 800;
}

.od-state-card p {
  margin: 0;

  color: var(--od-muted);

  font-size: 11px;

  line-height: 1.6;
}

.od-state-actions {
  width: 100%;

  margin-top: 18px;

  display: flex;
  justify-content: center;

  gap: 8px;
}

.od-primary-btn,
.od-simple-btn {
  min-height: 40px;

  padding: 9px 14px;

  border-radius: 10px;

  font-family: inherit;

  font-size: 10px;

  font-weight: 800;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  cursor: pointer;
}

.od-primary-btn {
  border: none;

  background:
    linear-gradient(135deg,#6366f1,#4f46e5);

  color: #fff;
}

.od-simple-btn {
  border: 1px solid var(--od-border);

  background: var(--od-card-soft);

  color: var(--od-secondary);
}

.od-loader {
  width: 40px;
  height: 40px;

  margin-bottom: 15px;

  border:
    3px solid var(--od-border);

  border-top-color: #6366f1;

  border-radius: 50%;

  animation:
    odSpin .7s linear infinite;
}

.od-spin {
  animation:
    odSpin .7s linear infinite;
}

@keyframes odSpin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 900px) {
  .od-page {
    padding:
      max(18px, env(safe-area-inset-top))
      18px
      max(24px, env(safe-area-inset-bottom));
  }

  .od-summary-grid {
    gap: 14px;
  }

  .od-actions-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 680px) {
  .od-page {
    padding:
      max(12px, env(safe-area-inset-top))
      12px
      max(20px, env(safe-area-inset-bottom));
  }

  .od-shell {
    gap: 12px;
  }

  .od-topbar {
    padding: 13px;

    border-radius: 15px;

    align-items: flex-start;
  }

  .od-topbar-left {
    flex: 1;
  }

  .od-heading h1 {
    font-size: 18px;
  }

  .od-order-id {
    font-size: 9px;
  }

  .od-topbar-actions {
    gap: 5px;

    flex-wrap: wrap;

    justify-content: flex-end;
  }

  .od-icon-btn {
    width: 36px;
    height: 36px;

    flex-basis: 36px;

    border-radius: 10px;
  }

  .od-icon-btn svg {
    width: 16px;
    height: 16px;
  }

  .od-status-badge {
    width: 100%;

    min-height: 30px;

    margin-top: 3px;

    padding: 6px 9px;

    justify-content: center;

    font-size: 9px;
  }

  .od-summary-grid {
    grid-template-columns: 1fr;

    gap: 12px;
  }

  .od-card,
  .od-actions-card {
    border-radius: 15px;
  }

  .od-card-body,
  .od-actions-card {
    padding: 16px;
  }

  .od-card-heading {
    margin-bottom: 13px;
  }

  .od-info-row {
    min-height: 46px;

    gap: 10px;
  }

  .od-info-label {
    font-size: 10px;
  }

  .od-info-value {
    font-size: 11px;
  }

  .od-info-value-strong {
    font-size: 13px;
  }

  .od-section-heading h2 {
    font-size: 14px;
  }

  .od-actions-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .od-advance-form {
    grid-template-columns: 1fr;
  }

  .od-request-btn {
    width: 100%;
  }
}

/* =========================================================
   SMALL MOBILE
   ========================================================= */

@media (max-width: 420px) {
  .od-page {
    padding:
      max(8px, env(safe-area-inset-top))
      8px
      max(15px, env(safe-area-inset-bottom));
  }

  .od-topbar {
    gap: 8px;

    padding: 11px;
  }

  .od-heading h1 {
    font-size: 16px;
  }

  .od-order-id {
    max-width: 105px;

    overflow: hidden;

    text-overflow: ellipsis;
  }

  .od-topbar-actions {
    max-width: 96px;
  }

  .od-card-body,
  .od-actions-card {
    padding: 14px;
  }

  .od-card-icon {
    width: 39px;
    height: 39px;

    flex-basis: 39px;
  }

  .od-card-heading h2 {
    font-size: 13px;
  }

  .od-info-row {
    align-items: flex-start;
  }

  .od-info-label {
    max-width: 48%;

    line-height: 1.35;
  }

  .od-info-value {
    max-width: 52%;
  }

  .od-actions-grid {
    grid-template-columns: 1fr;
  }

  .od-action-btn {
    min-height: 42px;
  }

  .od-request-box {
    padding: 13px;
  }

  .od-payment-due {
    align-items: flex-start;

    flex-direction: column;

    gap: 3px;
  }

  .od-state-actions {
    flex-direction: column;
  }

  .od-primary-btn,
  .od-simple-btn {
    width: 100%;
  }
}

/* =========================================================
   VERY SMALL
   ========================================================= */

@media (max-width: 330px) {
  .od-topbar {
    flex-direction: column;
  }

  .od-topbar-actions {
    width: 100%;
    max-width: none;

    justify-content: flex-start;
  }

  .od-status-badge {
    width: auto;
  }

  .od-info-row {
    flex-direction: column;

    gap: 5px;
  }

  .od-info-label,
  .od-info-value {
    max-width: 100%;

    text-align: left;
  }

  .od-advance-value {
    justify-content: flex-start;
  }
}

/* =========================================================
   SHORT LANDSCAPE
   ========================================================= */

@media (max-height: 550px) and (min-width: 681px) {
  .od-page {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .od-card-body {
    padding: 15px;
  }

  .od-info-row {
    min-height: 42px;
    padding-block: 8px;
  }
}

/* =========================================================
   TOUCH
   ========================================================= */

@media (hover: none) {
  .od-icon-btn:hover:not(:disabled),
  .od-action-btn:hover:not(:disabled),
  .od-request-btn:hover:not(:disabled) {
    transform: none;
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
  .od-page *,
  .od-page *::before,
  .od-page *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;
