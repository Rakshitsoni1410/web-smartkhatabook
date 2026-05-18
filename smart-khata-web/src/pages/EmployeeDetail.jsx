import React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

export default function EmployeeDetail() {
  const { state } = useLocation();

  const navigate = useNavigate();

  if (!state) {
    return <h2>No Employee Data Found</h2>;
  }

  const paid =
    state.payments?.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    ) || 0;

  const pending = Number(state.salary) - paid;

  return (
    <>
      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:Arial;
        }

        .detail-page{
          min-height:100vh;
          background:#f5f7fb;
          padding:25px;
        }

        .back-btn{
          background:#2563eb;
          color:white;
          border:none;
          padding:12px 18px;
          border-radius:12px;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:8px;
          margin-bottom:25px;
          font-weight:600;
        }

        .detail-header{
          background:white;
          padding:30px;
          border-radius:24px;
          box-shadow:0 10px 25px rgba(0,0,0,0.05);
          margin-bottom:25px;
        }

        .detail-header h1{
          font-size:34px;
          color:#111827;
        }

        .detail-header p{
          margin-top:8px;
          color:#6b7280;
        }

        .detail-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:20px;
          margin-bottom:30px;
        }

        .detail-card{
          background:white;
          padding:24px;
          border-radius:22px;
          box-shadow:0 10px 25px rgba(0,0,0,0.05);
        }

        .detail-card h3{
          color:#6b7280;
          margin-bottom:10px;
          font-size:15px;
        }

        .detail-card p{
          font-size:24px;
          font-weight:700;
          color:#111827;
        }

        .attendance-section{
          background:white;
          padding:25px;
          border-radius:24px;
          box-shadow:0 10px 25px rgba(0,0,0,0.05);
        }

        .attendance-title{
          font-size:24px;
          margin-bottom:20px;
          color:#111827;
        }

        .attendance-list{
          display:flex;
          flex-direction:column;
          gap:14px;
        }

        .attendance-card{
          padding:18px;
          border-radius:16px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          font-weight:600;
        }

        .present{
          background:#dcfce7;
          color:#166534;
        }

        .absent{
          background:#fee2e2;
          color:#991b1b;
        }

        .leave{
          background:#fef3c7;
          color:#92400e;
        }

        .empty-text{
          color:#6b7280;
          text-align:center;
          padding:20px;
        }
      `}</style>

      <div className="detail-page">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back
        </button>

        {/* HEADER */}
        <div className="detail-header">
          <h1>{state.name}</h1>

          <p>{state.phone}</p>
        </div>

        {/* DETAILS */}
        <div className="detail-grid">

          <div className="detail-card">
            <h3>
              <FiBriefcase /> Category
            </h3>

            <p>{state.category}</p>
          </div>

          <div className="detail-card">
            <h3>
              <FiDollarSign /> Salary
            </h3>

            <p>₹{state.salary}</p>
          </div>

          <div className="detail-card">
            <h3>
              <FiDollarSign /> Paid
            </h3>

            <p>₹{paid}</p>
          </div>

          <div className="detail-card">
            <h3>
              <FiDollarSign /> Pending
            </h3>

            <p>₹{pending}</p>
          </div>

        </div>

        {/* ATTENDANCE */}
        <div className="attendance-section">

          <h2 className="attendance-title">
            <FiCalendar /> Attendance History
          </h2>

          <div className="attendance-list">

            {state.attendance &&
            state.attendance.length > 0 ? (
              state.attendance
                .slice()
                .reverse()
                .map((item, index) => (
                  <div
                    key={index}
                    className={`attendance-card ${
                      item.status === "Present"
                        ? "present"
                        : item.status === "Absent"
                        ? "absent"
                        : "leave"
                    }`}
                  >
                    <span>{item.status}</span>

                    <span>
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
            ) : (
              <div className="empty-text">
                No Attendance Found
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}