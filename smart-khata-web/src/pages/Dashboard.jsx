import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        {/* Topbar */}
        <div className="topbar">
          <h2>Dashboard</h2>
          <p>Welcome, {user.name || "User"}</p>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Good Evening, {user.name || "User"}</h2>
          <p>{user.shopName || "Business Name"}</p>
          <span>{user.businessType || "Business Type"}</span>
        </div>

        {/* Stats */}
        <div className="stats-grid">

          <div className="stat-card">
            <h1>24</h1>
            <p>Stock Items</p>
          </div>

          <div className="stat-card">
            <h1>6</h1>
            <p>Employees</p>
          </div>

          <div className="stat-card">
            <h1>12</h1>
            <p>Orders</p>
          </div>

          <div className="stat-card">
            <h1>18</h1>
            <p>Reviews</p>
          </div>

        </div>

        {/* Focus */}
        <div className="focus-card">
          <h3>Today's Focus</h3>
          <p>
            Manage stock, monitor employees,
            handle incoming orders and review
            customer feedback.
          </p>
        </div>

      </div>
    </div>
  );
}