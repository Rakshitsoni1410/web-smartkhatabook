import "./Profile.css";
import { useNavigate } from "react-router-dom";

// inside component:

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
const navigate = useNavigate();
  return (
    <div className="profile-page">
      {/* HEADER */}
    <button className="back-btn" onClick={() => navigate(-1)}>
  <span className="back-arrow">‹</span>
</button>
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-header-info">
          <h1>{user.shopName || "Shop"}</h1>
          <p>{user.role}</p>
          <span className="header-badge">Active</span>
        </div>
        <div className="profile-header-right">
          <div className="header-meta">
            <span className="meta-label">Member since</span>
            <span className="meta-value">2024</span>
          </div>
          <div className="header-meta">
            <span className="meta-label">Business Type</span>
            <span className="meta-value">{user.businessType || "—"}</span>
          </div>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="profile-grid">
        {/* BUSINESS INFO */}
        <div className="profile-card">
          <div className="card-title">
            <div
              className="card-icon"
              style={{ background: "#EEF2FF", color: "#4F46E5" }}
            >
              🏢
            </div>
            <h3>Business Information</h3>
          </div>
          <div className="profile-row">
            <span>Owner</span>
            <strong>{user.name || "—"}</strong>
          </div>
          <div className="profile-row">
            <span>Business Type</span>
            <strong>{user.businessType || "—"}</strong>
          </div>
          <div className="profile-row">
            <span>Role</span>
            <strong>
              <span className="role-pill">{user.role || "—"}</span>
            </strong>
          </div>
          <div className="profile-row">
            <span>Address</span>
            <strong>{user.address || "—"}</strong>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="profile-card">
          <div className="card-title">
            <div
              className="card-icon"
              style={{ background: "#F0FDF4", color: "#16A34A" }}
            >
              📞
            </div>
            <h3>Contact Information</h3>
          </div>
          <div className="profile-row">
            <span>Phone</span>
            <strong>{user.phone || "—"}</strong>
          </div>
          <div className="profile-row">
            <span>Email</span>
            <strong>{user.email || "—"}</strong>
          </div>
          <div className="profile-row">
            <span>Status</span>
            <strong className="active-text">● Active</strong>
          </div>
        </div>

        {/* ORDER STATS */}
        <div className="profile-card">
          <div className="card-title">
            <div
              className="card-icon"
              style={{ background: "#FFF7ED", color: "#EA580C" }}
            >
              📦
            </div>
            <h3>Order Statistics</h3>
          </div>
          <div className="stats-grid">
            <div className="stats-box">
              <h2>0</h2>
              <p>Total</p>
            </div>
            <div className="stats-box stats-box--green">
              <h2>0</h2>
              <p>Completed</p>
            </div>
            <div className="stats-box stats-box--amber">
              <h2>0</h2>
              <p>Pending</p>
            </div>
          </div>
        </div>

        {/* PAYMENT POLICY */}
        <div className="profile-card">
          <div className="card-title">
            <div
              className="card-icon"
              style={{ background: "#FFF1F2", color: "#E11D48" }}
            >
              💳
            </div>
            <h3>Payment Policy</h3>
          </div>
          <div className="profile-row">
            <span>Advance Payment</span>
            <strong>
              <span className="advance-pill">
                {user.advancePercentage || 0}%
              </span>
            </strong>
          </div>
          <div className="profile-row">
            <span>Delivery Time</span>
            <strong>5 Days</strong>
          </div>
          <div className="policy-note">
            💡 Advance is collected before order processing begins.
          </div>
        </div>
      </div>
    </div>
  );
}
