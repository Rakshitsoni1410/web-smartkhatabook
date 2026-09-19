import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiMoon,
  FiSun,
  FiBookOpen,
} from "react-icons/fi";

import api from "../api";

import OnboardingTour from "../components/OnboardingTour";
import InstallAppButton from "../components/InstallAppButton";
import "./Login.css";

// =====================================================
// LOGIN
// =====================================================

export default function Login() {
  const navigate = useNavigate();

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState("");

  const [showTour, setShowTour] = useState(false);

  const [loading, setLoading] = useState(true);

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
        window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("smartkhata-theme", darkMode ? "dark" : "light");
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  // =====================================================
  // WARM SERVER
  // =====================================================

  useEffect(() => {
    let mounted = true;

    api
      .get("/ping")
      .catch(() => {})
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // TOAST CLEANUP
  // =====================================================

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    // Phone = digits only
    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((previous) => ({
      ...previous,

      [name]: nextValue,
    }));

    setErrors((previous) => ({
      ...previous,

      [name]: "",
    }));
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {
    const nextErrors = {};

    const phone = form.phone.trim();

    if (!phone) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      nextErrors.phone = "Enter a valid 10-digit number";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    }

    return nextErrors;
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      return;
    }

    try {
      setLoading(true);

      setErrors({});

      const res = await api.post("/api/user/login", {
        phone: form.phone.trim(),

        password: form.password,
      });

      localStorage.setItem("token", res.data.token);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToast("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setErrors({
        password: err?.response?.data?.message || "Invalid phone or password",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={`login-page ${darkMode ? "login-dark" : ""}`}>
      {/* =====================================
          TOAST
      ====================================== */}

      {toast && (
        <div className="login-toast" role="status" aria-live="polite">
          <span className="login-toast-dot" />

          {toast}
        </div>
      )}

      {/* =====================================
          LEFT PANEL
      ====================================== */}

      <aside className="login-left">
        <div className="login-left-inner">
          {/* BRAND */}

          <div className="login-brand">
            <div className="login-brand-icon">
              <FiBookOpen />
            </div>

            <span className="login-brand-name">Smart Khatabook</span>
          </div>

          {/* HERO */}

          <div className="login-left-hero">
            <span className="login-left-kicker">BUSINESS MADE SIMPLE</span>

            <h1>
              Track. Manage.
              <br />
              Profit.
            </h1>

            <p>
              Your complete business accounting platform — billing, customers,
              stock and reports in one place.
            </p>
          </div>

          {/* STATS */}

          <div className="login-stat-grid">
            <div className="login-stat-card">
              <strong>10K+</strong>

              <span>Businesses</span>
            </div>

            <div className="login-stat-card">
              <strong>₹50Cr+</strong>

              <span>Transactions</span>
            </div>

            <div className="login-stat-card">
              <strong>4.8★</strong>

              <span>Rating</span>
            </div>
          </div>

          {/* QUOTE */}

          <div className="login-quote">
            <p>
              “Smart Khatabook transformed how I manage my store. Everything is
              so much simpler now.”
            </p>

            <div className="login-quote-author">
              <div className="login-author-avatar">RK</div>

              <div>
                <strong>Ramesh Kumar</strong>

                <span>Grocery Store, Surat</span>
              </div>
            </div>
          </div>
        </div>

        {/* BACKGROUND DECOR */}

        <div className="login-left-decor" aria-hidden="true">
          <span className="login-decor-circle login-c1" />

          <span className="login-decor-circle login-c2" />

          <span className="login-decor-circle login-c3" />
        </div>
      </aside>

      {/* =====================================
          RIGHT
      ====================================== */}

      <main className="login-right">
        <div className="login-card">
          {/* THEME BUTTON */}

          <button
            type="button"
            className="login-theme-btn"
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {/* MOBILE BRAND */}

          <div className="login-mobile-brand">
            <div className="login-mobile-brand-icon">
              <FiBookOpen />
            </div>

            <span>Smart Khatabook</span>
          </div>

          {/* HEADER */}

          <div className="login-card-header">
            <span className="login-welcome-badge">Welcome back 👋</span>

            <h2>Sign in to your account</h2>

            <p>Enter your credentials to continue</p>
          </div>

          {/* FORM */}

          <div className="login-form">
            {/* PHONE */}

            <div className="login-field-wrap">
              <label className="login-field-label">Phone number</label>

              <div
                className={`login-field-box ${
                  errors.phone ? "login-field-error-box" : ""
                }`}
              >
                <FiPhone className="login-field-icon" />

                <input
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  placeholder="Enter 10-digit number"
                  value={form.phone}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>

              {errors.phone && (
                <p className="login-error-text">{errors.phone}</p>
              )}
            </div>

            {/* PASSWORD */}

            <div className="login-field-wrap">
              <div className="login-label-row">
                <label className="login-field-label">Password</label>

                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              <div
                className={`login-field-box ${
                  errors.password ? "login-field-error-box" : ""
                }`}
              >
                <FiLock className="login-field-icon" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {errors.password && (
                <p className="login-error-text">{errors.password}</p>
              )}
            </div>

            {/* BUTTON */}

            <button
              type="button"
              className={`login-primary-btn ${loading ? "login-loading" : ""}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />

                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>

                  <FiArrowRight />
                </>
              )}
            </button>
          </div>

          {/* SIGNUP */}

          <div className="login-signup">
            <span>Don't have an account?</span>

            <button type="button" onClick={() => setShowTour(true)}>
              Create account
            </button>
          </div>

          {/* INSTALL APP */}

          <InstallAppButton />

          {/* SECURITY */}

          <div className="login-security-note">
            <FiLock />
            Secure login powered by Smart Khatabook
          </div>
        </div>
      </main>

      {/* =====================================
          TOUR
      ====================================== */}

      {showTour && (
        <OnboardingTour
          onFinish={() => {
            setShowTour(false);

            navigate("/signup");
          }}
        />
      )}
    </div>
  );
}
