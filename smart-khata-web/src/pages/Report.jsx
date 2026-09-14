import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Report.css";
import { getStoredUser } from "../utils/session";

const API_URL = "https://backend-of-smartkhata-book-vkcv.vercel.app";

export default function Report() {
  const user = getStoredUser();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = useCallback(
    async (manual = false) => {
      if (!user?._id || !user?.role) {
        setError("User information not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await axios.get(
          `${API_URL}/api/reports/${user.role.toLowerCase()}/${user._id}`,
        );

        if (response.data.success) {
          setReport(response.data.report);
        } else {
          setError(response.data.message || "Failed to load report.");
        }
      } catch (err) {
        console.error("REPORT FETCH ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load report. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user._id, user.role],
  );

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
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

    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === "completed" || status === "delivered" || status === "paid") {
      return "report-status success";
    }

    if (
      status === "pending" ||
      status === "advancePending" ||
      status === "advanceRequested" ||
      status === "partial" ||
      status === "advancePaid"
    ) {
      return "report-status warning";
    }

    if (status === "rejected" || status === "unpaid") {
      return "report-status danger";
    }

    return "report-status info";
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="report-layout">
        <Sidebar role={user.role} />

        <main className="report-main">
          <div className="report-loading">
            <div className="report-spinner"></div>
            <p>Preparing your business report...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-layout">
        <Sidebar role={user.role} />

        <main className="report-main">
          <div className="report-error">
            <i className="ti ti-alert-circle"></i>

            <h2>Unable to load report</h2>

            <p>{error}</p>

            <button onClick={() => fetchReport(true)}>Try Again</button>
          </div>
        </main>
      </div>
    );
  }

  const orders = report?.orders || {};
  const payments = report?.payments || {};
  const stock = report?.stock || {};
  const reviews = report?.reviews || {};
  const ledger = report?.ledger || {};
  const recentOrders = report?.recentOrders || [];

  const isRetailer = user.role?.toLowerCase() === "retailer";

  return (
    <div className="report-layout">
      <Sidebar role={user.role} />

      <main className="report-main">
        {/* HEADER */}

        <div className="report-header">
          <div>
            <span className="report-small-title">BUSINESS ANALYTICS</span>

            <h1>Business Report</h1>

            <p>Complete overview of your business performance and activity.</p>
          </div>

          <div className="report-header-actions">
            <button
              className="report-refresh-btn"
              onClick={() => fetchReport(true)}
              disabled={refreshing}
            >
              <i
                className={`ti ti-refresh ${refreshing ? "report-spin" : ""}`}
              ></i>

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button className="report-print-btn" onClick={handlePrint}>
              <i className="ti ti-printer"></i>
              Print Report
            </button>
          </div>
        </div>

        {/* BUSINESS INFO */}

        <section className="report-business-card">
          <div className="report-business-left">
            <div className="report-business-icon">
              <i className="ti ti-building-store"></i>
            </div>

            <div>
              <h2>{user.shopName || user.name || "My Business"}</h2>

              <div className="report-business-meta">
                <span>
                  <i className="ti ti-user"></i>
                  {user.name || "User"}
                </span>

                <span>
                  <i className="ti ti-briefcase"></i>
                  {user.role || "-"}
                </span>

                {user.businessType && (
                  <span>
                    <i className="ti ti-category"></i>
                    {user.businessType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="report-date">
            <span>Report Date</span>
            <strong>{formatDate(new Date())}</strong>
          </div>
        </section>

        {/* MAIN FINANCIAL CARDS */}

        <section className="report-summary-grid">
          <div className="report-summary-card blue">
            <div className="report-summary-icon">
              <i className="ti ti-wallet"></i>
            </div>

            <div>
              <span>
                {isRetailer ? "Total Purchase Value" : "Total Sales Value"}
              </span>

              <h2>{formatCurrency(payments.totalOrderValue)}</h2>

              <p>Across {orders.total || 0} orders</p>
            </div>
          </div>

          <div className="report-summary-card green">
            <div className="report-summary-icon">
              <i className="ti ti-circle-check"></i>
            </div>

            <div>
              <span>Total Paid</span>

              <h2>{formatCurrency(payments.totalPaidAmount)}</h2>

              <p>{payments.paidOrders || 0} fully paid orders</p>
            </div>
          </div>

          <div className="report-summary-card orange">
            <div className="report-summary-icon">
              <i className="ti ti-clock"></i>
            </div>

            <div>
              <span>{isRetailer ? "Amount To Pay" : "Amount To Receive"}</span>

              <h2>{formatCurrency(payments.totalPendingAmount)}</h2>

              <p>Pending settlement</p>
            </div>
          </div>

          <div className="report-summary-card purple">
            <div className="report-summary-icon">
              <i className="ti ti-package"></i>
            </div>

            <div>
              <span>Stock Value</span>

              <h2>{formatCurrency(stock.sellingValue)}</h2>

              <p>{stock.totalProducts || 0} products</p>
            </div>
          </div>
        </section>

        {/* ORDER SUMMARY */}

        <section className="report-section">
          <div className="report-section-header">
            <div>
              <h2>Order Summary</h2>
              <p>Current order status overview</p>
            </div>

            <div className="report-section-icon">
              <i className="ti ti-shopping-cart"></i>
            </div>
          </div>

          <div className="report-order-grid">
            <div className="report-mini-card">
              <span>Total Orders</span>
              <strong>{orders.total || 0}</strong>
            </div>

            <div className="report-mini-card warning">
              <span>Pending</span>
              <strong>{orders.pending || 0}</strong>
            </div>

            <div className="report-mini-card info">
              <span>Approved</span>
              <strong>{orders.approved || 0}</strong>
            </div>

            <div className="report-mini-card purple">
              <span>Processing</span>
              <strong>{orders.processing || 0}</strong>
            </div>

            <div className="report-mini-card blue">
              <span>On The Way</span>
              <strong>{orders.onTheWay || 0}</strong>
            </div>

            <div className="report-mini-card success">
              <span>Delivered</span>
              <strong>{orders.delivered || 0}</strong>
            </div>

            <div className="report-mini-card success">
              <span>Completed</span>
              <strong>{orders.completed || 0}</strong>
            </div>

            <div className="report-mini-card danger">
              <span>Rejected</span>
              <strong>{orders.rejected || 0}</strong>
            </div>
          </div>
        </section>

        {/* PAYMENT + INVENTORY */}

        <div className="report-two-column">
          {/* PAYMENT */}

          <section className="report-section">
            <div className="report-section-header">
              <div>
                <h2>Payment Summary</h2>
                <p>Payment performance</p>
              </div>

              <div className="report-section-icon green-icon">
                <i className="ti ti-currency-rupee"></i>
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
                <h2>Inventory Summary</h2>
                <p>Your current stock position</p>
              </div>

              <div className="report-section-icon orange-icon">
                <i className="ti ti-box"></i>
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

        {/* REVIEWS + LEDGER */}

        <div className="report-two-column">
          <section className="report-section report-small-section">
            <div className="report-stat-icon yellow-icon">
              <i className="ti ti-star"></i>
            </div>

            <div>
              <span>Reviews</span>

              <h2>{reviews.total || 0}</h2>

              <p>
                Average Rating:{" "}
                <strong>{reviews.averageRating || 0} / 5</strong>
              </p>
            </div>
          </section>

          <section className="report-section report-small-section">
            <div className="report-stat-icon ledger-icon">
              <i className="ti ti-book"></i>
            </div>

            <div>
              <span>Ledger Entries</span>

              <h2>{ledger.totalEntries || 0}</h2>

              <p>Total ledger transactions recorded</p>
            </div>
          </section>
        </div>

        {/* RECENT ORDERS */}

        <section className="report-section report-table-section">
          <div className="report-section-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Your latest business activity</p>
            </div>

            <div className="report-section-icon">
              <i className="ti ti-history"></i>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="report-empty">
              <i className="ti ti-file-off"></i>

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
                      <td>
                        <span className="report-invoice">
                          {order.invoiceNumber || "-"}
                        </span>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td>{isRetailer ? order.wholesaler : order.retailer}</td>

                      <td>{order.productName}</td>

                      <td>
                        {order.quantity} {order.unit}
                      </td>

                      <td>
                        <span className={getStatusClass(order.orderStatus)}>
                          {formatStatus(order.orderStatus)}
                        </span>
                      </td>

                      <td>
                        <span className={getStatusClass(order.paymentStatus)}>
                          {formatStatus(order.paymentStatus)}
                        </span>
                      </td>

                      <td className="report-amount">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="report-footer">
          <p>
            SmartKhatabook Business Report • Generated on{" "}
            {formatDate(new Date())}
          </p>
        </div>
      </main>
    </div>
  );
}
