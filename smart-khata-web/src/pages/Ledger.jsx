import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiBookOpen,
  FiPrinter,
  FiSearch,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiMoon,
  FiSun,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import api from "../api";

import { getStoredUser } from "../utils/session";

import "./Ledger.css";

// =====================================================
// MONEY
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
// DATE
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
// LEDGER
// =====================================================

export default function Ledger() {
  const navigate = useNavigate();

  const user = getStoredUser();

  // =====================================================
  // STATE
  // =====================================================

  const [entries, setEntries] = useState([]);

  const [filter, setFilter] = useState("All");

  const [periodFilter, setPeriodFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

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
      // ignore storage error
    }
  }, [darkMode]);

  // =====================================================
  // FETCH LEDGER
  // =====================================================

  const fetchLedger = useCallback(async () => {
    if (!user?._id) {
      setError("Please log in again.");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      const res = await api.get(`/api/ledger/${user._id}`);

      setEntries(Array.isArray(res.data?.entries) ? res.data.entries : []);
    } catch (err) {
      console.error("LEDGER FETCH ERROR:", err);

      setError(err?.response?.data?.message || "Unable to load ledger.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // =====================================================
  // PERIOD CHECK
  // =====================================================

  const isSamePeriod = (dateString) => {
    if (periodFilter === "All") {
      return true;
    }

    const entryDate = new Date(dateString);

    if (Number.isNaN(entryDate.getTime())) {
      return false;
    }

    const now = new Date();

    if (periodFilter === "Monthly") {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }

    if (periodFilter === "Quarterly") {
      const entryQuarter = Math.floor(entryDate.getMonth() / 3);

      const currentQuarter = Math.floor(now.getMonth() / 3);

      return (
        entryQuarter === currentQuarter &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }

    if (periodFilter === "Yearly") {
      return entryDate.getFullYear() === now.getFullYear();
    }

    return true;
  };

  // =====================================================
  // PERIOD ENTRIES
  // =====================================================

  const periodEntries = useMemo(() => {
    return entries.filter((entry) => isSamePeriod(entry.createdAt));
  }, [entries, periodFilter]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totals = useMemo(() => {
    let credit = 0;

    let debit = 0;

    periodEntries.forEach((entry) => {
      const amount = Number(entry.amount || 0);

      if (entry.type === "credit") {
        credit += amount;
      }

      if (entry.type === "debit") {
        debit += amount;
      }
    });

    return {
      credit,

      debit,

      balance: credit - debit,
    };
  }, [periodEntries]);

  // =====================================================
  // FILTERED ENTRIES
  // =====================================================

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return periodEntries.filter((entry) => {
      const type = String(entry.type || "").toLowerCase();

      const matchType = filter === "All" || type === filter.toLowerCase();

      const partyName = String(
        entry.partyId?.shopName || entry.partyId?.name || "",
      ).toLowerCase();

      const source = String(entry.source || "").toLowerCase();

      const note = String(entry.note || "").toLowerCase();

      const matchSearch =
        !query ||
        partyName.includes(query) ||
        source.includes(query) ||
        note.includes(query);

      return matchType && matchSearch;
    });
  }, [periodEntries, filter, search]);

  // =====================================================
  // PRINT
  // =====================================================

  const handlePrint = () => {
    window.print();
  };

  // =====================================================
  // BALANCE LABEL
  // =====================================================

  const balanceLabel =
    totals.balance > 0
      ? "Credit Balance"
      : totals.balance < 0
        ? "Debit Balance"
        : "Balanced";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={`ledger-page ${darkMode ? "ledger-dark" : ""}`}>
      {/* =================================================
          TOP BAR
      ================================================== */}

      <div className="ledger-topbar no-print">
        <button
          type="button"
          className="ledger-back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
        </button>

        <div className="ledger-topbar-actions">
          <button
            type="button"
            className="ledger-icon-btn"
            onClick={fetchLedger}
            title="Refresh ledger"
          >
            <FiRefreshCw />
          </button>

          <button
            type="button"
            className="ledger-icon-btn"
            onClick={() => setDarkMode((previous) => !previous)}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>

      {/* =================================================
          HEADER
      ================================================== */}

      <header className="ledger-header">
        <div className="ledger-header-content">
          <div className="ledger-header-symbol">
            <FiBookOpen />
          </div>

          <div>
            <span className="ledger-header-label">Smart Khata</span>

            <h1>Ledger Book</h1>

            <p>Track all credits, debits and account balances in one place.</p>
          </div>
        </div>

        <button
          type="button"
          className="ledger-print-btn no-print"
          onClick={handlePrint}
        >
          <FiPrinter />

          <span>Print Ledger</span>
        </button>

        <div className="ledger-header-decoration ledger-decoration-one" />

        <div className="ledger-header-decoration ledger-decoration-two" />
      </header>

      {/* =================================================
          SUMMARY
      ================================================== */}

      <section className="ledger-summary">
        <div className="ledger-summary-card ledger-summary-credit">
          <div className="ledger-summary-icon">
            <FiTrendingUp />
          </div>

          <div>
            <span>Total Credit</span>

            <strong>{formatMoney(totals.credit)}</strong>
          </div>
        </div>

        <div className="ledger-summary-card ledger-summary-debit">
          <div className="ledger-summary-icon">
            <FiTrendingDown />
          </div>

          <div>
            <span>Total Debit</span>

            <strong>{formatMoney(totals.debit)}</strong>
          </div>
        </div>

        <div
          className={`ledger-summary-card ${
            totals.balance >= 0
              ? "ledger-summary-balance"
              : "ledger-summary-negative"
          }`}
        >
          <div className="ledger-summary-icon">
            <FiActivity />
          </div>

          <div>
            <span>{balanceLabel}</span>

            <strong>{formatMoney(Math.abs(totals.balance))}</strong>
          </div>
        </div>
      </section>

      {/* =================================================
          TOOLBAR
      ================================================== */}

      <section className="ledger-toolbar no-print">
        {/* SEARCH */}

        <div className="ledger-search">
          <FiSearch />

          <input
            type="search"
            placeholder="Search party, source or note..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="ledger-search-clear"
              onClick={() => setSearch("")}
            >
              <FiX />
            </button>
          )}
        </div>

        {/* TYPE FILTER */}

        <div className="ledger-filter-group">
          <span className="ledger-filter-title">Type</span>

          <div className="ledger-filter-buttons">
            {["All", "Credit", "Debit"].map((option) => (
              <button
                type="button"
                key={option}
                className={`ledger-filter-btn ${
                  filter === option ? "ledger-filter-active" : ""
                }`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* PERIOD FILTER */}

        <div className="ledger-filter-group ledger-period-group">
          <span className="ledger-filter-title">Period</span>

          <div className="ledger-filter-buttons">
            {["All", "Monthly", "Quarterly", "Yearly"].map((period) => (
              <button
                type="button"
                key={period}
                className={`ledger-filter-btn ${
                  periodFilter === period ? "ledger-filter-active" : ""
                }`}
                onClick={() => setPeriodFilter(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          RESULT INFORMATION
      ================================================== */}

      {!loading && !error && (
        <div className="ledger-result-info no-print">
          <span>
            Showing <strong>{filtered.length}</strong> entr
            {filtered.length === 1 ? "y" : "ies"}
          </span>

          {periodFilter !== "All" && (
            <span>
              Period: <strong>{periodFilter}</strong>
            </span>
          )}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================== */}

      {loading && (
        <div className="ledger-state">
          <div className="ledger-loader" />

          <p>Loading ledger...</p>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================== */}

      {!loading && error && (
        <div className="ledger-state ledger-error">
          <FiBookOpen size={32} />

          <h3>Unable to load ledger</h3>

          <p>{error}</p>

          <button type="button" onClick={fetchLedger}>
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================== */}

      {!loading && !error && (
        <section className="ledger-table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>#</th>

                <th>Party</th>

                <th>Type</th>

                <th>Amount</th>

                <th>Source</th>

                <th>Note</th>

                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ledger-empty">
                    <FiBookOpen size={28} />

                    <strong>No ledger entries found</strong>

                    <span>Try changing your filters or search.</span>
                  </td>
                </tr>
              ) : (
                filtered.map((entry, index) => {
                  const isCredit = entry.type === "credit";

                  const partyName =
                    entry.partyId?.shopName || entry.partyId?.name || "Unknown";

                  return (
                    <tr key={entry._id} className="ledger-row">
                      <td data-label="#" className="ledger-index">
                        {index + 1}
                      </td>

                      <td data-label="Party" className="ledger-party">
                        {partyName}
                      </td>

                      <td data-label="Type">
                        <span
                          className={`ledger-type-badge ${
                            isCredit
                              ? "ledger-credit-badge"
                              : "ledger-debit-badge"
                          }`}
                        >
                          {isCredit ? (
                            <>
                              <FiTrendingUp />
                              Credit
                            </>
                          ) : (
                            <>
                              <FiTrendingDown />
                              Debit
                            </>
                          )}
                        </span>
                      </td>

                      <td
                        data-label="Amount"
                        className={`ledger-amount ${
                          isCredit
                            ? "ledger-amount-credit"
                            : "ledger-amount-debit"
                        }`}
                      >
                        {isCredit ? "+" : "-"}

                        {formatMoney(entry.amount)}
                      </td>

                      <td data-label="Source">
                        <span className="ledger-source-pill">
                          {entry.source || "Order"}
                        </span>
                      </td>

                      <td data-label="Note" className="ledger-note">
                        {entry.note || "-"}
                      </td>

                      <td data-label="Date" className="ledger-date">
                        {formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
