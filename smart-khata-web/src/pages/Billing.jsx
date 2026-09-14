import { useState, useEffect } from "react";
import {
  FiFileText,
  FiChevronLeft,
  FiSend,
  FiCheck,
  FiClock,
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
  // BILL CAN BE GENERATED / SENT
  // ============================================

  const billIsReady = (bill) => {
    return ["delivered", "completed"].includes(bill.orderStatus);
  };

  // ============================================
  // SEND BILL
  // ============================================

  const handleSendBill = async (billId) => {
    try {
      setSendingBillId(billId);

      const res = await api.patch(`/api/orders/${billId}/send-bill`);

      if (res.data.success) {
        setBills((previousBills) =>
          previousBills.map((bill) =>
            bill._id === billId
              ? {
                  ...bill,

                  billSentToRetailer: true,

                  billSentAt:
                    res.data.bill?.billSentAt || new Date().toISOString(),
                }
              : bill,
          ),
        );

        alert("Bill sent to retailer successfully.");
      }
    } catch (err) {
      console.error("SEND BILL ERROR:", err);

      alert(err.response?.data?.message || "Failed to send bill to retailer.");
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
                          WHOLESALER:
                          GENERATE BILL ONLY AFTER DELIVERY
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
                          RETAILER:
                          DOWNLOAD SENT BILL
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
                        onClick={() => handleSendBill(bill._id)}
                        disabled={
                          bill.billSentToRetailer || sendingBillId === bill._id
                        }
                      >
                        {bill.billSentToRetailer ? (
                          <>
                            <FiCheck size={15} />
                            Sent
                          </>
                        ) : sendingBillId === bill._id ? (
                          "Sending..."
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
    </div>
  );
}
