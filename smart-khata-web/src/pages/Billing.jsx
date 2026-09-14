import { useState, useEffect } from "react";
import {
  FiFileText,
  FiChevronLeft,
  FiSend,
  FiCheck,
  FiClock,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import api from "../api";
import GenerateBillButton from "../components/GenerateBillButton";

import "./Billing.css";

const STATUS_LABEL = {
  unpaid: "Unpaid",
  advanceRequested: "Advance Requested",
  advancePaid: "Advance Paid",
  partial: "Partially Paid",
  paid: "Paid",
};

const STATUS_CLASS = {
  unpaid: "bill-status--unpaid",
  advanceRequested: "bill-status--pending",
  advancePaid: "bill-status--pending",
  partial: "bill-status--pending",
  paid: "bill-status--paid",
};

const ORDER_STATUS_LABEL = {
  pending: "Pending",
  approved: "Approved",
  advancePending: "Advance Pending",
  processing: "Processing",
  onTheWay: "On The Way",
  delivered: "Delivered",
  completed: "Completed",
  rejected: "Rejected",
};

export default function Billing() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sendingBillId, setSendingBillId] = useState(null);

  // Confirmation modal
  const [billToSend, setBillToSend] = useState(null);

  const [sendError, setSendError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isWholesaler = user.role?.trim().toLowerCase() === "wholesaler";

  // ============================================
  // FETCH BILLS
  // ============================================

  useEffect(() => {
    fetchBills();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBills = async () => {
    if (!user._id) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoint = isWholesaler
        ? `/api/orders/billing/wholesaler/${user._id}`
        : `/api/orders/billing/retailer/${user._id}`;

      const res = await api.get(endpoint);

      setBills(res.data.bills || []);
    } catch (err) {
      console.error("Failed to load bills:", err);

      setError(
        err.response?.data?.message || "Couldn't load bills. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // COUNTER PARTY
  // ============================================

  const counterpartyOf = (bill) => {
    const other = isWholesaler ? bill.retailerId : bill.wholesalerId;

    return other?.shopName || other?.name || "Unknown";
  };

  // ============================================
  // BILL READY
  // ============================================

  const billIsReady = (bill) => {
    return ["delivered", "completed"].includes(bill.orderStatus);
  };

  // ============================================
  // OPEN CONFIRMATION DIALOG
  // ============================================

  const openSendConfirmation = (bill) => {
    setSendError("");
    setBillToSend(bill);
  };

  // ============================================
  // CLOSE CONFIRMATION DIALOG
  // ============================================

  const closeSendConfirmation = () => {
    if (sendingBillId) {
      return;
    }

    setBillToSend(null);
    setSendError("");
  };

  // ============================================
  // CONFIRM + SEND BILL
  // ============================================

  const handleConfirmSendBill = async () => {
    if (!billToSend?._id) {
      return;
    }

    try {
      setSendingBillId(billToSend._id);

      setSendError("");

      const res = await api.patch(`/api/orders/${billToSend._id}/send-bill`);

      if (res.data.success) {
        setBills((previousBills) =>
          previousBills.map((bill) =>
            bill._id === billToSend._id
              ? {
                  ...bill,

                  billSentToRetailer: true,

                  billSentAt:
                    res.data.bill?.billSentAt || new Date().toISOString(),
                }
              : bill,
          ),
        );

        // Close dialog after successful send
        setBillToSend(null);
      }
    } catch (err) {
      console.error("SEND BILL ERROR:", err);

      setSendError(
        err.response?.data?.message || "Failed to send bill to retailer.",
      );
    } finally {
      setSendingBillId(null);
    }
  };

  return (
    <div className="billing-page">
      {/* =====================================
          HEADER
      ====================================== */}

      <div className="billing-header">
        <button
          className="billing-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <FiChevronLeft size={18} />
        </button>

        <div>
          <h1>Billing</h1>

          <p>
            {isWholesaler
              ? "Generate and send bills after order delivery"
              : "Bills sent by your wholesalers"}
          </p>
        </div>
      </div>

      {/* =====================================
          LOADING
      ====================================== */}

      {loading && <div className="billing-empty">Loading bills…</div>}

      {/* =====================================
          ERROR
      ====================================== */}

      {!loading && error && (
        <div className="billing-empty billing-error">
          <p>{error}</p>

          <button type="button" onClick={fetchBills}>
            Try Again
          </button>
        </div>
      )}

      {/* =====================================
          NO BILLS
      ====================================== */}

      {!loading && !error && bills.length === 0 && (
        <div className="billing-empty">
          <FiFileText size={28} />

          <p>
            {isWholesaler
              ? "No orders available for billing yet."
              : "No bills have been sent to you yet."}
          </p>
        </div>
      )}

      {/* =====================================
          BILL LIST
      ====================================== */}

      {!loading && !error && bills.length > 0 && (
        <div className="billing-list">
          {bills.map((bill) => {
            const canUseBill = billIsReady(bill);

            return (
              <div className="bill-card" key={bill._id}>
                {/* =========================
                        TOP
                    ========================== */}

                <div className="bill-card-top">
                  <div>
                    <div className="bill-invoice-no">
                      {bill.invoiceNumber || "Invoice Pending"}
                    </div>

                    <div className="bill-counterparty">
                      {counterpartyOf(bill)}
                    </div>
                  </div>

                  <span
                    className={`bill-status ${
                      STATUS_CLASS[bill.paymentStatus] || ""
                    }`}
                  >
                    {STATUS_LABEL[bill.paymentStatus] || bill.paymentStatus}
                  </span>
                </div>

                {/* =========================
                        BODY
                    ========================== */}

                <div className="bill-card-body">
                  <div className="bill-product">{bill.productName}</div>

                  <div className="bill-row">
                    <span>
                      {bill.quantity} {bill.unit}
                    </span>

                    <span className="bill-total">
                      ₹{Number(bill.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* ORDER STATUS */}

                  <div className="bill-row">
                    <span>Order Status</span>

                    <strong>
                      {ORDER_STATUS_LABEL[bill.orderStatus] ||
                        bill.orderStatus ||
                        "-"}
                    </strong>
                  </div>

                  {/* =========================
                          BILL NOT READY
                      ========================== */}

                  {isWholesaler && !canUseBill && !bill.billSentToRetailer && (
                    <div className="bill-waiting-info">
                      <FiClock size={14} />

                      <span>
                        Bill generation will be available after delivery
                      </span>
                    </div>
                  )}

                  {/* =========================
                          SENT INFO
                      ========================== */}

                  {isWholesaler && bill.billSentToRetailer && (
                    <div className="bill-sent-info">
                      <FiCheck size={14} />

                      <span>
                        Bill sent to retailer
                        {bill.billSentAt
                          ? ` on ${new Date(bill.billSentAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* =========================
                        FOOTER
                    ========================== */}

                <div className="bill-card-footer">
                  <span className="bill-date">
                    {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  <div className="bill-actions">
                    {/* =================================
                            WHOLESALER GENERATE BILL
                        ================================== */}

                    {isWholesaler && canUseBill && (
                      <GenerateBillButton
                        label="Generate Bill"
                        order={{
                          orderId: bill.invoiceNumber || bill._id,

                          businessName: user.shopName || user.name,

                          customerName: counterpartyOf(bill),

                          items: [
                            {
                              name: bill.productName,

                              qty: bill.quantity,

                              pricePerUnit: bill.pricePerUnit,
                            },
                          ],

                          paymentStatus: bill.paymentStatus,

                          orderStatus: bill.orderStatus,

                          date: bill.createdAt,
                        }}
                      />
                    )}

                    {/* =================================
                            RETAILER DOWNLOAD BILL
                        ================================== */}

                    {!isWholesaler && (
                      <GenerateBillButton
                        label="Download Bill"
                        order={{
                          orderId: bill.invoiceNumber || bill._id,

                          businessName:
                            bill.wholesalerId?.shopName ||
                            bill.wholesalerId?.name,

                          customerName: counterpartyOf(bill),

                          items: [
                            {
                              name: bill.productName,

                              qty: bill.quantity,

                              pricePerUnit: bill.pricePerUnit,
                            },
                          ],

                          paymentStatus: bill.paymentStatus,

                          orderStatus: bill.orderStatus,

                          date: bill.createdAt,
                        }}
                      />
                    )}

                    {/* =================================
                            SEND BILL
                        ================================== */}

                    {isWholesaler && canUseBill && (
                      <button
                        type="button"
                        className={`send-bill-btn ${
                          bill.billSentToRetailer ? "send-bill-btn--sent" : ""
                        }`}
                        onClick={() => openSendConfirmation(bill)}
                        disabled={
                          bill.billSentToRetailer || sendingBillId === bill._id
                        }
                      >
                        {bill.billSentToRetailer ? (
                          <>
                            <FiCheck size={15} />
                            Sent
                          </>
                        ) : (
                          <>
                            <FiSend size={15} />
                            Send Bill
                          </>
                        )}
                      </button>
                    )}

                    {/* =================================
                            BEFORE DELIVERY
                        ================================== */}

                    {isWholesaler && !canUseBill && (
                      <span className="bill-waiting-delivery">
                        Available after delivery
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          SEND BILL CONFIRMATION MODAL
      ========================================== */}

      {billToSend && (
        <div className="bill-confirm-overlay" onClick={closeSendConfirmation}>
          <div
            className="bill-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}

            <button
              type="button"
              className="bill-confirm-close"
              onClick={closeSendConfirmation}
              disabled={Boolean(sendingBillId)}
              aria-label="Close"
            >
              <FiX size={18} />
            </button>

            {/* ICON */}

            <div className="bill-confirm-icon">
              <FiSend size={25} />
            </div>

            {/* TITLE */}

            <h2>Send Bill to Retailer?</h2>

            <p className="bill-confirm-message">
              Are you sure you want to send this bill to{" "}
              <strong>{counterpartyOf(billToSend)}</strong>?
            </p>

            {/* BILL DETAILS */}

            <div className="bill-confirm-details">
              <div>
                <span>Invoice</span>

                <strong>{billToSend.invoiceNumber || "-"}</strong>
              </div>

              <div>
                <span>Product</span>

                <strong>{billToSend.productName}</strong>
              </div>

              <div>
                <span>Amount</span>

                <strong className="bill-confirm-amount">
                  ₹{Number(billToSend.totalAmount || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {/* WARNING */}

            <div className="bill-confirm-warning">
              <FiAlertCircle size={16} />

              <span>
                After sending, this bill will appear in the retailer's Billing
                section.
              </span>
            </div>

            {/* ERROR */}

            {sendError && <div className="bill-confirm-error">{sendError}</div>}

            {/* ACTIONS */}

            <div className="bill-confirm-actions">
              <button
                type="button"
                className="bill-confirm-cancel"
                onClick={closeSendConfirmation}
                disabled={Boolean(sendingBillId)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="bill-confirm-send"
                onClick={handleConfirmSendBill}
                disabled={Boolean(sendingBillId)}
              >
                {sendingBillId ? (
                  "Sending..."
                ) : (
                  <>
                    <FiSend size={15} />
                    Confirm & Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
