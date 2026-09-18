import { useEffect, useRef, useState } from "react";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiMail,
  FiMoon,
  FiSun,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import api from "../api";

// =====================================================
// COMPONENT
// =====================================================

export default function ForgotPassword() {
  const navigate = useNavigate();

  // =====================================================
  // FORM STATE
  // =====================================================

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

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("smartkhata-theme");

      if (saved === "dark") {
        return true;
      }

      if (saved === "light") {
        return false;
      }

      return (
        window.matchMedia?.("(prefers-color-scheme: dark)").matches || false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("smartkhata-theme", darkMode ? "dark" : "light");
    } catch {
      // Ignore localStorage errors
    }
  }, [darkMode]);

  // =====================================================
  // RESEND TIMER
  // =====================================================

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  // =====================================================
  // EMAIL VALIDATION
  // =====================================================

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // =====================================================
  // SEND OTP
  // =====================================================

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
        err?.response?.data?.message || "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

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

      setError(err?.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OTP CHANGE
  // =====================================================

  const handleOtpChange = (index, value) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      const updated = [...otp];

      updated[index] = "";

      setOtp(updated);

      return;
    }

    const updated = [...otp];

    updated[index] = digits.slice(-1);

    setOtp(updated);

    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // =====================================================
  // OTP KEYBOARD
  // =====================================================

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

  // =====================================================
  // OTP PASTE
  // =====================================================

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

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async () => {
    if (loading) {
      return;
    }

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
        err?.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHANGE EMAIL
  // =====================================================

  const handleChangeEmail = () => {
    setOtpSent(false);

    setOtp(["", "", "", "", "", ""]);

    setPassword("");

    setConfirmPassword("");

    setError("");

    setResendSeconds(0);
  };

  // =====================================================
  // THEME BUTTON
  // =====================================================

  const ThemeButton = () => (
    <button
      type="button"
      className="fp-theme-btn"
      onClick={() => setDarkMode((previous) => !previous)}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Light Mode" : "Dark Mode"}
    >
      {darkMode ? <FiSun /> : <FiMoon />}
    </button>
  );

  // =====================================================
  // SUCCESS
  // =====================================================

  if (success) {
    return (
      <>
        <style>{styles}</style>

        <div className={`fp-page ${darkMode ? "fp-dark" : ""}`}>
          <div className="fp-bg-circle fp-bg-one" />

          <div className="fp-bg-circle fp-bg-two" />

          <div className="fp-shell">
            <div className="fp-card">
              <ThemeButton />

              <div className="fp-success">
                <div className="fp-success-icon">
                  <FiCheckCircle size={34} />
                </div>

                <div className="fp-success-label">ALL DONE</div>

                <h2>Password Reset Successful</h2>

                <p>Your password has been changed successfully.</p>

                <p>Login again using your new password.</p>

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
        </div>
      </>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <style>{styles}</style>

      <div className={`fp-page ${darkMode ? "fp-dark" : ""}`}>
        {/* BACKGROUND DECORATION */}

        <div className="fp-bg-circle fp-bg-one" />

        <div className="fp-bg-circle fp-bg-two" />

        <div className="fp-shell">
          <div className="fp-card">
            {/* =====================================
                TOP
            ====================================== */}

            <div className="fp-card-top">
              <button
                type="button"
                className="fp-back"
                onClick={() => navigate("/")}
              >
                <FiArrowLeft />

                <span>Back to Login</span>
              </button>

              <ThemeButton />
            </div>

            {/* =====================================
                STEP 1
            ====================================== */}

            {!otpSent ? (
              <>
                <div className="fp-icon-wrap">
                  <FiMail size={25} />
                </div>

                <div className="fp-step-row">
                  <span className="fp-step">STEP 1 OF 2</span>

                  <div className="fp-step-dots">
                    <span className="fp-step-dot fp-step-dot-active" />

                    <span className="fp-step-dot" />
                  </div>
                </div>

                <h1 className="fp-title">Forgot Password?</h1>

                <p className="fp-subtitle">
                  Enter your registered email address and we'll send you a
                  secure 6-digit OTP.
                </p>

                {error && <div className="fp-error">{error}</div>}

                <label className="fp-label">Email Address</label>

                <div className="fp-input-wrap">
                  <FiMail className="fp-field-icon" />

                  <input
                    className="fp-input fp-input-icon"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
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

                <div className="fp-security">
                  <FiLock />
                  Your password reset request is protected.
                </div>
              </>
            ) : (
              <>
                {/* =================================
                    STEP 2
                ================================== */}

                <div className="fp-icon-wrap fp-key-icon">
                  <FiKey size={25} />
                </div>

                <div className="fp-step-row">
                  <span className="fp-step">STEP 2 OF 2</span>

                  <div className="fp-step-dots">
                    <span className="fp-step-dot fp-step-dot-active" />

                    <span className="fp-step-dot fp-step-dot-active" />
                  </div>
                </div>

                <h1 className="fp-title">Verify OTP</h1>

                <p className="fp-subtitle">
                  We've sent a 6-digit OTP to <strong>{email}</strong>.
                </p>

                <button
                  type="button"
                  className="fp-change-email"
                  onClick={handleChangeEmail}
                  disabled={loading}
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
                      className={`fp-otp-input ${digit ? "fp-otp-filled" : ""}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleOtpChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                {/* RESEND */}

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

                {/* PASSWORD */}

                <label className="fp-label">New Password</label>

                <div className="fp-input-wrap">
                  <FiLock className="fp-field-icon" />

                  <input
                    className="fp-input fp-input-icon fp-password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* CONFIRM */}

                <label className="fp-label">Confirm Password</label>

                <div className="fp-input-wrap">
                  <FiLock className="fp-field-icon" />

                  <input
                    className="fp-input fp-input-icon fp-password-input"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter password again"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleResetPassword();
                      }
                    }}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="fp-eye"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
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

                <div className="fp-security">
                  <FiLock />
                  OTP expires after a limited time for security.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = `
  @import url(
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap'
  );

  .fp-page,
  .fp-page * {
    box-sizing: border-box;
  }

  /* =========================================
     PAGE
  ========================================= */

  .fp-page {
    --fp-bg: #eef2f7;
    --fp-card: #ffffff;
    --fp-card-soft: #f8fafc;

    --fp-text: #0f172a;
    --fp-text-2: #334155;
    --fp-muted: #64748b;

    --fp-border: #e2e8f0;

    --fp-input: #ffffff;

    --fp-primary: #4f46e5;
    --fp-primary-hover: #4338ca;

    --fp-shadow:
      0 24px 60px
      rgba(
        15,
        23,
        42,
        0.10
      );

    position: relative;

    isolation: isolate;

    width: 100%;

    min-width: 0;

    min-height: 100vh;

    min-height: 100dvh;

    padding:
      max(
        20px,
        env(
          safe-area-inset-top
        )
      )
      max(
        20px,
        env(
          safe-area-inset-right
        )
      )
      max(
        20px,
        env(
          safe-area-inset-bottom
        )
      )
      max(
        20px,
        env(
          safe-area-inset-left
        )
      );

    display: flex;

    align-items: center;

    justify-content: center;

    overflow-x: hidden;

    overflow-y: auto;

    background:
      radial-gradient(
        circle
        at
        10%
        0%,
        rgba(
          99,
          102,
          241,
          0.12
        ),
        transparent
        33%
      ),
      radial-gradient(
        circle
        at
        95%
        85%,
        rgba(
          14,
          165,
          233,
          0.10
        ),
        transparent
        35%
      ),
      var(
        --fp-bg
      );

    color:
      var(
        --fp-text
      );

    font-family:
      'Outfit',
      Arial,
      sans-serif;

    transition:
      background
        0.25s
        ease,
      color
        0.25s
        ease;
  }

  /* =========================================
     DARK MODE
  ========================================= */

  .fp-page.fp-dark {
    --fp-bg: #080e1a;

    --fp-card: #111827;

    --fp-card-soft: #172033;

    --fp-text: #f8fafc;

    --fp-text-2: #cbd5e1;

    --fp-muted: #94a3b8;

    --fp-border: #293548;

    --fp-input: #151f31;

    --fp-shadow:
      0 25px 70px
      rgba(
        0,
        0,
        0,
        0.36
      );
  }

  /* =========================================
     BACKGROUND DECORATION
  ========================================= */

  .fp-bg-circle {
    position: fixed;

    z-index: -1;

    border-radius: 50%;

    pointer-events: none;

    filter: blur(1px);
  }

  .fp-bg-one {
    width:
      min(
        50vw,
        600px
      );

    aspect-ratio: 1;

    top: -28%;

    left: -12%;

    background:
      radial-gradient(
        circle,
        rgba(
          79,
          70,
          229,
          0.13
        ),
        transparent
        70%
      );
  }

  .fp-bg-two {
    width:
      min(
        48vw,
        550px
      );

    aspect-ratio: 1;

    right: -12%;

    bottom: -30%;

    background:
      radial-gradient(
        circle,
        rgba(
          14,
          165,
          233,
          0.10
        ),
        transparent
        70%
      );
  }

  /* =========================================
     SHELL
  ========================================= */

  .fp-shell {
    width: 100%;

    display: flex;

    justify-content: center;
  }

  /* =========================================
     CARD
  ========================================= */

  .fp-card {
    position: relative;

    width:
      min(
        100%,
        460px
      );

    padding:
      30px
      32px
      32px;

    border:
      1px solid
      var(
        --fp-border
      );

    border-radius: 24px;

    background:
      var(
        --fp-card
      );

    box-shadow:
      var(
        --fp-shadow
      );

    animation:
      fpCardIn
      0.28s
      ease;
  }

  @keyframes fpCardIn {
    from {
      opacity: 0;

      transform:
        translateY(
          14px
        )
        scale(
          0.985
        );
    }

    to {
      opacity: 1;

      transform:
        translateY(
          0
        )
        scale(
          1
        );
    }
  }

  /* =========================================
     CARD TOP
  ========================================= */

  .fp-card-top {
    min-height: 38px;

    margin-bottom: 21px;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;
  }

  /* =========================================
     BACK
  ========================================= */

  .fp-back {
    min-width: 0;

    padding: 0;

    border: none;

    background:
      transparent;

    color:
      var(
        --fp-muted
      );

    display:
      inline-flex;

    align-items: center;

    gap: 6px;

    font-family: inherit;

    font-size: 12px;

    font-weight: 700;

    cursor: pointer;

    transition:
      color
      0.18s
      ease;
  }

  .fp-back:hover {
    color:
      var(
        --fp-primary
      );
  }

  /* =========================================
     THEME
  ========================================= */

  .fp-theme-btn {
    width: 38px;
    height: 38px;

    flex: 0 0 38px;

    border:
      1px solid
      var(
        --fp-border
      );

    border-radius: 11px;

    background:
      var(
        --fp-card-soft
      );

    color:
      var(
        --fp-text-2
      );

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 17px;

    cursor: pointer;

    transition:
      transform
        0.18s
        ease,
      background
        0.18s
        ease;
  }

  .fp-theme-btn:hover {
    transform:
      translateY(
        -2px
      );
  }

  /* =========================================
     ICON
  ========================================= */

  .fp-icon-wrap {
    width: 58px;
    height: 58px;

    margin-bottom: 17px;

    border-radius: 17px;

    background:
      rgba(
        79,
        70,
        229,
        0.11
      );

    color:
      #4f46e5;

    display: flex;

    align-items: center;

    justify-content: center;
  }

  .fp-dark
  .fp-icon-wrap {
    color:
      #a5b4fc;

    background:
      rgba(
        99,
        102,
        241,
        0.17
      );
  }

  .fp-key-icon {
    color:
      #7c3aed;
  }

  /* =========================================
     STEP
  ========================================= */

  .fp-step-row {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 10px;

    margin-bottom: 7px;
  }

  .fp-step {
    color:
      #6366f1;

    font-size: 10px;

    font-weight: 800;

    letter-spacing:
      1.1px;
  }

  .fp-step-dots {
    display: flex;

    gap: 5px;
  }

  .fp-step-dot {
    width: 18px;
    height: 4px;

    border-radius:
      20px;

    background:
      var(
        --fp-border
      );
  }

  .fp-step-dot-active {
    background:
      #6366f1;
  }

  /* =========================================
     TITLE
  ========================================= */

  .fp-title {
    margin:
      0
      0
      8px;

    color:
      var(
        --fp-text
      );

    font-size:
      clamp(
        23px,
        5vw,
        27px
      );

    font-weight: 800;

    line-height: 1.2;

    letter-spacing:
      -0.5px;
  }

  .fp-subtitle {
    margin:
      0
      0
      20px;

    color:
      var(
        --fp-muted
      );

    font-size: 13px;

    line-height: 1.65;

    overflow-wrap:
      anywhere;
  }

  .fp-subtitle strong {
    color:
      var(
        --fp-text-2
      );

    overflow-wrap:
      anywhere;
  }

  /* =========================================
     CHANGE EMAIL
  ========================================= */

  .fp-change-email {
    margin:
      -10px
      0
      18px;

    padding: 0;

    border: none;

    background:
      transparent;

    color:
      #6366f1;

    font-family: inherit;

    font-size: 12px;

    font-weight: 700;

    cursor: pointer;
  }

  .fp-change-email:hover {
    text-decoration:
      underline;
  }

  .fp-change-email:disabled {
    opacity: 0.5;

    cursor:
      not-allowed;
  }

  /* =========================================
     ERROR
  ========================================= */

  .fp-error {
    margin-bottom: 17px;

    padding:
      10px
      12px;

    border:
      1px solid
      rgba(
        239,
        68,
        68,
        0.28
      );

    border-radius: 10px;

    background:
      rgba(
        239,
        68,
        68,
        0.08
      );

    color:
      #dc2626;

    font-size: 12px;

    font-weight: 600;

    line-height: 1.5;

    overflow-wrap:
      anywhere;
  }

  .fp-dark
  .fp-error {
    color:
      #fca5a5;
  }

  /* =========================================
     LABEL
  ========================================= */

  .fp-label {
    display: block;

    margin-bottom: 7px;

    color:
      var(
        --fp-text-2
      );

    font-size: 12px;

    font-weight: 700;
  }

  /* =========================================
     INPUT WRAPPER
  ========================================= */

  .fp-input-wrap {
    position: relative;

    margin-bottom: 17px;
  }

  .fp-field-icon {
    position: absolute;

    z-index: 2;

    left: 14px;

    top: 50%;

    transform:
      translateY(
        -50%
      );

    color:
      var(
        --fp-muted
      );

    pointer-events:
      none;
  }

  /* =========================================
     INPUT
  ========================================= */

  .fp-input {
    width: 100%;

    min-width: 0;

    height: 48px;

    padding:
      0
      14px;

    border:
      1.5px solid
      var(
        --fp-border
      );

    border-radius: 12px;

    outline: none;

    background:
      var(
        --fp-input
      );

    color:
      var(
        --fp-text
      );

    font-family: inherit;

    font-size: 14px;

    transition:
      border-color
        0.18s
        ease,
      box-shadow
        0.18s
        ease;
  }

  .fp-input-icon {
    padding-left: 42px;
  }

  .fp-password-input {
    padding-right: 46px;
  }

  .fp-input:focus {
    border-color:
      #6366f1;

    box-shadow:
      0
      0
      0
      3px
      rgba(
        99,
        102,
        241,
        0.12
      );
  }

  .fp-input::placeholder {
    color:
      var(
        --fp-muted
      );
  }

  /* Prevent browser white autofill
     looking terrible in dark mode */

  .fp-dark
  .fp-input:-webkit-autofill,
  .fp-dark
  .fp-input:-webkit-autofill:hover,
  .fp-dark
  .fp-input:-webkit-autofill:focus {
    -webkit-text-fill-color:
      #f8fafc;

    -webkit-box-shadow:
      0
      0
      0
      1000px
      #151f31
      inset;

    transition:
      background-color
      9999s
      ease-in-out
      0s;
  }

  /* =========================================
     PASSWORD EYE
  ========================================= */

  .fp-eye {
    position: absolute;

    right: 11px;

    top: 50%;

    transform:
      translateY(
        -50%
      );

    width: 34px;
    height: 34px;

    padding: 0;

    border: none;

    border-radius: 8px;

    background:
      transparent;

    color:
      var(
        --fp-muted
      );

    display: flex;

    align-items: center;

    justify-content: center;

    cursor: pointer;
  }

  .fp-eye:hover {
    color:
      #6366f1;

    background:
      var(
        --fp-card-soft
      );
  }

  /* =========================================
     OTP
  ========================================= */

  .fp-otp-group {
    width: 100%;

    display: grid;

    grid-template-columns:
      repeat(
        6,
        minmax(
          0,
          1fr
        )
      );

    gap: 8px;

    margin-bottom: 11px;
  }

  .fp-otp-input {
    width: 100%;

    min-width: 0;

    height: 54px;

    padding: 0;

    border:
      1.5px solid
      var(
        --fp-border
      );

    border-radius: 11px;

    outline: none;

    background:
      var(
        --fp-input
      );

    color:
      var(
        --fp-text
      );

    text-align: center;

    font-family: inherit;

    font-size: 20px;

    font-weight: 800;

    transition:
      border-color
        0.16s
        ease,
      box-shadow
        0.16s
        ease,
      transform
        0.16s
        ease,
      background
        0.16s
        ease;
  }

  .fp-otp-input:focus {
    border-color:
      #6366f1;

    box-shadow:
      0
      0
      0
      3px
      rgba(
        99,
        102,
        241,
        0.12
      );

    transform:
      translateY(
        -1px
      );
  }

  .fp-otp-filled {
    border-color:
      rgba(
        99,
        102,
        241,
        0.65
      );

    background:
      rgba(
        99,
        102,
        241,
        0.06
      );
  }

  .fp-dark
  .fp-otp-filled {
    background:
      rgba(
        99,
        102,
        241,
        0.12
      );
  }

  /* =========================================
     RESEND
  ========================================= */

  .fp-resend {
    min-height: 24px;

    margin-bottom: 17px;

    color:
      var(
        --fp-muted
      );

    text-align: right;

    font-size: 12px;
  }

  .fp-resend strong {
    color:
      var(
        --fp-text-2
      );
  }

  .fp-resend button {
    padding: 0;

    border: none;

    background:
      transparent;

    color:
      #6366f1;

    font-family: inherit;

    font-size: 12px;

    font-weight: 700;

    cursor: pointer;
  }

  .fp-resend button:hover {
    text-decoration:
      underline;
  }

  .fp-resend button:disabled {
    opacity: 0.5;

    cursor:
      not-allowed;
  }

  /* =========================================
     PRIMARY BUTTON
  ========================================= */

  .fp-btn {
    width: 100%;

    min-height: 49px;

    padding:
      11px
      16px;

    border: none;

    border-radius: 12px;

    background:
      linear-gradient(
        135deg,
        #4f46e5,
        #6366f1
      );

    color: #ffffff;

    font-family: inherit;

    font-size: 14px;

    font-weight: 800;

    cursor: pointer;

    box-shadow:
      0
      6px
      18px
      rgba(
        79,
        70,
        229,
        0.24
      );

    transition:
      transform
        0.17s
        ease,
      filter
        0.17s
        ease,
      box-shadow
        0.17s
        ease;
  }

  .fp-btn:hover:not(
    :disabled
  ) {
    transform:
      translateY(
        -2px
      );

    filter:
      brightness(
        1.05
      );

    box-shadow:
      0
      9px
      22px
      rgba(
        79,
        70,
        229,
        0.3
      );
  }

  .fp-btn:disabled {
    opacity: 0.6;

    cursor:
      not-allowed;

    box-shadow: none;
  }

  /* =========================================
     SECURITY TEXT
  ========================================= */

  .fp-security {
    margin-top: 15px;

    color:
      var(
        --fp-muted
      );

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 6px;

    text-align: center;

    font-size: 10px;

    font-weight: 600;

    line-height: 1.4;
  }

  /* =========================================
     SUCCESS
  ========================================= */

  .fp-success {
    padding:
      25px
      0
      10px;

    text-align: center;
  }

  .fp-success-icon {
    width: 74px;
    height: 74px;

    margin:
      0
      auto
      19px;

    border-radius: 22px;

    background:
      rgba(
        34,
        197,
        94,
        0.13
      );

    color: #16a34a;

    display: flex;

    align-items: center;

    justify-content: center;
  }

  .fp-success-label {
    margin-bottom: 7px;

    color: #16a34a;

    font-size: 10px;

    font-weight: 900;

    letter-spacing:
      0.11em;
  }

  .fp-success h2 {
    margin:
      0
      0
      12px;

    color:
      var(
        --fp-text
      );

    font-size:
      clamp(
        22px,
        5vw,
        25px
      );

    font-weight: 800;
  }

  .fp-success p {
    margin:
      5px
      0;

    color:
      var(
        --fp-muted
      );

    font-size: 13px;

    line-height: 1.6;
  }

  .fp-success-btn {
    margin-top: 24px;
  }

  /* =========================================
     TABLET
  ========================================= */

  @media (
    max-width: 700px
  ) {
    .fp-page {
      align-items:
        flex-start;

      padding:
        max(
          18px,
          env(
            safe-area-inset-top
          )
        )
        16px
        max(
          18px,
          env(
            safe-area-inset-bottom
          )
        );
    }

    .fp-shell {
      margin:
        auto
        0;
    }

    .fp-card {
      max-width: 450px;

      padding:
        28px
        25px;

      border-radius: 21px;
    }
  }

  /* =========================================
     MOBILE
  ========================================= */

  @media (
    max-width: 480px
  ) {
    .fp-page {
      padding:
        max(
          12px,
          env(
            safe-area-inset-top
          )
        )
        12px
        max(
          12px,
          env(
            safe-area-inset-bottom
          )
        );
    }

    .fp-card {
      padding:
        22px
        18px
        24px;

      border-radius: 18px;
    }

    .fp-card-top {
      margin-bottom: 18px;
    }

    .fp-title {
      font-size: 22px;
    }

    .fp-subtitle {
      font-size: 12px;
    }

    .fp-icon-wrap {
      width: 52px;
      height: 52px;

      border-radius: 15px;
    }

    .fp-otp-group {
      gap: 5px;
    }

    .fp-otp-input {
      height: 49px;

      border-radius: 9px;

      font-size: 18px;
    }
  }

  /* =========================================
     SMALL MOBILE
  ========================================= */

  @media (
    max-width: 370px
  ) {
    .fp-page {
      padding:
        8px;
    }

    .fp-card {
      padding:
        18px
        14px
        20px;

      border-radius: 16px;
    }

    .fp-back span {
      display: none;
    }

    .fp-back {
      width: 38px;
      height: 38px;

      border:
        1px solid
        var(
          --fp-border
        );

      border-radius: 10px;

      background:
        var(
          --fp-card-soft
        );

      justify-content: center;
    }

    .fp-step {
      font-size: 9px;
    }

    .fp-title {
      font-size: 20px;
    }

    .fp-otp-group {
      gap: 4px;
    }

    .fp-otp-input {
      height: 45px;

      font-size: 17px;

      border-radius: 8px;
    }

    .fp-input {
      height: 46px;
    }
  }

  /* =========================================
     TINY PHONE
  ========================================= */

  @media (
    max-width: 320px
  ) {
    .fp-card {
      padding:
        16px
        10px;
    }

    .fp-otp-group {
      gap: 3px;
    }

    .fp-otp-input {
      height: 42px;

      font-size: 16px;
    }
  }

  /* =========================================
     SHORT / LANDSCAPE SCREEN
  ========================================= */

  @media (
    max-height: 650px
  ) {
    .fp-page {
      align-items:
        flex-start;

      padding-top: 12px;

      padding-bottom: 12px;
    }

    .fp-card {
      margin:
        0
        auto;

      padding-top: 20px;

      padding-bottom: 20px;
    }

    .fp-card-top {
      margin-bottom: 13px;
    }

    .fp-icon-wrap {
      width: 46px;
      height: 46px;

      margin-bottom: 12px;
    }

    .fp-subtitle {
      margin-bottom: 15px;
    }

    .fp-input-wrap {
      margin-bottom: 13px;
    }

    .fp-resend {
      margin-bottom: 13px;
    }
  }

  /* =========================================
     TOUCH DEVICES
  ========================================= */

  @media (
    hover: none
  ) {
    .fp-theme-btn:hover,
    .fp-btn:hover:not(
      :disabled
    ) {
      transform: none;
    }
  }

  /* =========================================
     REDUCED MOTION
  ========================================= */

  @media (
    prefers-reduced-motion:
      reduce
  ) {
    .fp-page *,
    .fp-page *::before,
    .fp-page *::after {
      animation-duration:
        0.01ms !important;

      transition-duration:
        0.01ms !important;
    }
  }
`;
