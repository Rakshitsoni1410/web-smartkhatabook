import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiFileText,
  FiChevronLeft,
  FiSend,
  FiCheck,
  FiClock,
  FiX,
  FiAlertCircle,
  FiSearch,
  FiMail,
  FiEye,
  FiBell,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api";
import GenerateBillButton from "../components/GenerateBillButton";
import "./Billing.css";
import { getStoredUser } from "../utils/session";

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

const READ_STORAGE_PREFIX = "billing-read-v1";

function getReadStorageKey(userId) {
  return `${READ_STORAGE_PREFIX}:${userId || "unknown"}`;
}

function readLocalReadState(userId) {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(getReadStorageKey(userId)) || "{}",
    );
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function formatDateTime(value) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${time}`;
}

function isSameLocalDay(value, reference = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export default function Billing() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userId = user?._id;
  const isWholesaler = user?.role?.trim().toLowerCase() === "wholesaler";

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingBillId, setSendingBillId] = useState(null);
  const [billToSend, setBillToSend] = useState(null);
  const [sendError, setSendError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [readState, setReadState] = useState(() => readLocalReadState(userId));

  useEffect(() => {
    setReadState(readLocalReadState(userId));
  }, [userId]);

  const fetchBills = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!userId) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        if (showLoading) setLoading(true);
        setError("");

        const endpoint = isWholesaler
          ? `/api/orders/billing/wholesaler/${userId}`
          : `/api/orders/billing/retailer/${userId}`;

        const res = await api.get(endpoint);
        setBills(res.data.bills || []);
      } catch (err) {
        console.error("Failed to load bills:", err);
        setError(
          err.response?.data?.message ||
            "Couldn't load bills. Please try again.",
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [userId, isWholesaler],
  );

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const markAsRead = useCallback(
    (billId) => {
      if (!billId) return;
      setReadState((previous) => {
        if (previous[billId]) return previous;
        const next = { ...previous, [billId]: new Date().toISOString() };
        try {
          localStorage.setItem(getReadStorageKey(userId), JSON.stringify(next));
        } catch (err) {
          console.warn("Could not save local bill read state:", err);
        }
        return next;
      });
    },
    [userId],
  );

  const counterpartyOf = (bill) => {
    const other = isWholesaler ? bill.retailerId : bill.wholesalerId;
    return other?.shopName || other?.name || "Unknown";
  };

  const billIsReady = (bill) =>
    ["delivered", "completed"].includes(bill.orderStatus);

  const openSendConfirmation = (bill) => {
    setSendError("");
    setBillToSend(bill);
  };

  const closeSendConfirmation = () => {
    if (sendingBillId) return;
    setBillToSend(null);
    setSendError("");
  };

  const handleConfirmSendBill = async () => {
    if (!billToSend?._id) return;

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
        setBillToSend(null);
      } else {
        setSendError(res.data.message || "The bill could not be sent.");
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

  const getSentAt = (bill) =>
    bill.billSentAt || bill.updatedAt || bill.createdAt;
  const isUnread = (bill) =>
    !isWholesaler && Boolean(bill.billSentToRetailer) && !readState[bill._id];
  const isNewToday = (bill) =>
    !isWholesaler &&
    Boolean(bill.billSentToRetailer) &&
    isSameLocalDay(getSentAt(bill));

  const unreadCount = useMemo(
    () => bills.filter((bill) => isUnread(bill)).length,
    [bills, readState, isWholesaler],
  );

  const newTodayCount = useMemo(
    () => bills.filter((bill) => isNewToday(bill)).length,
    [bills, isWholesaler],
  );

  const filteredBills = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...bills]
      .filter((bill) => {
        if (!isWholesaler) {
          if (!bill.billSentToRetailer) return false;
          if (filter === "unread" && !isUnread(bill)) return false;
          if (filter === "read" && isUnread(bill)) return false;
          if (filter === "today" && !isNewToday(bill)) return false;
        }

        if (!normalizedSearch) return true;
        const searchable = [
          bill.invoiceNumber,
          bill.productName,
          counterpartyOf(bill),
          bill.orderStatus,
          bill.paymentStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (!isWholesaler) {
          const unreadDifference = Number(isUnread(b)) - Number(isUnread(a));
          if (unreadDifference !== 0) return unreadDifference;
          const sentA = new Date(getSentAt(a) || 0).getTime();
          const sentB = new Date(getSentAt(b) || 0).getTime();
          return sentB - sentA;
        }
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [bills, filter, searchTerm, readState, isWholesaler]);

  const openBill = (bill) => {
    if (!isWholesaler && bill.billSentToRetailer) markAsRead(bill._id);
  };

  return (
    <div className="billing-page">
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
        {!isWholesaler && unreadCount > 0 && (
          <div className="billing-unread-summary" aria-live="polite">
            <FiBell size={15} />
            <span>{unreadCount} unread</span>
          </div>
        )}
      </div>

      {!loading && !error && bills.length > 0 && (
        <section className="billing-tools" aria-label="Bill filters">
          <div className="billing-search">
            <FiSearch size={17} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search invoice, product, or shop..."
              aria-label="Search bills"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <div
            className="billing-filters"
            role="group"
            aria-label="Filter bills"
          >
            {[
              {
                id: "all",
                label: "All Bills",
                count: bills.filter(
                  (bill) => isWholesaler || bill.billSentToRetailer,
                ).length,
              },
              ...(!isWholesaler
                ? [
                    { id: "unread", label: "Unread", count: unreadCount },
                    {
                      id: "read",
                      label: "Read",
                      count: bills.filter(
                        (bill) => bill.billSentToRetailer && !isUnread(bill),
                      ).length,
                    },
                    { id: "today", label: "New Today", count: newTodayCount },
                  ]
                : []),
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`billing-filter ${filter === item.id ? "billing-filter--active" : ""}`}
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
              >
                {item.label} <span>{item.count}</span>
              </button>
            ))}
          </div>
          {!isWholesaler && newTodayCount > 0 && (
            <p className="billing-new-note">
              <FiBell size={14} /> {newTodayCount} bill
              {newTodayCount === 1 ? "" : "s"} sent today
            </p>
          )}
        </section>
      )}

      {loading && <div className="billing-empty">Loading bills…</div>}

      {!loading && error && (
        <div className="billing-empty billing-error">
          <p>{error}</p>
          <button type="button" onClick={() => fetchBills()}>
            Try Again
          </button>
        </div>
      )}

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

      {!loading && !error && bills.length > 0 && filteredBills.length === 0 && (
        <div className="billing-empty billing-empty--compact">
          <FiSearch size={24} />
          <p>No bills match your current search or filter.</p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setSearchTerm("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && filteredBills.length > 0 && (
        <div className="billing-list">
          {filteredBills.map((bill) => {
            const canUseBill = billIsReady(bill);
            const unread = isUnread(bill);
            const newToday = isNewToday(bill);
            const sentAt = getSentAt(bill);

            return (
              <article
                className={[
                  "bill-card",
                  unread ? "bill-card--unread" : "",
                  newToday ? "bill-card--new-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={bill._id}
              >
                <div className="bill-card-top">
                  <div>
                    <div className="bill-invoice-no">
                      {bill.invoiceNumber || "Invoice Pending"}
                    </div>
                    <div className="bill-counterparty">
                      {counterpartyOf(bill)}
                    </div>
                  </div>
                  <div className="bill-card-badges">
                    {!isWholesaler && newToday && (
                      <span className="bill-new-badge">NEW TODAY</span>
                    )}
                    {!isWholesaler && (
                      <span
                        className={`bill-read-badge ${unread ? "bill-read-badge--unread" : "bill-read-badge--read"}`}
                      >
                        {unread ? (
                          <>
                            <FiMail size={12} /> UNREAD
                          </>
                        ) : (
                          <>
                            <FiEye size={12} /> READ
                          </>
                        )}
                      </span>
                    )}
                    <span
                      className={`bill-status ${STATUS_CLASS[bill.paymentStatus] || ""}`}
                    >
                      {STATUS_LABEL[bill.paymentStatus] ||
                        bill.paymentStatus ||
                        "Unknown"}
                    </span>
                  </div>
                </div>

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
                  <div className="bill-row">
                    <span>Order Status</span>
                    <strong>
                      {ORDER_STATUS_LABEL[bill.orderStatus] ||
                        bill.orderStatus ||
                        "-"}
                    </strong>
                  </div>

                  {!isWholesaler && bill.billSentToRetailer && (
                    <div className="bill-received-info">
                      {unread ? <FiMail size={14} /> : <FiEye size={14} />}
                      <span>
                        {unread
                          ? "New bill waiting to be read"
                          : "You have viewed this bill"}
                        {sentAt ? ` · Sent ${formatDateTime(sentAt)}` : ""}
                      </span>
                    </div>
                  )}

                  {isWholesaler && !canUseBill && !bill.billSentToRetailer && (
                    <div className="bill-waiting-info">
                      <FiClock size={14} />
                      <span>
                        Bill generation will be available after delivery
                      </span>
                    </div>
                  )}

                  {isWholesaler && bill.billSentToRetailer && (
                    <div className="bill-sent-info">
                      <FiCheck size={14} />
                      <span>
                        Bill sent to retailer
                        {bill.billSentAt
                          ? ` · ${formatDateTime(bill.billSentAt)}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bill-card-footer">
                  <span className="bill-date">
                    Order date:{" "}
                    {bill.createdAt
                      ? new Date(bill.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>

                  <div className="bill-actions">
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

                    {!isWholesaler && bill.billSentToRetailer && (
                      <button
                        type="button"
                        className="bill-read-action"
                        onClick={() => openBill(bill)}
                        disabled={!unread}
                      >
                        {unread ? (
                          <>
                            <FiEye size={14} /> Mark as Read
                          </>
                        ) : (
                          <>
                            <FiCheck size={14} /> Read
                          </>
                        )}
                      </button>
                    )}

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

                    {isWholesaler && canUseBill && (
                      <button
                        type="button"
                        className={`send-bill-btn ${bill.billSentToRetailer ? "send-bill-btn--sent" : ""}`}
                        onClick={() => openSendConfirmation(bill)}
                        disabled={
                          bill.billSentToRetailer || sendingBillId === bill._id
                        }
                      >
                        {bill.billSentToRetailer ? (
                          <>
                            <FiCheck size={15} /> Sent
                          </>
                        ) : (
                          <>
                            <FiSend size={15} /> Send Bill
                          </>
                        )}
                      </button>
                    )}

                    {isWholesaler && !canUseBill && (
                      <span className="bill-waiting-delivery">
                        Available after delivery
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {billToSend && (
        <div className="bill-confirm-overlay" onClick={closeSendConfirmation}>
          <div
            className="bill-confirm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="bill-confirm-close"
              onClick={closeSendConfirmation}
              disabled={Boolean(sendingBillId)}
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
            <div className="bill-confirm-icon">
              <FiSend size={25} />
            </div>
            <h2>Send Bill to Retailer?</h2>
            <p className="bill-confirm-message">
              Are you sure you want to send this bill to{" "}
              <strong>{counterpartyOf(billToSend)}</strong>?
            </p>
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
            <div className="bill-confirm-warning">
              <FiAlertCircle size={16} />
              <span>
                After sending, this bill will appear in the retailer's Billing
                section.
              </span>
            </div>
            {sendError && <div className="bill-confirm-error">{sendError}</div>}
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
                    <FiSend size={15} /> Confirm & Send
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
