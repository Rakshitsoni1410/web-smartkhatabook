import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.length < 10) e.phone = "Enter a valid 10-digit number";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await axios.post("https://backend-of-smartkhata-book.onrender.com/api/user/login", {
        phone: form.phone,
        password: form.password,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setToast("Login successful!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setErrors({ password: err.response?.data?.message || "Invalid phone or password" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span className="toast-dot" />
          {toast}
        </div>
      )}

      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="left-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="brand-name">Smart Khatabook</span>
          </div>

          <div className="left-hero">
            <h1>Track. Manage. Profit.</h1>
            <p>Your complete business accounting platform — billing, customers, stock and reports in one place.</p>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-num">10K+</span>
              <span className="stat-label">Businesses</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">₹50Cr+</span>
              <span className="stat-label">Transactions</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">4.8★</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>

          <div className="left-quote">
            <p>"Smart Khatabook transformed how I manage my store. Everything is so much simpler now."</p>
            <div className="quote-author">
              <div className="author-avatar">RK</div>
              <div>
                <strong>Ramesh Kumar</strong>
                <span>Grocery Store, Surat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="left-decor" aria-hidden="true">
          <div className="decor-circle c1" />
          <div className="decor-circle c2" />
          <div className="decor-circle c3" />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">

          <div className="card-header">
            <div className="welcome-badge">Welcome back 👋</div>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to continue</p>
          </div>

          <div className="form-body">
            <div className="field-wrap">
              <label className="field-label">Phone number</label>
              <div className={`field-box ${errors.phone ? "has-error" : ""}`}>
                <FiPhone className="field-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit number"
                  value={form.phone}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  maxLength="10"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="field-wrap">
              <div className="label-row">
                <label className="field-label">Password</label>
                <span className="forgot-link" onClick={() => navigate("/forgot-password")}>
                  Forgot password?
                </span>
              </div>
              <div className={`field-box ${errors.password ? "has-error" : ""}`}>
                <FiLock className="field-icon" />
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
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <button
              className={`btn-primary ${loading ? "loading" : ""}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>Sign in <FiArrowRight size={15} /></>
              )}
            </button>
          </div>

          <p className="signup-hint">
            Don't have an account?{" "}
            <span className="signup-link" onClick={() => navigate("/signup")}>
              Create account
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}