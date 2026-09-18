import { useEffect, useState } from "react";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiGlobe,
  FiLock,
  FiSend,
  FiSmartphone,
  FiX,
} from "react-icons/fi";

// =====================================================
// PAYMENT METHODS
// =====================================================

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    subtitle: "Demo UPI payment",
    icon: <FiSmartphone size={20} />,
  },

  {
    id: "card",
    label: "Card",
    subtitle: "Demo card payment",
    icon: <FiCreditCard size={20} />,
  },

  {
    id: "netbanking",
    label: "Net Banking",
    subtitle: "Demo bank payment",
    icon: <FiGlobe size={20} />,
  },
];

// =====================================================
// MONEY FORMATTER
// =====================================================

const formatMoney = (value) => {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

// =====================================================
// DEMO TRANSACTION ID
// =====================================================

const createTransactionId = () => {
  const time = Date.now().toString(36).toUpperCase();

  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `SKPAY-${time}-${random}`;
};

// =====================================================
// COMPONENT
// =====================================================

export default function FakePaymentModal({
  open,
  amount = 0,
  paymentType = "payment",
  orderId = "",
  onClose,
  onConfirm,
}) {
  const [method, setMethod] = useState("upi");

  const [step, setStep] = useState("choose");

  const [transactionId, setTransactionId] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // RESET WHEN OPENED
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    setMethod("upi");
    setStep("choose");
    setTransactionId("");
    setError("");
  }, [open, amount, paymentType]);

  // =====================================================
  // LOCK PAGE SCROLL WHEN OPEN
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // =====================================================
  // ESCAPE KEY
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && step !== "processing") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, step, onClose]);

  if (!open) {
    return null;
  }

  // =====================================================
  // PAYMENT TITLE
  // =====================================================

  const paymentTitle =
    paymentType === "advance"
      ? "Advance Payment"
      : paymentType === "final"
        ? "Final Payment"
        : "Payment";

  // =====================================================
  // HANDLE PAYMENT
  // =====================================================

  const handlePayment = async () => {
    if (step === "processing") {
      return;
    }

    setError("");

    setStep("processing");

    // Demo processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newTransactionId = createTransactionId();

    try {
      await onConfirm?.({
        paymentType,

        paymentMethod: method,

        transactionId: newTransactionId,

        amount: Number(amount || 0),
      });

      setTransactionId(newTransactionId);

      setStep("success");
    } catch (paymentError) {
      console.error("DEMO PAYMENT ERROR:", paymentError);

      setStep("choose");

      setError(
        paymentError?.response?.data?.message ||
          paymentError?.message ||
          "Demo payment could not be completed. Please try again.",
      );
    }
  };

  // =====================================================
  // OVERLAY CLICK
  // =====================================================

  const handleOverlayClick = () => {
    if (step !== "processing") {
      onClose?.();
    }
  };

  // =====================================================
  // CURRENT PAYMENT METHOD
  // =====================================================

  const selectedMethod = PAYMENT_METHODS.find((item) => item.id === method);

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>{paymentStyles}</style>

      <div className="skpay-overlay" onClick={handleOverlayClick}>
        <div
          className="skpay-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Smart Khata demo payment gateway"
          onClick={(event) => event.stopPropagation()}
        >
          {/* =====================================
              CLOSE
          ====================================== */}

          {step !== "processing" && (
            <button
              type="button"
              className="skpay-close"
              onClick={onClose}
              aria-label="Close payment"
            >
              <FiX size={18} />
            </button>
          )}

          {/* =====================================
              SUCCESS
          ====================================== */}

          {step === "success" ? (
            <div className="skpay-success">
              <div className="skpay-success-icon">
                <FiCheckCircle size={38} />
              </div>

              <div className="skpay-success-title">Payment Successful</div>

              <div className="skpay-success-subtitle">
                Demo payment completed successfully.
              </div>

              <div className="skpay-success-amount">₹{formatMoney(amount)}</div>

              <div className="skpay-success-details">
                <div>
                  <span>Transaction ID</span>

                  <strong>{transactionId}</strong>
                </div>

                <div>
                  <span>Payment Type</span>

                  <strong>{paymentTitle}</strong>
                </div>

                <div>
                  <span>Method</span>

                  <strong>{selectedMethod?.label || method}</strong>
                </div>

                <div>
                  <span>Order</span>

                  <strong>#{orderId?.slice(-8).toUpperCase()}</strong>
                </div>
              </div>

              <button type="button" className="skpay-primary" onClick={onClose}>
                <FiCheckCircle size={16} />
                Done
              </button>
            </div>
          ) : step === "processing" ? (
            /* =====================================
               PROCESSING
            ====================================== */

            <div className="skpay-processing">
              <div className="skpay-spinner" />

              <div className="skpay-processing-title">
                Processing Demo Payment
              </div>

              <div className="skpay-processing-subtitle">
                Please do not close this window.
              </div>

              <div className="skpay-processing-amount">
                ₹{formatMoney(amount)}
              </div>
            </div>
          ) : (
            <>
              {/* =====================================
                  BRAND
              ====================================== */}

              <div className="skpay-brand">
                <div className="skpay-brand-icon">
                  <FiSend size={21} />
                </div>

                <div className="skpay-brand-copy">
                  <div className="skpay-brand-name">Smart Khata Pay</div>

                  <div className="skpay-brand-subtitle">
                    Demo Payment Gateway
                  </div>
                </div>
              </div>

              {/* =====================================
                  WARNING
              ====================================== */}

              <div className="skpay-demo-banner">
                <FiAlertCircle size={16} />

                <span>
                  TEST MODE — No real money will be charged. Do not enter real
                  banking credentials.
                </span>
              </div>

              {/* =====================================
                  SUMMARY
              ====================================== */}

              <div className="skpay-summary">
                <div>
                  <span>{paymentTitle}</span>

                  <strong className="skpay-money">
                    ₹{formatMoney(amount)}
                  </strong>
                </div>

                <div>
                  <span>Order ID</span>

                  <strong>#{orderId?.slice(-8).toUpperCase()}</strong>
                </div>
              </div>

              {/* =====================================
                  METHOD HEADING
              ====================================== */}

              <div className="skpay-heading">Choose payment method</div>

              {/* =====================================
                  METHODS
              ====================================== */}

              <div className="skpay-methods">
                {PAYMENT_METHODS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`skpay-method ${
                      method === item.id ? "skpay-method-active" : ""
                    }`}
                    onClick={() => setMethod(item.id)}
                  >
                    <span className="skpay-method-icon">{item.icon}</span>

                    <span className="skpay-method-copy">
                      <strong>{item.label}</strong>

                      <small>{item.subtitle}</small>
                    </span>

                    <span
                      className={`skpay-radio ${
                        method === item.id ? "skpay-radio-active" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* =====================================
                  DEMO DETAILS
              ====================================== */}

              <div className="skpay-demo-details">
                {method === "upi" && (
                  <>
                    <span>Demo UPI ID</span>

                    <strong>demo@smartkhata</strong>
                  </>
                )}

                {method === "card" && (
                  <>
                    <span>Demo Card</span>

                    <strong>4242 4242 4242 4242</strong>
                  </>
                )}

                {method === "netbanking" && (
                  <>
                    <span>Demo Bank</span>

                    <strong>Smart Khata Demo Bank</strong>
                  </>
                )}
              </div>

              {/* =====================================
                  ERROR
              ====================================== */}

              {error && <div className="skpay-error">{error}</div>}

              {/* =====================================
                  PAYMENT BUTTON
              ====================================== */}

              <button
                type="button"
                className="skpay-primary"
                onClick={handlePayment}
              >
                <FiLock size={15} />
                Pay ₹{formatMoney(amount)}
              </button>

              {/* =====================================
                  FOOTER
              ====================================== */}

              <div className="skpay-footer">
                <FiLock size={12} />
                Demo checkout for project/testing only
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// =====================================================
// RESPONSIVE STYLES
// =====================================================

const paymentStyles = `
  .skpay-overlay,
  .skpay-overlay * {
    box-sizing: border-box;
  }

  .skpay-overlay {
    position: fixed;
    inset: 0;

    z-index: 10000;

    background:
      rgba(
        15,
        23,
        42,
        0.66
      );

    backdrop-filter:
      blur(5px);

    -webkit-backdrop-filter:
      blur(5px);

    display: flex;

    align-items: center;
    justify-content: center;

    padding:
      max(
        18px,
        env(safe-area-inset-top)
      )
      max(
        18px,
        env(safe-area-inset-right)
      )
      max(
        18px,
        env(safe-area-inset-bottom)
      )
      max(
        18px,
        env(safe-area-inset-left)
      );

    overflow: hidden;

    font-family:
      'Outfit',
      'Segoe UI',
      sans-serif;
  }

  /* =====================================
     MODAL
  ====================================== */

  .skpay-modal {
    position: relative;

    width: min(
      100%,
      430px
    );

    max-height:
      calc(
        100dvh - 36px
      );

    overflow-x: hidden;
    overflow-y: auto;

    overscroll-behavior:
      contain;

    background:
      #ffffff;

    border-radius:
      22px;

    padding:
      24px;

    box-shadow:
      0
      28px
      70px
      rgba(
        15,
        23,
        42,
        0.30
      );

    animation:
      skpayOpen
      0.2s ease;

    scrollbar-width:
      thin;
  }

  .skpay-modal::-webkit-scrollbar {
    width: 5px;
  }

  .skpay-modal::-webkit-scrollbar-thumb {
    background:
      #cbd5e1;

    border-radius:
      20px;
  }

  @keyframes skpayOpen {
    from {
      opacity: 0;

      transform:
        translateY(12px)
        scale(0.98);
    }

    to {
      opacity: 1;

      transform:
        translateY(0)
        scale(1);
    }
  }

  /* =====================================
     CLOSE
  ====================================== */

  .skpay-close {
    position: absolute;

    top: 16px;
    right: 16px;

    width: 36px;
    height: 36px;

    border: 0;

    border-radius:
      10px;

    background:
      #f1f5f9;

    color:
      #64748b;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
      all
      0.18s ease;
  }

  .skpay-close:hover {
    background:
      #e2e8f0;

    color:
      #0f172a;
  }

  /* =====================================
     BRAND
  ====================================== */

  .skpay-brand {
    display: flex;

    align-items: center;

    gap: 12px;

    padding-right:
      46px;

    margin-bottom:
      18px;

    min-width: 0;
  }

  .skpay-brand-icon {
    width: 46px;
    height: 46px;

    flex-shrink: 0;

    border-radius:
      14px;

    background:
      #4f46e5;

    color:
      #ffffff;

    display: flex;
    align-items: center;
    justify-content: center;

    box-shadow:
      0
      7px
      18px
      rgba(
        79,
        70,
        229,
        0.25
      );
  }

  .skpay-brand-copy {
    min-width: 0;
  }

  .skpay-brand-name {
    color:
      #0f172a;

    font-size:
      clamp(
        16px,
        4vw,
        18px
      );

    font-weight: 800;

    overflow-wrap:
      anywhere;
  }

  .skpay-brand-subtitle {
    margin-top: 2px;

    color:
      #94a3b8;

    font-size: 11px;

    font-weight: 600;
  }

  /* =====================================
     DEMO WARNING
  ====================================== */

  .skpay-demo-banner {
    display: flex;

    align-items:
      flex-start;

    gap: 8px;

    padding:
      10px
      12px;

    margin-bottom:
      16px;

    border:
      1px solid
      #fde68a;

    border-radius:
      11px;

    background:
      #fffbeb;

    color:
      #92400e;

    font-size: 11px;

    font-weight: 600;

    line-height: 1.5;
  }

  .skpay-demo-banner svg {
    flex-shrink: 0;

    margin-top: 1px;
  }

  /* =====================================
     SUMMARY
  ====================================== */

  .skpay-summary {
    padding: 14px;

    margin-bottom: 20px;

    border:
      1px solid
      #e2e8f0;

    border-radius:
      14px;

    background:
      #f8fafc;
  }

  .skpay-summary > div,
  .skpay-success-details > div {
    display: flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap: 14px;

    padding: 6px 0;

    min-width: 0;
  }

  .skpay-summary span,
  .skpay-success-details span {
    color:
      #64748b;

    font-size: 12px;

    font-weight: 500;

    flex-shrink: 0;
  }

  .skpay-summary strong,
  .skpay-success-details strong {
    color:
      #0f172a;

    font-size: 12px;

    font-weight: 800;

    text-align: right;

    overflow-wrap:
      anywhere;

    word-break:
      break-word;

    min-width: 0;
  }

  .skpay-summary
  .skpay-money {
    color:
      #16a34a;

    font-size:
      clamp(
        16px,
        4.5vw,
        18px
      );
  }

  /* =====================================
     HEADING
  ====================================== */

  .skpay-heading {
    margin-bottom:
      10px;

    color:
      #334155;

    font-size: 12px;

    font-weight: 800;

    text-transform:
      uppercase;

    letter-spacing:
      0.7px;
  }

  /* =====================================
     METHODS
  ====================================== */

  .skpay-methods {
    display: grid;

    gap: 8px;
  }

  .skpay-method {
    width: 100%;

    min-width: 0;

    border:
      1.5px solid
      #e2e8f0;

    border-radius:
      13px;

    background:
      #ffffff;

    padding: 12px;

    cursor: pointer;

    display: flex;

    align-items:
      center;

    gap: 11px;

    text-align: left;

    transition:
      all
      0.18s ease;
  }

  .skpay-method:hover {
    border-color:
      #c7d2fe;

    background:
      #f8faff;
  }

  .skpay-method-active {
    border-color:
      #6366f1;

    background:
      #eef2ff;
  }

  .skpay-method-icon {
    width: 38px;
    height: 38px;

    flex:
      0 0 38px;

    border-radius:
      11px;

    background:
      #f1f5f9;

    color:
      #4f46e5;

    display: flex;

    align-items:
      center;

    justify-content:
      center;
  }

  .skpay-method-active
  .skpay-method-icon {
    background:
      #4f46e5;

    color:
      #ffffff;
  }

  .skpay-method-copy {
    min-width: 0;

    flex: 1;

    display: flex;

    flex-direction:
      column;

    gap: 2px;
  }

  .skpay-method-copy strong {
    color:
      #0f172a;

    font-size: 13px;

    overflow-wrap:
      anywhere;
  }

  .skpay-method-copy small {
    color:
      #94a3b8;

    font-size: 11px;

    overflow-wrap:
      anywhere;
  }

  .skpay-radio {
    width: 17px;
    height: 17px;

    flex:
      0 0 17px;

    border:
      2px solid
      #cbd5e1;

    border-radius:
      50%;
  }

  .skpay-radio-active {
    border:
      5px solid
      #4f46e5;
  }

  /* =====================================
     DEMO DETAILS
  ====================================== */

  .skpay-demo-details {
    margin:
      14px
      0;

    padding:
      11px
      12px;

    border-radius:
      11px;

    background:
      #f8fafc;

    display: flex;

    justify-content:
      space-between;

    align-items:
      center;

    gap: 10px;

    min-width: 0;
  }

  .skpay-demo-details span {
    color:
      #94a3b8;

    font-size: 11px;

    font-weight: 600;

    flex-shrink: 0;
  }

  .skpay-demo-details strong {
    color:
      #475569;

    font-size: 12px;

    text-align: right;

    overflow-wrap:
      anywhere;

    word-break:
      break-word;

    min-width: 0;
  }

  /* =====================================
     ERROR
  ====================================== */

  .skpay-error {
    margin-bottom:
      12px;

    padding:
      10px
      12px;

    border:
      1px solid
      #fecaca;

    border-radius:
      10px;

    background:
      #fef2f2;

    color:
      #dc2626;

    font-size: 12px;

    font-weight: 600;

    line-height: 1.5;

    overflow-wrap:
      anywhere;
  }

  /* =====================================
     PRIMARY BUTTON
  ====================================== */

  .skpay-primary {
    width: 100%;

    min-height: 46px;

    border: 0;

    border-radius:
      12px;

    background:
      #4f46e5;

    color:
      #ffffff;

    cursor: pointer;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    gap: 8px;

    padding:
      12px
      16px;

    font-size: 14px;

    font-weight: 800;

    font-family:
      inherit;

    transition:
      all
      0.18s ease;
  }

  .skpay-primary:hover {
    background:
      #4338ca;

    transform:
      translateY(-1px);

    box-shadow:
      0
      7px
      18px
      rgba(
        79,
        70,
        229,
        0.22
      );
  }

  .skpay-primary:active {
    transform:
      translateY(0);
  }

  /* =====================================
     FOOTER
  ====================================== */

  .skpay-footer {
    margin-top:
      11px;

    color:
      #94a3b8;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    gap: 5px;

    font-size: 10px;

    font-weight: 600;

    text-align: center;

    line-height: 1.4;
  }

  /* =====================================
     SUCCESS / PROCESSING
  ====================================== */

  .skpay-processing,
  .skpay-success {
    min-height:
      min(
        390px,
        calc(
          100dvh -
          100px
        )
      );

    display: flex;

    flex-direction:
      column;

    align-items:
      center;

    justify-content:
      center;

    text-align:
      center;
  }

  .skpay-spinner {
    width: 54px;
    height: 54px;

    margin-bottom:
      20px;

    border:
      5px solid
      #e0e7ff;

    border-top-color:
      #4f46e5;

    border-radius:
      50%;

    animation:
      skpaySpin
      0.8s
      linear
      infinite;
  }

  @keyframes skpaySpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  .skpay-processing-title,
  .skpay-success-title {
    color:
      #0f172a;

    font-size:
      clamp(
        18px,
        5vw,
        20px
      );

    font-weight: 800;
  }

  .skpay-processing-subtitle,
  .skpay-success-subtitle {
    margin-top: 6px;

    color:
      #94a3b8;

    font-size: 12px;

    line-height: 1.5;
  }

  .skpay-processing-amount,
  .skpay-success-amount {
    margin:
      22px
      0;

    color:
      #16a34a;

    font-size:
      clamp(
        24px,
        8vw,
        30px
      );

    font-weight: 800;

    overflow-wrap:
      anywhere;
  }

  .skpay-success-icon {
    width: 72px;
    height: 72px;

    margin-bottom:
      18px;

    border-radius:
      50%;

    background:
      #dcfce7;

    color:
      #16a34a;

    display: flex;

    align-items:
      center;

    justify-content:
      center;
  }

  .skpay-success-details {
    width: 100%;

    padding: 13px;

    margin-bottom:
      18px;

    border:
      1px solid
      #e2e8f0;

    border-radius:
      13px;

    background:
      #f8fafc;
  }

  /* =====================================
     TABLET / PHONE
  ====================================== */

  @media (
    max-width: 600px
  ) {
    .skpay-overlay {
      align-items:
        flex-end;

      padding:
        0;
    }

    .skpay-modal {
      width: 100%;

      max-width: none;

      max-height:
        min(
          92dvh,
          760px
        );

      border-radius:
        22px
        22px
        0
        0;

      padding:
        22px
        18px
        max(
          20px,
          env(
            safe-area-inset-bottom
          )
        );

      animation:
        skpayMobileOpen
        0.22s ease;
    }

    @keyframes skpayMobileOpen {
      from {
        opacity: 0;

        transform:
          translateY(30px);
      }

      to {
        opacity: 1;

        transform:
          translateY(0);
      }
    }

    .skpay-close {
      top: 14px;

      right: 14px;
    }

    .skpay-brand {
      margin-bottom:
        15px;
    }

    .skpay-summary {
      margin-bottom:
        17px;
    }

    .skpay-processing,
    .skpay-success {
      min-height:
        340px;
    }
  }

  /* =====================================
     SMALL MOBILE
  ====================================== */

  @media (
    max-width: 380px
  ) {
    .skpay-modal {
      padding:
        18px
        14px
        max(
          18px,
          env(
            safe-area-inset-bottom
          )
        );
    }

    .skpay-brand-icon {
      width: 42px;
      height: 42px;

      border-radius:
        12px;
    }

    .skpay-method {
      padding:
        10px;
    }

    .skpay-method-icon {
      width: 34px;
      height: 34px;

      flex-basis:
        34px;
    }

    .skpay-summary > div,
    .skpay-success-details > div,
    .skpay-demo-details {
      align-items:
        flex-start;

      flex-direction:
        column;

      gap: 4px;
    }

    .skpay-summary strong,
    .skpay-success-details strong,
    .skpay-demo-details strong {
      text-align:
        left;
    }

    .skpay-demo-details span {
      flex-shrink: 1;
    }

    .skpay-primary {
      font-size:
        13px;
    }
  }

  /* =====================================
     SHORT / LANDSCAPE SCREENS
  ====================================== */

  @media (
    max-height: 620px
  ) {
    .skpay-overlay {
      align-items:
        flex-start;

      overflow-y:
        auto;
    }

    .skpay-modal {
      max-height:
        none;

      margin:
        10px
        auto;
    }

    .skpay-processing,
    .skpay-success {
      min-height:
        300px;
    }

    .skpay-success-icon {
      width: 60px;
      height: 60px;

      margin-bottom:
        12px;
    }

    .skpay-processing-amount,
    .skpay-success-amount {
      margin:
        14px
        0;
    }
  }

  /* =====================================
     REDUCED MOTION
  ====================================== */

  @media (
    prefers-reduced-motion:
      reduce
  ) {
    .skpay-modal,
    .skpay-primary,
    .skpay-method,
    .skpay-close {
      animation: none;
      transition: none;
    }
  }
`;
