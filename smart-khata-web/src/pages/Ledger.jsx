import { useState } from "react";
import "./Ledger.css";

const DUMMY_ENTRIES = [
  { id: 1, party: "Raj Traders",      type: "Credit", amount: 12000, date: "2024-05-01", source: "Order", note: "Order #1021 payment received" },
  { id: 2, party: "Mehta Stores",     type: "Debit",  amount: 4500,  date: "2024-05-03", source: "Order", note: "Order #1022 placed" },
  { id: 3, party: "Patel Wholesale",  type: "Credit", amount: 8750,  date: "2024-05-05", source: "Order", note: "Advance received" },
  { id: 4, party: "Suresh Goods",     type: "Debit",  amount: 3200,  date: "2024-05-07", source: "Manual", note: "Transport expense" },
  { id: 5, party: "Raj Traders",      type: "Credit", amount: 5000,  date: "2024-05-09", source: "Order", note: "Final payment" },
  { id: 6, party: "Ankit Supplies",   type: "Debit",  amount: 9100,  date: "2024-05-11", source: "Order", note: "Order #1028 placed" },
  { id: 7, party: "Mehta Stores",     type: "Credit", amount: 2200,  date: "2024-05-13", source: "Manual", note: "Refund adjusted" },
  { id: 8, party: "Patel Wholesale",  type: "Debit",  amount: 6600,  date: "2024-05-15", source: "Order", note: "Order #1031 placed" },
];

export default function Ledger() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const totalCredit = DUMMY_ENTRIES
    .filter((e) => e.type === "Credit")
    .reduce((s, e) => s + e.amount, 0);

  const totalDebit = DUMMY_ENTRIES
    .filter((e) => e.type === "Debit")
    .reduce((s, e) => s + e.amount, 0);

  const balance = totalCredit - totalDebit;

  const filtered = DUMMY_ENTRIES.filter((e) => {
    const matchFilter = filter === "All" || e.type === filter;
    const matchSearch = e.party.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="ledger-page">

      {/* HEADER */}
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
        <div className={`summary-card ${balance >= 0 ? "summary-card--blue" : "summary-card--red"}`}>
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
                <td colSpan={7} className="ledger-empty">No entries found</td>
              </tr>
            ) : (
              filtered.map((entry, i) => (
                <tr key={entry.id} className="ledger-row">
                  <td className="ledger-index">{i + 1}</td>
                  <td className="ledger-party">{entry.party}</td>
                  <td>
                    <span className={`type-badge ${entry.type === "Credit" ? "badge--green" : "badge--red"}`}>
                      {entry.type === "Credit" ? "↑ Credit" : "↓ Debit"}
                    </span>
                  </td>
                  <td className={`ledger-amount ${entry.type === "Credit" ? "amount--green" : "amount--red"}`}>
                    {entry.type === "Credit" ? "+" : "-"}₹{entry.amount.toLocaleString()}
                  </td>
                  <td><span className="source-pill">{entry.source}</span></td>
                  <td className="ledger-note">{entry.note}</td>
                  <td className="ledger-date">{entry.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}