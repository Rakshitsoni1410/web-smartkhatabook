import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMoon,
  FiSun,
} from "react-icons/fi";

import { FaRupeeSign } from "react-icons/fa";

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
// DATE FORMATTER
// =====================================================

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// ATTENDANCE DATE HELPER
// =====================================================

const getDateKey = (value) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// =====================================================
// COMPONENT
// =====================================================

export default function EmployeeDetail() {
  const { state: employee } = useLocation();

  const navigate = useNavigate();

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("smartkhata-theme");

      if (saved === "dark") {
        return true;
      }

      if (saved === "light") {
        return false;
      }

      return (
        window.matchMedia?.("(prefers-color-scheme: dark)").matches || false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("smartkhata-theme", darkMode ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [darkMode]);

  // =====================================================
  // NO DATA
  // =====================================================

  if (!employee) {
    return (
      <>
        <style>{styles}</style>

        <div className={`ed-page ${darkMode ? "ed-dark" : ""}`}>
          <div className="ed-empty">
            <FiUser size={42} />

            <h2>Employee data not found</h2>

            <p>Go back to the employee list and open the employee again.</p>

            <button type="button" onClick={() => navigate(-1)}>
              <FiArrowLeft />
              Back
            </button>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // PAYMENT CALCULATIONS
  // =====================================================

  const salary = Number(employee.salary || 0);

  const paid =
    employee.payments?.reduce(
      (sum, payment) => sum + Number(payment?.amount || 0),
      0,
    ) || 0;

  const pending = Math.max(salary - paid, 0);

  const salaryProgress =
    salary > 0 ? Math.min(Math.max((paid / salary) * 100, 0), 100) : 0;

  // =====================================================
  // ATTENDANCE
  // =====================================================

  const rawAttendance = Array.isArray(employee.attendance)
    ? employee.attendance
    : [];

  /*
    Old data may already contain duplicate rows for the
    same calendar day. For display and totals, keep only
    the newest record for each day.
  */
  const attendanceByDay = new Map();

  rawAttendance.forEach((item) => {
    const dayKey = getDateKey(item?.date);

    if (!dayKey) {
      return;
    }

    const existing = attendanceByDay.get(dayKey);

    const currentTime = new Date(item?.date).getTime();

    const existingTime = existing ? new Date(existing?.date).getTime() : 0;

    if (!existing || currentTime >= existingTime) {
      attendanceByDay.set(dayKey, item);
    }
  });

  const attendance = Array.from(attendanceByDay.values()).sort(
    (a, b) => new Date(a?.date).getTime() - new Date(b?.date).getTime(),
  );

  const presentCount = attendance.filter(
    (item) => item.status === "Present",
  ).length;

  const absentCount = attendance.filter(
    (item) => item.status === "Absent",
  ).length;

  const leaveCount = attendance.filter(
    (item) => !["Present", "Absent"].includes(item.status),
  ).length;

  const todayKey = getDateKey(new Date());

  const todayAttendance = attendance.find(
    (item) => getDateKey(item?.date) === todayKey,
  );

  const latestAttendance = todayAttendance?.status || null;

  const initial = String(employee.name || "E")
    .trim()
    .charAt(0)
    .toUpperCase();

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>{styles}</style>

      <div className={`ed-page ${darkMode ? "ed-dark" : ""}`}>
        {/* =============================================
            TOP BAR
        ============================================== */}

        <div className="ed-topbar">
          <button
            type="button"
            className="ed-back"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />

            <span>Back</span>
          </button>

          <button
            type="button"
            className="ed-theme"
            onClick={() => setDarkMode((previous) => !previous)}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        {/* =============================================
            PROFILE HEADER
        ============================================== */}

        <section className="ed-profile">
          <div className="ed-profile-glow ed-glow-one" />

          <div className="ed-profile-glow ed-glow-two" />

          <div className="ed-avatar">{initial}</div>

          <div className="ed-profile-info">
            <div className="ed-profile-top">
              <div>
                <span className="ed-profile-label">Employee Profile</span>

                <h1>{employee.name || "Employee"}</h1>
              </div>

              <span
                className={`ed-status ${
                  employee.status === "Active"
                    ? "ed-status-active"
                    : "ed-status-leave"
                }`}
              >
                <span />

                {employee.status || "Active"}
              </span>
            </div>

            <div className="ed-profile-meta">
              <span>
                <FiPhone />

                {employee.phone || "No phone"}
              </span>

              <span>
                <FiBriefcase />

                {employee.category || "Employee"}
              </span>

              <span
                className={
                  latestAttendance === "Present"
                    ? "ed-today-present"
                    : latestAttendance === "Absent"
                      ? "ed-today-absent"
                      : "ed-today-neutral"
                }
              >
                {latestAttendance === "Present" ? (
                  <FiCheckCircle />
                ) : latestAttendance === "Absent" ? (
                  <FiXCircle />
                ) : (
                  <FiClock />
                )}
                Today: {latestAttendance || "Not Marked"}
              </span>
            </div>
          </div>
        </section>

        {/* =============================================
            SUMMARY
        ============================================== */}

        <section className="ed-grid">
          <div className="ed-card ed-role-card">
            <div className="ed-card-icon">
              <FiBriefcase />
            </div>

            <div>
              <span>Role</span>

              <strong>{employee.category || "Employee"}</strong>
            </div>
          </div>

          <div className="ed-card ed-salary-card">
            <div className="ed-card-icon">
              <FaRupeeSign />
            </div>

            <div>
              <span>Monthly Salary</span>

              <strong>{formatMoney(salary)}</strong>
            </div>
          </div>

          <div className="ed-card ed-paid-card">
            <div className="ed-card-icon">
              <FaRupeeSign />
            </div>

            <div>
              <span>Salary Paid</span>

              <strong>{formatMoney(paid)}</strong>
            </div>
          </div>

          <div className="ed-card ed-pending-card">
            <div className="ed-card-icon">
              <FaRupeeSign />
            </div>

            <div>
              <span>Pending Salary</span>

              <strong>{formatMoney(pending)}</strong>
            </div>
          </div>
        </section>

        {/* =============================================
            SALARY PROGRESS
        ============================================== */}

        <section className="ed-salary-progress-card">
          <div className="ed-section-heading">
            <div>
              <span>Salary Overview</span>

              <h2>Payment Progress</h2>
            </div>

            <strong className="ed-progress-percent">
              {Math.round(salaryProgress)}%
            </strong>
          </div>

          <div className="ed-progress-track">
            <div
              className="ed-progress-fill"
              style={{
                width: `${salaryProgress}%`,
              }}
            />
          </div>

          <div className="ed-progress-values">
            <div>
              <span>Paid</span>

              <strong className="ed-green-text">{formatMoney(paid)}</strong>
            </div>

            <div>
              <span>Remaining</span>

              <strong className="ed-orange-text">{formatMoney(pending)}</strong>
            </div>

            <div>
              <span>Total</span>

              <strong>{formatMoney(salary)}</strong>
            </div>
          </div>
        </section>

        {/* =============================================
            ATTENDANCE SUMMARY
        ============================================== */}

        <section className="ed-attendance-summary">
          <div className="ed-attendance-stat ed-present-stat">
            <FiCheckCircle />

            <div>
              <strong>{presentCount}</strong>

              <span>Present</span>
            </div>
          </div>

          <div className="ed-attendance-stat ed-absent-stat">
            <FiXCircle />

            <div>
              <strong>{absentCount}</strong>

              <span>Absent</span>
            </div>
          </div>

          <div className="ed-attendance-stat ed-leave-stat">
            <FiClock />

            <div>
              <strong>{leaveCount}</strong>

              <span>Leave</span>
            </div>
          </div>

          <div className="ed-attendance-stat ed-total-stat">
            <FiCalendar />

            <div>
              <strong>{attendance.length}</strong>

              <span>Records</span>
            </div>
          </div>
        </section>

        {/* =============================================
            ATTENDANCE HISTORY
        ============================================== */}

        <section className="ed-attendance-section">
          <div className="ed-section-heading">
            <div>
              <span>Attendance</span>

              <h2>Attendance History</h2>
            </div>

            <div className="ed-calendar-icon">
              <FiCalendar />
            </div>
          </div>

          {attendance.length > 0 ? (
            <div className="ed-attendance-list">
              {attendance
                .slice()
                .reverse()
                .map((item, index) => {
                  const status = item.status || "Leave";

                  const isPresent = status === "Present";

                  const isAbsent = status === "Absent";

                  return (
                    <div
                      className={`ed-attendance-row ${
                        isPresent
                          ? "ed-attendance-present"
                          : isAbsent
                            ? "ed-attendance-absent"
                            : "ed-attendance-leave"
                      }`}
                      key={item._id || `${item.date}-${index}`}
                    >
                      <div className="ed-attendance-left">
                        <div className="ed-attendance-icon">
                          {isPresent ? (
                            <FiCheckCircle />
                          ) : isAbsent ? (
                            <FiXCircle />
                          ) : (
                            <FiClock />
                          )}
                        </div>

                        <div>
                          <strong>{status}</strong>

                          <span>Attendance record</span>
                        </div>
                      </div>

                      <div className="ed-attendance-date">
                        <FiCalendar />

                        {formatDate(item.date)}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="ed-no-attendance">
              <FiCalendar size={32} />

              <h3>No attendance records</h3>

              <p>Attendance history will appear here after it is marked.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = `
  .ed-page,
  .ed-page * {
    box-sizing: border-box;
  }

  .ed-page {
    --ed-bg: #f4f7fc;
    --ed-card: #ffffff;
    --ed-card-soft: #f8fafc;

    --ed-text: #0f172a;
    --ed-text-2: #334155;
    --ed-muted: #64748b;

    --ed-border: #e5eaf2;

    --ed-shadow:
      0 8px 28px
      rgba(15, 23, 42, 0.06);

    min-height: 100vh;

    padding: 26px;

    color:
      var(--ed-text);

    font-family:
      Inter,
      "Segoe UI",
      Arial,
      sans-serif;

    background:
      radial-gradient(
        circle at 8% 0%,
        rgba(37,99,235,.08),
        transparent 30%
      ),
      radial-gradient(
        circle at 95% 15%,
        rgba(124,58,237,.07),
        transparent 30%
      ),
      var(--ed-bg);

    transition:
      background .25s ease,
      color .25s ease;

    overflow-x: hidden;
  }

  /* =========================================
     DARK MODE
  ========================================= */

  .ed-page.ed-dark {
    --ed-bg: #090f1d;
    --ed-card: #111827;
    --ed-card-soft: #172033;

    --ed-text: #f8fafc;
    --ed-text-2: #cbd5e1;
    --ed-muted: #94a3b8;

    --ed-border: #263244;

    --ed-shadow:
      0 10px 30px
      rgba(0,0,0,.30);
  }

  /* =========================================
     TOP BAR
  ========================================= */

  .ed-topbar {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    margin-bottom: 18px;
  }

  .ed-back {
    min-height: 42px;

    padding:
      0
      15px;

    border:
      1px solid
      var(--ed-border);

    border-radius: 12px;

    background:
      var(--ed-card);

    color:
      var(--ed-text-2);

    display: flex;

    align-items: center;

    gap: 8px;

    font-family: inherit;

    font-weight: 700;

    cursor: pointer;

    box-shadow:
      var(--ed-shadow);

    transition: .2s ease;
  }

  .ed-back:hover {
    transform:
      translateX(-2px);
  }

  .ed-theme {
    width: 42px;
    height: 42px;

    border:
      1px solid
      var(--ed-border);

    border-radius: 12px;

    background:
      var(--ed-card);

    color:
      var(--ed-text);

    display: flex;

    align-items: center;

    justify-content: center;

    cursor: pointer;

    font-size: 18px;

    box-shadow:
      var(--ed-shadow);

    transition: .2s ease;
  }

  .ed-theme:hover {
    transform:
      translateY(-2px);
  }

  /* =========================================
     PROFILE
  ========================================= */

  .ed-profile {
    position: relative;

    isolation: isolate;

    overflow: hidden;

    padding: 28px;

    border-radius: 24px;

    margin-bottom: 20px;

    background:
      linear-gradient(
        135deg,
        #2563eb,
        #4f46e5 52%,
        #7c3aed
      );

    color: #ffffff;

    display: flex;

    align-items: center;

    gap: 20px;

    box-shadow:
      0 16px 40px
      rgba(79,70,229,.22);
  }

  .ed-profile-glow {
    position: absolute;

    z-index: -1;

    border-radius: 50%;

    background:
      rgba(255,255,255,.10);
  }

  .ed-glow-one {
    width: 230px;
    height: 230px;

    top: -150px;
    right: 130px;
  }

  .ed-glow-two {
    width: 180px;
    height: 180px;

    right: -60px;
    bottom: -110px;
  }

  .ed-avatar {
    width: 86px;
    height: 86px;

    flex: 0 0 86px;

    border:
      2px solid
      rgba(255,255,255,.24);

    border-radius: 24px;

    background:
      rgba(255,255,255,.15);

    backdrop-filter:
      blur(8px);

    display: flex;

    align-items: center;

    justify-content: center;

    color: #ffffff;

    font-size: 34px;

    font-weight: 900;

    box-shadow:
      0 10px 25px
      rgba(15,23,42,.18);
  }

  .ed-profile-info {
    min-width: 0;

    flex: 1;
  }

  .ed-profile-top {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap: 14px;
  }

  .ed-profile-label {
    color:
      rgba(255,255,255,.65);

    font-size: 11px;

    font-weight: 700;

    text-transform:
      uppercase;

    letter-spacing:
      .08em;
  }

  .ed-profile h1 {
    margin:
      4px
      0
      0;

    font-size:
      clamp(
        25px,
        4vw,
        36px
      );

    font-weight: 900;

    letter-spacing:
      -.04em;

    overflow-wrap:
      anywhere;
  }

  .ed-status {
    flex-shrink: 0;

    padding:
      6px
      11px;

    border-radius: 20px;

    display:
      inline-flex;

    align-items: center;

    gap: 6px;

    font-size: 11px;

    font-weight: 800;
  }

  .ed-status span {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background:
      currentColor;
  }

  .ed-status-active {
    background:
      rgba(220,252,231,.95);

    color: #15803d;
  }

  .ed-status-leave {
    background:
      rgba(254,226,226,.95);

    color: #dc2626;
  }

  .ed-profile-meta {
    margin-top: 14px;

    display: flex;

    align-items: center;

    gap: 10px;

    flex-wrap: wrap;
  }

  .ed-profile-meta > span {
    padding:
      6px
      10px;

    border:
      1px solid
      rgba(255,255,255,.14);

    border-radius: 10px;

    background:
      rgba(255,255,255,.10);

    color:
      rgba(255,255,255,.88);

    display: inline-flex;

    align-items: center;

    gap: 6px;

    font-size: 11px;

    font-weight: 600;
  }

  .ed-profile-meta
  .ed-today-present {
    background:
      rgba(34,197,94,.18);
  }

  .ed-profile-meta
  .ed-today-absent {
    background:
      rgba(239,68,68,.17);
  }

  .ed-profile-meta
  .ed-today-neutral {
    background:
      rgba(148,163,184,.17);
  }

  /* =========================================
     DETAIL GRID
  ========================================= */

  .ed-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 14px;

    margin-bottom: 20px;
  }

  .ed-card {
    min-width: 0;

    padding: 19px;

    border:
      1px solid
      var(--ed-border);

    border-radius: 18px;

    background:
      var(--ed-card);

    display: flex;

    align-items: center;

    gap: 13px;

    box-shadow:
      var(--ed-shadow);

    transition:
      transform .2s ease;
  }

  .ed-card:hover {
    transform:
      translateY(-3px);
  }

  .ed-card-icon {
    width: 44px;
    height: 44px;

    flex: 0 0 44px;

    border-radius: 13px;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 18px;
  }

  .ed-role-card
  .ed-card-icon {
    background: #dbeafe;
    color: #2563eb;
  }

  .ed-salary-card
  .ed-card-icon {
    background: #ede9fe;
    color: #7c3aed;
  }

  .ed-paid-card
  .ed-card-icon {
    background: #dcfce7;
    color: #16a34a;
  }

  .ed-pending-card
  .ed-card-icon {
    background: #fef3c7;
    color: #d97706;
  }

  .ed-card > div:last-child {
    min-width: 0;
  }

  .ed-card span {
    display: block;

    margin-bottom: 4px;

    color:
      var(--ed-muted);

    font-size: 11px;

    font-weight: 600;
  }

  .ed-card strong {
    display: block;

    color:
      var(--ed-text);

    font-size:
      clamp(
        16px,
        2vw,
        21px
      );

    font-weight: 800;

    overflow-wrap:
      anywhere;
  }

  /* =========================================
     SALARY PROGRESS
  ========================================= */

  .ed-salary-progress-card {
    margin-bottom: 20px;

    padding: 22px;

    border:
      1px solid
      var(--ed-border);

    border-radius: 20px;

    background:
      var(--ed-card);

    box-shadow:
      var(--ed-shadow);
  }

  .ed-section-heading {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 15px;

    margin-bottom: 18px;
  }

  .ed-section-heading span {
    display: block;

    margin-bottom: 3px;

    color:
      var(--ed-muted);

    font-size: 10px;

    font-weight: 800;

    text-transform:
      uppercase;

    letter-spacing:
      .09em;
  }

  .ed-section-heading h2 {
    margin: 0;

    color:
      var(--ed-text);

    font-size: 19px;

    font-weight: 800;
  }

  .ed-progress-percent {
    color: #6366f1;

    font-size: 20px;
  }

  .ed-progress-track {
    width: 100%;

    height: 10px;

    overflow: hidden;

    border-radius: 30px;

    background:
      var(--ed-border);
  }

  .ed-progress-fill {
    height: 100%;

    border-radius: inherit;

    background:
      linear-gradient(
        90deg,
        #2563eb,
        #7c3aed
      );

    transition:
      width .4s ease;
  }

  .ed-progress-values {
    margin-top: 15px;

    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 12px;
  }

  .ed-progress-values
  > div {
    min-width: 0;
  }

  .ed-progress-values
  > div:nth-child(2) {
    text-align: center;
  }

  .ed-progress-values
  > div:last-child {
    text-align: right;
  }

  .ed-progress-values span {
    display: block;

    margin-bottom: 3px;

    color:
      var(--ed-muted);

    font-size: 10px;
  }

  .ed-progress-values strong {
    color:
      var(--ed-text);

    font-size: 13px;

    overflow-wrap:
      anywhere;
  }

  .ed-green-text {
    color: #16a34a !important;
  }

  .ed-orange-text {
    color: #f59e0b !important;
  }

  /* =========================================
     ATTENDANCE SUMMARY
  ========================================= */

  .ed-attendance-summary {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 12px;

    margin-bottom: 20px;
  }

  .ed-attendance-stat {
    min-width: 0;

    padding: 16px;

    border:
      1px solid
      var(--ed-border);

    border-radius: 16px;

    background:
      var(--ed-card);

    display: flex;

    align-items: center;

    gap: 11px;

    box-shadow:
      var(--ed-shadow);
  }

  .ed-attendance-stat > svg {
    flex-shrink: 0;

    font-size: 21px;
  }

  .ed-attendance-stat strong {
    display: block;

    color:
      var(--ed-text);

    font-size: 18px;
  }

  .ed-attendance-stat span {
    color:
      var(--ed-muted);

    font-size: 10px;
  }

  .ed-present-stat > svg {
    color: #16a34a;
  }

  .ed-absent-stat > svg {
    color: #ef4444;
  }

  .ed-leave-stat > svg {
    color: #f59e0b;
  }

  .ed-total-stat > svg {
    color: #6366f1;
  }

  /* =========================================
     ATTENDANCE HISTORY
  ========================================= */

  .ed-attendance-section {
    padding: 22px;

    border:
      1px solid
      var(--ed-border);

    border-radius: 20px;

    background:
      var(--ed-card);

    box-shadow:
      var(--ed-shadow);
  }

  .ed-calendar-icon {
    width: 40px;
    height: 40px;

    border-radius: 12px;

    background:
      rgba(99,102,241,.11);

    color: #6366f1;

    display: flex;

    align-items: center;

    justify-content: center;
  }

  .ed-attendance-list {
    display: flex;

    flex-direction: column;

    gap: 10px;
  }

  .ed-attendance-row {
    min-width: 0;

    padding: 13px 14px;

    border-radius: 13px;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 15px;
  }

  .ed-attendance-present {
    background:
      rgba(34,197,94,.09);

    border:
      1px solid
      rgba(34,197,94,.22);
  }

  .ed-attendance-absent {
    background:
      rgba(239,68,68,.08);

    border:
      1px solid
      rgba(239,68,68,.20);
  }

  .ed-attendance-leave {
    background:
      rgba(245,158,11,.08);

    border:
      1px solid
      rgba(245,158,11,.22);
  }

  .ed-attendance-left {
    min-width: 0;

    display: flex;

    align-items: center;

    gap: 10px;
  }

  .ed-attendance-icon {
    width: 36px;
    height: 36px;

    flex: 0 0 36px;

    border-radius: 10px;

    display: flex;

    align-items: center;

    justify-content: center;
  }

  .ed-attendance-present
  .ed-attendance-icon {
    color: #16a34a;

    background:
      rgba(34,197,94,.13);
  }

  .ed-attendance-absent
  .ed-attendance-icon {
    color: #ef4444;

    background:
      rgba(239,68,68,.12);
  }

  .ed-attendance-leave
  .ed-attendance-icon {
    color: #f59e0b;

    background:
      rgba(245,158,11,.13);
  }

  .ed-attendance-left strong {
    display: block;

    color:
      var(--ed-text);

    font-size: 12px;
  }

  .ed-attendance-left span {
    display: block;

    margin-top: 2px;

    color:
      var(--ed-muted);

    font-size: 10px;
  }

  .ed-attendance-date {
    flex-shrink: 0;

    color:
      var(--ed-muted);

    display: flex;

    align-items: center;

    gap: 6px;

    font-size: 11px;

    font-weight: 600;
  }

  /* =========================================
     EMPTY
  ========================================= */

  .ed-no-attendance,
  .ed-empty {
    min-height: 260px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 8px;

    color:
      var(--ed-muted);

    text-align: center;
  }

  .ed-empty {
    max-width: 500px;

    margin:
      80px
      auto;

    padding: 30px;

    border:
      1px solid
      var(--ed-border);

    border-radius: 20px;

    background:
      var(--ed-card);

    box-shadow:
      var(--ed-shadow);
  }

  .ed-no-attendance h3,
  .ed-empty h2 {
    margin:
      5px
      0
      0;

    color:
      var(--ed-text);
  }

  .ed-no-attendance p,
  .ed-empty p {
    max-width: 360px;

    margin: 0;

    font-size: 12px;

    line-height: 1.6;
  }

  .ed-empty button {
    margin-top: 8px;

    padding:
      10px
      16px;

    border: none;

    border-radius: 10px;

    background: #4f46e5;

    color: white;

    display: flex;

    align-items: center;

    gap: 7px;

    cursor: pointer;

    font-weight: 700;
  }

  /* =========================================
     TABLET
  ========================================= */

  @media (
    max-width: 950px
  ) {
    .ed-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .ed-attendance-summary {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }
  }

  /* =========================================
     MOBILE
  ========================================= */

  @media (
    max-width: 650px
  ) {
    .ed-page {
      padding: 14px;
    }

    .ed-profile {
      padding: 20px;

      border-radius: 20px;

      align-items:
        flex-start;
    }

    .ed-avatar {
      width: 62px;
      height: 62px;

      flex-basis: 62px;

      border-radius: 18px;

      font-size: 25px;
    }

    .ed-profile-top {
      flex-direction:
        column;

      gap: 8px;
    }

    .ed-profile h1 {
      font-size: 24px;
    }

    .ed-profile-meta {
      align-items:
        flex-start;

      flex-direction:
        column;
    }

    .ed-profile-meta
    > span {
      max-width: 100%;

      overflow-wrap:
        anywhere;
    }

    .ed-grid {
      gap: 10px;
    }

    .ed-card {
      padding: 14px;

      border-radius: 15px;
    }

    .ed-card-icon {
      width: 39px;
      height: 39px;

      flex-basis: 39px;
    }

    .ed-card strong {
      font-size: 16px;
    }

    .ed-salary-progress-card,
    .ed-attendance-section {
      padding: 17px;

      border-radius: 17px;
    }

    .ed-attendance-row {
      align-items:
        flex-start;

      flex-direction:
        column;

      gap: 8px;
    }

    .ed-attendance-date {
      padding-left: 46px;
    }
  }

  /* =========================================
     SMALL PHONE
  ========================================= */

  @media (
    max-width: 430px
  ) {
    .ed-page {
      padding:
        11px;
    }

    .ed-back span {
      display: none;
    }

    .ed-back {
      width: 42px;

      padding: 0;

      justify-content:
        center;
    }

    .ed-profile {
      flex-direction:
        column;
    }

    .ed-profile-info {
      width: 100%;
    }

    .ed-profile-top {
      width: 100%;

      flex-direction:
        row;

      justify-content:
        space-between;
    }

    .ed-grid {
      grid-template-columns:
        1fr 1fr;
    }

    .ed-card {
      align-items:
        flex-start;

      flex-direction:
        column;

      gap: 8px;
    }

    .ed-attendance-summary {
      gap: 8px;
    }

    .ed-attendance-stat {
      padding: 12px;

      align-items:
        flex-start;

      flex-direction:
        column;

      gap: 6px;
    }

    .ed-progress-values {
      gap: 6px;
    }

    .ed-progress-values strong {
      font-size: 11px;
    }
  }

  /* =========================================
     VERY SMALL PHONE
  ========================================= */

  @media (
    max-width: 350px
  ) {
    .ed-grid {
      grid-template-columns:
        1fr;
    }

    .ed-card {
      flex-direction:
        row;

      align-items: center;
    }

    .ed-attendance-summary {
      grid-template-columns:
        1fr;
    }

    .ed-attendance-stat {
      flex-direction: row;

      align-items: center;
    }

    .ed-progress-values {
      grid-template-columns:
        1fr;
    }

    .ed-progress-values
    > div,
    .ed-progress-values
    > div:nth-child(2),
    .ed-progress-values
    > div:last-child {
      text-align: left;
    }
  }

  /* =========================================
     TOUCH
  ========================================= */

  @media (
    hover: none
  ) {
    .ed-card:hover,
    .ed-back:hover,
    .ed-theme:hover {
      transform: none;
    }
  }

  /* =========================================
     REDUCED MOTION
  ========================================= */

  @media (
    prefers-reduced-motion:
      reduce
  ) {
    .ed-page *,
    .ed-page *::before,
    .ed-page *::after {
      transition-duration:
        .01ms !important;
    }
  }
`;
