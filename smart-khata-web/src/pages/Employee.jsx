// FILE: src/pages/Employees.jsx

import React, { useState } from "react";

import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

export default function Employees() {
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editId, setEditId] = useState(null);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      phone: "9876543210",
      category: "Salesman",
      salary: 15000,
      paid: 10000,
      attendance: true,
      status: "Active",
    },
    {
      id: 2,
      name: "Amit Patel",
      phone: "9998887771",
      category: "Cashier",
      salary: 18000,
      paid: 12000,
      attendance: false,
      status: "On Leave",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    category: "",
    salary: "",
  });

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalSalary = employees.reduce((acc, emp) => acc + emp.salary, 0);

  const totalPaid = employees.reduce((acc, emp) => acc + emp.paid, 0);

  const pendingSalary = totalSalary - totalPaid;

  const presentEmployees = employees.filter((emp) => emp.attendance).length;

  const handleDelete = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const handleAttendance = (id) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              attendance: !emp.attendance,
            }
          : emp,
      ),
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.salary) {
      alert("Fill all fields");
      return;
    }

    if (editId) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editId
            ? {
                ...emp,
                ...formData,
                salary: Number(formData.salary),
              }
            : emp,
        ),
      );
    } else {
      const newEmployee = {
        id: Date.now(),
        ...formData,
        salary: Number(formData.salary),
        paid: 0,
        attendance: true,
        status: "Active",
      };

      setEmployees([...employees, newEmployee]);
    }

    setShowModal(false);

    setEditId(null);

    setFormData({
      name: "",
      phone: "",
      category: "",
      salary: "",
    });
  };

  const handleEdit = (emp) => {
    setEditId(emp.id);

    setFormData({
      name: emp.name,
      phone: emp.phone,
      category: emp.category,
      salary: emp.salary,
    });

    setShowModal(true);
  };

  return (
    <>
      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:Arial;
        }

        body{
          background:#f5f7fb;
        }

        .employee-page{
          padding:25px;
        }

        .top-header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:25px;
        }

        .title-wrap h1{
          font-size:30px;
          color:#111827;
        }

        .title-wrap p{
          color:#6b7280;
          margin-top:6px;
        }

        .add-btn{
          background:#2563eb;
          color:white;
          border:none;
          padding:14px 18px;
          border-radius:14px;
          display:flex;
          align-items:center;
          gap:8px;
          cursor:pointer;
          font-size:15px;
          font-weight:600;
        }

        .summary-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:18px;
          margin-bottom:25px;
        }

        .summary-card{
          background:white;
          padding:22px;
          border-radius:18px;
          box-shadow:0 10px 30px rgba(0,0,0,0.05);
        }

        .summary-card h3{
          color:#6b7280;
          margin-bottom:10px;
          font-size:14px;
        }

        .summary-card h2{
          font-size:28px;
          color:#111827;
        }

        .search-box{
          background:white;
          border-radius:16px;
          padding:14px 18px;
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:25px;
        }

        .search-box input{
          border:none;
          outline:none;
          width:100%;
          font-size:15px;
        }

        .employee-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
          gap:20px;
        }

        .employee-card{
          background:white;
          border-radius:22px;
          padding:22px;
          box-shadow:0 10px 25px rgba(0,0,0,0.05);
        }

        .employee-top{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:18px;
        }

        .avatar{
          width:60px;
          height:60px;
          border-radius:18px;
          background:#2563eb;
          color:white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:24px;
        }

        .employee-name{
          font-size:20px;
          font-weight:700;
          color:#111827;
        }

        .employee-phone{
          color:#6b7280;
          margin-top:4px;
        }

        .badge{
          display:inline-block;
          padding:7px 12px;
          border-radius:30px;
          font-size:12px;
          font-weight:600;
          margin-top:12px;
        }

        .active{
          background:#dcfce7;
          color:#166534;
        }

        .leave{
          background:#fef3c7;
          color:#92400e;
        }

        .salary-section{
          margin-top:20px;
        }

        .salary-top{
          display:flex;
          justify-content:space-between;
          margin-bottom:8px;
        }

        .progress{
          height:10px;
          background:#e5e7eb;
          border-radius:30px;
          overflow:hidden;
        }

        .progress-bar{
          height:100%;
          background:#2563eb;
        }

        .card-actions{
          display:flex;
          gap:12px;
          margin-top:22px;
        }

        .action-btn{
          flex:1;
          border:none;
          padding:12px;
          border-radius:12px;
          color:white;
          font-weight:600;
          cursor:pointer;
        }

        .edit-btn{
          background:#2563eb;
        }

        .delete-btn{
          background:#dc2626;
        }

        .attendance-btn{
          background:#16a34a;
        }

        .attendance-off{
          background:#ef4444;
        }

        .modal-overlay{
          position:fixed;
          inset:0;
          background:rgba(0,0,0,0.4);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:1000;
        }

        .modal{
          width:420px;
          background:white;
          padding:25px;
          border-radius:22px;
        }

        .modal h2{
          margin-bottom:20px;
        }

        .modal input{
          width:100%;
          padding:14px;
          border-radius:12px;
          border:1px solid #d1d5db;
          margin-bottom:15px;
        }

        .modal-buttons{
          display:flex;
          gap:12px;
        }

        .modal-buttons button{
          flex:1;
          border:none;
          padding:14px;
          border-radius:12px;
          cursor:pointer;
          color:white;
          font-weight:600;
        }

        .save-btn{
          background:#2563eb;
        }

        .cancel-btn{
          background:#6b7280;
        }
      `}</style>

      <div className="employee-page">
        {/* TOP */}
        <div className="top-header">
          <div className="title-wrap">
            <h1>Employee Management</h1>
            <p>Manage employees, salary & attendance</p>
          </div>

          <button className="add-btn" onClick={() => setShowModal(true)}>
            <FiPlus />
            Add Employee
          </button>
        </div>

        {/* SUMMARY */}
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Employees</h3>
            <h2>{employees.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Salary</h3>
            <h2>₹{totalSalary}</h2>
          </div>

          <div className="summary-card">
            <h3>Pending Salary</h3>
            <h2>₹{pendingSalary}</h2>
          </div>

          <div className="summary-card">
            <h3>Present Today</h3>
            <h2>{presentEmployees}</h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <FiSearch />

          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* EMPLOYEES */}
        <div className="employee-grid">
          {filteredEmployees.map((emp) => {
            const progress = (emp.paid / emp.salary) * 100;

            return (
              <div className="employee-card" key={emp.id}>
                <div className="employee-top">
                  <div>
                    <div className="avatar">
                      <FiUsers />
                    </div>
                  </div>

                  <div>
                    <span
                      className={`badge ${
                        emp.status === "Active" ? "active" : "leave"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>
                </div>

                <div className="employee-name">{emp.name}</div>

                <div className="employee-phone">{emp.phone}</div>

                <div
                  style={{
                    marginTop: "10px",
                    color: "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  {emp.category}
                </div>

                {/* SALARY */}
                <div className="salary-section">
                  <div className="salary-top">
                    <span>Paid ₹{emp.paid}</span>

                    <span>₹{emp.salary}</span>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="card-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(emp)}
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(emp.id)}
                  >
                    <FiTrash2 />
                  </button>

                  <button
                    className={`action-btn ${
                      emp.attendance ? "attendance-btn" : "attendance-off"
                    }`}
                    onClick={() => handleAttendance(emp.id)}
                  >
                    {emp.attendance ? <FiCheckCircle /> : <FiXCircle />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editId ? "Edit Employee" : "Add Employee"}</h2>

              <input
                type="text"
                name="name"
                placeholder="Employee Name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
              />

              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={formData.salary}
                onChange={handleChange}
              />

              <div className="modal-buttons">
                <button className="save-btn" onClick={handleSubmit}>
                  {editId ? "Update" : "Save"}
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
