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

/* TOAST */
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

/* TOAST HOOK */
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3500) => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
}

/* MAIN COMPONENT */
export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [serverReady, setServerReady] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // WAKE FREE SERVER
  useEffect(() => {
    axios
      .get("https://backend-of-smartkhata-book.onrender.com/ping")
      .catch(() => {})
      .finally(() => {
        setServerReady(true);
      });
  }, []);

  // FORM STATE
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

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // ROLE SELECT
  const selectRole = (role) => {
    setForm({
      ...form,
      role,
    });

    setErrors({
      ...errors,
      role: "",
    });
  };

  // STEP 1 VALIDATION
  const validateStep1 = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Name required";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      e.phone = "Enter valid phone";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Invalid email";
    }

    if (!form.role) {
      e.role = "Select role";
    }

    return e;
  };

  // STEP 2 VALIDATION
  const validateStep2 = () => {
    const e = {};

    if (form.role !== "Customer") {
      if (!form.shopName.trim()) {
        e.shopName = "Shop name required";
      }

      if (!form.businessType) {
        e.businessType = "Business type required";
      }
    }

    if (!form.address.trim()) {
      e.address = "Address required";
    }

    if (form.password.length < 6) {
      e.password = "Password minimum 6 characters";
    }

    if (form.password !== form.confirm) {
      e.confirm = "Passwords do not match";
    }

    return e;
  };

  // NEXT STEP
  const goNext = () => {
    const errs = validateStep1();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);

      addToast("Please fix form errors", "error");

      return;
    }

    setStep(2);
  };

  // SIGNUP
  const handleSignup = async () => {
    const errs = validateStep2();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);

      addToast("Please fix form errors", "error");

      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
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

      addToast(data.message || "Account created successfully!", "success");

      // RESET FORM
      setForm({
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

      // REDIRECT
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.log(err);

      const msg = err.response?.data?.message || "Signup failed";

      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* YOUR EXISTING UI */}

      <button
        className="btn-primary"
        onClick={handleSignup}
        disabled={loading || !serverReady}
      >
        {loading ? (
          <span className="spinner" />
        ) : (
          <>
            Create account
            <FiCheck size={15} />
          </>
        )}
      </button>
    </div>
  );
}
