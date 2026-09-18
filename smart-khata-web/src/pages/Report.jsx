import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiActivity,
  FiAlertCircle,
  FiBookOpen,
  FiBox,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiGrid,
  FiMoon,
  FiPackage,
  FiPrinter,
  FiRefreshCw,
  FiShoppingBag,
  FiShoppingCart,
  FiStar,
  FiSun,
  FiUser,
  FiCreditCard,
  FiXCircle,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";

import api from "../api";

import { getStoredUser } from "../utils/session";

import "./Report.css";

// =====================================================
// HELPERS
// =====================================================

const safeNumber = (value) => {
  const number = Number(value || 0);

  return Number.isFinite(number) ? number : 0;
};

const clampPercentage = (value) => {
  return Math.min(100, Math.max(0, Number(value) || 0));
};

// =====================================================
// SMALL COMPONENTS
// =====================================================

function SummaryCard({ tone, Icon, label, value, helper }) {
  return (
    <article className={`report-summary-card report-summary-${tone}`}>
      <div className="report-summary-top">
        <div className="report-summary-icon">
          <Icon />
        </div>

        <span className="report-summary-dot" />
      </div>

      <div className="report-summary-content">
        <span className="report-summary-label">{label}</span>

        <strong className="report-summary-value">{value}</strong>

        <p>{helper}</p>
      </div>
    </article>
  );
}

function StatusTile({ label, value, tone = "default" }) {
  return (
    <div className={`report-order-tile report-order-${tone}`}>
      <div className="report-order-tile-top">
        <span>{label}</span>

        <span className="report-order-indicator" />
      </div>

      <strong>{safeNumber(value).toLocaleString("en-IN")}</strong>
    </div>
  );
}

function DetailRow({ label, value, className = "" }) {
  return (
    <div className="report-detail-row">
      <span>{label}</span>

      <strong className={className}>{value}</strong>
    </div>
  );
}

// =====================================================
// REPORT
// =====================================================

export default function Report() {
  const user = getStoredUser() || {};

  const userId = user?._id;

  const userRole = user?.role;

  // =====================================================
  // STATE
  // =====================================================

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

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
      // Ignore storage errors.
    }
  }, [darkMode]);

  // =====================================================
  // FETCH
  // =====================================================

  const fetchReport = useCallback(
    async (manual = false) => {
      if (!userId || !userRole) {
        setError("User information not found. Please login again.");

        setLoading(false);

        setRefreshing(false);

        return;
      }

      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get(
          `/api/reports/${userRole.toLowerCase()}/${userId}`,
        );

        if (response.data?.success) {
          setReport(response.data.report);
        } else {
          setReport(null);

          setError(response.data?.message || "Failed to load report.");
        }
      } catch (err) {
        console.error("REPORT FETCH ERROR:", err);

        setReport(null);

        setError(
          err?.response?.data?.message ||
            "Unable to load report. Please try again.",
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [userId, userRole],
  );

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // =====================================================
  // FORMATTERS
  // =====================================================

  const formatCurrency = (amount = 0) => {
    const value = safeNumber(amount);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    });
  };

  const formatStatus = (status = "") => {
    const map = {
      pending: "Pending",

      approved: "Approved",

      advancePending: "Advance Pending",

      processing: "Processing",

      onTheWay: "On The Way",

      delivered: "Delivered",

      completed: "Completed",

      rejected: "Rejected",

      unpaid: "Unpaid",

      advanceRequested: "Advance Requested",

      advancePaid: "Advance Paid",

      partial: "Partially Paid",

      paid: "Paid",
    };

    return map[status] || status || "-";
  };

  const getStatusClass = (status) => {
    if (status === "completed" || status === "delivered" || status === "paid") {
      return "report-status report-status-success";
    }

    if (
      status === "pending" ||
      status === "advancePending" ||
      status === "advanceRequested" ||
      status === "partial" ||
      status === "advancePaid"
    ) {
      return "report-status report-status-warning";
    }

    if (status === "rejected" || status === "unpaid") {
      return "report-status report-status-danger";
    }

    return "report-status report-status-info";
  };

  // =====================================================
  // DATA
  // =====================================================

  const orders = report?.orders || {};

  const payments = report?.payments || {};

  const stock = report?.stock || {};

  const reviews = report?.reviews || {};

  const ledger = report?.ledger || {};

  const recentOrders = Array.isArray(report?.recentOrders)
    ? report.recentOrders
    : [];

  const isRetailer =
    String(userRole || "")
      .trim()
      .toLowerCase() === "retailer";

  // =====================================================
  // PROGRESS
  // =====================================================

  const paymentProgress = useMemo(() => {
    const total = safeNumber(payments.totalOrderValue);

    const paid = safeNumber(payments.totalPaidAmount);

    if (total <= 0) {
      return 0;
    }

    return clampPercentage(Math.round((paid / total) * 100));
  }, [payments]);

  const stockAvailability = useMemo(() => {
    const total = safeNumber(stock.totalProducts);

    const out = safeNumber(stock.outOfStockProducts);

    if (total <= 0) {
      return 0;
    }

    return clampPercentage(Math.round(((total - out) / total) * 100));
  }, [stock]);

  // =====================================================
  // CLASSES
  // =====================================================

  const sidebarRole = userRole || "";

  const layoutClassName = `report-layout ${darkMode ? "report-dark" : ""}`;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className={layoutClassName}>
        <Sidebar role={sidebarRole} />

        <main className="report-main">
          <div className="report-loading">
            <div className="report-loading-icon">
              <FiActivity />
            </div>

            <div className="report-spinner" />

            <h2>Preparing your report</h2>

            <p>Gathering your latest business analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className={layoutClassName}>
        <Sidebar role={sidebarRole} />

        <main className="report-main">
          <div className="report-error">
            <div className="report-error-icon">
              <FiAlertCircle />
            </div>

            <h2>Unable to load report</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchReport(true)}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "report-spin" : ""} />

              {refreshing ? "Trying..." : "Try Again"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={layoutClassName}>
      <Sidebar role={sidebarRole} />

      <main className="report-main">
        {/* =====================================
            HEADER
        ====================================== */}

        <header className="report-header">
          <div className="report-header-copy">
            <span className="report-small-title">BUSINESS ANALYTICS</span>

            <h1>Business Report</h1>

            <p>
              Financial, inventory, orders and business activity in one place.
            </p>
          </div>

          <div className="report-header-actions no-print">
            <button
              type="button"
              className="report-theme-btn"
              onClick={() => setDarkMode((previous) => !previous)}
              title={darkMode ? "Light Mode" : "Dark Mode"}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? <FiSun /> : <FiMoon />}

              <span className="report-theme-text">
                {darkMode ? "Light" : "Dark"}
              </span>
            </button>

            <button
              type="button"
              className="report-refresh-btn"
              onClick={() => fetchReport(true)}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "report-spin" : ""} />

              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              type="button"
              className="report-print-btn"
              onClick={() => window.print()}
            >
              <FiPrinter />

              <span>Print</span>
            </button>
          </div>
        </header>

        {/* =====================================
            BUSINESS HERO
        ====================================== */}

        <section className="report-business-card">
          <div className="report-business-glow report-business-glow-one" />

          <div className="report-business-glow report-business-glow-two" />

          <div className="report-business-main">
            <div className="report-business-icon">
              <FiShoppingBag />
            </div>

            <div className="report-business-info">
              <span className="report-business-label">BUSINESS PROFILE</span>

              <h2>{user?.shopName || user?.name || "My Business"}</h2>

              <div className="report-business-meta">
                <span>
                  <FiUser />

                  {user?.name || "User"}
                </span>

                <span>
                  <FiBriefcase />

                  {userRole || "-"}
                </span>

                {user?.businessType && (
                  <span>
                    <FiGrid />

                    {user.businessType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="report-date-card">
            <FiFileText />

            <div>
              <span>REPORT DATE</span>

              <strong>{formatDate(new Date())}</strong>
            </div>
          </div>
        </section>

        {/* =====================================
            SUMMARY
        ====================================== */}

        <section className="report-summary-grid">
          <SummaryCard
            tone="blue"
            Icon={FiCreditCard}
            label={isRetailer ? "Total Purchase Value" : "Total Sales Value"}
            value={formatCurrency(payments.totalOrderValue)}
            helper={`${safeNumber(orders.total).toLocaleString(
              "en-IN",
            )} total orders`}
          />

          <SummaryCard
            tone="green"
            Icon={FiCheckCircle}
            label="Total Paid"
            value={formatCurrency(payments.totalPaidAmount)}
            helper={`${safeNumber(payments.paidOrders).toLocaleString(
              "en-IN",
            )} fully paid orders`}
          />

          <SummaryCard
            tone="orange"
            Icon={FiClock}
            label={isRetailer ? "Amount To Pay" : "Amount To Receive"}
            value={formatCurrency(payments.totalPendingAmount)}
            helper="Pending settlement"
          />

          <SummaryCard
            tone="purple"
            Icon={FiPackage}
            label="Stock Value"
            value={formatCurrency(stock.sellingValue)}
            helper={`${safeNumber(stock.totalProducts).toLocaleString(
              "en-IN",
            )} products`}
          />
        </section>

        {/* =====================================
            ORDER SUMMARY
        ====================================== */}

        <section className="report-section">
          <div className="report-section-header">
            <div>
              <span className="report-section-label">ORDERS</span>

              <h2>Order Summary</h2>

              <p>Current order status overview</p>
            </div>

            <div className="report-section-icon">
              <FiShoppingCart />
            </div>
          </div>

          <div className="report-order-grid">
            <StatusTile label="Total Orders" value={orders.total} />

            <StatusTile label="Pending" value={orders.pending} tone="warning" />

            <StatusTile label="Approved" value={orders.approved} tone="info" />

            <StatusTile
              label="Processing"
              value={orders.processing}
              tone="purple"
            />

            <StatusTile
              label="On The Way"
              value={orders.onTheWay}
              tone="blue"
            />

            <StatusTile
              label="Delivered"
              value={orders.delivered}
              tone="success"
            />

            <StatusTile
              label="Completed"
              value={orders.completed}
              tone="success"
            />

            <StatusTile
              label="Rejected"
              value={orders.rejected}
              tone="danger"
            />
          </div>
        </section>

        {/* =====================================
            PAYMENT + INVENTORY
        ====================================== */}

        <div className="report-two-column">
          {/* PAYMENT */}

          <section className="report-section report-detail-section">
            <div className="report-section-header">
              <div>
                <span className="report-section-label">FINANCE</span>

                <h2>Payment Summary</h2>

                <p>Current payment position</p>
              </div>

              <div className="report-section-icon report-green-icon">
                <span className="report-rupee-icon">₹</span>
              </div>
            </div>

            <div className="report-progress-card">
              <div className="report-progress-heading">
                <div>
                  <span>Payment completion</span>

                  <strong>{paymentProgress}%</strong>
                </div>

                <FiActivity />
              </div>

              <div className="report-progress-track">
                <span
                  style={{
                    width: `${paymentProgress}%`,
                  }}
                />
              </div>

              <p>
                {formatCurrency(payments.totalPaidAmount)} paid from{" "}
                {formatCurrency(payments.totalOrderValue)}
              </p>
            </div>

            <div className="report-detail-list">
              <DetailRow
                label="Total Order Value"
                value={formatCurrency(payments.totalOrderValue)}
              />

              <DetailRow
                label="Amount Paid"
                value={formatCurrency(payments.totalPaidAmount)}
                className="report-green"
              />

              <DetailRow
                label={isRetailer ? "Amount To Pay" : "Amount To Receive"}
                value={formatCurrency(payments.totalPendingAmount)}
                className="report-orange"
              />

              <DetailRow
                label="Advance Paid"
                value={formatCurrency(payments.totalAdvancePaid)}
              />

              <DetailRow
                label="Fully Paid Amount"
                value={formatCurrency(payments.fullyPaidAmount)}
              />

              <DetailRow
                label="Paid Orders"
                value={safeNumber(payments.paidOrders).toLocaleString("en-IN")}
              />

              <DetailRow
                label="Partially Paid"
                value={safeNumber(payments.partiallyPaidOrders).toLocaleString(
                  "en-IN",
                )}
              />

              <DetailRow
                label="Unpaid Orders"
                value={safeNumber(payments.unpaidOrders).toLocaleString(
                  "en-IN",
                )}
              />
            </div>
          </section>

          {/* INVENTORY */}

          <section className="report-section report-detail-section">
            <div className="report-section-header">
              <div>
                <span className="report-section-label">INVENTORY</span>

                <h2>Inventory Summary</h2>

                <p>Your current stock position</p>
              </div>

              <div className="report-section-icon report-orange-icon">
                <FiBox />
              </div>
            </div>

            <div className="report-progress-card report-stock-progress">
              <div className="report-progress-heading">
                <div>
                  <span>Product availability</span>

                  <strong>{stockAvailability}%</strong>
                </div>

                <FiPackage />
              </div>

              <div className="report-progress-track">
                <span
                  style={{
                    width: `${stockAvailability}%`,
                  }}
                />
              </div>

              <p>
                {safeNumber(stock.outOfStockProducts).toLocaleString("en-IN")}{" "}
                products currently out of stock
              </p>
            </div>

            <div className="report-detail-list">
              <DetailRow
                label="Total Products"
                value={safeNumber(stock.totalProducts).toLocaleString("en-IN")}
              />

              <DetailRow
                label="Total Stock Quantity"
                value={safeNumber(stock.totalStockQuantity).toLocaleString(
                  "en-IN",
                )}
              />

              <DetailRow
                label="Low Stock Products"
                value={safeNumber(stock.lowStockProducts).toLocaleString(
                  "en-IN",
                )}
                className="report-orange"
              />

              <DetailRow
                label="Out Of Stock"
                value={safeNumber(stock.outOfStockProducts).toLocaleString(
                  "en-IN",
                )}
                className="report-red"
              />

              <DetailRow
                label="Purchase Value"
                value={formatCurrency(stock.purchaseValue)}
              />

              <DetailRow
                label="Selling Value"
                value={formatCurrency(stock.sellingValue)}
              />

              <DetailRow
                label="Estimated Stock Profit"
                value={formatCurrency(stock.estimatedProfit)}
                className="report-green"
              />
            </div>
          </section>
        </div>

        {/* =====================================
            REVIEWS + LEDGER
        ====================================== */}

        <div className="report-insight-grid">
          <section className="report-insight-card report-review-card">
            <div className="report-insight-icon">
              <FiStar />
            </div>

            <div className="report-insight-copy">
              <span>REVIEWS</span>

              <strong>
                {safeNumber(reviews.total).toLocaleString("en-IN")}
              </strong>

              <p>
                Average rating <b>{safeNumber(reviews.averageRating)} / 5</b>
              </p>
            </div>
          </section>

          <section className="report-insight-card report-ledger-card">
            <div className="report-insight-icon">
              <FiBookOpen />
            </div>

            <div className="report-insight-copy">
              <span>LEDGER ENTRIES</span>

              <strong>
                {safeNumber(ledger.totalEntries).toLocaleString("en-IN")}
              </strong>

              <p>Total recorded ledger entries</p>
            </div>
          </section>
        </div>

        {/* =====================================
            RECENT ORDERS
        ====================================== */}

        <section className="report-section report-table-section">
          <div className="report-section-header">
            <div>
              <span className="report-section-label">ACTIVITY</span>

              <h2>Recent Orders</h2>

              <p>Your latest business activity</p>
            </div>

            <div className="report-section-icon">
              <FiClock  />
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="report-empty">
              <div className="report-empty-icon">
                <FiFileText />
              </div>

              <h3>No orders found</h3>

              <p>Your recent orders will appear here.</p>
            </div>
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Invoice</th>

                    <th>Date</th>

                    <th>{isRetailer ? "Wholesaler" : "Retailer"}</th>

                    <th>Product</th>

                    <th>Quantity</th>

                    <th>Order</th>

                    <th>Payment</th>

                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={order._id || `${order.invoiceNumber}-${index}`}>
                      <td data-label="Invoice">
                        <span className="report-invoice">
                          {order.invoiceNumber || "-"}
                        </span>
                      </td>

                      <td data-label="Date">{formatDate(order.createdAt)}</td>

                      <td data-label={isRetailer ? "Wholesaler" : "Retailer"}>
                        {isRetailer
                          ? order.wholesaler || "-"
                          : order.retailer || "-"}
                      </td>

                      <td data-label="Product">{order.productName || "-"}</td>

                      <td data-label="Quantity">
                        {safeNumber(order.quantity).toLocaleString("en-IN")}{" "}
                        {order.unit || ""}
                      </td>

                      <td data-label="Order Status">
                        <span className={getStatusClass(order.orderStatus)}>
                          {formatStatus(order.orderStatus)}
                        </span>
                      </td>

                      <td data-label="Payment">
                        <span className={getStatusClass(order.paymentStatus)}>
                          {formatStatus(order.paymentStatus)}
                        </span>
                      </td>

                      <td data-label="Amount" className="report-amount">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="report-footer">
          <FiFileText />

          <span>
            Smart Khatabook Business Report • {formatDate(new Date())}
          </span>
        </footer>
      </main>
    </div>
  );
}
