import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiFilter,
  FiMessageSquare,
  FiMoon,
  FiRefreshCw,
  FiSend,
  FiStar,
  FiSun,
  FiThumbsUp,
  FiUsers,
  FiX,
} from "react-icons/fi";

import api from "../api";

import { getStoredUser } from "../utils/session";

import "./Reviews.css";

// =====================================================
// HELPERS
// =====================================================

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// REVIEWS
// =====================================================

export default function Reviews() {
  const navigate = useNavigate();

  const user = getStoredUser() || {};

  const normalizedRole = String(user?.role || "")
    .trim()
    .toLowerCase();

  const isRetailer = normalizedRole === "retailer";

  const isWholesaler = normalizedRole === "wholesaler";

  // =====================================================
  // DATA
  // =====================================================

  const [reviews, setReviews] = useState([]);

  const [wholesalers, setWholesalers] = useState([]);

  const [reply, setReply] = useState({});

  const [form, setForm] = useState({
    targetUserId: "",
    comment: "",
    rating: 5,
  });

  // =====================================================
  // FILTERS
  // =====================================================

  const [starFilter, setStarFilter] = useState(0);

  const [monthFilter, setMonthFilter] = useState("All");

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [replyingId, setReplyingId] = useState("");

  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("smartkhata-theme");

      if (saved === "dark") {
        return true;
      }

      if (saved === "light") {
        return false;
      }

      return (
        window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("smartkhata-theme", darkMode ? "dark" : "light");
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  // =====================================================
  // TOAST TIMER
  // =====================================================

  useEffect(() => {
    if (!toast.message) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        message: "",
        type: "success",
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  // =====================================================
  // FETCH REVIEWS
  // =====================================================

  const fetchReviews = useCallback(
    async (manual = false) => {
      if (!user?._id) {
        setError("User information not found. Please login again.");

        setLoading(false);

        return;
      }

      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const res = await api.get(`/api/reviews/${user._id}`);

        setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
      } catch (err) {
        console.error("FETCH REVIEWS ERROR:", err);

        setError(err?.response?.data?.message || "Unable to load reviews.");
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [user?._id],
  );

  // =====================================================
  // FETCH REVIEW SUGGESTIONS
  // =====================================================

  const fetchSuggestions = useCallback(async () => {
    if (!user?._id || !isRetailer) {
      return;
    }

    try {
      const res = await api.get(`/api/reviews/suggestions/${user._id}`);

      setWholesalers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (err) {
      console.error("FETCH REVIEW SUGGESTIONS ERROR:", err);
    }
  }, [user?._id, isRetailer]);

  useEffect(() => {
    fetchReviews();

    fetchSuggestions();
  }, [fetchReviews, fetchSuggestions]);

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const submitReview = async () => {
    const comment = form.comment.trim();

    if (!form.targetUserId) {
      showToast("Please select a wholesaler.", "error");

      return;
    }

    if (!comment) {
      showToast("Please write a review.", "error");

      return;
    }

    if (form.rating < 1 || form.rating > 5) {
      showToast("Please select a valid rating.", "error");

      return;
    }

    try {
      setSubmitting(true);

      await api.post("/api/reviews/add", {
        targetUserId: form.targetUserId,

        comment,

        rating: form.rating,

        author: user?.name,

        role: user?.role,

        businessType: user?.businessType,

        shopName: user?.shopName,
      });

      setForm({
        targetUserId: "",
        comment: "",
        rating: 5,
      });

      showToast("Review submitted successfully.");

      await fetchReviews(true);
    } catch (err) {
      console.error("SUBMIT REVIEW ERROR:", err);

      showToast(
        err?.response?.data?.message || "Unable to submit review.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // SEND REPLY
  // =====================================================

  const sendReply = async (id) => {
    const text = String(reply[id] || "").trim();

    if (!text) {
      showToast("Please write a reply.", "error");

      return;
    }

    try {
      setReplyingId(id);

      await api.post(`/api/reviews/reply/${id}`, {
        text,

        role: user?.role,

        businessType: user?.businessType,
      });

      setReply((previous) => ({
        ...previous,

        [id]: "",
      }));

      showToast("Reply sent successfully.");

      await fetchReviews(true);
    } catch (err) {
      console.error("SEND REPLY ERROR:", err);

      showToast(
        err?.response?.data?.message || "Unable to send reply.",
        "error",
      );
    } finally {
      setReplyingId("");
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return "0.0";
    }

    const total = reviews.reduce(
      (sum, review) => sum + Number(review?.rating || 0),
      0,
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const positiveReviews = useMemo(() => {
    return reviews.filter((review) => Number(review?.rating || 0) >= 4).length;
  }, [reviews]);

  const positivePercentage =
    reviews.length > 0
      ? Math.round((positiveReviews / reviews.length) * 100)
      : 0;

  // =====================================================
  // MONTH OPTIONS
  // =====================================================

  const monthOptions = useMemo(() => {
    return Array.from(
      new Set(
        reviews
          .filter((review) => review.createdAt)
          .map((review) => {
            const date = new Date(review.createdAt);

            if (Number.isNaN(date.getTime())) {
              return null;
            }

            return `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}`;
          })
          .filter(Boolean),
      ),
    ).sort((a, b) => (a < b ? 1 : -1));
  }, [reviews]);

  const monthLabel = (yearMonth) => {
    const [year, month] = yearMonth.split("-");

    const date = new Date(Number(year), Number(month) - 1, 1);

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  // =====================================================
  // FILTERED REVIEWS
  // =====================================================

  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const rating = Number(item?.rating || 0);

      const matchStar = starFilter === 0 || rating === starFilter;

      let matchMonth = true;

      if (monthFilter !== "All") {
        if (!item.createdAt) {
          matchMonth = false;
        } else {
          const date = new Date(item.createdAt);

          if (Number.isNaN(date.getTime())) {
            matchMonth = false;
          } else {
            const yearMonth = `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}`;

            matchMonth = yearMonth === monthFilter;
          }
        }
      }

      return matchStar && matchMonth;
    });
  }, [reviews, starFilter, monthFilter]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={`reviews-page ${darkMode ? "reviews-dark" : ""}`}>
      {/* =====================================
          TOAST
      ====================================== */}

      {toast.message && (
        <div
          className={`reviews-toast ${
            toast.type === "error"
              ? "reviews-toast-error"
              : "reviews-toast-success"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "error" ? <FiX /> : <FiCheckCircle />}

          <span>{toast.message}</span>
        </div>
      )}

      {/* =====================================
          TOP BAR
      ====================================== */}

      <header className="reviews-topbar">
        <div className="reviews-topbar-left">
          <button
            type="button"
            className="reviews-icon-btn"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1>Reviews</h1>

            <p>Manage ratings, feedback and replies</p>
          </div>
        </div>

        <div className="reviews-topbar-actions">
          <button
            type="button"
            className="reviews-icon-btn"
            onClick={() => fetchReviews(true)}
            disabled={refreshing}
            aria-label="Refresh reviews"
            title="Refresh reviews"
          >
            <FiRefreshCw className={refreshing ? "reviews-spin" : ""} />
          </button>

          <button
            type="button"
            className="reviews-icon-btn"
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </header>

      {/* =====================================
          HERO / SUMMARY
      ====================================== */}

      <section className="reviews-hero">
        <div className="reviews-hero-glow reviews-glow-one" />

        <div className="reviews-hero-glow reviews-glow-two" />

        <div className="reviews-hero-heading">
          <div>
            <span className="reviews-hero-label">CUSTOMER FEEDBACK</span>

            <h2>{user?.shopName || user?.name || "My Business"}</h2>

            <p>
              {user?.businessType
                ? `${user.businessType} reviews and ratings`
                : "Reviews and ratings overview"}
            </p>
          </div>

          <div className="reviews-hero-star">
            <FiStar />

            <span>{averageRating}</span>
          </div>
        </div>

        <div className="reviews-summary-grid">
          <div className="reviews-summary-card reviews-rating-card">
            <div className="reviews-summary-icon">
              <FiStar />
            </div>

            <div>
              <strong>{averageRating}</strong>

              <span>Average Rating</span>
            </div>
          </div>

          <div className="reviews-summary-card">
            <div className="reviews-summary-icon">
              <FiMessageSquare />
            </div>

            <div>
              <strong>{reviews.length}</strong>

              <span>Total Reviews</span>
            </div>
          </div>

          <div className="reviews-summary-card reviews-positive-card">
            <div className="reviews-summary-icon">
              <FiThumbsUp />
            </div>

            <div>
              <strong>{positiveReviews}</strong>

              <span>Positive</span>
            </div>
          </div>

          <div className="reviews-summary-card reviews-rate-card">
            <div className="reviews-summary-icon">
              <FiUsers />
            </div>

            <div>
              <strong>{positivePercentage}%</strong>

              <span>Positive Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          ADD REVIEW - RETAILER
      ====================================== */}

      {isRetailer && (
        <section className="reviews-section reviews-form-card">
          <div className="reviews-section-header">
            <div>
              <span className="reviews-section-label">SHARE FEEDBACK</span>

              <h2>Add Review</h2>

              <p>Rate a wholesaler you've worked with.</p>
            </div>

            <div className="reviews-section-icon reviews-review-icon">
              <FiStar />
            </div>
          </div>

          <div className="reviews-form-grid">
            <label className="reviews-field reviews-field-full">
              <span>Wholesaler</span>

              <select
                value={form.targetUserId}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,

                    targetUserId: event.target.value,
                  }))
                }
              >
                <option value="">Select Wholesaler</option>

                {wholesalers.map((wholesaler) => (
                  <option key={wholesaler._id} value={wholesaler._id}>
                    {wholesaler.shopName || wholesaler.name || "Wholesaler"}
                  </option>
                ))}
              </select>
            </label>

            <label className="reviews-field reviews-field-full">
              <span>Your Review</span>

              <textarea
                placeholder="Write your experience..."
                maxLength={500}
                value={form.comment}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,

                    comment: event.target.value,
                  }))
                }
              />

              <small>
                {form.comment.length}
                /500
              </small>
            </label>

            <div className="reviews-rating-field">
              <span>Your Rating</span>

              <div className="reviews-rating-picker">
                {[1, 2, 3, 4, 5].map((number) => (
                  <button
                    type="button"
                    key={number}
                    className={`reviews-rating-star ${
                      number <= form.rating ? "reviews-rating-star-active" : ""
                    }`}
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,

                        rating: number,
                      }))
                    }
                    aria-label={`${number} star rating`}
                  >
                    <FiStar />
                  </button>
                ))}

                <strong>{form.rating}/5</strong>
              </div>
            </div>

            <button
              type="button"
              className="reviews-submit-btn"
              onClick={submitReview}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="reviews-btn-spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* =====================================
          REVIEWS TOOLBAR
      ====================================== */}

      <section className="reviews-toolbar">
        <div className="reviews-list-heading">
          <div>
            <span className="reviews-section-label">FEEDBACK</span>

            <h2>Recent Reviews</h2>
          </div>

          <span className="reviews-result-count">
            {filteredReviews.length} result
            {filteredReviews.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="reviews-filter-area">
          <div className="reviews-filter-label">
            <FiFilter />
            Filters
          </div>

          <div className="reviews-star-filters">
            {[0, 5, 4, 3, 2, 1].map((number) => (
              <button
                type="button"
                key={number}
                className={`reviews-filter-btn ${
                  starFilter === number ? "reviews-filter-btn-active" : ""
                }`}
                onClick={() => setStarFilter(number)}
              >
                {number === 0 ? (
                  "All"
                ) : (
                  <>
                    {number}

                    <FiStar />
                  </>
                )}
              </button>
            ))}
          </div>

          <select
            className="reviews-month-select"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
          >
            <option value="All">All Months</option>

            {monthOptions.map((yearMonth) => (
              <option key={yearMonth} value={yearMonth}>
                {monthLabel(yearMonth)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* =====================================
          LOADING
      ====================================== */}

      {loading && (
        <div className="reviews-state-card">
          <div className="reviews-loader" />

          <h3>Loading reviews</h3>

          <p>Gathering your latest customer feedback...</p>
        </div>
      )}

      {/* =====================================
          ERROR
      ====================================== */}

      {!loading && error && (
        <div className="reviews-state-card reviews-error-card">
          <FiMessageSquare size={32} />

          <h3>Unable to load reviews</h3>

          <p>{error}</p>

          <button type="button" onClick={() => fetchReviews(true)}>
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      )}

      {/* =====================================
          EMPTY
      ====================================== */}

      {!loading && !error && filteredReviews.length === 0 && (
        <div className="reviews-state-card">
          <div className="reviews-empty-icon">
            <FiMessageSquare />
          </div>

          <h3>No reviews found</h3>

          <p>
            {reviews.length === 0
              ? "Reviews will appear here once customers start leaving feedback."
              : "No reviews match the selected filters."}
          </p>

          {reviews.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setStarFilter(0);

                setMonthFilter("All");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* =====================================
          REVIEWS GRID
      ====================================== */}

      {!loading && !error && filteredReviews.length > 0 && (
        <section className="reviews-grid">
          {filteredReviews.map((item) => {
            const rating = Math.min(Math.max(Number(item?.rating || 0), 0), 5);

            const initial = String(item?.author || "U")
              .trim()
              .charAt(0)
              .toUpperCase();

            return (
              <article key={item._id} className="review-card">
                {/* CARD HEADER */}

                <div className="review-card-top">
                  <div className="review-author">
                    <div className="review-avatar">{initial}</div>

                    <div>
                      <h3>{item.author || "Anonymous"}</h3>

                      <span>
                        {item.shopName ||
                          item.businessType ||
                          item.role ||
                          "Customer"}
                      </span>
                    </div>
                  </div>

                  <div className="review-rating-badge">
                    <FiStar />

                    <strong>{rating}</strong>
                  </div>
                </div>

                {/* STARS */}

                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <FiStar
                      key={number}
                      className={number <= rating ? "review-star-active" : ""}
                    />
                  ))}
                </div>

                {/* COMMENT */}

                <p className="review-comment">
                  {item.comment || "No comment provided."}
                </p>

                {/* DATE */}

                <div className="review-date">{formatDate(item.createdAt)}</div>

                {/* EXISTING REPLY */}

                {item.reply?.text && (
                  <div className="review-reply-box">
                    <div className="review-reply-title">
                      <FiMessageSquare />
                      Business Reply
                    </div>

                    <p>{item.reply.text}</p>
                  </div>
                )}

                {/* WHOLESALER REPLY */}

                {!item.reply?.text && isWholesaler && (
                  <div className="review-reply-form">
                    <input
                      type="text"
                      maxLength={300}
                      placeholder="Write a reply..."
                      value={reply[item._id] || ""}
                      onChange={(event) =>
                        setReply((previous) => ({
                          ...previous,

                          [item._id]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          sendReply(item._id);
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => sendReply(item._id)}
                      disabled={replyingId === item._id}
                    >
                      {replyingId === item._id ? (
                        <span className="reviews-btn-spinner" />
                      ) : (
                        <FiSend />
                      )}

                      <span>
                        {replyingId === item._id ? "Sending" : "Reply"}
                      </span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
