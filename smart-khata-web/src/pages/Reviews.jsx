import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiArrowLeft,
  FiStar,
  FiMessageSquare,
  FiThumbsUp,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Reviews() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [reviews, setReviews] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);

  const [reply, setReply] = useState({});

  const [form, setForm] = useState({
    targetUserId: "",
    comment: "",
    rating: 5,
  });

  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchReviews();

    if (user.role === "Retailer") {
      fetchWholesalers();
    }
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/reviews/${user._id}`,
      );

      setReviews(res.data.reviews || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchWholesalers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/user/wholesalers/${user.businessType}`,
      );

      setWholesalers(res.data.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const submitReview = async () => {
    try {
      await axios.post("http://localhost:4000/api/reviews/add", {
        targetUserId: form.targetUserId,
        comment: form.comment,
        rating: form.rating,
        author: user.name,
        role: user.role,
        businessType: user.businessType,
        shopName: user.shopName,
      });

      setToast("Review submitted");

      setForm({
        targetUserId: "",
        comment: "",
        rating: 5,
      });

      fetchReviews();

      setTimeout(() => {
        setToast("");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const sendReply = async (id) => {
    try {
      await axios.post(`http://localhost:4000/api/reviews/reply/${id}`, {
        text: reply[id],
        role: user.role,
        businessType: user.businessType,
      });

      fetchReviews();

      setToast("Reply sent");

      setTimeout(() => {
        setToast("");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const avg =
    reviews.length > 0
      ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const positive = reviews.filter((r) => r.rating >= 4).length;

  return (
    <div className="dashboard-main">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#16a34a",
            color: "white",
            padding: "12px 18px",
            borderRadius: "12px",
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}

      {/* Top */}
      <div className="topbar">
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <FiArrowLeft />
          </button>

          <h2>Reviews</h2>
        </div>
      </div>

      {/* Premium Summary */}
      <div
        style={{
          background:
"linear-gradient(135deg,#1d4ed8,#3b82f6)",
          padding: "30px",
          borderRadius: "26px",
          color: "white",
          marginBottom: "25px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <h2>{user.shopName || user.name}</h2>

        <p style={{ opacity: 0.8 }}>{user.businessType} reviews</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
            marginTop: "22px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "24px",
              borderRadius: "22px",
            }}
          >
            <h2 style={{ color: "#fbbf24" }}>{avg}</h2>
            <p>Rating</p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "24px",
              borderRadius: "22px",
            }}
          >
            <h2>{reviews.length}</h2>
            <p>Reviews</p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "24px",
              borderRadius: "22px",
            }}
          >
            <h2 style={{ color: "#22c55e" }}>{positive}</h2>
            <p>Positive</p>
          </div>
        </div>
      </div>

      {/* Retailer Form */}
      {user.role === "Retailer" && (
        <div
          className="focus-card"
          style={{
            marginBottom: "25px",
          }}
        >
          <h3>Add Review</h3>

          <select
            value={form.targetUserId}
            onChange={(e) =>
              setForm({
                ...form,
                targetUserId: e.target.value,
              })
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              marginTop: "14px",
              border: "1px solid #ddd",
            }}
          >
            <option value="">Select Wholesaler</option>

            {wholesalers.map((w) => (
              <option key={w._id} value={w._id}>
                {w.shopName}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Write review..."
            value={form.comment}
            onChange={(e) =>
              setForm({
                ...form,
                comment: e.target.value,
              })
            }
            style={{
              width: "100%",
              minHeight: "130px",
              padding: "14px",
              borderRadius: "14px",
              marginTop: "14px",
              border: "1px solid #ddd",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <FiStar
                key={num}
                size={28}
                style={{
                  cursor: "pointer",
                  color: num <= form.rating ? "#f59e0b" : "#cbd5e1",
                }}
                onClick={() =>
                  setForm({
                    ...form,
                    rating: num,
                  })
                }
              />
            ))}
          </div>

          <button
            className="save-btn"
            style={{
              width: "100%",
              marginTop: "18px",
            }}
            onClick={submitReview}
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <h3
        style={{
          marginBottom: "15px",
        }}
      >
        Recent Reviews
      </h3>

      {reviews.length === 0 ? (
        <div className="focus-card">
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="stats-grid">
          {reviews.map((item) => (
            <div key={item._id} className="stat-card">
              <h3>{item.author}</h3>

              <p
                style={{
                  marginTop: "8px",
                }}
              >
                {item.comment}
              </p>

              <p
                style={{
                  color: "#f59e0b",
                  marginTop: "12px",
                }}
              >
                {"★".repeat(item.rating)}
              </p>

              {item.reply?.text ? (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px",
                    borderRadius: "14px",
                    background: "#eff6ff",
                  }}
                >
                  <b>Reply:</b> {item.reply.text}
                </div>
              ) : user.role === "Wholesaler" ? (
                <>
                  <input
                    placeholder="Write reply..."
                    value={reply[item._id] || ""}
                    onChange={(e) =>
                      setReply({
                        ...reply,
                        [item._id]: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      marginTop: "14px",
                      border: "1px solid #ddd",
                    }}
                  />

                  <button
                    className="save-btn"
                    style={{
                      width: "100%",
                      marginTop: "12px",
                    }}
                    onClick={() => sendReply(item._id)}
                  >
                    Reply
                  </button>
                </>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
