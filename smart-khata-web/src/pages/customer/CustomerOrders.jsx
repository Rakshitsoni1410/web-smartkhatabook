import React, { useEffect, useState } from "react";
import api from "../../api";
import {
  FaSpinner,
  FaShoppingBag,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaRedo,
} from "react-icons/fa";

const API = "/api";

const statusStyle = {
  pending:
    "bg-yellow-100 text-yellow-700 border border-yellow-200",

  confirmed:
    "bg-blue-100 text-blue-700 border border-blue-200",

  approved:
    "bg-blue-100 text-blue-700 border border-blue-200",

  advancePending:
    "bg-orange-100 text-orange-700 border border-orange-200",

  processing:
    "bg-indigo-100 text-indigo-700 border border-indigo-200",

  shipped:
    "bg-purple-100 text-purple-700 border border-purple-200",

  onTheWay:
    "bg-purple-100 text-purple-700 border border-purple-200",

  delivered:
    "bg-green-100 text-green-700 border border-green-200",

  completed:
    "bg-emerald-100 text-emerald-700 border border-emerald-200",

  cancelled:
    "bg-red-100 text-red-700 border border-red-200",

  rejected:
    "bg-red-100 text-red-700 border border-red-200",
};

const filterStatuses = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "delivered",
  "completed",
  "cancelled",
];

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `${API}/customer-portal/orders`
      );

      // Supports:
      // { orders: [...] }
      // OR directly [...]
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.orders || [];

      setOrders(data);
    } catch (err) {
      console.error(
        "Failed to fetch customer orders:",
        err
      );

      setOrders([]);

      setError(
        err.response?.data?.message ||
          "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatus = (order) => {
    return (
      order.status ||
      order.orderStatus ||
      "pending"
    );
  };

  const getRetailerName = (order) => {
    return (
      order.retailerName ||
      order.retailerId?.shopName ||
      order.retailerId?.name ||
      "Retailer"
    );
  };

  const getOrderId = (order) => {
    if (!order?._id) {
      return "------";
    }

    return String(order._id)
      .slice(-6)
      .toUpperCase();
  };

  const getItems = (order) => {
    if (
      Array.isArray(order.items) &&
      order.items.length > 0
    ) {
      return order.items;
    }

    // Fallback for single-product order structure
    if (order.productName) {
      return [
        {
          name: order.productName,
          quantity: Number(
            order.quantity || 1
          ),
          price: Number(
            order.pricePerUnit || 0
          ),
        },
      ];
    }

    return [];
  };

  const getItemName = (item) => {
    return (
      item.name ||
      item.productName ||
      item.productId?.name ||
      "Product"
    );
  };

  const getItemPrice = (item) => {
    return Number(
      item.price ||
        item.pricePerUnit ||
        0
    );
  };

  const getItemQuantity = (item) => {
    return Number(
      item.quantity || 0
    );
  };

  const getStatusLabel = (status) => {
    if (status === "onTheWay") {
      return "On The Way";
    }

    if (status === "advancePending") {
      return "Advance Pending";
    }

    return status;
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filtered =
    filter === "all"
      ? orders
      : orders.filter(
          (order) =>
            getStatus(order) === filter
        );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FaSpinner className="animate-spin text-indigo-500 text-3xl" />

        <p className="text-sm text-gray-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-5">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          My Orders
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Track all orders placed with your retailers
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Unable to load orders
              </p>

              <p className="text-xs text-red-500 mt-0.5">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
          >
            <FaRedo />
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}

      <div className="flex gap-2 flex-wrap">
        {filterStatuses.map(
          (status) => (
            <button
              type="button"
              key={status}
              onClick={() =>
                setFilter(status)
              }
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                filter === status
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {getStatusLabel(
                status
              )}
            </button>
          )
        )}
      </div>

      {/* No Orders */}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FaShoppingBag className="text-4xl text-gray-300 mx-auto mb-3" />

          <p className="text-gray-500 font-medium">
            {filter === "all"
              ? "No orders found"
              : `No ${getStatusLabel(
                  filter
                )} orders found`}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            {filter === "all"
              ? "Browse products to place an order."
              : "Try selecting a different order status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status =
              getStatus(order);

            const items =
              getItems(order);

            const isExpanded =
              expanded ===
              order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Order Header */}

                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    setExpanded(
                      isExpanded
                        ? null
                        : order._id
                    )
                  }
                >
                  {/* Left */}

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      #
                      {getOrderId(
                        order
                      )}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {getRetailerName(
                        order
                      )}{" "}
                      •{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </p>
                  </div>

                  {/* Right */}

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-800">
                      {formatCurrency(
                        order.totalAmount
                      )}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        statusStyle[
                          status
                        ] ||
                        "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {getStatusLabel(
                        status
                      )}
                    </span>

                    {isExpanded ? (
                      <FaChevronUp className="text-gray-400 text-xs" />
                    ) : (
                      <FaChevronDown className="text-gray-400 text-xs" />
                    )}
                  </div>
                </div>

                {/* Expanded Order */}

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                      Items
                    </p>

                    {items.length ===
                    0 ? (
                      <div className="py-3 text-sm text-gray-400">
                        No item details
                        available.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map(
                          (
                            item,
                            index
                          ) => {
                            const quantity =
                              getItemQuantity(
                                item
                              );

                            const price =
                              getItemPrice(
                                item
                              );

                            return (
                              <div
                                key={
                                  item._id ||
                                  item.productId?._id ||
                                  item.productId ||
                                  index
                                }
                                className="flex items-center justify-between gap-4 text-sm"
                              >
                                <div>
                                  <p className="font-medium text-gray-700">
                                    {getItemName(
                                      item
                                    )}
                                  </p>

                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Qty:{" "}
                                    {
                                      quantity
                                    }{" "}
                                    ×{" "}
                                    {formatCurrency(
                                      price
                                    )}
                                  </p>
                                </div>

                                <p className="font-semibold text-indigo-700 whitespace-nowrap">
                                  {formatCurrency(
                                    quantity *
                                      price
                                  )}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}

                    {/* Total */}

                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-800">
                      <span>
                        Total
                      </span>

                      <span>
                        {formatCurrency(
                          order.totalAmount
                        )}
                      </span>
                    </div>

                    {/* Payment Status */}

                    {order.paymentStatus && (
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-gray-500">
                          Payment
                          Status
                        </span>

                        <span className="capitalize font-medium text-gray-700">
                          {
                            order.paymentStatus
                          }
                        </span>
                      </div>
                    )}

                    {/* Invoice */}

                    {order.invoiceNumber && (
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-500">
                          Invoice
                        </span>

                        <span className="font-medium text-gray-700">
                          {
                            order.invoiceNumber
                          }
                        </span>
                      </div>
                    )}

                    {/* Note */}

                    {order.note && (
                      <p className="mt-3 text-xs text-gray-400 italic">
                        Note:{" "}
                        {order.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;