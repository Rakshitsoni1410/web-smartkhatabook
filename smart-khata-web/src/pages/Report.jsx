import { useCallback, useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import api from "../api";

import "./Report.css";

import { getStoredUser } from "../utils/session";

// =====================================================
// REPORT
// =====================================================

export default function Report() {
  const user = getStoredUser();

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
      // Ignore localStorage errors
    }
  }, [darkMode]);

  // =====================================================
  // FETCH REPORT
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
  // HELPERS
  // =====================================================

  const formatCurrency = (amount = 0) => {
    const value = Number(amount || 0);

    if (!Number.isFinite(value)) {
      return "₹0";
    }

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

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    });
  };

  const formatStatus = (status = "") => {
    const statusMap = {
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

    return statusMap[status] || status || "-";
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

  const handlePrint = () => {
    window.print();
  };

  // =====================================================
  // SAFE ROLE
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
              <i className="ti ti-chart-bar" />
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
              <i className="ti ti-alert-circle" />
            </div>

            <h2>Unable to load report</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchReport(true)}
              disabled={refreshing}
            >
              <i
                className={`ti ti-refresh ${refreshing ? "report-spin" : ""}`}
              />

              {refreshing ? "Trying..." : "Try Again"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // SAFE REPORT DATA
  // =====================================================

  const orders = report?.orders || {};

  const payments = report?.payments || {};

  const stock = report?.stock || {};

  const reviews = report?.reviews || {};

  const ledger = report?.ledger || {};

  const recentOrders = Array.isArray(report?.recentOrders)
    ? report.recentOrders
    : [];

  const isRetailer = userRole?.toLowerCase() === "retailer";

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

            <p>Complete overview of your business performance and activity.</p>
          </div>

          <div className="report-header-actions no-print">
            {/* DARK MODE */}

            <button
              type="button"
              className="report-theme-btn"
              onClick={() => setDarkMode((previous) => !previous)}
              title={darkMode ? "Light Mode" : "Dark Mode"}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              <i className={darkMode ? "ti ti-sun" : "ti ti-moon"} />

              <span className="report-theme-text">
                {darkMode ? "Light" : "Dark"}
              </span>
            </button>

            {/* REFRESH */}

            <button
              type="button"
              className="report-refresh-btn"
              onClick={() => fetchReport(true)}
              disabled={refreshing}
            >
              <i
                className={`ti ti-refresh ${refreshing ? "report-spin" : ""}`}
              />

              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {/* PRINT */}

            <button
              type="button"
              className="report-print-btn"
              onClick={handlePrint}
            >
              <i className="ti ti-printer" />

              <span>Print Report</span>
            </button>
          </div>
        </header>

        {/* =====================================
            BUSINESS CARD
        ====================================== */}

        <section className="report-business-card">
          <div className="report-business-decoration report-decoration-one" />

          <div className="report-business-decoration report-decoration-two" />

          <div className="report-business-left">
            <div className="report-business-icon">
              <i className="ti ti-building-store" />
            </div>

            <div className="report-business-info">
              <span className="report-business-label">BUSINESS PROFILE</span>

              <h2>{user?.shopName || user?.name || "My Business"}</h2>

              <div className="report-business-meta">
                <span>
                  <i className="ti ti-user" />

                  {user?.name || "User"}
                </span>

                <span>
                  <i className="ti ti-briefcase" />

                  {userRole || "-"}
                </span>

                {user?.businessType && (
                  <span>
                    <i className="ti ti-category" />

                    {user.businessType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="report-date">
            <span>REPORT DATE</span>

            <strong>{formatDate(new Date())}</strong>
          </div>
        </section>

        {/* =====================================
            FINANCIAL SUMMARY
        ====================================== */}

        <section className="report-summary-grid">
          <div className="report-summary-card report-summary-blue">
            <div className="report-summary-icon">
              <i className="ti ti-wallet" />
            </div>

            <div>
              <span>
                {isRetailer ? "Total Purchase Value" : "Total Sales Value"}
              </span>

              <h2>{formatCurrency(payments.totalOrderValue)}</h2>

              <p>Across {orders.total || 0} orders</p>
            </div>
          </div>

          <div className="report-summary-card report-summary-green">
            <div className="report-summary-icon">
              <i className="ti ti-circle-check" />
            </div>

            <div>
              <span>Total Paid</span>

              <h2>{formatCurrency(payments.totalPaidAmount)}</h2>

              <p>{payments.paidOrders || 0} fully paid orders</p>
            </div>
          </div>

          <div className="report-summary-card report-summary-orange">
            <div className="report-summary-icon">
              <i className="ti ti-clock" />
            </div>

            <div>
              <span>{isRetailer ? "Amount To Pay" : "Amount To Receive"}</span>

              <h2>{formatCurrency(payments.totalPendingAmount)}</h2>

              <p>Pending settlement</p>
            </div>
          </div>

          <div className="report-summary-card report-summary-purple">
            <div className="report-summary-icon">
              <i className="ti ti-package" />
            </div>

            <div>
              <span>Stock Value</span>

              <h2>{formatCurrency(stock.sellingValue)}</h2>

              <p>{stock.totalProducts || 0} products</p>
            </div>
          </div>
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
              <i className="ti ti-shopping-cart" />
            </div>
          </div>

          <div className="report-order-grid">
            <div className="report-mini-card">
              <span>Total Orders</span>

              <strong>{orders.total || 0}</strong>
            </div>

            <div className="report-mini-card report-mini-warning">
              <span>Pending</span>

              <strong>{orders.pending || 0}</strong>
            </div>

            <div className="report-mini-card report-mini-info">
              <span>Approved</span>

              <strong>{orders.approved || 0}</strong>
            </div>

            <div className="report-mini-card report-mini-purple">
              <span>Processing</span>

              <strong>{orders.processing || 0}</strong>
            </div>

            <div className="report-mini-card report-mini-blue">
              <span>On The Way</span>

              <strong>{orders.onTheWay || 0}</strong>
            </div>

            <div className="report-mini-card report-mini-success">
              <span>Delivered</span>

              <strong>{orders.delivered || 0}</strong>
            </div>

            <div className="report-mini-card report-mini-success">
              <span>Completed</span>

              <strong>{orders.completed || 0}</strong>
            </div>

            <div className="report-mini-card report-mini-danger">
              <span>Rejected</span>

              <strong>{orders.rejected || 0}</strong>
            </div>
          </div>
        </section>

        {/* =====================================
            PAYMENT + INVENTORY
        ====================================== */}

        <div className="report-two-column">
          {/* PAYMENT */}

          <section className="report-section">
            <div className="report-section-header">
              <div>
                <span className="report-section-label">FINANCE</span>

                <h2>Payment Summary</h2>

                <p>Payment performance</p>
              </div>

              <div className="report-section-icon report-green-icon">
                <i className="ti ti-currency-rupee" />
              </div>
            </div>

            <div className="report-detail-list">
              <div className="report-detail-row">
                <span>Total Order Value</span>

                <strong>{formatCurrency(payments.totalOrderValue)}</strong>
              </div>

              <div className="report-detail-row">
                <span>Amount Paid</span>

                <strong className="report-green">
                  {formatCurrency(payments.totalPaidAmount)}
                </strong>
              </div>

              <div className="report-detail-row">
                <span>
                  {isRetailer ? "Amount To Pay" : "Amount To Receive"}
                </span>

                <strong className="report-orange">
                  {formatCurrency(payments.totalPendingAmount)}
                </strong>
              </div>

              <div className="report-detail-row">
                <span>Advance Paid</span>

                <strong>{formatCurrency(payments.totalAdvancePaid)}</strong>
              </div>

              <div className="report-detail-row">
                <span>Fully Paid Amount</span>

                <strong>{formatCurrency(payments.fullyPaidAmount)}</strong>
              </div>

              <div className="report-detail-row">
                <span>Paid Orders</span>

                <strong>{payments.paidOrders || 0}</strong>
              </div>

              <div className="report-detail-row">
                <span>Partially Paid</span>

                <strong>{payments.partiallyPaidOrders || 0}</strong>
              </div>

              <div className="report-detail-row">
                <span>Unpaid Orders</span>

                <strong>{payments.unpaidOrders || 0}</strong>
              </div>
            </div>
          </section>

          {/* INVENTORY */}

          <section className="report-section">
            <div className="report-section-header">
              <div>
                <span className="report-section-label">INVENTORY</span>

                <h2>Inventory Summary</h2>

                <p>Your current stock position</p>
              </div>

              <div className="report-section-icon report-orange-icon">
                <i className="ti ti-box" />
              </div>
            </div>

            <div className="report-detail-list">
              <div className="report-detail-row">
                <span>Total Products</span>

                <strong>{stock.totalProducts || 0}</strong>
              </div>

              <div className="report-detail-row">
                <span>Total Stock Quantity</span>

                <strong>{stock.totalStockQuantity || 0}</strong>
              </div>

              <div className="report-detail-row">
                <span>Low Stock Products</span>

                <strong className="report-orange">
                  {stock.lowStockProducts || 0}
                </strong>
              </div>

              <div className="report-detail-row">
                <span>Out Of Stock</span>

                <strong className="report-red">
                  {stock.outOfStockProducts || 0}
                </strong>
              </div>

              <div className="report-detail-row">
                <span>Purchase Value</span>

                <strong>{formatCurrency(stock.purchaseValue)}</strong>
              </div>

              <div className="report-detail-row">
                <span>Selling Value</span>

                <strong>{formatCurrency(stock.sellingValue)}</strong>
              </div>

              <div className="report-detail-row">
                <span>Estimated Stock Profit</span>

                <strong className="report-green">
                  {formatCurrency(stock.estimatedProfit)}
                </strong>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================
            REVIEWS + LEDGER
        ====================================== */}

        <div className="report-two-column">
          <section className="report-section report-small-section">
            <div className="report-stat-icon report-yellow-icon">
              <i className="ti ti-star" />
            </div>

            <div>
              <span>REVIEWS</span>

              <h2>{reviews.total || 0}</h2>

              <p>
                Average Rating:{" "}
                <strong>{reviews.averageRating || 0} / 5</strong>
              </p>
            </div>
          </section>

          <section className="report-section report-small-section">
            <div className="report-stat-icon report-ledger-icon">
              <i className="ti ti-book" />
            </div>

            <div>
              <span>LEDGER ENTRIES</span>

              <h2>{ledger.totalEntries || 0}</h2>

              <p>Total ledger transactions recorded</p>
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
              <i className="ti ti-history" />
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="report-empty">
              <div className="report-empty-icon">
                <i className="ti ti-file-off" />
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

                    <th>Order Status</th>

                    <th>Payment</th>

                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
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
                        {order.quantity || 0} {order.unit || ""}
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

        {/* =====================================
            FOOTER
        ====================================== */}

        <footer className="report-footer">
          <p>
            Smart Khatabook Business Report • Generated on{" "}
            {formatDate(new Date())}
          </p>
        </footer>
      </main>
    </div>
  );
}
