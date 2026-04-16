import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiMapPin,
  FiBriefcase,
  FiHome
} from "react-icons/fi";

import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    role: "Retailer",
    shop: "",
    type: "",
    address: "",
    password: "",
    confirm: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = () => {
    if (!form.name || !form.mobile || !form.password) {
      alert("Fill required fields");
      return;
    }

    alert("Account Created!");
    navigate("/");
  };

  return (
    <div className="signup-container">

      {/* Top */}
      <div className="top-section">
        <img src="/icons.svg" className="logo" />
        <h2>Create Account</h2>
        <p>Register and manage your business easily</p>
      </div>

      {/* Card */}
      <div className="signup-card">

        <Input icon={<FiUser />} name="name" placeholder="Full Name" onChange={handleChange} />
        <Input icon={<FiPhone />} name="mobile" placeholder="Mobile Number" onChange={handleChange} />
        <Input icon={<FiMail />} name="email" placeholder="Email Address" onChange={handleChange} />

        <select name="role" onChange={handleChange}>
          <option>Retailer</option>
          <option>Wholesaler</option>
        </select>

        <Input icon={<FiHome />} name="shop" placeholder="Shop / Business Name" onChange={handleChange} />

        <select name="type" onChange={handleChange}>
          <option>Business Type</option>
          <option>Grocery</option>
          <option>Clothing</option>
        </select>

        <Input icon={<FiMapPin />} name="address" placeholder="Address" onChange={handleChange} />

        <Input icon={<FiLock />} name="password" type="password" placeholder="Password" onChange={handleChange} />
        <Input icon={<FiLock />} name="confirm" type="password" placeholder="Confirm Password" onChange={handleChange} />

        <button onClick={handleSignup}>Create Account</button>

        <p className="login-link" onClick={() => navigate("/")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

/* Reusable Input */
function Input({ icon, ...props }) {
  return (
    <div className="input-box">
      <span className="icon">{icon}</span>
      <input {...props} />
    </div>
  );
}