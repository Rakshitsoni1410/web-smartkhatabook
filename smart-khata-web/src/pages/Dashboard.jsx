import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1>Dashboard</h1>

        <div className="cards">
          <div className="card">
            <h3>Customers</h3>
            <p>120</p>
          </div>

          <div className="card">
            <h3>Bills</h3>
            <p>75</p>
          </div>

          <div className="card">
            <h3>Employees</h3>
            <p>8</p>
          </div>
        </div>
      </div>
    </div>
  );
}