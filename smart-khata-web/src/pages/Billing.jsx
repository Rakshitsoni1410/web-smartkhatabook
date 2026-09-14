import { useState, useEffect } from "react";
import { FiFileText, FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api";
import GenerateBillButton from "../components/GenerateBillButton";
import "../components/GenerateBillButton.css";
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

export default function Billing() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isWholesaler = user.role === "Wholesaler";

  useEffect(() => {
    const fetchBills = async () => {
      if (!user._id) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const endpoint = isWholesaler
          ? `/api/orders/billing/wholesaler/${user._id}`
          : `/api/orders/billing/retailer/${user._id}`;

        const res = await api.get(endpoint);
        setBills(res.data.bills || []);
      } catch (err) {
        console.error("Failed to load bills:", err);
        setError("Couldn't load bills. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The "other side" of each bill — a wholesaler viewing bills sees the
  // retailer's name on each row, and vice versa.
  const counterpartyOf = (bill) => {
    const other = isWholesaler ? bill.retailerId : bill.wholesalerId;
    return other?.shopName || other?.name || "Unknown";
  };

  return (
    <div className="billing-page">
      <div className="billing-header">
        <button className="billing-back" onClick={() => navigate(-1)} aria-label="Back">
          <FiChevronLeft size={18} />
        </button>
        <div>
          <h1>Billing</h1>
          <p>
            {isWholesaler
              ? "Amounts your retailers owe you"
              : "Amounts you owe your wholesalers"}
          </p>
        </div>
      </div>

      {loading && <div className="billing-empty">Loading bills…</div>}

      {!loading && error && <div className="billing-empty billing-error">{error}</div>}

      {!loading && !error && bills.length === 0 && (
        <div className="billing-empty">
          <FiFileText size={28} />
          <p>No bills yet.</p>
        </div>
      )}

      {!loading && !error && bills.length > 0 && (
        <div className="billing-list">
          {bills.map((bill) => (
            <div className="bill-card" key={bill._id}>
              <div className="bill-card-top">
                <div>
                  <div className="bill-invoice-no">
                    {bill.invoiceNumber || "Pending…"}
                  </div>
                  <div className="bill-counterparty">{counterpartyOf(bill)}</div>
                </div>
                <span className={`bill-status ${STATUS_CLASS[bill.paymentStatus] || ""}`}>
                  {STATUS_LABEL[bill.paymentStatus] || bill.paymentStatus}
                </span>
              </div>

              <div className="bill-card-body">
                <div className="bill-product">{bill.productName}</div>
                <div className="bill-row">
                  <span>{bill.quantity} {bill.unit}</span>
                  <span className="bill-total">
                    ₹{Number(bill.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="bill-card-footer">
                <span className="bill-date">
                  {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <GenerateBillButton
                  label="Download"
                  order={{
                    orderId: bill.invoiceNumber || bill._id,
                    businessName: isWholesaler
                      ? user.shopName
                      : bill.wholesalerId?.shopName || bill.wholesalerId?.name,
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}