import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiHome,
  FiLock,
  FiMail,
  FiMapPin,
  FiMoon,
  FiPackage,
  FiPhone,
  FiShoppingBag,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";

import api from "../api";

import "./Signup.css";

// =====================================================
// CONSTANTS
// =====================================================

const ROLES = [
  {
    value: "Customer",
    icon: <FiUser />,
    label: "Customer",
  },
  {
    value: "Retailer",
    icon: <FiShoppingBag />,
    label: "Retailer",
  },
  {
    value: "Wholesaler",
    icon: <FiPackage />,
    label: "Wholesaler",
  },
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

// =====================================================
// TOAST
// =====================================================

function SignupToast({
  toasts,
  removeToast,
}) {
  return (
    <div className="signup-toast-container">
      {toasts.map(
        (toast) => (
          <div
            key={toast.id}
            className={`signup-toast ${
              toast.type ===
              "success"
                ? "signup-toast-success"
                : "signup-toast-error"
            }`}
            role="status"
          >
            <span className="signup-toast-icon">
              {toast.type ===
              "success" ? (
                <FiCheck />
              ) : (
                <FiAlertCircle />
              )}
            </span>

            <span className="signup-toast-message">
              {toast.message}
            </span>

            <button
              type="button"
              className="signup-toast-close"
              onClick={() =>
                removeToast(
                  toast.id
                )
              }
              aria-label="Close notification"
            >
              <FiX />
            </button>
          </div>
        )
      )}
    </div>
  );
}

// =====================================================
// TOAST HOOK
// =====================================================

function useSignupToast() {
  const [
    toasts,
    setToasts,
  ] = useState([]);

  const removeToast = (
    id
  ) => {
    setToasts(
      (previous) =>
        previous.filter(
          (toast) =>
            toast.id !== id
        )
    );
  };

  const addToast = (
    message,
    type = "success",
    duration = 3500
  ) => {
    const id =
      `${Date.now()}-${Math.random()}`;

    setToasts(
      (previous) => [
        ...previous,
        {
          id,
          message,
          type,
        },
      ]
    );

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
}

// =====================================================
// SIGNUP
// =====================================================

export default function Signup() {
  const navigate =
    useNavigate();

  const [
    step,
    setStep,
  ] = useState(1);

  const {
    toasts,
    addToast,
    removeToast,
  } = useSignupToast();

  // =====================================================
  // FORM
  // =====================================================

  const [
    form,
    setForm,
  ] = useState({
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

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  // =====================================================
  // DARK MODE
  // =====================================================

  const [
    darkMode,
    setDarkMode,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          "smartkhata-theme"
        );

      if (
        saved === "dark"
      ) {
        return true;
      }

      if (
        saved === "light"
      ) {
        return false;
      }

      return (
        window.matchMedia?.(
          "(prefers-color-scheme: dark)"
        )?.matches || false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "smartkhata-theme",
        darkMode
          ? "dark"
          : "light"
      );
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    let nextValue = value;

    if (
      name === "phone"
    ) {
      nextValue = value
        .replace(
          /\D/g,
          ""
        )
        .slice(0, 10);
    }

    setForm(
      (previous) => ({
        ...previous,
        [name]:
          nextValue,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [name]: "",
      })
    );
  };

  // =====================================================
  // ROLE
  // =====================================================

  const selectRole = (
    role
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        role,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        role: "",
      })
    );
  };

  // =====================================================
  // STEP 1 VALIDATION
  // =====================================================

  const validateStep1 =
    () => {
      const nextErrors =
        {};

      if (
        !form.name.trim()
      ) {
        nextErrors.name =
          "Name is required";
      }

      if (
        !form.phone.trim()
      ) {
        nextErrors.phone =
          "Phone is required";
      } else if (
        !/^\d{10}$/.test(
          form.phone
        )
      ) {
        nextErrors.phone =
          "Enter a valid 10-digit number";
      }

      if (
        !form.email.trim()
      ) {
        nextErrors.email =
          "Email is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim()
        )
      ) {
        nextErrors.email =
          "Enter a valid email";
      }

      if (!form.role) {
        nextErrors.role =
          "Please select a role";
      }

      return nextErrors;
    };

  // =====================================================
  // STEP 2 VALIDATION
  // =====================================================

  const validateStep2 =
    () => {
      const nextErrors =
        {};

      if (
        form.role !==
        "Customer"
      ) {
        if (
          !form.shopName.trim()
        ) {
          nextErrors.shopName =
            "Shop name is required";
        }

        if (
          !form.businessType
        ) {
          nextErrors.businessType =
            "Business type is required";
        }
      }

      if (
        !form.address.trim()
      ) {
        nextErrors.address =
          "Address is required";
      }

      if (!form.password) {
        nextErrors.password =
          "Password is required";
      } else if (
        form.password.length <
        6
      ) {
        nextErrors.password =
          "Password must be at least 6 characters";
      }

      if (
        !form.confirm
      ) {
        nextErrors.confirm =
          "Confirm your password";
      } else if (
        form.password !==
        form.confirm
      ) {
        nextErrors.confirm =
          "Passwords do not match";
      }

      return nextErrors;
    };

  // =====================================================
  // NEXT STEP
  // =====================================================

  const goNext = () => {
    const nextErrors =
      validateStep1();

    if (
      Object.keys(
        nextErrors
      ).length > 0
    ) {
      setErrors(
        nextErrors
      );

      return;
    }

    setErrors({});

    setStep(2);

    window.scrollTo?.({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // SIGNUP
  // =====================================================

  const handleSignup =
    async () => {
      if (submitting) {
        return;
      }

      const nextErrors =
        validateStep2();

      if (
        Object.keys(
          nextErrors
        ).length > 0
      ) {
        setErrors(
          nextErrors
        );

        return;
      }

      try {
        setSubmitting(true);

        const response =
          await api.post(
            "/api/user/register",
            {
              name:
                form.name.trim(),

              phone:
                form.phone.trim(),

              email:
                form.email
                  .trim()
                  .toLowerCase(),

              role:
                form.role,

              shopName:
                form.shopName
                  .trim() ||
                "N/A",

              businessType:
                form.businessType ||
                "N/A",

              address:
                form.address.trim(),

              password:
                form.password,
            }
          );

        if (
          response.data
            ?.success
        ) {
          addToast(
            "Account created successfully! 🎉",
            "success"
          );

          setTimeout(() => {
            navigate("/");
          }, 1300);
        } else {
          addToast(
            response.data
              ?.message ||
              "Signup failed",
            "error"
          );
        }
      } catch (error) {
        console.error(
          "SIGNUP ERROR:",
          error
        );

        addToast(
          error?.response?.data
            ?.message ||
            "Signup failed. Try again.",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={`signup-page ${
        darkMode
          ? "signup-dark"
          : ""
      }`}
    >
      <SignupToast
        toasts={toasts}
        removeToast={
          removeToast
        }
      />

      {/* =====================================
          LEFT PANEL
      ====================================== */}

      <aside className="signup-left">
        <div className="signup-left-inner">
          {/* BRAND */}

          <div className="signup-brand">
            <div className="signup-brand-icon">
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

            <span className="signup-brand-name">
              Smart Khatabook
            </span>
          </div>

          {/* HERO */}

          <div className="signup-left-hero">
            <span className="signup-left-label">
              SMART BUSINESS
            </span>

            <h1>
              Manage your
              business with
              clarity.
            </h1>

            <p>
              One platform for
              billing, ledgers,
              inventory and
              reports.
            </p>
          </div>

          {/* FEATURES */}

          <ul className="signup-feature-list">
            {[
              "Billing & Invoicing",
              "Customer Ledger",
              "Stock Tracking",
              "Business Reports",
            ].map(
              (feature) => (
                <li
                  key={
                    feature
                  }
                >
                  <span className="signup-feature-dot">
                    <FiCheck />
                  </span>

                  {feature}
                </li>
              )
            )}
          </ul>

          <div className="signup-left-footer">
            <strong>
              Smart Khatabook
            </strong>

            <span>
              Manage everything
              from one place.
            </span>
          </div>
        </div>

        <div
          className="signup-left-decor"
          aria-hidden="true"
        >
          <span className="signup-decor-circle signup-decor-one" />

          <span className="signup-decor-circle signup-decor-two" />
        </div>
      </aside>

      {/* =====================================
          RIGHT PANEL
      ====================================== */}

      <main className="signup-right">
        <div className="signup-card">
          {/* TOP CONTROLS */}

          <div className="signup-card-top">
            <button
              type="button"
              className="signup-back-login"
              onClick={() =>
                navigate("/")
              }
            >
              <FiArrowLeft />

              <span>
                Login
              </span>
            </button>

            <button
              type="button"
              className="signup-theme-btn"
              onClick={() =>
                setDarkMode(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              title={
                darkMode
                  ? "Light mode"
                  : "Dark mode"
              }
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <FiSun />
              ) : (
                <FiMoon />
              )}
            </button>
          </div>

          {/* MOBILE BRAND */}

          <div className="signup-mobile-brand">
            <div className="signup-mobile-brand-icon">
              <FiShoppingBag />
            </div>

            <span>
              Smart Khatabook
            </span>
          </div>

          {/* =====================================
              STEPS
          ====================================== */}

          <div className="signup-step-area">
            <div
              className={`signup-step ${
                step >= 1
                  ? "signup-step-active"
                  : ""
              }`}
            >
              <span>
                1
              </span>

              <strong>
                Account
              </strong>
            </div>

            <div
              className={`signup-step-line ${
                step >= 2
                  ? "signup-step-line-active"
                  : ""
              }`}
            />

            <div
              className={`signup-step ${
                step >= 2
                  ? "signup-step-active"
                  : ""
              }`}
            >
              <span>
                2
              </span>

              <strong>
                Details
              </strong>
            </div>
          </div>

          {/* HEADER */}

          <div className="signup-card-header">
            <span className="signup-card-label">
              STEP {step} OF 2
            </span>

            <h2>
              {step === 1
                ? "Create your account"
                : "Business & security"}
            </h2>

            <p>
              {step === 1
                ? "Start with your basic information."
                : "Almost there — complete your profile and secure your account."}
            </p>
          </div>

          {/* =====================================
              STEP 1
          ====================================== */}

          {step === 1 && (
            <div className="signup-form">
              <div className="signup-section-label">
                Account Type
              </div>

              <div className="signup-role-grid">
                {ROLES.map(
                  ({
                    value,
                    icon,
                    label,
                  }) => (
                    <button
                      key={
                        value
                      }
                      type="button"
                      className={`signup-role-btn ${
                        form.role ===
                        value
                          ? "signup-role-selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectRole(
                          value
                        )
                      }
                    >
                      <span className="signup-role-icon">
                        {icon}
                      </span>

                      <span className="signup-role-name">
                        {
                          label
                        }
                      </span>

                      {form.role ===
                        value && (
                        <span className="signup-role-check">
                          <FiCheck />
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>

              {errors.role && (
                <p className="signup-field-error">
                  {
                    errors.role
                  }
                </p>
              )}

              <div className="signup-section-label signup-section-space">
                Personal Details
              </div>

              <div className="signup-field-grid">
                <SignupField
                  icon={
                    <FiUser />
                  }
                  label="Full name"
                  name="name"
                  placeholder="Your full name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  error={
                    errors.name
                  }
                  autoComplete="name"
                />

                <SignupField
                  icon={
                    <FiPhone />
                  }
                  label="Phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit number"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  error={
                    errors.phone
                  }
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>

              <SignupField
                icon={
                  <FiMail />
                }
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                error={
                  errors.email
                }
                autoComplete="email"
              />

              <button
                type="button"
                className="signup-primary-btn"
                onClick={
                  goNext
                }
              >
                Continue

                <FiArrowRight />
              </button>
            </div>
          )}

          {/* =====================================
              STEP 2
          ====================================== */}

          {step === 2 && (
            <div className="signup-form">
              {form.role !==
                "Customer" && (
                <>
                  <div className="signup-section-label">
                    Business Details
                  </div>

                  <div className="signup-field-grid">
                    <SignupField
                      icon={
                        <FiHome />
                      }
                      label="Shop name"
                      name="shopName"
                      placeholder="Your shop name"
                      value={
                        form.shopName
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.shopName
                      }
                    />

                    <SignupSelectField
                      icon={
                        <FiBriefcase />
                      }
                      label="Business type"
                      name="businessType"
                      value={
                        form.businessType
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.businessType
                      }
                      options={
                        BUSINESS_TYPES
                      }
                    />
                  </div>
                </>
              )}

              <div
                className={`signup-section-label ${
                  form.role !==
                  "Customer"
                    ? "signup-section-space"
                    : ""
                }`}
              >
                Location
              </div>

              <SignupField
                icon={
                  <FiMapPin />
                }
                label="Address"
                name="address"
                placeholder="Shop or home address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                error={
                  errors.address
                }
                autoComplete="street-address"
              />

              <div className="signup-section-label signup-section-space">
                Security
              </div>

              <div className="signup-field-grid">
                <SignupField
                  icon={
                    <FiLock />
                  }
                  label="Password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Minimum 6 characters"
                  value={
                    form.password
                  }
                  onChange={
                    handleChange
                  }
                  error={
                    errors.password
                  }
                  autoComplete="new-password"
                  endAction={
                    <button
                      type="button"
                      className="signup-eye-btn"
                      onClick={() =>
                        setShowPassword(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>
                  }
                />

                <SignupField
                  icon={
                    <FiLock />
                  }
                  label="Confirm password"
                  name="confirm"
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat password"
                  value={
                    form.confirm
                  }
                  onChange={
                    handleChange
                  }
                  error={
                    errors.confirm
                  }
                  autoComplete="new-password"
                  endAction={
                    <button
                      type="button"
                      className="signup-eye-btn"
                      onClick={() =>
                        setShowConfirm(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                      aria-label={
                        showConfirm
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirm ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>
                  }
                />
              </div>

              <div className="signup-button-row">
                <button
                  type="button"
                  className="signup-ghost-btn"
                  onClick={() =>
                    setStep(1)
                  }
                  disabled={
                    submitting
                  }
                >
                  <FiArrowLeft />

                  Back
                </button>

                <button
                  type="button"
                  className="signup-primary-btn"
                  onClick={
                    handleSignup
                  }
                  disabled={
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <span className="signup-spinner" />

                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account

                      <FiCheck />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* LOGIN */}

          <div className="signup-login-hint">
            <span>
              Already have an
              account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
            >
              Sign in
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// =====================================================
// FIELD
// =====================================================

function SignupField({
  icon,
  label,
  error,
  endAction,
  ...props
}) {
  return (
    <div className="signup-field-wrap">
      <label className="signup-field-label">
        {label}
      </label>

      <div
        className={`signup-field-box ${
          error
            ? "signup-field-box-error"
            : ""
        }`}
      >
        <span className="signup-field-icon">
          {icon}
        </span>

        <input
          {...props}
        />

        {endAction}
      </div>

      {error && (
        <p className="signup-field-error">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// SELECT
// =====================================================

function SignupSelectField({
  icon,
  label,
  options,
  error,
  ...props
}) {
  return (
    <div className="signup-field-wrap">
      <label className="signup-field-label">
        {label}
      </label>

      <div
        className={`signup-field-box ${
          error
            ? "signup-field-box-error"
            : ""
        }`}
      >
        <span className="signup-field-icon">
          {icon}
        </span>

        <select
          {...props}
        >
          <option value="">
            Select type
          </option>

          {options.map(
            (option) => (
              <option
                key={
                  option
                }
                value={
                  option
                }
              >
                {option}
              </option>
            )
          )}
        </select>
      </div>

      {error && (
        <p className="signup-field-error">
          {error}
        </p>
      )}
    </div>
  );
}