import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiLock } from "react-icons/fi";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!mobile || !password) {
      alert("Please enter mobile number and password");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      {/* Top Section */}
      <div className="top-section">
        <img src="/icons.svg" alt="logo" className="logo" />
        <h1>SMART KHATABOOK</h1>
        <p>Track. Manage. Profit.</p>
      </div>

      {/* Card */}
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="sub-text">Login to continue to your account</p>

        <div className="input-box">
          <FiPhone className="icon" />
          <input
            type="text"
            placeholder="Mobile Number"
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div className="input-box">
          <FiLock className="icon" />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button onClick={handleLogin}>Login</button>

        <p className="signup">
          Don’t have an account?
          <span onClick={() => navigate("/signup")}> Sign up</span>
        </p>
      </div>
    </div>
  );
}
