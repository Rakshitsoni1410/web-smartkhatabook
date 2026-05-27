import { useState, useEffect } from "react";

import "./Ledger.css";

import axios from "axios";

export default function Ledger() {
  const [filter, setFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [entries, setEntries] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH LEDGER
  // =========================

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await axios.get(
        `https://backend-of-smartkhata-book.onrender.com/api/ledger/${user._id}`,
      );

      setEntries(res.data.entries || []);
    } catch (error) {
      console.log(error);
    }
  };

 
  // TOTAL CREDIT


  const totalCredit = entries

    .filter((e) => e.type === "credit")

    .reduce(
      (s, e) => s + Number(e.amount || 0),

      0,
    );

  // TOTAL DEBIT


  const totalDebit = entries

    .filter((e) => e.type === "debit")

    .reduce(
      (s, e) => s + Number(e.amount || 0),

      0,
    );


  // BALANCE
  

  const balance = totalCredit - totalDebit;

  // FILTERED DATA


  const filtered = entries.filter((e) => {
    const matchFilter =
      filter === "All" || e.type.toLowerCase() === filter.toLowerCase();

    const partyName = (
      e.partyId?.shopName ||
      e.partyId?.name ||
      ""
    ).toLowerCase();

    const matchSearch = partyName.includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="ledger-page">
      {/* HEADER */}
       <button className="back-btn" onClick={() => navigate(-1)}>
  <span className="back-arrow">‹</span>
</button>
      <div className="ledger-header">
        <div>
          <h1>Ledger Book</h1>
          <p>Track all your credits and debits</p>
        </div>
        <div className="ledger-header-icon">📒</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="ledger-summary">
        <div className="summary-card summary-card--green">
          <div className="summary-icon">↑</div>
          <div>
            <p>Total Credit</p>
            <h2>₹{totalCredit.toLocaleString()}</h2>
          </div>
        </div>
        <div className="summary-card summary-card--red">
          <div className="summary-icon">↓</div>
          <div>
            <p>Total Debit</p>
            <h2>₹{totalDebit.toLocaleString()}</h2>
          </div>
        </div>
        <div
          className={`summary-card ${balance >= 0 ? "summary-card--blue" : "summary-card--red"}`}
        >
          <div className="summary-icon">⚖</div>
          <div>
            <p>Net Balance</p>
            <h2>₹{Math.abs(balance).toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="ledger-toolbar">
        <div className="ledger-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by party name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ledger-filters">
          {["All", "Credit", "Debit"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "filter-btn--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="ledger-table-wrap">
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
                  No entries found
                </td>
              </tr>
            ) : (
              filtered.map((entry, i) => (
                <tr key={entry._id} className="ledger-row">
                  <td className="ledger-index">{i + 1}</td>

                  <td className="ledger-party">
                    {entry.partyId?.shopName ||
                      entry.partyId?.name ||
                      "Unknown"}
                  </td>

                  <td>
                    <span
                      className={`type-badge ${
                        entry.type === "credit" ? "badge--green" : "badge--red"
                      }`}
                    >
                      {entry.type === "credit" ? "↑ Credit" : "↓ Debit"}
                    </span>
                  </td>

                  <td
                    className={`ledger-amount ${
                      entry.type === "credit" ? "amount--green" : "amount--red"
                    }`}
                  >
                    {entry.type === "credit" ? "+" : "-"}₹
                    {Number(entry.amount || 0).toLocaleString()}
                  </td>

                  <td>
                    <span className="source-pill">
                      {entry.source || "Order"}
                    </span>
                  </td>

                  <td className="ledger-note">{entry.note || "-"}</td>

                  <td className="ledger-date">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
