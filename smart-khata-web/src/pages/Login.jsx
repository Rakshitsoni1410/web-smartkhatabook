import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiLock } from "react-icons/fi";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.password) newErrors.password = "Password is required";

    return newErrors;
  };

  const handleLogin = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/api/user/login",
        {
          phone: form.phone,
          password: form.password,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard");

    } catch (err) {
      setErrors({
        password: err.response?.data?.message || "Login failed",
      });
    }
  };

  return (
    <div className="login-container">

      <div className="top-section">
        <img src="/logos.svg" alt="logo" className="logo" />
        <h1>SMART KHATABOOK</h1>
        <p>Track. Manage. Profit.</p>
      </div>

      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="sub-text">
          Login to continue to your account
        </p>

        <div className={`input-box ${errors.phone ? "error" : ""}`}>
          <FiPhone className="icon" />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        {errors.phone && (
          <p className="error-text">{errors.phone}</p>
        )}

        <div className={`input-box ${errors.password ? "error" : ""}`}>
          <FiLock className="icon" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {errors.password && (
          <p className="error-text">{errors.password}</p>
        )}

        <button onClick={handleLogin}>Login</button>

        <p className="signup">
          Don’t have an account?
          <span onClick={() => navigate("/signup")}>
            {" "}Sign up
          </span>
        </p>
      </div>
    </div>
  );
}