import React from "react";
import { useLocation } from "react-router-dom";
import "./EmployeeDetail.css";

const EmployeeDetail = () => {
  const { state } = useLocation();

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h1>{state.name}</h1>
        <p>{state.phone}</p>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Category</h3>
          <p>{state.category}</p>
        </div>

        <div className="detail-card">
          <h3>Salary</h3>
          <p>₹{state.salary}</p>
        </div>

        <div className="detail-card">
          <h3>Paid</h3>
          <p>₹{state.paid}</p>
        </div>

        <div className="detail-card">
          <h3>Pending</h3>
          <p>₹{state.salary - state.paid}</p>
        </div>
      </div>

      <div className="attendance-section">
        <h2>Attendance History</h2>

        <div className="attendance-card present">
          Present - 15 May 2026
        </div>

        <div className="attendance-card absent">
          Absent - 14 May 2026
        </div>

        <div className="attendance-card leave">
          Leave - 13 May 2026
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;