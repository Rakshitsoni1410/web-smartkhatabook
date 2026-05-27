// FILE: src/pages/Employees.jsx

import React, { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiUsers,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiDollarSign,
} from "react-icons/fi";

export default function Employees() {
  const navigate = useNavigate();

  const API = "https://backend-of-smartkhata-book.onrender.com/api/employees";

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editId, setEditId] = useState(null);

  const [employees, setEmployees] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "Cash",
    note: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    category: "",
    salary: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =========================
  // FETCH
  // =========================
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API);

      setEmployees(res.data.employees || []);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // FILTER
  // =========================
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // SUMMARY
  // =========================
  const totalSalary = employees.reduce(
    (acc, emp) => acc + Number(emp.salary || 0),
    0,
  );

  const totalPaid = employees.reduce((acc, emp) => {
    const paid =
      emp.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    return acc + paid;
  }, 0);

  const pendingSalary = totalSalary - totalPaid;

  const presentEmployees = employees.filter((emp) => {
    if (!emp.attendance?.length) return false;

    return emp.attendance[emp.attendance.length - 1]?.status === "Present";
  }).length;

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/delete/${id}`);

      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // ATTENDANCE
  // =========================
  const handleAttendance = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Present" ? "Absent" : "Present";

      await axios.post(`${API}/attendance/${id}`, {
        status: newStatus,
        date: new Date().toISOString(),
      });

      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // PAYMENT
  // =========================
  const handleSalaryPayment = async () => {
    try {
      if (!paymentData.amount) {
        alert("Enter amount");
        return;
      }

      await axios.post(`${API}/payment/${selectedEmployee._id}`, paymentData);

      fetchEmployees();

      setShowPaymentModal(false);

      setPaymentData({
        amount: "",
        method: "Cash",
        note: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.phone || !formData.salary) {
        alert("Please fill all fields");
        return;
      }

      if (editId) {
        await axios.put(`${API}/update/${editId}`, formData);
      } else {
        await axios.post(`${API}/add`, {
          ...formData,
          payments: [],
          attendance: [],
          status: "Active",
        });
      }

      fetchEmployees();

      setShowModal(false);

      setEditId(null);

      setFormData({
        name: "",
        phone: "",
        category: "",
        salary: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (emp) => {
    setEditId(emp._id);

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
  font-family:Inter, Arial, sans-serif;
}

body{
  background:#eef2ff;
}

.employee-page{
  padding:30px;
  min-height:100vh;
  background:
  linear-gradient(
    135deg,
    #eef2ff 0%,
    #f8fafc 50%,
    #ecfeff 100%
  );
}

.top-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:30px;
  flex-wrap:wrap;
  gap:20px;
}

.title-wrap h1{
  font-size:38px;
  font-weight:800;
  color:#0f172a;
}

.title-wrap p{
  margin-top:8px;
  color:#64748b;
}

.add-btn{
  background:linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  );

  color:white;
  border:none;
  padding:15px 22px;
  border-radius:16px;
  display:flex;
  align-items:center;
  gap:10px;
  cursor:pointer;
  font-weight:700;
  transition:0.3s;
}

.add-btn:hover{
  transform:translateY(-3px);
}

.summary-grid{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(240px,1fr));

  gap:20px;
  margin-bottom:30px;
}

.summary-card{
  background:white;
  padding:24px;
  border-radius:24px;
  box-shadow:
  0 10px 30px rgba(0,0,0,0.08);

  transition:0.3s;
}

.summary-card:hover{
  transform:translateY(-5px);
}

.summary-card h3{
  color:#64748b;
  margin-bottom:12px;
}

.summary-card h2{
  font-size:34px;
  font-weight:800;
}

.search-box{
  background:white;
  border-radius:18px;
  padding:16px 18px;
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:30px;

  box-shadow:
  0 8px 20px rgba(0,0,0,0.05);
}

.search-box input{
  border:none;
  outline:none;
  width:100%;
  font-size:15px;
}

.employee-grid{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(340px,1fr));

  gap:24px;
}

.employee-card{
  background:white;
  border-radius:28px;
  padding:24px;

  box-shadow:
  0 10px 30px rgba(0,0,0,0.08);

  transition:0.35s;
}

.employee-card:hover{
  transform:
  translateY(-8px)
  scale(1.01);
}

.employee-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.avatar{
  width:72px;
  height:72px;
  border-radius:24px;

  background:
  linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  );

  color:white;

  display:flex;
  align-items:center;
  justify-content:center;

  font-size:30px;
}

.employee-name{
  font-size:24px;
  font-weight:800;
  margin-top:18px;
}

.employee-phone{
  color:#64748b;
  margin-top:8px;
}

.category{
  display:inline-block;

  margin-top:14px;

  background:#dbeafe;

  color:#1d4ed8;

  padding:8px 14px;

  border-radius:30px;

  font-size:13px;

  font-weight:700;
}

.badge{
  padding:8px 16px;
  border-radius:30px;
  font-size:12px;
  font-weight:700;
}

.active{
  background:#dcfce7;
  color:#166534;
}

.leave{
  background:#fee2e2;
  color:#991b1b;
}

.salary-section{
  margin-top:24px;
}

.salary-top{
  display:flex;
  justify-content:space-between;
  margin-bottom:10px;
  font-size:14px;
  font-weight:600;
}

.progress{
  height:12px;
  background:#e2e8f0;
  border-radius:30px;
  overflow:hidden;
}

.progress-bar{
  height:100%;

  background:
  linear-gradient(
    90deg,
    #2563eb,
    #7c3aed
  );
}

.card-actions{
  display:flex;
  gap:12px;
  margin-top:25px;
  flex-wrap:wrap;
}

.action-btn{
  flex:1;
  border:none;
  height:48px;
  border-radius:16px;
  color:white;
  font-weight:700;
  cursor:pointer;

  display:flex;
  align-items:center;
  justify-content:center;

  font-size:18px;

  transition:0.3s;
}

.action-btn:hover{
  transform:translateY(-3px);
}

.view-btn{
  background:#0ea5e9;
}

.edit-btn{
  background:#2563eb;
}

.delete-btn{
  background:#ef4444;
}

.salary-btn{
  background:
  linear-gradient(
    135deg,
    #f59e0b,
    #f97316
  );
}

.attendance-btn{
  background:#16a34a;
}

.attendance-off{
  background:#f97316;
}

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,0.45);

  display:flex;
  align-items:center;
  justify-content:center;

  z-index:1000;
}

.modal{
  width:430px;
  background:white;
  padding:30px;
  border-radius:28px;
}

.modal h2{
  margin-bottom:22px;
  color:#111827;
}

.modal input{
  width:100%;
  padding:15px;
  border-radius:14px;
  border:1px solid #cbd5e1;
  margin-bottom:16px;
}

.employee-select{
  width:100%;
  padding:15px;
  border-radius:14px;
  border:1px solid #cbd5e1;
  margin-bottom:16px;
}

.modal-buttons{
  display:flex;
  gap:14px;
}

.modal-buttons button{
  flex:1;
  border:none;
  padding:15px;
  border-radius:14px;
  cursor:pointer;
  color:white;
  font-weight:700;
}

.save-btn{
  background:
  linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  );
}

.cancel-btn{
  background:#64748b;
}

@media(max-width:768px){

  .employee-page{
    padding:18px;
  }

  .employee-grid{
    grid-template-columns:1fr;
  }

  .modal{
    width:95%;
  }

  .action-btn{
    min-width:48%;
  }

}
      `}</style>

      <div className="employee-page">
        {/* HEADER */}

        <div className="top-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              className="or-back-btn"
              onClick={() => navigate("/dashboard")}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                border: "none",
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                color: "white",
                fontSize: "22px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
              }}
            >
              <FiArrowLeft />
            </button>

            <div className="title-wrap">
              <h1>Employee Management</h1>

              <p>Manage employees, salary & attendance</p>
            </div>
          </div>

          <button
            className="add-btn"
            onClick={() => {
              setShowModal(true);

              setEditId(null);

              setFormData({
                name: "",
                phone: "",
                category: "",
                salary: "",
              });
            }}
          >
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

        {/* EMPLOYEE LIST */}

        <div className="employee-grid">
          {filteredEmployees.map((emp) => {
            const paid =
              emp.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

            const progress = (paid / emp.salary) * 100;

            const latestAttendance =
              emp.attendance?.[emp.attendance.length - 1]?.status;

            return (
              <div className="employee-card" key={emp._id}>
                <div className="employee-top">
                  <div className="avatar">
                    <FiUsers />
                  </div>

                  <span
                    className={`badge ${
                      emp.status === "Active" ? "active" : "leave"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="employee-name">{emp.name}</div>

                <div className="employee-phone">{emp.phone}</div>

                <div className="category">{emp.category}</div>

                {/* SALARY */}

                <div className="salary-section">
                  <div className="salary-top">
                    <span>Paid ₹{paid}</span>

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
                    className="action-btn view-btn"
                    onClick={() =>
                      navigate("/employee-detail", {
                        state: emp,
                      })
                    }
                  >
                    <FiEye />
                  </button>

                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(emp)}
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(emp._id)}
                  >
                    <FiTrash2 />
                  </button>

                  <button
                    className="action-btn salary-btn"
                    onClick={() => {
                      setSelectedEmployee(emp);

                      setShowPaymentModal(true);
                    }}
                  >
                    <FiDollarSign />
                  </button>

                  <button
                    className={`action-btn ${
                      latestAttendance === "Present"
                        ? "attendance-btn"
                        : "attendance-off"
                    }`}
                    onClick={() => handleAttendance(emp._id, latestAttendance)}
                  >
                    {latestAttendance === "Present" ? (
                      <FiCheckCircle />
                    ) : (
                      <FiXCircle />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADD / EDIT MODAL */}

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

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="employee-select"
              >
                <option value="">Select Category</option>

                <option value="Salesman">Salesman</option>

                <option value="Cashier">Cashier</option>

                <option value="Manager">Manager</option>

                <option value="Delivery Boy">Delivery Boy</option>

                <option value="Accountant">Accountant</option>

                <option value="Helper">Helper</option>

                <option value="Other">Other</option>
              </select>

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

        {/* PAYMENT MODAL */}

        {showPaymentModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Pay Salary</h2>

              <input
                type="number"
                placeholder="Amount"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    amount: e.target.value,
                  })
                }
              />

              <select
                className="employee-select"
                value={paymentData.method}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    method: e.target.value,
                  })
                }
              >
                <option value="Cash">Cash</option>

                <option value="UPI">UPI</option>

                <option value="Bank Transfer">Bank Transfer</option>
              </select>

              <input
                type="text"
                placeholder="Note"
                value={paymentData.note}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    note: e.target.value,
                  })
                }
              />

              <div className="modal-buttons">
                <button className="save-btn" onClick={handleSalaryPayment}>
                  Pay Now
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => setShowPaymentModal(false)}
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
