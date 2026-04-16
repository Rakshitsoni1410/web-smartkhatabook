import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiMapPin,
  FiBriefcase,
  FiHome,
} from "react-icons/fi";
import axios from "axios";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

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

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name) newErrors.name = "Name required";
    if (!form.phone) newErrors.phone = "Phone required";
    if (!form.email) newErrors.email = "Email required";
    if (!form.role) newErrors.role = "Select role";
    if (!form.address) newErrors.address = "Address required";
    if (!form.password)
      newErrors.password = "Password required";

    if (form.role !== "Customer") {
      if (!form.shopName)
        newErrors.shopName =
          "Shop name required";

      if (!form.businessType)
        newErrors.businessType =
          "Business type required";
    }

    if (form.password !== form.confirm) {
      newErrors.confirm =
        "Passwords do not match";
    }

    return newErrors;
  };

  const handleSignup = async () => {
    const validationErrors = validate();

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/user/register",
        {
          name: form.name,
          phone: form.phone,
          email: form.email,
          role: form.role,
          shopName: form.shopName,
          businessType:
            form.businessType,
          address: form.address,
          password: form.password,
        }
      );

      alert(
        "Account created successfully!"
      );

      navigate("/");

    } catch (err) {
      setErrors({
        phone:
          err.response?.data?.message ||
          "Signup failed",
      });
    }
  };

  return (
    <div className="signup-container">

      {/* LEFT SIDE */}
      <div className="left-panel">
        <div className="left-content">
          <img
            src="/icons.svg"
            alt="logo"
          />

          <h1>Smart Khatabook</h1>

          <p>
            Smart business accounting
            platform for billing,
            customers, inventory and
            reports.
          </p>

          <ul>
            <li>✔ Billing System</li>
            <li>✔ Customer Ledger</li>
            <li>✔ Stock Tracking</li>
            <li>✔ Reports</li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">
        <div className="signup-card">

          <h2>Create Account</h2>

          <p className="sub-title">
            Register your business
            account
          </p>

          {/* HORIZONTAL GRID */}
          <div className="grid-2">

            <Input
              icon={<FiUser />}
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              icon={<FiPhone />}
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            <Input
              icon={<FiMail />}
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <SelectBox
              icon={<FiBriefcase />}
              name="role"
              value={form.role}
              onChange={handleChange}
              options={[
                "Customer",
                "Retailer",
                "Wholesaler",
              ]}
              error={errors.role}
            />

            <Input
              icon={<FiHome />}
              name="shopName"
              placeholder="Shop Name"
              value={form.shopName}
              onChange={handleChange}
              error={errors.shopName}
            />

            <SelectBox
              icon={<FiHome />}
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              options={[
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
              ]}
              error={
                errors.businessType
              }
            />

            <Input
              icon={<FiMapPin />}
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
            />

            <Input
              icon={<FiLock />}
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Input
              icon={<FiLock />}
              type="password"
              name="confirm"
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
            />

          </div>

          <button
            onClick={handleSignup}
          >
            Create Account
          </button>

          <p
            className="login-link"
            onClick={() =>
              navigate("/")
            }
          >
            Already have an account?
            Login
          </p>

        </div>
      </div>

    </div>
  );
}

function Input({
  icon,
  error,
  ...props
}) {
  return (
    <div className="field-wrap">
      <div
        className={`input-box ${
          error
            ? "error"
            : ""
        }`}
      >
        <span className="icon">
          {icon}
        </span>

        <input {...props} />
      </div>

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectBox({
  icon,
  options,
  error,
  ...props
}) {
  return (
    <div className="field-wrap">
      <div
        className={`input-box select-box ${
          error
            ? "error"
            : ""
        }`}
      >
        <span className="icon">
          {icon}
        </span>

        <select {...props}>
          <option value="">
            Select
          </option>

          {options.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>
      </div>

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}