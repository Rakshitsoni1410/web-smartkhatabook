const GenerateBillButton = ({
  order,
  label = "Generate Bill",
  disabled = false,
}) => {
  // =====================================================
  // ESCAPE HTML
  // =====================================================

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  // =====================================================
  // CURRENCY
  // =====================================================

  const formatCurrency = (amount = 0) => {
    const value = Number(amount || 0);

    if (!Number.isFinite(value)) {
      return "₹0.00";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

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

  // =====================================================
  // ORDER STATUS
  // =====================================================

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

  // =====================================================
  // GENERATE BILL
  // =====================================================

  const handleGenerateBill = () => {
    if (!order) {
      alert("Bill information is not available.");

      return;
    }

    // =================================================
    // ITEMS
    //
    // Supports:
    //
    // order.items[]
    //
    // AND
    //
    // your main wholesaler order:
    // productName
    // quantity
    // pricePerUnit
    // =================================================

    let items = Array.isArray(order.items) ? order.items : [];

    if (items.length === 0 && order.productName) {
      items = [
        {
          name: order.productName,

          qty: Number(order.quantity || 1),

          pricePerUnit: Number(order.pricePerUnit || 0),
        },
      ];
    }

    // =================================================
    // SUBTOTAL
    // =================================================

    const calculatedSubtotal = items.reduce((total, item) => {
      const quantity = Number(item.qty ?? item.quantity ?? 0);

      const price = Number(item.pricePerUnit ?? item.price ?? 0);

      return total + quantity * price;
    }, 0);

    const subtotal =
      calculatedSubtotal > 0
        ? calculatedSubtotal
        : Number(order.totalAmount || 0);

    // =================================================
    // INVOICE NUMBER
    // =================================================

    const invoiceNumber =
      order.invoiceNumber ||
      order.billNumber ||
      order.orderId ||
      order._id ||
      "-";

    // =================================================
    // DATE
    // =================================================

    const invoiceDate = order.date || order.createdAt || new Date();

    // =================================================
    // BUSINESS
    // =================================================

    const businessName =
      order.businessName ||
      order.wholesalerName ||
      order.shopName ||
      "Smart Khata Book";

    // =================================================
    // CUSTOMER
    // =================================================

    const customerName =
      order.customerName || order.retailerName || order.partyName || "Retailer";

    // =================================================
    // OPEN WINDOW
    // =================================================

    const billWindow = window.open("", "_blank", "width=900,height=700");

    if (!billWindow) {
      alert("Please allow pop-ups to generate the bill.");

      return;
    }

    // =================================================
    // ITEMS HTML
    // =================================================

    const itemsHtml = items
      .map((item, index) => {
        const itemName = item.name || item.productName || "-";

        const quantity = Number(item.qty ?? item.quantity ?? 0);

        const price = Number(item.pricePerUnit ?? item.price ?? 0);

        const amount = quantity * price;

        return `
                <tr>
                  <td>
                    ${index + 1}
                  </td>

                  <td class="product-cell">
                    ${escapeHtml(itemName)}
                  </td>

                  <td>
                    ${quantity}
                  </td>

                  <td class="money-cell">
                    ${formatCurrency(price)}
                  </td>

                  <td class="money-cell">
                    ${formatCurrency(amount)}
                  </td>
                </tr>
              `;
      })
      .join("");

    // =================================================
    // EMPTY PRODUCT FALLBACK
    // =================================================

    const safeItemsHtml =
      itemsHtml ||
      `
          <tr>
            <td colspan="5" class="empty-row">
              No product information available
            </td>
          </tr>
        `;

    // =================================================
    // BUILD DOCUMENT
    // =================================================

    billWindow.document.write(`
        <!DOCTYPE html>

        <html lang="en">
          <head>
            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <title>
              Invoice ${escapeHtml(String(invoiceNumber))}
            </title>

            <style>
              * {
                box-sizing: border-box;
              }

              html {
                -webkit-text-size-adjust: 100%;
              }

              body {
                margin: 0;

                padding: 40px 20px;

                font-family:
                  Arial,
                  Helvetica,
                  sans-serif;

                background:
                  #f5f7fb;

                color:
                  #1f2937;

                overflow-x:
                  hidden;
              }

              /* =================================
                 INVOICE
              ================================= */

              .invoice {
                width: 100%;

                max-width: 850px;

                margin:
                  0 auto;

                background:
                  #ffffff;

                padding: 35px;

                border-radius:
                  14px;

                box-shadow:
                  0
                  5px
                  25px
                  rgba(
                    0,
                    0,
                    0,
                    0.08
                  );

                overflow:
                  hidden;
              }

              /* =================================
                 HEADER
              ================================= */

              .header {
                display: flex;

                justify-content:
                  space-between;

                align-items:
                  flex-start;

                gap: 25px;

                border-bottom:
                  2px solid
                  #2563eb;

                padding-bottom:
                  20px;

                margin-bottom:
                  25px;
              }

              .brand {
                min-width: 0;

                flex: 1;
              }

              .brand h1 {
                margin: 0;

                color:
                  #2563eb;

                font-size:
                  clamp(
                    22px,
                    4vw,
                    28px
                  );

                line-height: 1.2;

                overflow-wrap:
                  anywhere;
              }

              .brand p {
                margin:
                  6px
                  0
                  0;

                color:
                  #6b7280;

                font-size:
                  13px;
              }

              /* =================================
                 INVOICE TITLE
              ================================= */

              .invoice-title {
                text-align:
                  right;

                min-width: 0;
              }

              .invoice-title h2 {
                margin: 0;

                font-size:
                  clamp(
                    20px,
                    4vw,
                    24px
                  );
              }

              .invoice-number {
                margin-top:
                  6px;

                color:
                  #2563eb;

                font-weight:
                  bold;

                font-size:
                  13px;

                overflow-wrap:
                  anywhere;

                word-break:
                  break-word;
              }

              .invoice-date {
                margin-top:
                  6px;

                color:
                  #6b7280;

                font-size:
                  13px;
              }

              /* =================================
                 DETAILS
              ================================= */

              .details {
                display: grid;

                grid-template-columns:
                  minmax(0, 1fr)
                  minmax(0, 1fr);

                gap: 20px;

                margin-bottom:
                  28px;
              }

              .detail-box {
                min-width: 0;

                padding: 16px;

                background:
                  #f8fafc;

                border:
                  1px solid
                  #e5e7eb;

                border-radius:
                  9px;
              }

              .detail-box span {
                display:
                  block;

                margin-bottom:
                  5px;

                color:
                  #6b7280;

                font-size:
                  12px;
              }

              .detail-box strong {
                display:
                  block;

                font-size:
                  15px;

                overflow-wrap:
                  anywhere;
              }

              /* =================================
                 SECTION TITLE
              ================================= */

              h3 {
                margin:
                  0
                  0
                  10px;

                font-size:
                  17px;
              }

              /* =================================
                 TABLE WRAPPER
              ================================= */

              .table-wrap {
                width: 100%;

                overflow-x:
                  auto;

                -webkit-overflow-scrolling:
                  touch;

                border:
                  1px solid
                  #e5e7eb;

                border-radius:
                  10px;
              }

              table {
                width: 100%;

                min-width:
                  620px;

                border-collapse:
                  collapse;

                background:
                  #ffffff;
              }

              th {
                padding:
                  12px;

                background:
                  #2563eb;

                color:
                  #ffffff;

                text-align:
                  left;

                font-size:
                  13px;

                white-space:
                  nowrap;
              }

              td {
                padding:
                  12px;

                border-bottom:
                  1px solid
                  #e5e7eb;

                font-size:
                  13px;

                vertical-align:
                  top;
              }

              tbody
              tr:last-child
              td {
                border-bottom:
                  none;
              }

              .product-cell {
                min-width:
                  180px;

                overflow-wrap:
                  anywhere;
              }

              .money-cell {
                white-space:
                  nowrap;
              }

              th:last-child,
              td:last-child {
                text-align:
                  right;
              }

              .empty-row {
                padding:
                  25px;

                color:
                  #6b7280;

                text-align:
                  center !important;
              }

              /* =================================
                 SUMMARY
              ================================= */

              .summary {
                width: 100%;

                max-width:
                  320px;

                margin:
                  25px
                  0
                  0
                  auto;
              }

              .summary-row {
                display: flex;

                align-items:
                  center;

                justify-content:
                  space-between;

                gap: 20px;

                padding:
                  10px
                  0;

                border-bottom:
                  1px solid
                  #e5e7eb;

                font-size:
                  14px;
              }

              .summary-row strong,
              .summary-row span:last-child {
                white-space:
                  nowrap;
              }

              .grand-total {
                margin-top:
                  5px;

                padding-top:
                  12px;

                border-top:
                  2px solid
                  #2563eb;

                color:
                  #2563eb;

                font-size:
                  19px;

                font-weight:
                  bold;
              }

              /* =================================
                 STATUS
              ================================= */

              .status-area {
                display: grid;

                grid-template-columns:
                  minmax(0, 1fr)
                  minmax(0, 1fr);

                gap: 15px;

                margin-top:
                  30px;
              }

              .status {
                min-width: 0;

                padding:
                  12px;

                background:
                  #f8fafc;

                border:
                  1px solid
                  #e5e7eb;

                border-radius:
                  8px;
              }

              .status span {
                display:
                  block;

                margin-bottom:
                  4px;

                color:
                  #6b7280;

                font-size:
                  12px;
              }

              .status strong {
                display:
                  block;

                overflow-wrap:
                  anywhere;
              }

              /* =================================
                 FOOTER
              ================================= */

              .footer {
                margin-top:
                  40px;

                padding-top:
                  18px;

                border-top:
                  1px solid
                  #e5e7eb;

                color:
                  #6b7280;

                text-align:
                  center;

                font-size:
                  12px;
              }

              .footer p {
                margin:
                  6px
                  0
                  0;
              }

              /* =================================
                 BUTTON
              ================================= */

              .print-btn {
                display:
                  block;

                width:
                  fit-content;

                margin:
                  25px
                  auto
                  0;

                padding:
                  12px
                  24px;

                border:
                  none;

                border-radius:
                  8px;

                background:
                  #2563eb;

                color:
                  #ffffff;

                cursor:
                  pointer;

                font-size:
                  14px;

                font-weight:
                  bold;

                transition:
                  all
                  0.2s ease;
              }

              .print-btn:hover {
                background:
                  #1d4ed8;

                transform:
                  translateY(-1px);
              }

              /* =================================
                 TABLET
              ================================= */

              @media (
                max-width: 768px
              ) {
                body {
                  padding:
                    20px
                    14px;
                }

                .invoice {
                  padding:
                    25px
                    20px;

                  border-radius:
                    12px;
                }

                .header {
                  gap: 18px;
                }

                .details {
                  gap: 12px;
                }

                th,
                td {
                  padding:
                    10px;
                }
              }

              /* =================================
                 PHONE
              ================================= */

              @media (
                max-width: 600px
              ) {
                body {
                  padding:
                    0;

                  background:
                    #ffffff;
                }

                .invoice {
                  max-width:
                    none;

                  min-height:
                    100vh;

                  margin: 0;

                  padding:
                    22px
                    16px
                    30px;

                  border-radius:
                    0;

                  box-shadow:
                    none;
                }

                /* Header becomes vertical */

                .header {
                  flex-direction:
                    column;

                  align-items:
                    stretch;

                  gap: 16px;

                  padding-bottom:
                    16px;

                  margin-bottom:
                    20px;
                }

                .invoice-title {
                  text-align:
                    left;

                  padding-top:
                    14px;

                  border-top:
                    1px solid
                    #e5e7eb;
                }

                /* Business/customer stack */

                .details {
                  grid-template-columns:
                    1fr;

                  gap: 10px;

                  margin-bottom:
                    22px;
                }

                .detail-box {
                  padding:
                    13px;
                }

                /* Table remains usable */

                .table-wrap {
                  margin:
                    0
                    -2px;
                }

                table {
                  min-width:
                    560px;
                }

                th,
                td {
                  padding:
                    10px
                    9px;

                  font-size:
                    12px;
                }

                /* Full width summary */

                .summary {
                  width: 100%;

                  max-width:
                    none;

                  margin-top:
                    20px;
                }

                .summary-row {
                  font-size:
                    13px;
                }

                .grand-total {
                  font-size:
                    17px;
                }

                /* Status vertical */

                .status-area {
                  grid-template-columns:
                    1fr;

                  gap: 10px;

                  margin-top:
                    24px;
                }

                .footer {
                  margin-top:
                    30px;
                }

                /* Button full width */

                .print-btn {
                  width:
                    100%;

                  min-height:
                    46px;

                  margin-top:
                    20px;
                }
              }

              /* =================================
                 VERY SMALL PHONE
              ================================= */

              @media (
                max-width: 380px
              ) {
                .invoice {
                  padding:
                    18px
                    12px
                    25px;
                }

                .brand h1 {
                  font-size:
                    20px;
                }

                .invoice-title h2 {
                  font-size:
                    19px;
                }

                .detail-box {
                  padding:
                    12px;
                }

                .summary-row {
                  gap: 10px;
                }
              }

              /* =================================
                 PRINT / SAVE PDF
              ================================= */

              @media print {
                @page {
                  size: A4;

                  margin:
                    12mm;
                }

                html,
                body {
                  width: 100%;

                  margin: 0;

                  padding: 0;

                  background:
                    #ffffff;
                }

                body {
                  -webkit-print-color-adjust:
                    exact;

                  print-color-adjust:
                    exact;
                }

                .invoice {
                  width: 100%;

                  max-width:
                    none;

                  min-height:
                    auto;

                  margin: 0;

                  padding: 0;

                  border-radius:
                    0;

                  box-shadow:
                    none;

                  overflow:
                    visible;
                }

                .header {
                  flex-direction:
                    row;

                  align-items:
                    flex-start;
                }

                .invoice-title {
                  text-align:
                    right;

                  border-top:
                    none;

                  padding-top:
                    0;
                }

                .details {
                  grid-template-columns:
                    1fr 1fr;
                }

                .table-wrap {
                  overflow:
                    visible;

                  border:
                    none;
                }

                table {
                  min-width: 0;

                  width: 100%;
                }

                th,
                td {
                  padding:
                    8px;

                  font-size:
                    11px;
                }

                .summary {
                  max-width:
                    300px;
                }

                .status-area {
                  grid-template-columns:
                    1fr 1fr;
                }

                .print-btn {
                  display:
                    none !important;
                }

                .detail-box,
                .status,
                tr,
                .summary {
                  break-inside:
                    avoid;
                }
              }
            </style>
          </head>

          <body>
            <main class="invoice">

              <!-- =========================
                   HEADER
              ========================== -->

              <header class="header">

                <div class="brand">
                  <h1>
                    ${escapeHtml(businessName)}
                  </h1>

                  <p>
                    Business Invoice
                  </p>
                </div>

                <div class="invoice-title">

                  <h2>
                    INVOICE
                  </h2>

                  <div class="invoice-number">
                    ${escapeHtml(String(invoiceNumber))}
                  </div>

                  <div class="invoice-date">
                    ${formatDate(invoiceDate)}
                  </div>

                </div>

              </header>

              <!-- =========================
                   PARTY DETAILS
              ========================== -->

              <section class="details">

                <div class="detail-box">
                  <span>
                    Business
                  </span>

                  <strong>
                    ${escapeHtml(businessName)}
                  </strong>
                </div>

                <div class="detail-box">
                  <span>
                    Customer / Party
                  </span>

                  <strong>
                    ${escapeHtml(customerName)}
                  </strong>
                </div>

              </section>

              <!-- =========================
                   ITEMS
              ========================== -->

              <section>

                <h3>
                  Order Details
                </h3>

                <div class="table-wrap">

                  <table>

                    <thead>
                      <tr>
                        <th>
                          #
                        </th>

                        <th>
                          Product
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Rate
                        </th>

                        <th>
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      ${safeItemsHtml}
                    </tbody>

                  </table>

                </div>

              </section>

              <!-- =========================
                   TOTAL
              ========================== -->

              <section class="summary">

                <div class="summary-row">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ${formatCurrency(subtotal)}
                  </strong>

                </div>

                <div class="summary-row grand-total">

                  <span>
                    Total
                  </span>

                  <span>
                    ${formatCurrency(subtotal)}
                  </span>

                </div>

              </section>

              <!-- =========================
                   STATUS
              ========================== -->

              <section class="status-area">

                <div class="status">

                  <span>
                    Order Status
                  </span>

                  <strong>
                    ${escapeHtml(getOrderStatus(order.orderStatus))}
                  </strong>

                </div>

                <div class="status">

                  <span>
                    Payment Status
                  </span>

                  <strong>
                    ${escapeHtml(getPaymentStatus(order.paymentStatus))}
                  </strong>

                </div>

              </section>

              <!-- =========================
                   FOOTER
              ========================== -->

              <footer class="footer">

                <strong>
                  Smart Khata Book
                </strong>

                <p>
                  This is a
                  computer-generated
                  invoice.
                </p>

              </footer>

              <!-- =========================
                   PRINT
              ========================== -->

              <button
                class="print-btn"
                onclick="window.print()"
              >
                Print / Save as PDF
              </button>

            </main>
          </body>
        </html>
      `);

    billWindow.document.close();

    // Focus new bill window
    billWindow.focus();
  };

  // =====================================================
  // BUTTON
  // =====================================================

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
