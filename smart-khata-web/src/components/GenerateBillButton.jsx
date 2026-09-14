
const GenerateBillButton = ({
  order,
  label = "Generate Bill",
  disabled = false,
}) => {
  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPaymentStatus = (status) => {
    const labels = {
      unpaid: "Unpaid",
      advanceRequested: "Advance Requested",
      advancePaid: "Advance Paid",
      partial: "Partially Paid",
      paid: "Paid",
    };

    return labels[status] || status || "-";
  };

  const getOrderStatus = (status) => {
    const labels = {
      pending: "Pending",
      approved: "Approved",
      advancePending: "Advance Pending",
      processing: "Processing",
      onTheWay: "On The Way",
      delivered: "Delivered",
      completed: "Completed",
      rejected: "Rejected",
    };

    return labels[status] || status || "-";
  };

  const handleGenerateBill = () => {
    if (!order) {
      alert("Bill information is not available.");
      return;
    }

    const items = order.items || [];

    const subtotal = items.reduce((total, item) => {
      return total + Number(item.qty || 0) * Number(item.pricePerUnit || 0);
    }, 0);

    const billWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!billWindow) {
      alert("Please allow pop-ups to generate the bill.");
      return;
    }

    const itemsHtml = items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.name || "-")}</td>
            <td>${item.qty || 0}</td>
            <td>${formatCurrency(item.pricePerUnit)}</td>
            <td>
              ${formatCurrency(
                Number(item.qty || 0) *
                  Number(item.pricePerUnit || 0)
              )}
            </td>
          </tr>
        `
      )
      .join("");

    billWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${order.orderId || ""}</title>

          <meta charset="UTF-8" />

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, Helvetica, sans-serif;
              background: #f5f7fb;
              color: #1f2937;
            }

            .invoice {
              max-width: 850px;
              margin: auto;
              background: white;
              padding: 35px;
              border-radius: 12px;
              box-shadow: 0 5px 25px rgba(0,0,0,0.08);
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }

            .brand h1 {
              margin: 0;
              font-size: 28px;
              color: #2563eb;
            }

            .brand p {
              margin: 6px 0 0;
              color: #6b7280;
            }

            .invoice-title {
              text-align: right;
            }

            .invoice-title h2 {
              margin: 0;
              font-size: 24px;
            }

            .invoice-number {
              color: #2563eb;
              font-weight: bold;
              margin-top: 6px;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 28px;
            }

            .detail-box {
              background: #f8fafc;
              border: 1px solid #e5e7eb;
              padding: 16px;
              border-radius: 8px;
            }

            .detail-box span {
              display: block;
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }

            .detail-box strong {
              font-size: 15px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            th {
              background: #2563eb;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 13px;
            }

            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }

            th:last-child,
            td:last-child {
              text-align: right;
            }

            .summary {
              width: 320px;
              margin-left: auto;
              margin-top: 25px;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .grand-total {
              font-size: 19px;
              font-weight: bold;
              color: #2563eb;
              border-top: 2px solid #2563eb;
              margin-top: 5px;
              padding-top: 12px;
            }

            .status-area {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 30px;
            }

            .status {
              padding: 12px;
              background: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }

            .status span {
              color: #6b7280;
              font-size: 12px;
              display: block;
              margin-bottom: 4px;
            }

            .footer {
              margin-top: 40px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              padding-top: 18px;
              color: #6b7280;
              font-size: 12px;
            }

            .print-btn {
              margin: 25px auto 0;
              display: block;
              border: none;
              background: #2563eb;
              color: white;
              padding: 11px 22px;
              border-radius: 7px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
            }

            @media print {
              body {
                background: white;
                padding: 0;
              }

              .invoice {
                box-shadow: none;
                max-width: 100%;
              }

              .print-btn {
                display: none;
              }
            }
          </style>
        </head>

        <body>

          <div class="invoice">

            <div class="header">

              <div class="brand">
                <h1>
                  ${escapeHtml(order.businessName || "Smart Khata Book")}
                </h1>

                <p>Business Invoice</p>
              </div>

              <div class="invoice-title">
                <h2>INVOICE</h2>

                <div class="invoice-number">
                  ${escapeHtml(order.orderId || "-")}
                </div>

                <div style="margin-top:6px;font-size:13px;color:#6b7280;">
                  ${formatDate(order.date)}
                </div>
              </div>

            </div>

            <div class="details">

              <div class="detail-box">
                <span>Business</span>
                <strong>
                  ${escapeHtml(order.businessName || "-")}
                </strong>
              </div>

              <div class="detail-box">
                <span>Customer / Party</span>
                <strong>
                  ${escapeHtml(order.customerName || "-")}
                </strong>
              </div>

            </div>

            <h3>Order Details</h3>

            <table>

              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>

            </table>

            <div class="summary">

              <div class="summary-row">
                <span>Subtotal</span>

                <strong>
                  ${formatCurrency(subtotal)}
                </strong>
              </div>

              <div class="summary-row grand-total">
                <span>Total</span>

                <span>
                  ${formatCurrency(subtotal)}
                </span>
              </div>

            </div>

            <div class="status-area">

              <div class="status">
                <span>Order Status</span>

                <strong>
                  ${escapeHtml(getOrderStatus(order.orderStatus))}
                </strong>
              </div>

              <div class="status">
                <span>Payment Status</span>

                <strong>
                  ${escapeHtml(getPaymentStatus(order.paymentStatus))}
                </strong>
              </div>

            </div>

            <div class="footer">
              <strong>Smart Khata Book</strong>

              <p>
                This is a computer-generated invoice.
              </p>
            </div>

            <button
              class="print-btn"
              onclick="window.print()"
            >
              Print / Save as PDF
            </button>

          </div>

        </body>
      </html>
    `);

    billWindow.document.close();
  };

  return (
    <button
      type="button"
      className="generate-bill-btn"
      onClick={handleGenerateBill}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default GenerateBillButton;