import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSpinner,
  FaFileInvoiceDollar,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

const API = "https://backend-of-smartkhata-book-vkcv.vercel.app/api";

const paymentBadge = {
  paid: "bg-green-100 text-green-700 border border-green-200",
  unpaid: "bg-red-100 text-red-700 border border-red-200",
  partial: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const CustomerBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${API}/customer-portal/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBills(res.data.bills || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? bills : bills.filter((b) => b.paymentStatus === filter);
  const totalDue = bills
    .filter((b) => b.paymentStatus !== "paid")
    .reduce((s, b) => s + (b.amountDue || b.totalAmount || 0), 0);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Bills</h1>
          <p className="text-sm text-gray-500 mt-1">
            Invoices sent by your retailer
          </p>
        </div>
        {totalDue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <FaClock className="text-red-400" />
            <div>
              <p className="text-xs text-red-500 font-medium">
                Total Amount Due
              </p>
              <p className="text-lg font-bold text-red-600">₹{totalDue}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "unpaid", "partial", "paid"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border
              ${filter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FaFileInvoiceDollar className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No bills found</p>
          <p className="text-sm text-gray-400 mt-1">
            Bills sent by your retailer will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => (
            <div
              key={bill._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Bill Header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpanded(expanded === bill._id ? null : bill._id)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      bill.paymentStatus === "paid"
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    {bill.paymentStatus === "paid" ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaFileInvoiceDollar className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Bill #
                      {bill.billNumber || bill._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {bill.retailerName || bill.retailerId?.name || "Retailer"}{" "}
                      •{" "}
                      {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ₹{bill.totalAmount}
                    </p>
                    {bill.amountDue > 0 && bill.paymentStatus !== "paid" && (
                      <p className="text-xs text-red-500">
                        Due: ₹{bill.amountDue}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentBadge[bill.paymentStatus] || "bg-gray-100 text-gray-600"}`}
                  >
                    {bill.paymentStatus || "unpaid"}
                  </span>
                  {expanded === bill._id ? (
                    <FaChevronUp className="text-gray-400 text-xs" />
                  ) : (
                    <FaChevronDown className="text-gray-400 text-xs" />
                  )}
                </div>
              </div>

              {/* Bill Detail */}
              {expanded === bill._id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  {/* Items table */}
                  {bill.items?.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                        Items
                      </p>
                      <div className="space-y-2 mb-4">
                        {bill.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-700">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                            <p className="font-semibold text-indigo-700">
                              ₹{item.quantity * item.price}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{bill.subtotal || bill.totalAmount}</span>
                    </div>
                    {bill.tax > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Tax ({bill.taxRate || ""}%)</span>
                        <span>₹{bill.tax}</span>
                      </div>
                    )}
                    {bill.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{bill.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{bill.totalAmount}</span>
                    </div>
                    {bill.amountPaid > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid</span>
                        <span>₹{bill.amountPaid}</span>
                      </div>
                    )}
                    {bill.amountDue > 0 && bill.paymentStatus !== "paid" && (
                      <div className="flex justify-between font-bold text-red-600">
                        <span>Amount Due</span>
                        <span>₹{bill.amountDue}</span>
                      </div>
                    )}
                  </div>

                  {bill.note && (
                    <p className="mt-3 text-xs text-gray-400 italic">
                      Note: {bill.note}
                    </p>
                  )}

                  {bill.dueDate && (
                    <p className="mt-2 text-xs text-orange-500 font-medium">
                      Due by:{" "}
                      {new Date(bill.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBills;
