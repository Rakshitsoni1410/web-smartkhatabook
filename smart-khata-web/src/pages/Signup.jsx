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

  // 🔁 handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ✅ validation
  const validate = () => {
    let newErrors = {};

    if (!form.name) newErrors.name = "Name required";
    if (!form.phone) newErrors.phone = "Phone required";
    if (!form.email) newErrors.email = "Email required";
    if (!form.role) newErrors.role = "Select role";
    if (!form.address) newErrors.address = "Address required";
    if (!form.password) newErrors.password = "Password required";

    if (form.role !== "Customer") {
      if (!form.shopName) newErrors.shopName = "Shop name required";
      if (!form.businessType) newErrors.businessType = "Business type required";
    }

    if (form.password !== form.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    return newErrors;
  };

  // 🔥 SIGNUP API
  const handleSignup = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/api/user/register", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        role: form.role,
        shopName: form.shopName,
        businessType: form.businessType,
        address: form.address,
        password: form.password,
      });

      alert("Account created successfully!");

      navigate("/");
    } catch (err) {
      setErrors({
        phone: err.response?.data?.message || "Signup failed",
      });
    }
  };

  return (
    <div className="signup-container">
      <div className="top-section">
        <img src="/icons.svg" className="logo" alt="logo" />
        <h2>Create Account</h2>
        <p>Register and manage your business easily</p>
      </div>

      <div className="signup-card">
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

        {/* ROLE */}
        <SelectBox
          icon={<FiBriefcase />}
          name="role"
          value={form.role}
          onChange={handleChange}
          options={["Customer", "Retailer", "Wholesaler"]}
          error={errors.role}
        />

        {/* SHOP */}
        {form.role !== "Customer" && (
          <Input
            icon={<FiHome />}
            name="shopName"
            placeholder="Shop Name"
            value={form.shopName}
            onChange={handleChange}
            error={errors.shopName}
          />
        )}

        {/* BUSINESS TYPE */}
        {form.role !== "Customer" && (
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
            error={errors.businessType}
          />
        )}

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
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          icon={<FiLock />}
          name="confirm"
          type="password"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handleChange}
          error={errors.confirm}
        />

        <button onClick={handleSignup}>Create Account</button>

        <p className="login-link" onClick={() => navigate("/")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

/* Input */
function Input({ icon, error, ...props }) {
  return (
    <>
      <div className={`input-box ${error ? "error" : ""}`}>
        <span className="icon">{icon}</span>
        <input {...props} />
      </div>
      {error && <p className="error-text">{error}</p>}
    </>
  );
}

/* Select */
function SelectBox({ icon, options, error, ...props }) {
  return (
    <>
      <div className={`input-box select-box ${error ? "error" : ""}`}>
        <span className="icon">{icon}</span>
        <select {...props}>
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      {error && <p className="error-text">{error}</p>}
    </>
  );
}
