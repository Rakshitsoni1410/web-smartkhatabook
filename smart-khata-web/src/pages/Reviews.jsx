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

  // NEW: star rating filter -> 0 means "All"
  const [starFilter, setStarFilter] = useState(0);

  // NEW: month filter -> "All" or "YYYY-MM"
  const [monthFilter, setMonthFilter] = useState("All");

  useEffect(() => {
    fetchReviews();

    if (user.role === "Retailer") {
      fetchSuggestions();
    }
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `https://backend-of-smartkhata-book-vkcv.vercel.app/api/reviews/${user._id}`,
      );

      setReviews(res.data.reviews || []);
    } catch (error) {
      console.log(error);
    }
  };

const fetchSuggestions = async () => {

  try {

    const res = await axios.get(
      `https://backend-of-smartkhata-book-vkcv.vercel.app/api/reviews/suggestions/${user._id}`
    );

    setWholesalers(
      res.data.users || []
    );

  } catch (error) {

    console.log(error);

  }
};
  const submitReview = async () => {
    try {
      await axios.post("https://backend-of-smartkhata-book-vkcv.vercel.app/api/reviews/add", {
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
      await axios.post(`https://backend-of-smartkhata-book-vkcv.vercel.app/api/reviews/reply/${id}`, {
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

  // =========================
  // MONTH OPTIONS (built from actual review dates)
  // =========================
  const monthOptions = Array.from(
    new Set(
      reviews
        .filter((r) => r.createdAt)
        .map((r) => {
          const d = new Date(r.createdAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        }),
    ),
  ).sort((a, b) => (a < b ? 1 : -1)); // newest first

  const monthLabel = (ym) => {
    const [y, m] = ym.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  // =========================
  // FILTERED REVIEWS
  // =========================
  const filteredReviews = reviews.filter((item) => {
    const matchStar = starFilter === 0 || item.rating === starFilter;

    let matchMonth = true;
    if (monthFilter !== "All") {
      if (!item.createdAt) {
        matchMonth = false;
      } else {
        const d = new Date(item.createdAt);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        matchMonth = ym === monthFilter;
      }
    }

    return matchStar && matchMonth;
  });

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

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0 }}>Recent Reviews</h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* STAR FILTER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#fff",
              padding: "6px 10px",
              borderRadius: "999px",
              border: "1px solid #e2e8f0",
            }}
          >
            {[0, 5, 4, 3, 2, 1].map((num) => (
              <button
                key={num}
                onClick={() => setStarFilter(num)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: starFilter === num ? "#f59e0b" : "transparent",
                  color: starFilter === num ? "#fff" : "#475569",
                }}
              >
                {num === 0 ? (
                  "All"
                ) : (
                  <>
                    {num} <FiStar size={12} />
                  </>
                )}
              </button>
            ))}
          </div>

          {/* MONTH FILTER */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              border: "1px solid #e2e8f0",
              fontWeight: 600,
              fontSize: "13px",
              color: "#334155",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="All">All Months</option>
            {monthOptions.map((ym) => (
              <option key={ym} value={ym}>
                {monthLabel(ym)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="focus-card">
          <p>No reviews found</p>
        </div>
      ) : (
        <div className="stats-grid">
          {filteredReviews.map((item) => (
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

              {item.createdAt && (
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    marginTop: "6px",
                  }}
                >
                  {new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}

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