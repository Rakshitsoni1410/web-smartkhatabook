import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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
  FiMoon,
  FiSun,
  FiX,
} from "react-icons/fi";

import {
  FaRupeeSign,
} from "react-icons/fa";

import api from "../api";


import "./Employee.css";
// =====================================================
// API
// =====================================================

const API = "/api/employees";

// =====================================================
// MONEY FORMATTER
// =====================================================

const formatMoney = (value) => {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// COMPONENT
// =====================================================

export default function Employees() {
  const navigate = useNavigate();

  // =====================================================
  // MAIN STATE
  // =====================================================

  const [employees, setEmployees] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // ADD / EDIT MODAL
  // =====================================================

  const [showModal, setShowModal] =
    useState(false);

  const [editId, setEditId] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      category: "",
      salary: "",
    });

  // =====================================================
  // PAYMENT MODAL
  // =====================================================

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] = useState(false);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState(null);

  const [
    paymentData,
    setPaymentData,
  ] = useState({
    amount: "",
    method: "Cash",
    note: "",
  });

  // =====================================================
  // DELETE MODAL
  // =====================================================

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "smartkhata-theme"
          );

        if (saved === "dark") {
          return true;
        }

        if (saved === "light") {
          return false;
        }

        return (
          window.matchMedia?.(
            "(prefers-color-scheme: dark)"
          ).matches || false
        );
      } catch {
        return false;
      }
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        "smartkhata-theme",
        darkMode
          ? "dark"
          : "light"
      );
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  const fetchEmployees =
    async () => {
      try {
        setLoading(true);

        setError("");

        const res =
          await api.get(API);

        setEmployees(
          Array.isArray(
            res.data?.employees
          )
            ? res.data.employees
            : []
        );
      } catch (err) {
        console.error(
          "EMPLOYEE FETCH ERROR:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Unable to load employees."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredEmployees =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return employees;
      }

      return employees.filter(
        (emp) =>
          String(
            emp?.name || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            emp?.phone || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            emp?.category || ""
          )
            .toLowerCase()
            .includes(query)
      );
    }, [
      employees,
      search,
    ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary =
    useMemo(() => {
      let totalSalary = 0;
      let totalPaid = 0;
      let present = 0;

      employees.forEach(
        (emp) => {
          totalSalary +=
            Number(
              emp?.salary || 0
            );

          const paid =
            emp?.payments?.reduce(
              (
                total,
                payment
              ) =>
                total +
                Number(
                  payment?.amount ||
                    0
                ),
              0
            ) || 0;

          totalPaid += paid;

          const attendance =
            emp?.attendance || [];

          const latest =
            attendance[
              attendance.length -
                1
            ]?.status;

          if (
            latest ===
            "Present"
          ) {
            present += 1;
          }
        }
      );

      return {
        totalSalary,

        totalPaid,

        pendingSalary:
          Math.max(
            totalSalary -
              totalPaid,
            0
          ),

        present,
      };
    }, [employees]);

  // =====================================================
  // ADD EMPLOYEE
  // =====================================================

  const openAddModal = () => {
    setEditId(null);

    setFormData({
      name: "",
      phone: "",
      category: "",
      salary: "",
    });

    setShowModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (emp) => {
    setEditId(emp._id);

    setFormData({
      name:
        emp?.name || "",

      phone:
        emp?.phone || "",

      category:
        emp?.category || "",

      salary:
        emp?.salary || "",
    });

    setShowModal(true);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]: value,
      })
    );
  };

  // =====================================================
  // SAVE EMPLOYEE
  // =====================================================

  const handleSubmit =
    async () => {
      const name =
        formData.name.trim();

      const phone =
        formData.phone.trim();

      const category =
        formData.category.trim();

      const salary =
        Number(
          formData.salary
        );

      if (
        !name ||
        !phone ||
        !category ||
        !Number.isFinite(
          salary
        ) ||
        salary <= 0
      ) {
        alert(
          "Please enter valid employee details."
        );

        return;
      }

      try {
        setSaving(true);

        const payload = {
          name,
          phone,
          category,
          salary,
        };

        if (editId) {
          await api.put(
            `${API}/update/${editId}`,
            payload
          );
        } else {
          await api.post(
            `${API}/add`,
            {
              ...payload,

              payments: [],

              attendance: [],

              status:
                "Active",
            }
          );
        }

        await fetchEmployees();

        setShowModal(false);

        setEditId(null);

        setFormData({
          name: "",
          phone: "",
          category: "",
          salary: "",
        });
      } catch (err) {
        console.error(
          "EMPLOYEE SAVE ERROR:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
            "Failed to save employee."
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // DELETE
  // =====================================================

  const requestDelete = (
    employee
  ) => {
    setDeleteTarget(
      employee
    );

    setShowDeleteModal(
      true
    );
  };

  const cancelDelete = () => {
    if (saving) {
      return;
    }

    setShowDeleteModal(
      false
    );

    setDeleteTarget(null);
  };

  const confirmDelete =
    async () => {
      if (
        !deleteTarget?._id
      ) {
        return;
      }

      try {
        setSaving(true);

        await api.delete(
          `${API}/delete/${deleteTarget._id}`
        );

        await fetchEmployees();

        setShowDeleteModal(
          false
        );

        setDeleteTarget(null);
      } catch (err) {
        console.error(
          "EMPLOYEE DELETE ERROR:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
            "Failed to delete employee."
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // ATTENDANCE
  // =====================================================

  const handleAttendance =
    async (
      id,
      currentStatus
    ) => {
      try {
        const newStatus =
          currentStatus ===
          "Present"
            ? "Absent"
            : "Present";

        await api.post(
          `${API}/attendance/${id}`,
          {
            status:
              newStatus,

            date:
              new Date().toISOString(),
          }
        );

        await fetchEmployees();
      } catch (err) {
        console.error(
          "ATTENDANCE ERROR:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
            "Unable to update attendance."
        );
      }
    };

  // =====================================================
  // OPEN PAYMENT
  // =====================================================

  const openPaymentModal = (
    employee
  ) => {
    setSelectedEmployee(
      employee
    );

    setPaymentData({
      amount: "",
      method: "Cash",
      note: "",
    });

    setShowPaymentModal(
      true
    );
  };

  // =====================================================
  // SALARY PAYMENT
  // =====================================================

  const handleSalaryPayment =
    async () => {
      const amount =
        Number(
          paymentData.amount
        );

      if (
        !selectedEmployee?._id
      ) {
        return;
      }

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        alert(
          "Enter a valid amount."
        );

        return;
      }

      try {
        setSaving(true);

        await api.post(
          `${API}/payment/${selectedEmployee._id}`,
          {
            ...paymentData,

            amount,
          }
        );

        await fetchEmployees();

        setShowPaymentModal(
          false
        );

        setSelectedEmployee(
          null
        );

        setPaymentData({
          amount: "",
          method: "Cash",
          note: "",
        });
      } catch (err) {
        console.error(
          "SALARY PAYMENT ERROR:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
            "Salary payment failed."
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={`emp-page ${
        darkMode
          ? "emp-dark"
          : ""
      }`}
    >
      {/* =================================================
          HERO
      ================================================== */}

      <header className="emp-hero">
        <div className="emp-hero-glow emp-hero-glow-one" />

        <div className="emp-hero-glow emp-hero-glow-two" />

        <div className="emp-hero-left">
          <button
            type="button"
            className="emp-back-btn"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            aria-label="Back to dashboard"
          >
            <FiArrowLeft />
          </button>

          <div className="emp-heading">
            <div className="emp-heading-icon">
              <FiUsers />
            </div>

            <div>
              <h1>
                Employee Management
              </h1>

              <p>
                Manage your team,
                salaries and daily
                attendance
              </p>
            </div>
          </div>
        </div>

        <div className="emp-hero-actions">
          <button
            type="button"
            className="emp-theme-btn"
            onClick={() =>
              setDarkMode(
                (
                  previous
                ) =>
                  !previous
              )
            }
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Light mode"
                : "Dark mode"
            }
          >
            {darkMode ? (
              <FiSun />
            ) : (
              <FiMoon />
            )}
          </button>

          <button
            type="button"
            className="emp-add-btn"
            onClick={
              openAddModal
            }
          >
            <FiPlus />

            <span>
              Add Employee
            </span>
          </button>
        </div>
      </header>

      {/* =================================================
          SUMMARY
      ================================================== */}

      <section className="emp-summary-grid">
        <div className="emp-summary-card emp-summary-blue">
          <div className="emp-summary-icon">
            <FiUsers />
          </div>

          <div>
            <span>
              Total Employees
            </span>

            <strong>
              {
                employees.length
              }
            </strong>
          </div>
        </div>

        <div className="emp-summary-card emp-summary-purple">
          <div className="emp-summary-icon">
            <FaRupeeSign />
          </div>

          <div>
            <span>
              Total Salary
            </span>

            <strong>
              {formatMoney(
                summary.totalSalary
              )}
            </strong>
          </div>
        </div>

        <div className="emp-summary-card emp-summary-orange">
          <div className="emp-summary-icon">
            <FaRupeeSign />
          </div>

          <div>
            <span>
              Pending Salary
            </span>

            <strong>
              {formatMoney(
                summary.pendingSalary
              )}
            </strong>
          </div>
        </div>

        <div className="emp-summary-card emp-summary-green">
          <div className="emp-summary-icon">
            <FiCheckCircle />
          </div>

          <div>
            <span>
              Present Today
            </span>

            <strong>
              {
                summary.present
              }
            </strong>
          </div>
        </div>
      </section>

      {/* =================================================
          SEARCH
      ================================================== */}

      <section className="emp-toolbar">
        <div className="emp-search">
          <FiSearch />

          <input
            type="search"
            placeholder="Search by name, phone or role..."
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
          />

          {search && (
            <button
              type="button"
              className="emp-search-clear"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="emp-count">
          <FiUsers />

          {
            filteredEmployees.length
          }{" "}
          employee
          {filteredEmployees.length ===
          1
            ? ""
            : "s"}
        </div>
      </section>

      {/* =================================================
          LOADING
      ================================================== */}

      {loading && (
        <div className="emp-state-card">
          <div className="emp-loader" />

          <p>
            Loading employees...
          </p>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================== */}

      {!loading &&
        error && (
          <div className="emp-state-card emp-error-state">
            <FiXCircle
              size={32}
            />

            <h3>
              Unable to load
              employees
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={
                fetchEmployees
              }
            >
              Try Again
            </button>
          </div>
        )}

      {/* =================================================
          NO RESULTS
      ================================================== */}

      {!loading &&
        !error &&
        filteredEmployees.length ===
          0 && (
          <div className="emp-state-card">
            <FiUsers
              size={35}
            />

            <h3>
              {search
                ? "No matching employees"
                : "No employees yet"}
            </h3>

            <p>
              {search
                ? "Try another name, phone number or role."
                : "Add your first employee to start managing your team."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={
                  openAddModal
                }
              >
                <FiPlus />

                Add Employee
              </button>
            )}
          </div>
        )}

      {/* =================================================
          EMPLOYEE GRID
      ================================================== */}

      {!loading &&
        !error &&
        filteredEmployees.length >
          0 && (
          <section className="emp-grid">
            {filteredEmployees.map(
              (emp) => {
                const paid =
                  emp?.payments?.reduce(
                    (
                      sum,
                      payment
                    ) =>
                      sum +
                      Number(
                        payment?.amount ||
                          0
                      ),
                    0
                  ) || 0;

                const salary =
                  Number(
                    emp?.salary ||
                      0
                  );

                const rawProgress =
                  salary > 0
                    ? (paid /
                        salary) *
                      100
                    : 0;

                const progress =
                  Math.min(
                    Math.max(
                      rawProgress,
                      0
                    ),
                    100
                  );

                const attendance =
                  emp?.attendance ||
                  [];

                const latestAttendance =
                  attendance[
                    attendance.length -
                      1
                  ]?.status;

                const isPresent =
                  latestAttendance ===
                  "Present";

                const initial =
                  String(
                    emp?.name ||
                      "E"
                  )
                    .trim()
                    .charAt(0)
                    .toUpperCase();

                return (
                  <article
                    className="emp-card"
                    key={
                      emp._id
                    }
                  >
                    {/* TOP */}

                    <div className="emp-card-top">
                      <div className="emp-avatar">
                        {
                          initial
                        }
                      </div>

                      <div className="emp-card-badges">
                        <span
                          className={`emp-work-badge ${
                            emp.status ===
                            "Active"
                              ? "emp-active"
                              : "emp-leave"
                          }`}
                        >
                          <span />

                          {emp.status ||
                            "Active"}
                        </span>

                        <span
                          className={`emp-attendance-chip ${
                            isPresent
                              ? "emp-present"
                              : "emp-absent"
                          }`}
                        >
                          {isPresent
                            ? "Present"
                            : "Absent"}
                        </span>
                      </div>
                    </div>

                    {/* INFO */}

                    <div className="emp-info">
                      <h2>
                        {emp.name ||
                          "Unnamed Employee"}
                      </h2>

                      <p>
                        {emp.phone ||
                          "No phone number"}
                      </p>

                      <span className="emp-role">
                        {emp.category ||
                          "Employee"}
                      </span>
                    </div>

                    {/* SALARY */}

                    <div className="emp-salary">
                      <div className="emp-salary-heading">
                        <span>
                          Salary Progress
                        </span>

                        <strong>
                          {Math.round(
                            progress
                          )}
                          %
                        </strong>
                      </div>

                      <div className="emp-progress">
                        <div
                          className="emp-progress-fill"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />
                      </div>

                      <div className="emp-salary-numbers">
                        <div>
                          <span>
                            Paid
                          </span>

                          <strong className="emp-paid-value">
                            {formatMoney(
                              paid
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Salary
                          </span>

                          <strong>
                            {formatMoney(
                              salary
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="emp-card-actions">
                      <button
                        type="button"
                        className="emp-action emp-view"
                        onClick={() =>
                          navigate(
                            "/employee-detail",
                            {
                              state:
                                emp,
                            }
                          )
                        }
                        title="View employee"
                      >
                        <FiEye />

                        <span>
                          View
                        </span>
                      </button>

                      <button
                        type="button"
                        className="emp-action emp-edit"
                        onClick={() =>
                          handleEdit(
                            emp
                          )
                        }
                        title="Edit employee"
                      >
                        <FiEdit2 />

                        <span>
                          Edit
                        </span>
                      </button>

                      <button
                        type="button"
                        className="emp-action emp-pay"
                        onClick={() =>
                          openPaymentModal(
                            emp
                          )
                        }
                        title="Pay salary"
                      >
                        <FaRupeeSign />

                        <span>
                          Pay
                        </span>
                      </button>

                      <button
                        type="button"
                        className={`emp-action ${
                          isPresent
                            ? "emp-attendance-present"
                            : "emp-attendance-absent"
                        }`}
                        onClick={() =>
                          handleAttendance(
                            emp._id,
                            latestAttendance
                          )
                        }
                        title={
                          isPresent
                            ? "Mark absent"
                            : "Mark present"
                        }
                      >
                        {isPresent ? (
                          <FiCheckCircle />
                        ) : (
                          <FiXCircle />
                        )}

                        <span>
                          {isPresent
                            ? "Present"
                            : "Absent"}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="emp-action emp-delete"
                        onClick={() =>
                          requestDelete(
                            emp
                          )
                        }
                        title="Delete employee"
                      >
                        <FiTrash2 />

                        <span>
                          Delete
                        </span>
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div
          className="emp-modal-overlay"
          onClick={() => {
            if (!saving) {
              setShowModal(
                false
              );
            }
          }}
        >
          <div
            className="emp-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="emp-modal-close"
              onClick={() =>
                setShowModal(
                  false
                )
              }
              disabled={saving}
            >
              <FiX />
            </button>

            <div className="emp-modal-icon">
              {editId ? (
                <FiEdit2 />
              ) : (
                <FiPlus />
              )}
            </div>

            <h2>
              {editId
                ? "Edit Employee"
                : "Add Employee"}
            </h2>

            <p className="emp-modal-subtitle">
              {editId
                ? "Update employee information."
                : "Add a new member to your team."}
            </p>

            <div className="emp-form">
              <label>
                Employee Name

                <input
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label>
                Phone Number

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label>
                Role

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select Role
                  </option>

                  <option value="Salesman">
                    Salesman
                  </option>

                  <option value="Cashier">
                    Cashier
                  </option>

                  <option value="Manager">
                    Manager
                  </option>

                  <option value="Delivery Boy">
                    Delivery Boy
                  </option>

                  <option value="Accountant">
                    Accountant
                  </option>

                  <option value="Helper">
                    Helper
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </label>

              <label>
                Monthly Salary

                <div className="emp-money-input">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="salary"
                    min="0"
                    placeholder="Enter salary"
                    value={
                      formData.salary
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>
              </label>
            </div>

            <div className="emp-modal-actions">
              <button
                type="button"
                className="emp-modal-cancel"
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="emp-modal-primary"
                onClick={
                  handleSubmit
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editId
                    ? "Update Employee"
                    : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          PAYMENT MODAL
      ================================================== */}

      {showPaymentModal &&
        selectedEmployee && (
          <div
            className="emp-modal-overlay"
            onClick={() => {
              if (!saving) {
                setShowPaymentModal(
                  false
                );
              }
            }}
          >
            <div
              className="emp-modal"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="emp-modal-close"
                onClick={() =>
                  setShowPaymentModal(
                    false
                  )
                }
                disabled={saving}
              >
                <FiX />
              </button>

              <div className="emp-modal-icon emp-payment-icon">
                <FaRupeeSign />
              </div>

              <h2>
                Pay Salary
              </h2>

              <p className="emp-modal-subtitle">
                Record salary payment
                for{" "}
                <strong>
                  {
                    selectedEmployee.name
                  }
                </strong>
                .
              </p>

              <div className="emp-form">
                <label>
                  Amount

                  <div className="emp-money-input">
                    <FaRupeeSign />

                    <input
                      type="number"
                      min="0"
                      placeholder="Enter amount"
                      value={
                        paymentData.amount
                      }
                      onChange={(
                        event
                      ) =>
                        setPaymentData(
                          (
                            previous
                          ) => ({
                            ...previous,

                            amount:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  Payment Method

                  <select
                    value={
                      paymentData.method
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentData(
                        (
                          previous
                        ) => ({
                          ...previous,

                          method:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                  </select>
                </label>

                <label>
                  Note

                  <input
                    type="text"
                    placeholder="Optional note"
                    value={
                      paymentData.note
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentData(
                        (
                          previous
                        ) => ({
                          ...previous,

                          note:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </label>
              </div>

              <div className="emp-modal-actions">
                <button
                  type="button"
                  className="emp-modal-cancel"
                  onClick={() =>
                    setShowPaymentModal(
                      false
                    )
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="emp-modal-primary emp-payment-primary"
                  onClick={
                    handleSalaryPayment
                  }
                  disabled={saving}
                >
                  <FaRupeeSign />

                  {saving
                    ? "Processing..."
                    : "Pay Salary"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =================================================
          DELETE MODAL
      ================================================== */}

      {showDeleteModal &&
        deleteTarget && (
          <div
            className="emp-modal-overlay"
            onClick={
              cancelDelete
            }
          >
            <div
              className="emp-modal emp-delete-modal"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="emp-modal-close"
                onClick={
                  cancelDelete
                }
                disabled={saving}
              >
                <FiX />
              </button>

              <div className="emp-modal-icon emp-delete-icon">
                <FiTrash2 />
              </div>

              <h2>
                Delete Employee?
              </h2>

              <p className="emp-modal-subtitle">
                Are you sure you
                want to delete{" "}
                <strong>
                  {
                    deleteTarget.name
                  }
                </strong>
                ? This action cannot
                be undone.
              </p>

              <div className="emp-modal-actions">
                <button
                  type="button"
                  className="emp-modal-cancel"
                  onClick={
                    cancelDelete
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="emp-delete-confirm"
                  onClick={
                    confirmDelete
                  }
                  disabled={saving}
                >
                  <FiTrash2 />

                  {saving
                    ? "Deleting..."
                    : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}