import { useState } from "react";

import axios from "axios";

import { FiLock, FiCheckCircle } from "react-icons/fi";

import { useNavigate, useParams } from "react-router-dom";

import "./ResetPassword.css";

export default function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [done, setDone] = useState(false);

  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill all fields");

      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");

      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    try {
      setLoading(true);

      setError("");

      await axios.post(
        `http://https://backend-of-smartkhata-book.onrender.com/api/user/reset-password/${token}`,
        {
          password,
        },
      );

      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        {done ? (
          <div className="success-box">
            <FiCheckCircle size={60} color="#16a34a" />

            <h2>Password Reset Successful</h2>

            <p>Your password has been updated.</p>

            <button onClick={() => navigate("/")}>Back to Login</button>
          </div>
        ) : (
          <>
            <div className="icon-box">
              <FiLock size={30} />
            </div>

            <h2>Reset Password</h2>

            <p className="sub-text">Enter your new password</p>

            {error && <p className="error-text">{error}</p>}

            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button onClick={handleReset}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
