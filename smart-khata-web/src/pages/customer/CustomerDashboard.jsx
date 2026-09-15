import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./CustomerDashboard.css";

const initialStats = {
  totalOrders: 0,
  pendingOrders: 0,
  totalSpent: 0,
  savedSuppliers: 0,
};

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, ordersRes] = await Promise.all([
        api.get("/api/customer-portal/stats"),
        api.get("/api/customer-portal/orders?limit=5"),
      ]);

      // Supports either:
      // { stats: {...} }
      // or directly {...}
      const statsData =
        statsRes.data?.stats ||
        statsRes.data ||
        initialStats;

      // Supports either:
      // { orders: [...] }
      // or directly [...]
      const ordersData = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data?.orders || [];

      setStats({
        totalOrders: Number(statsData.totalOrders || 0),
        pendingOrders: Number(statsData.pendingOrders || 0),
        totalSpent: Number(statsData.totalSpent || 0),
        savedSuppliers: Number(statsData.savedSuppliers || 0),
      });

      setRecentOrders(ordersData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );

      setStats(initialStats);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    const map = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      approved: "#3b82f6",
      processing: "#6366f1",
      shipped: "#8b5cf6",
      ontheway: "#8b5cf6",
      delivered: "#10b981",
      completed: "#059669",
      cancelled: "#ef4444",
      rejected: "#ef4444",
    };

    const normalizedStatus = String(status || "")
      .replace(/\s+/g, "")
      .toLowerCase();

    return map[normalizedStatus] || "#6b7280";
  };

  const getOrderStatus = (order) => {
    return order.status || order.orderStatus || "pending";
  };

  const getSupplierName = (order) => {
    return (
      order.supplierName ||
      order.retailerName ||
      order.retailerId?.shopName ||
      order.retailerId?.name ||
      order.wholesalerId?.shopName ||
      order.wholesalerId?.name ||
      "—"
    );
  };

  const getOrderItemCount = (order) => {
    if (Array.isArray(order.items)) {
      return order.items.length;
    }

    if (order.productName) {
      return 1;
    }

    return 0;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="c-loading">
        <div className="c-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="c-dashboard">
      {/* Error */}
      {error && (
        <div className="c-error-box">
          <div>
            <strong>Unable to load dashboard</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            className="c-error-retry"
            onClick={fetchDashboardData}
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="c-dash-header">
        <div>
          <h1>Welcome back! 👋</h1>
          <p>
            Here's what's happening with your business today.
          </p>
        </div>

        <button
          type="button"
          className="c-btn-primary"
          onClick={() => navigate("/customer/products")}
        >
          Browse Marketplace
        </button>
      </div>

      {/* Stats */}
      <div className="c-stats-grid">
        <div className="c-stat-card">
          <div
            className="c-stat-icon"
            style={{ background: "#dbeafe" }}
          >
            📦
          </div>

          <div>
            <p className="c-stat-label">Total Orders</p>
            <h2 className="c-stat-value">
              {stats.totalOrders}
            </h2>
          </div>
        </div>

        <div className="c-stat-card">
          <div
            className="c-stat-icon"
            style={{ background: "#fef3c7" }}
          >
            ⏳
          </div>

          <div>
            <p className="c-stat-label">Pending Orders</p>
            <h2 className="c-stat-value">
              {stats.pendingOrders}
            </h2>
          </div>
        </div>

        <div className="c-stat-card">
          <div
            className="c-stat-icon"
            style={{ background: "#d1fae5" }}
          >
            💰
          </div>

          <div>
            <p className="c-stat-label">Total Spent</p>
            <h2 className="c-stat-value">
              {formatCurrency(stats.totalSpent)}
            </h2>
          </div>
        </div>

        <div className="c-stat-card">
          <div
            className="c-stat-icon"
            style={{ background: "#ede9fe" }}
          >
            🤝
          </div>

          <div>
            <p className="c-stat-label">
              Saved Suppliers
            </p>

            <h2 className="c-stat-value">
              {stats.savedSuppliers}
            </h2>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="c-quick-actions">
        <h3>Quick Actions</h3>

        <div className="c-action-grid">
          <button
            type="button"
            className="c-action-card"
            onClick={() => navigate("/customer/products")}
          >
            <span>🏪</span>
            <p>Find Suppliers</p>
          </button>

          <button
            type="button"
            className="c-action-card"
            onClick={() => navigate("/customer/orders")}
          >
            <span>📋</span>
            <p>My Orders</p>
          </button>

          <button
            type="button"
            className="c-action-card"
            onClick={() => navigate("/customer/products")}
          >
            <span>⭐</span>
            <p>Saved Suppliers</p>
          </button>

          <button
            type="button"
            className="c-action-card"
            onClick={() => navigate("/customer/dashboard")}
          >
            <span>👤</span>
            <p>My Profile</p>
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="c-recent-orders">
        <div className="c-section-header">
          <h3>Recent Orders</h3>

          <button
            type="button"
            className="c-btn-link"
            onClick={() => navigate("/customer/orders")}
          >
            View All
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="c-empty">
            <div className="c-empty-icon">📦</div>

            <p>No orders yet.</p>

            <button
              type="button"
              className="c-btn-primary"
              onClick={() => navigate("/customer/products")}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="c-orders-table-wrap">
            <table className="c-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => {
                  const status = getOrderStatus(order);
                  const color = statusColor(status);

                  return (
                    <tr
                      key={order._id}
                      onClick={() =>
                        navigate("/customer/orders")
                      }
                      className="c-clickable-row"
                    >
                      <td>
                        #
                        {order._id
                          ?.slice(-6)
                          .toUpperCase() || "------"}
                      </td>

                      <td>{getSupplierName(order)}</td>

                      <td>
                        {getOrderItemCount(order)}{" "}
                        {getOrderItemCount(order) === 1
                          ? "item"
                          : "items"}
                      </td>

                      <td>
                        {formatCurrency(
                          order.totalAmount || 0
                        )}
                      </td>

                      <td>
                        <span
                          className="c-status-badge"
                          style={{
                            background: `${color}20`,
                            color,
                          }}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;