import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiMapPin,
  FiBriefcase,
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiArrowRight,
  FiCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";
import "./Signup.css";

const ROLES = [
  { value: "Customer", icon: <FiUser />, label: "Customer" },
  { value: "Retailer", icon: <FiShoppingBag />, label: "Retailer" },
  { value: "Wholesaler", icon: <FiPackage />, label: "Wholesaler" },
];

const BUSINESS_TYPES = [
  "Stationery",
  "Grocery",
  "Medical",
  "Clothing",
  "Electronics",
  "Footwear",
  "Jewelry",
  "Hardware",
  "Furniture",
  "Cosmetic",
  "Book Store",
  "Mobile Shop",
  "Bakery",
  "Restaurant",
  "Gift Shop",
  "General Store",
  "Sports Shop",
  "Toy Shop",
  "Agriculture",
  "Other",
];

/* ── Toast Component ─────────────────────────────────────── */
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === "success" ? (
              <FiCheck size={15} />
            ) : (
              <FiAlertCircle size={15} />
            )}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            <FiX size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── useToast hook ───────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

/* ── Main Component ──────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    shopName: "",
    businessType: "",
    address: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const selectRole = (role) => {
    setForm({ ...form, role });
    setErrors({ ...errors, role: "" });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.phone.trim()) e.phone = "Phone required";
    else if (form.phone.length < 10) e.phone = "Enter valid 10-digit number";
    if (!form.email.trim()) e.email = "Email required";
    if (!form.role) e.role = "Please select a role";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.role !== "Customer") {
      if (!form.shopName.trim()) e.shopName = "Shop name required";
      if (!form.businessType) e.businessType = "Business type required";
    }
    if (!form.address.trim()) e.address = "Address required";
    if (!form.password) e.password = "Password required";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const goNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep(2);
  };

  const handleSignup = async () => {
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await axios.post(
        "https://backend-of-smartkhata-book.onrender.com/api/user/register",
        {
          name: form.name,
          phone: form.phone,
          email: form.email,
          role: form.role,
          shopName: form.shopName,
          businessType: form.businessType,
          address: form.address,
          password: form.password,
        },
      );
      addToast("Account created successfully! Redirecting…", "success");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Signup failed. Please try again.";
      addToast(msg, "error");
      setErrors({ phone: msg });
      setStep(1);
    }
  };

  return (
    <div className="signup-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="signup-left">
        <div className="left-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="brand-name">Smart Khatabook</span>
          </div>

          <div className="left-hero">
            <h1>Manage your business with clarity</h1>
            <p>One platform for billing, ledgers, inventory, and reports.</p>
          </div>

          <ul className="feature-list">
            {[
              "Billing & Invoicing",
              "Customer Ledger",
              "Stock Tracking",
              "Business Reports",
            ].map((f) => (
              <li key={f}>
                <span className="feature-dot">
                  <FiCheck size={11} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="left-footer">
            <p>
              Trusted by <strong>10,000+ businesses</strong> across India
            </p>
          </div>
        </div>

        <div className="left-decor" aria-hidden="true">
          <div className="decor-circle c1" />
          <div className="decor-circle c2" />
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-card">
          <div className="card-header">
            <div className="step-pills">
              <div className={`step-pill ${step >= 1 ? "active" : ""}`}>
                <span>1</span> Account
              </div>
              <div className="step-line" />
              <div className={`step-pill ${step >= 2 ? "active" : ""}`}>
                <span>2</span> Details
              </div>
            </div>
            <h2>{step === 1 ? "Create account" : "Business & security"}</h2>
            <p>
              {step === 1
                ? "Start with your basic information"
                : "Almost there — a few more details"}
            </p>
          </div>

          {step === 1 && (
            <div className="form-body">
              <div className="section-label">Account type</div>
              <div className="role-grid">
                {ROLES.map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`role-btn ${form.role === value ? "selected" : ""}`}
                    onClick={() => selectRole(value)}
                  >
                    <span className="role-icon">{icon}</span>
                    <span>{label}</span>
                    {form.role === value && (
                      <span className="role-check">
                        <FiCheck size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {errors.role && <p className="field-error">{errors.role}</p>}

              <div className="section-label" style={{ marginTop: "1.25rem" }}>
                Personal details
              </div>
              <div className="field-grid">
                <Field
                  icon={<FiUser />}
                  label="Full name"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                <Field
                  icon={<FiPhone />}
                  label="Phone"
                  name="phone"
                  placeholder="10-digit number"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  maxLength="10"
                />
              </div>
              <Field
                icon={<FiMail />}
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />

              <button className="btn-primary" onClick={goNext}>
                Continue <FiArrowRight size={15} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-body">
              {form.role !== "Customer" && (
                <>
                  <div className="section-label">Business details</div>
                  <div className="field-grid">
                    <Field
                      icon={<FiHome />}
                      label="Shop name"
                      name="shopName"
                      placeholder="Your shop name"
                      value={form.shopName}
                      onChange={handleChange}
                      error={errors.shopName}
                    />
                    <SelectField
                      icon={<FiBriefcase />}
                      label="Business type"
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      error={errors.businessType}
                      options={BUSINESS_TYPES}
                    />
                  </div>
                </>
              )}

              <div
                className="section-label"
                style={{ marginTop: form.role !== "Customer" ? "1.25rem" : 0 }}
              >
                Location
              </div>
              <Field
                icon={<FiMapPin />}
                label="Address"
                name="address"
                placeholder="Shop or home address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
              />

              <div className="section-label" style={{ marginTop: "1.25rem" }}>
                Security
              </div>
              <div className="field-grid">
                <Field
                  icon={<FiLock />}
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <Field
                  icon={<FiLock />}
                  label="Confirm password"
                  name="confirm"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  error={errors.confirm}
                />
              </div>

              <div className="btn-row">
                <button className="btn-ghost" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={handleSignup}>
                  Create account <FiCheck size={15} />
                </button>
              </div>
            </div>
          )}

          <p className="login-hint">
            Already have an account?{" "}
            <span onClick={() => navigate("/")} className="login-link">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, error, ...props }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className={`field-box ${error ? "has-error" : ""}`}>
        <span className="field-icon">{icon}</span>
        <input {...props} />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function SelectField({ icon, label, options, error, ...props }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className={`field-box ${error ? "has-error" : ""}`}>
        <span className="field-icon">{icon}</span>
        <select {...props}>
          <option value="">Select type</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
