import React, { useEffect, useState } from "react";
import api from "../../api";
import {
  FaSpinner,
  FaFileInvoiceDollar,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaRedo,
} from "react-icons/fa";

const API = "/api";

const paymentBadge = {
  paid:
    "bg-green-100 text-green-700 border border-green-200",

  unpaid:
    "bg-red-100 text-red-700 border border-red-200",

  partial:
    "bg-yellow-100 text-yellow-700 border border-yellow-200",

  advanceRequested:
    "bg-orange-100 text-orange-700 border border-orange-200",

  advancePaid:
    "bg-blue-100 text-blue-700 border border-blue-200",
};

const CustomerBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  // =====================================================
  // FETCH BILLS
  // =====================================================

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `${API}/customer-portal/bills`
      );

      // Supports:
      // { bills: [...] }
      // or directly [...]
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.bills || [];

      setBills(data);
    } catch (err) {
      console.error(
        "Failed to fetch customer bills:",
        err
      );

      setBills([]);

      setError(
        err.response?.data?.message ||
          "Unable to load your bills. Please try again."
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

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentStatus = (bill) => {
    return bill.paymentStatus || "unpaid";
  };

  const getBillNumber = (bill) => {
    return (
      bill.invoiceNumber ||
      bill.billNumber ||
      (bill._id
        ? bill._id.slice(-6).toUpperCase()
        : "------")
    );
  };

  const getRetailerName = (bill) => {
    return (
      bill.retailerName ||
      bill.retailerId?.shopName ||
      bill.retailerId?.name ||
      "Retailer"
    );
  };

  const getItems = (bill) => {
    if (
      Array.isArray(bill.items) &&
      bill.items.length > 0
    ) {
      return bill.items;
    }

    // Fallback for single-product records
    if (bill.productName) {
      return [
        {
          name: bill.productName,
          quantity: Number(bill.quantity || 1),
          price: Number(
            bill.pricePerUnit || 0
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

  const getItemQuantity = (item) => {
    return Number(item.quantity || 0);
  };

  const getItemPrice = (item) => {
    return Number(
      item.price ||
        item.pricePerUnit ||
        0
    );
  };

  const getAmountPaid = (bill) => {
    if (
      bill.amountPaid !== undefined &&
      bill.amountPaid !== null
    ) {
      return Number(bill.amountPaid) || 0;
    }

    if (bill.paymentStatus === "paid") {
      return Number(bill.totalAmount || 0);
    }

    if (
      bill.advancePaid &&
      bill.advanceAmount
    ) {
      return Number(bill.advanceAmount || 0);
    }

    return 0;
  };

  const getAmountDue = (bill) => {
    if (
      bill.paymentStatus === "paid"
    ) {
      return 0;
    }

    if (
      bill.amountDue !== undefined &&
      bill.amountDue !== null
    ) {
      return Number(bill.amountDue) || 0;
    }

    if (
      bill.remainingAmount !== undefined &&
      bill.remainingAmount !== null
    ) {
      return Number(
        bill.remainingAmount
      ) || 0;
    }

    const total =
      Number(bill.totalAmount || 0);

    const paid =
      getAmountPaid(bill);

    return Math.max(
      total - paid,
      0
    );
  };

  // =====================================================
  // FILTERING
  // =====================================================

  const filtered =
    filter === "all"
      ? bills
      : bills.filter(
          (bill) =>
            getPaymentStatus(bill) === filter
        );

  const totalDue = bills.reduce(
    (sum, bill) =>
      sum + getAmountDue(bill),
    0
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FaSpinner className="animate-spin text-indigo-500 text-3xl" />

        <p className="text-sm text-gray-500">
          Loading your bills...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Bills
          </h1>

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

              <p className="text-lg font-bold text-red-600">
                {formatCurrency(totalDue)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Unable to load bills
              </p>

              <p className="text-xs text-red-500 mt-0.5">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchBills}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
          >
            <FaRedo />
            Retry
          </button>
        </div>
      )}

      {/* Filters */}

      <div className="flex gap-2 flex-wrap">
        {[
          "all",
          "unpaid",
          "partial",
          "paid",
        ].map((status) => (
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
            {status}
          </button>
        ))}
      </div>

      {/* Empty State */}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FaFileInvoiceDollar className="text-4xl text-gray-300 mx-auto mb-3" />

          <p className="text-gray-500 font-medium">
            {filter === "all"
              ? "No bills found"
              : `No ${filter} bills found`}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            {filter === "all"
              ? "Bills sent by your retailer will appear here."
              : "Try selecting another payment status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => {
            const paymentStatus =
              getPaymentStatus(bill);

            const amountDue =
              getAmountDue(bill);

            const amountPaid =
              getAmountPaid(bill);

            const items =
              getItems(bill);

            const isExpanded =
              expanded === bill._id;

            return (
              <div
                key={bill._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Bill Header */}

                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    setExpanded(
                      isExpanded
                        ? null
                        : bill._id
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        paymentStatus ===
                        "paid"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      {paymentStatus ===
                      "paid" ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaFileInvoiceDollar className="text-red-400" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Bill #
                        {getBillNumber(
                          bill
                        )}
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {getRetailerName(
                          bill
                        )}{" "}
                        •{" "}
                        {formatDate(
                          bill.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {formatCurrency(
                          bill.totalAmount
                        )}
                      </p>

                      {amountDue >
                        0 &&
                        paymentStatus !==
                          "paid" && (
                          <p className="text-xs text-red-500">
                            Due:{" "}
                            {formatCurrency(
                              amountDue
                            )}
                          </p>
                        )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        paymentBadge[
                          paymentStatus
                        ] ||
                        "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {paymentStatus}
                    </span>

                    {isExpanded ? (
                      <FaChevronUp className="text-gray-400 text-xs" />
                    ) : (
                      <FaChevronDown className="text-gray-400 text-xs" />
                    )}
                  </div>
                </div>

                {/* Bill Detail */}

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    {/* Invoice information */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">
                          Invoice Number
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {getBillNumber(
                            bill
                          )}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">
                          Invoice Date
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {formatDate(
                            bill.billSentAt ||
                              bill.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Items */}

                    {items.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                          Items
                        </p>

                        <div className="space-y-2 mb-4">
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
                                    item
                                      .productId
                                      ?._id ||
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

                                    <p className="text-xs text-gray-400">
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
                      </>
                    )}

                    {/* Summary */}

                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>
                          Subtotal
                        </span>

                        <span>
                          {formatCurrency(
                            bill.subtotal ??
                              bill.totalAmount
                          )}
                        </span>
                      </div>

                      {Number(
                        bill.tax
                      ) > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>
                            Tax
                            {bill.taxRate
                              ? ` (${bill.taxRate}%)`
                              : ""}
                          </span>

                          <span>
                            {formatCurrency(
                              bill.tax
                            )}
                          </span>
                        </div>
                      )}

                      {Number(
                        bill.discount
                      ) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>
                            Discount
                          </span>

                          <span>
                            -
                            {formatCurrency(
                              bill.discount
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                        <span>
                          Total
                        </span>

                        <span>
                          {formatCurrency(
                            bill.totalAmount
                          )}
                        </span>
                      </div>

                      {amountPaid >
                        0 && (
                        <div className="flex justify-between text-green-600">
                          <span>
                            Amount Paid
                          </span>

                          <span>
                            {formatCurrency(
                              amountPaid
                            )}
                          </span>
                        </div>
                      )}

                      {amountDue >
                        0 &&
                        paymentStatus !==
                          "paid" && (
                          <div className="flex justify-between font-bold text-red-600">
                            <span>
                              Amount Due
                            </span>

                            <span>
                              {formatCurrency(
                                amountDue
                              )}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Payment history */}

                    {Array.isArray(
                      bill.paymentHistory
                    ) &&
                      bill.paymentHistory
                        .length >
                        0 && (
                        <div className="mt-5">
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                            Payment
                            History
                          </p>

                          <div className="space-y-2">
                            {bill.paymentHistory.map(
                              (
                                payment,
                                index
                              ) => (
                                <div
                                  key={
                                    payment._id ||
                                    payment.transactionId ||
                                    index
                                  }
                                  className="bg-gray-50 rounded-xl px-3 py-2 text-sm"
                                >
                                  <div className="flex justify-between gap-3">
                                    <div>
                                      <p className="font-medium text-gray-700 capitalize">
                                        {payment.paymentType ||
                                          "Payment"}
                                      </p>

                                      <p className="text-xs text-gray-400 mt-1">
                                        {payment.transactionId ||
                                          "No transaction ID"}
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="font-semibold text-green-600">
                                        {formatCurrency(
                                          payment.amount
                                        )}
                                      </p>

                                      <p className="text-xs text-gray-400 capitalize">
                                        {payment.paymentMethod ||
                                          "—"}
                                      </p>
                                    </div>
                                  </div>

                                  {payment.paidAt && (
                                    <p className="text-xs text-gray-400 mt-2">
                                      {formatDate(
                                        payment.paidAt
                                      )}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Notes */}

                    {bill.note && (
                      <p className="mt-3 text-xs text-gray-400 italic">
                        Note:{" "}
                        {bill.note}
                      </p>
                    )}

                    {/* Due Date */}

                    {bill.dueDate && (
                      <p className="mt-2 text-xs text-orange-500 font-medium">
                        Due by:{" "}
                        {formatDate(
                          bill.dueDate
                        )}
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

export default CustomerBills;