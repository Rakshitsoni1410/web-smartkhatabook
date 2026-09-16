import { useEffect, useRef, useState } from "react";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiMail,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [email, setEmail] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const [resendSeconds, setResendSeconds] = useState(0);

  const otpRefs = useRef([]);

  // ==========================================
  // RESEND TIMER
  // ==========================================

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your registered email.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/user/forgot-password", {
        email: normalizedEmail,
      });

      if (response.data?.success) {
        setEmail(normalizedEmail);

        setOtpSent(true);

        setOtp(["", "", "", "", "", ""]);

        setResendSeconds(60);

        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(response.data?.message || "Unable to send OTP.");
      }
    } catch (err) {
      console.error("SEND OTP ERROR:", err);

      setError(
        err.response?.data?.message || "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/user/forgot-password", {
        email,
      });

      if (response.data?.success) {
        setOtp(["", "", "", "", "", ""]);

        setResendSeconds(60);

        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(response.data?.message || "Unable to resend OTP.");
      }
    } catch (err) {
      console.error("RESEND OTP ERROR:", err);

      setError(err.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OTP INPUT
  // ==========================================

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "");

    if (!digit) {
      const updated = [...otp];

      updated[index] = "";

      setOtp(updated);

      return;
    }

    const updated = [...otp];

    updated[index] = digit.slice(-1);

    setOtp(updated);

    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // ==========================================
  // OTP BACKSPACE
  // ==========================================

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft") {
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowRight") {
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }

    if (event.key === "Enter") {
      handleResetPassword();
    }
  };

  // ==========================================
  // OTP PASTE
  // ==========================================

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const updated = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setOtp(updated);

    const nextIndex = Math.min(pastedValue.length, 5);

    setTimeout(() => {
      otpRefs.current[nextIndex]?.focus();
    }, 0);
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!password) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/user/reset-password-otp", {
        email,
        otp: otpValue,
        password,
      });

      if (response.data?.success) {
        setSuccess(true);

        setOtp(["", "", "", "", "", ""]);

        setPassword("");
        setConfirmPassword("");
      } else {
        setError(response.data?.message || "Unable to reset password.");
      }
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHANGE EMAIL
  // ==========================================

  const handleChangeEmail = () => {
    setOtpSent(false);

    setOtp(["", "", "", "", "", ""]);

    setPassword("");
    setConfirmPassword("");

    setError("");
    setResendSeconds(0);
  };

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================

  if (success) {
    return (
      <>
        <style>{styles}</style>

        <div className="fp-page">
          <div className="fp-card">
            <div className="fp-success">
              <div className="fp-success-icon">
                <FiCheckCircle size={32} />
              </div>

              <h2>Password Reset Successful</h2>

              <p>Your password has been changed successfully.</p>

              <p>Please login again using your new password.</p>

              <button
                type="button"
                className="fp-btn fp-success-btn"
                onClick={() => navigate("/")}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <style>{styles}</style>

      <div className="fp-page">
        <div className="fp-card">
          {/* Back */}

          <button
            type="button"
            className="fp-back"
            onClick={() => navigate("/")}
          >
            <FiArrowLeft size={15} />
            Back to Login
          </button>

          {/* =====================================
              STEP 1 - EMAIL
          ===================================== */}

          {!otpSent ? (
            <>
              <div className="fp-icon-wrap">
                <FiMail size={25} />
              </div>

              <div className="fp-step">STEP 1 OF 2</div>

              <h2 className="fp-title">Forgot Password?</h2>

              <p className="fp-subtitle">
                Enter your registered email address and we'll send you a 6-digit
                OTP.
              </p>

              {error && <div className="fp-error">{error}</div>}

              <label className="fp-label">Email Address</label>

              <div className="fp-input-wrap">
                <FiMail className="fp-field-icon" />

                <input
                  className="fp-input fp-input-icon"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendOtp();
                    }
                  }}
                />
              </div>

              <button
                type="button"
                className="fp-btn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              {/* =================================
                  STEP 2 - OTP + PASSWORD
              ================================= */}

              <div className="fp-icon-wrap">
                <FiKey size={25} />
              </div>

              <div className="fp-step">STEP 2 OF 2</div>

              <h2 className="fp-title">Verify OTP</h2>

              <p className="fp-subtitle">
                We've sent a 6-digit OTP to
                <strong> {email}</strong>.
              </p>

              <button
                type="button"
                className="fp-change-email"
                onClick={handleChangeEmail}
              >
                Change email
              </button>

              {error && <div className="fp-error">{error}</div>}

              {/* OTP */}

              <label className="fp-label">Enter 6-digit OTP</label>

              <div className="fp-otp-group" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    className="fp-otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>

              {/* Resend */}

              <div className="fp-resend">
                {resendSeconds > 0 ? (
                  <span>
                    Resend OTP in <strong>{resendSeconds}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* New Password */}

              <label className="fp-label">New Password</label>

              <div className="fp-input-wrap">
                <FiLock className="fp-field-icon" />

                <input
                  className="fp-input fp-input-icon fp-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="fp-eye"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Confirm Password */}

              <label className="fp-label">Confirm Password</label>

              <div className="fp-input-wrap">
                <FiLock className="fp-field-icon" />

                <input
                  className="fp-input fp-input-icon fp-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter password again"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleResetPassword();
                    }
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="fp-eye"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <button
                type="button"
                className="fp-btn"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  .fp-page {
    min-height: 100vh;
    background:
      radial-gradient(
        circle at top left,
        rgba(99, 102, 241, 0.09),
        transparent 30%
      ),
      #f1f5f9;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    font-family: 'Outfit', sans-serif;
  }

  .fp-card {
    width: 100%;
    max-width: 440px;

    background: white;

    border: 1px solid #e5e7eb;
    border-radius: 22px;

    padding: 34px;

    box-shadow:
      0 20px 50px rgba(15, 23, 42, 0.08);
  }

  .fp-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 0;
    margin-bottom: 26px;

    border: none;
    background: transparent;

    color: #64748b;

    font-family: inherit;
    font-size: 13px;
    font-weight: 600;

    cursor: pointer;
  }

  .fp-back:hover {
    color: #4f46e5;
  }

  .fp-icon-wrap {
    width: 56px;
    height: 56px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 16px;

    background: #eef2ff;
    color: #4f46e5;

    margin-bottom: 16px;
  }

  .fp-step {
    color: #6366f1;

    font-size: 10px;
    font-weight: 800;

    letter-spacing: 1.2px;

    margin-bottom: 7px;
  }

  .fp-title {
    color: #0f172a;

    font-size: 24px;
    font-weight: 800;

    letter-spacing: -0.4px;

    margin: 0 0 8px;
  }

  .fp-subtitle {
    color: #64748b;

    font-size: 13px;
    line-height: 1.65;

    margin: 0 0 20px;
  }

  .fp-subtitle strong {
    color: #334155;
  }

  .fp-change-email {
    border: none;
    background: transparent;

    padding: 0;
    margin: -10px 0 20px;

    color: #4f46e5;

    font-family: inherit;
    font-size: 12px;
    font-weight: 700;

    cursor: pointer;
  }

  .fp-change-email:hover {
    text-decoration: underline;
  }

  .fp-error {
    background: #fef2f2;

    border: 1px solid #fecaca;
    border-radius: 10px;

    color: #dc2626;

    padding: 10px 12px;

    margin-bottom: 18px;

    font-size: 12px;
    font-weight: 600;

    line-height: 1.45;
  }

  .fp-label {
    display: block;

    color: #475569;

    font-size: 12px;
    font-weight: 700;

    margin-bottom: 7px;
  }

  .fp-input-wrap {
    position: relative;

    margin-bottom: 18px;
  }

  .fp-field-icon {
    position: absolute;

    left: 14px;
    top: 50%;

    transform: translateY(-50%);

    color: #94a3b8;

    pointer-events: none;
  }

  .fp-input {
    width: 100%;

    height: 48px;

    border: 1.5px solid #e2e8f0;
    border-radius: 12px;

    outline: none;

    padding: 0 14px;

    font-family: inherit;
    font-size: 14px;

    color: #0f172a;
    background: white;

    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .fp-input-icon {
    padding-left: 42px;
  }

  .fp-password-input {
    padding-right: 45px;
  }

  .fp-input:focus {
    border-color: #6366f1;

    box-shadow:
      0 0 0 3px
      rgba(99, 102, 241, 0.1);
  }

  .fp-input::placeholder {
    color: #94a3b8;
  }

  .fp-eye {
    position: absolute;

    right: 13px;
    top: 50%;

    transform: translateY(-50%);

    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    background: transparent;

    color: #94a3b8;

    cursor: pointer;
  }

  .fp-eye:hover {
    color: #4f46e5;
  }

  .fp-otp-group {
    display: grid;

    grid-template-columns:
      repeat(6, 1fr);

    gap: 8px;

    margin-bottom: 12px;
  }

  .fp-otp-input {
    width: 100%;
    min-width: 0;

    height: 52px;

    border: 1.5px solid #e2e8f0;
    border-radius: 11px;

    outline: none;

    text-align: center;

    font-family: inherit;
    font-size: 21px;
    font-weight: 800;

    color: #0f172a;

    transition:
      border-color 0.15s,
      box-shadow 0.15s,
      transform 0.15s;
  }

  .fp-otp-input:focus {
    border-color: #6366f1;

    box-shadow:
      0 0 0 3px
      rgba(99, 102, 241, 0.1);

    transform: translateY(-1px);
  }

  .fp-resend {
    min-height: 24px;

    text-align: right;

    color: #94a3b8;

    font-size: 12px;

    margin-bottom: 18px;
  }

  .fp-resend strong {
    color: #475569;
  }

  .fp-resend button {
    border: none;
    background: transparent;

    padding: 0;

    color: #4f46e5;

    font-family: inherit;
    font-size: 12px;
    font-weight: 700;

    cursor: pointer;
  }

  .fp-resend button:hover {
    text-decoration: underline;
  }

  .fp-resend button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fp-btn {
    width: 100%;

    min-height: 48px;

    border: none;
    border-radius: 12px;

    background: #4f46e5;
    color: white;

    font-family: inherit;
    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
      background 0.15s,
      transform 0.15s,
      box-shadow 0.15s;

    box-shadow:
      0 5px 16px
      rgba(79, 70, 229, 0.25);
  }

  .fp-btn:hover:not(:disabled) {
    background: #4338ca;

    transform: translateY(-1px);
  }

  .fp-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* SUCCESS */

  .fp-success {
    text-align: center;

    padding: 20px 0 10px;
  }

  .fp-success-icon {
    width: 70px;
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0 auto 20px;

    border-radius: 20px;

    color: #16a34a;
    background: #dcfce7;
  }

  .fp-success h2 {
    margin: 0 0 10px;

    color: #0f172a;

    font-size: 23px;
    font-weight: 800;
  }

  .fp-success p {
    margin: 5px 0;

    color: #64748b;

    font-size: 13px;
    line-height: 1.6;
  }

  .fp-success-btn {
    margin-top: 24px;
  }

  @media (max-width: 480px) {
    .fp-page {
      padding: 14px;
    }

    .fp-card {
      padding: 26px 20px;

      border-radius: 18px;
    }

    .fp-title {
      font-size: 21px;
    }

    .fp-otp-group {
      gap: 5px;
    }

    .fp-otp-input {
      height: 48px;

      border-radius: 9px;

      font-size: 18px;
    }
  }
`;
