import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerDashboard.css";
    
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    savedSuppliers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, ordersRes] = await Promise.all([
        axios.get("/api/customer/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/customer/orders?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    const map = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return map[status] || "#6b7280";
  };

  if (loading) return <div className="c-loading">Loading dashboard...</div>;

  return (
    <div className="c-dashboard">
      <div className="c-dash-header">
        <div>
          <h1>Welcome back! 👋</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        <button
          className="c-btn-primary"
          onClick={() => navigate("/customer/marketplace")}
        >
          Browse Marketplace
        </button>
      </div>

      {/* Stats Cards */}
      <div className="c-stats-grid">
        <div className="c-stat-card">
          <div className="c-stat-icon" style={{ background: "#dbeafe" }}>
            📦
          </div>
          <div>
            <p className="c-stat-label">Total Orders</p>
            <h2 className="c-stat-value">{stats.totalOrders}</h2>
          </div>
        </div>
        <div className="c-stat-card">
          <div className="c-stat-icon" style={{ background: "#fef3c7" }}>
            ⏳
          </div>
          <div>
            <p className="c-stat-label">Pending Orders</p>
            <h2 className="c-stat-value">{stats.pendingOrders}</h2>
          </div>
        </div>
        <div className="c-stat-card">
          <div className="c-stat-icon" style={{ background: "#d1fae5" }}>
            💰
          </div>
          <div>
            <p className="c-stat-label">Total Spent</p>
            <h2 className="c-stat-value">₹{stats.totalSpent?.toLocaleString()}</h2>
          </div>
        </div>
        <div className="c-stat-card">
          <div className="c-stat-icon" style={{ background: "#ede9fe" }}>
            🤝
          </div>
          <div>
            <p className="c-stat-label">Saved Suppliers</p>
            <h2 className="c-stat-value">{stats.savedSuppliers}</h2>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="c-quick-actions">
        <h3>Quick Actions</h3>
        <div className="c-action-grid">
          <div
            className="c-action-card"
            onClick={() => navigate("/customer/marketplace")}
          >
            <span>🏪</span>
            <p>Find Suppliers</p>
          </div>
          <div
            className="c-action-card"
            onClick={() => navigate("/customer/orders")}
          >
            <span>📋</span>
            <p>My Orders</p>
          </div>
          <div
            className="c-action-card"
            onClick={() => navigate("/customer/suppliers/saved")}
          >
            <span>⭐</span>
            <p>Saved Suppliers</p>
          </div>
          <div
            className="c-action-card"
            onClick={() => navigate("/customer/profile")}
          >
            <span>👤</span>
            <p>My Profile</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="c-recent-orders">
        <div className="c-section-header">
          <h3>Recent Orders</h3>
          <button
            className="c-btn-link"
            onClick={() => navigate("/customer/orders")}
          >
            View All
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="c-empty">
            <p>No orders yet.</p>
            <button
              className="c-btn-primary"
              onClick={() => navigate("/customer/marketplace")}
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
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/customer/orders/${order._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>#{order._id?.slice(-6).toUpperCase()}</td>
                    <td>{order.supplierName || "—"}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₹{order.totalAmount?.toLocaleString()}</td>
                    <td>
                      <span
                        className="c-status-badge"
                        style={{
                          background: statusColor(order.status) + "20",
                          color: statusColor(order.status),
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;