import { useState } from "react";
import axios from "axios";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) return setError("Please enter your email");
    try {
      setLoading(true);
      setError("");
      await axios.post("http://localhost:4000/api/user/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="fp-page">
        <div className="fp-card">
          <button className="fp-back" onClick={() => navigate("/")}>
            <FiArrowLeft size={15} /> Back to Login
          </button>

          {sent ? (
            <div className="fp-success">
              <div className="fp-success-icon"><FiCheckCircle size={28} color="#22c55e" /></div>
              <h2>Check your email</h2>
              <p>We sent a password reset link to <strong>{email}</strong>. It expires in 15 minutes.</p>
            </div>
          ) : (
            <>
              <div className="fp-icon-wrap">
                <FiMail size={24} color="#6366f1" />
              </div>
              <h2 className="fp-title">Forgot Password?</h2>
              <p className="fp-subtitle">Enter your registered email and we'll send you a reset link.</p>

              {error && <div className="fp-error">{error}</div>}

              <label className="fp-label">Email Address</label>
              <input
                className="fp-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />

              <button className="fp-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .fp-page {
    min-height: 100vh;
    background: #eef2f7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    padding: 20px;
  }
  .fp-card {
    background: #fff;
    border-radius: 20px;
    padding: 36px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    border: 1.5px solid #f1f5f9;
  }
  .fp-back {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 28px;
    font-family: 'Outfit', sans-serif;
    transition: color 0.15s;
  }
  .fp-back:hover { color: #0f172a; }
  .fp-icon-wrap {
    width: 54px; height: 54px;
    border-radius: 16px;
    background: #6366f118;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .fp-title {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
    letter-spacing: -0.4px;
  }
  .fp-subtitle {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 24px;
    font-weight: 400;
  }
  .fp-error {
    background: #fef2f2;
    color: #ef4444;
    border: 1px solid #fee2e2;
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  .fp-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .fp-input {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    outline: none;
    transition: border 0.15s;
    margin-bottom: 20px;
  }
  .fp-input:focus { border-color: #6366f1; }
  .fp-btn {
    width: 100%;
    padding: 14px;
    background: #6366f1;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    transition: all 0.15s;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  }
  .fp-btn:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
  }
  .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .fp-success { text-align: center; padding: 10px 0; }
  .fp-success-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: #22c55e18;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }
  .fp-success h2 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 10px;
  }
  .fp-success p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.7;
  }
`;