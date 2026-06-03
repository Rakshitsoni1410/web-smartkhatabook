import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSpinner, FaShoppingBag, FaChevronDown, FaChevronUp } from "react-icons/fa";

const API = "https://backend-of-smartkhata-book-vkcv.vercel.app/api";

const statusStyle = {
  pending:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
  delivered: "bg-green-100 text-green-700 border border-green-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API}/customer-portal/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setOrders(res.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Track all orders placed with your retailers</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "delivered", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border
              ${filter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FaShoppingBag className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders found</p>
          <p className="text-sm text-gray-400 mt-1">Browse products to place an order.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.retailerName || order.retailerId?.name || "Retailer"} •{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">₹{order.totalAmount}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  {expanded === order._id ? (
                    <FaChevronUp className="text-gray-400 text-xs" />
                  ) : (
                    <FaChevronDown className="text-gray-400 text-xs" />
                  )}
                </div>
              </div>

              {/* Order Items Expanded */}
              {expanded === order._id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Items</p>
                  <div className="space-y-2">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-700">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-semibold text-indigo-700">₹{item.quantity * item.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                  {order.note && (
                    <p className="mt-2 text-xs text-gray-400 italic">Note: {order.note}</p>
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

export default CustomerOrders;