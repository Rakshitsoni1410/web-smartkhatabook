import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OnboardingTour.css";

// ─── slide definitions ────────────────────────────────────────────────────────
const SLIDES = [
  {
    title: "Welcome to Smart Khatabook 👋",
    desc: "Your all-in-one business panel for managing stock, employees, orders and reviews. Here's a quick look at what's waiting for you.",
    content: (
      <div className="tour-s1-dash">
        <div className="tour-s1-topbar">
          <div>
            <div className="tour-s1-greet">🌙 GOOD EVENING</div>
            <div className="tour-s1-name">yash</div>
            <span className="tour-s1-badge">Wholesaler</span>
          </div>
          <div className="tour-s1-date">
            <div className="tour-s1-day">19</div>
            <div className="tour-s1-mo">AUG<br />Wednesday</div>
          </div>
        </div>
        <div className="tour-s1-cards">
          {[
            { accent: "📦 +4 this week", num: "20", lbl: "Stock Items" },
            { accent: "👥 All active",   num: "5",  lbl: "Employees"  },
            { accent: "🛒 +12 today",    num: "3",  lbl: "Orders"     },
          ].map((c) => (
            <div className="tour-s1-card" key={c.lbl}>
              <div className="tour-s1-accent">{c.accent}</div>
              <div className="tour-s1-num">{c.num}</div>
              <div className="tour-s1-lbl">{c.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Stock management",
    desc: "Add and track all your products. See selling price, profit, and stock count at a glance. Get low-stock alerts automatically.",
    content: (
      <div className="tour-s2-wrap">
        <div className="tour-s2-head">
          <span className="tour-s2-title">Stock</span>
          <button className="tour-s2-addbtn">+ Add Product</button>
        </div>
        <div className="tour-s2-grid">
          {[
            { name: "Van Heusen Polo Shirt", tag: "In Stock", tagCls: "stk", sell: "₹899", profit: "₹419", stock: "14", stockCls: "" },
            { name: "Arrow Formal Shirt",    tag: "Low Stock", tagCls: "low", sell: "₹550", profit: "₹150", stock: "4",  stockCls: "warn" },
          ].map((p) => (
            <div className="tour-s2-card" key={p.name}>
              <div className="tour-s2-pname">{p.name}</div>
              <div className="tour-s2-tags">
                <span className="tour-s2-tag tour-s2-cat">Clothing</span>
                <span className={`tour-s2-tag tour-s2-${p.tagCls}`}>{p.tag}</span>
              </div>
              <div className="tour-s2-stats">
                <div className="tour-s2-stat"><div className="tour-s2-slbl">Selling</div><div className="tour-s2-sval">{p.sell}</div></div>
                <div className="tour-s2-stat"><div className="tour-s2-slbl">Profit</div><div className="tour-s2-sval">{p.profit}</div></div>
                <div className="tour-s2-stat"><div className="tour-s2-slbl">Stock</div><div className={`tour-s2-sval ${p.stockCls}`}>{p.stock}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Employee management",
    desc: "Track salaries, attendance, and team performance. Pay employees and monitor who's present today — all from one screen.",
    content: (
      <div className="tour-s3-wrap">
        <div className="tour-s3-cards">
          {[
            { lbl: "Total Employees", val: "5",          cls: "" },
            { lbl: "Present Today",   val: "3",          cls: "" },
            { lbl: "Total Salary",    val: "₹12,00,000", cls: "" },
            { lbl: "Pending Salary",  val: "₹11,94,154", cls: "warn" },
          ].map((s) => (
            <div className="tour-s3-stat" key={s.lbl}>
              <div className="tour-s3-slbl">{s.lbl}</div>
              <div className={`tour-s3-sval ${s.cls}`}>{s.val}</div>
            </div>
          ))}
        </div>
        <div className="tour-emp-card">
          <div className="tour-emp-top">
            <div className="tour-emp-av">👤</div>
            <div>
              <div className="tour-emp-name">Rahul</div>
              <div className="tour-emp-phone">9876543211</div>
              <span className="tour-emp-role">Salesman</span>
            </div>
            <span className="tour-emp-active">Active</span>
          </div>
          <div className="tour-emp-pay-row">
            <span>Paid ₹5,846</span><span>₹12,00,000</span>
          </div>
          <div className="tour-emp-bar-wrap"><div className="tour-emp-bar" /></div>
          <div className="tour-emp-btns">
            {[
              { lbl: "View",   cls: "cyan"   },
              { lbl: "Edit",   cls: "indigo" },
              { lbl: "Delete", cls: "red"    },
              { lbl: "Pay",    cls: "amber"  },
            ].map((b) => (
              <div className={`tour-emp-btn tour-emp-btn--${b.cls}`} key={b.lbl}>{b.lbl}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Order tracking",
    desc: "Every order has a status — completed, pending, or processing. Track quantities and totals in real time.",
    content: (
      <div className="tour-s4-wrap">
        <div className="tour-s4-header">
          Orders <span className="tour-s4-count">3</span>
        </div>
        <div className="tour-s4-grid">
          {[
            { status: "completed",  cls: "done", qty: "1 units", total: "₹550" },
            { status: "Pending",    cls: "pend", qty: "1 units", total: "₹550" },
            { status: "processing", cls: "proc", qty: "1 units", total: "₹550" },
          ].map((o, i) => (
            <div className="tour-s4-card" key={i}>
              <span className={`tour-s4-status tour-s4-${o.cls}`}>{o.status}</span>
              <div className="tour-s4-pname">Arrow Formal Shirt</div>
              <div className="tour-s4-row">
                <div><div className="tour-s4-qlbl">QUANTITY</div><div className="tour-s4-qval">{o.qty}</div></div>
                <div className="tour-s4-right"><div className="tour-s4-qlbl">TOTAL</div><div className="tour-s4-price">{o.total}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Reviews & ratings",
    desc: "See what your customers say. Reply to reviews, track your rating, and build your business reputation — all in one place.",
    content: (
      <div className="tour-s5-wrap">
        <div className="tour-s5-hero">
          <div className="tour-s5-user">yash</div>
          <div className="tour-s5-sub">reviews</div>
          <div className="tour-s5-stats">
            {[
              { val: "4.0", lbl: "Rating",   cls: "gold"  },
              { val: "1",   lbl: "Reviews",  cls: "white" },
              { val: "1",   lbl: "Positive", cls: "green" },
            ].map((s) => (
              <div className="tour-s5-scard" key={s.lbl}>
                <div className={`tour-s5-sval tour-s5-sval--${s.cls}`}>{s.val}</div>
                <div className="tour-s5-slbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="tour-s5-body">
          <div className="tour-s5-rtitle">Recent Reviews</div>
          <div className="tour-s5-rev">
            <div className="tour-s5-rname">smith</div>
            <div className="tour-s5-rtxt">nice</div>
            <div className="tour-s5-stars">★★★★☆</div>
            <div className="tour-s5-rdate">28 Mar 2026</div>
            <div className="tour-s5-reply">Reply: thanks</div>
          </div>
        </div>
      </div>
    ),
  },
];

const SLIDE_DURATION = 4500; // ms per slide

// ─── component ────────────────────────────────────────────────────────────────
export default function OnboardingTour() {
  const navigate  = useNavigate();
  const [cur, setCur]       = useState(0);
  const [barPct, setBarPct] = useState(0);
  const rafRef   = useRef(null);
  const timerRef = useRef(null);
  const t0Ref    = useRef(null);

  // start / restart the progress bar + auto-advance timer
  const startBar = (slideIndex) => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    setBarPct(0);
    t0Ref.current = performance.now();

    const tick = (now) => {
      const pct = Math.min(((now - t0Ref.current) / SLIDE_DURATION) * 100, 100);
      setBarPct(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    if (slideIndex < SLIDES.length - 1) {
      timerRef.current = setTimeout(() => {
        setCur((prev) => prev + 1);
      }, SLIDE_DURATION);
    }
  };

  useEffect(() => {
    startBar(cur);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [cur]);

  const finish = () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    // Mark tour as seen so it never shows again for this user
    localStorage.setItem("skb_tour_seen", "true");
    navigate("/dashboard");
  };

  const goTo = (i) => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    setCur(i);
  };

  const isLast = cur === SLIDES.length - 1;

  return (
    <div className="tour-overlay">
      <div className="tour-modal">

        {/* ── header ── */}
        <div className="tour-header">
          <div className="tour-brand">
            <div className="tour-logo">📒</div>
            <span className="tour-brand-name">SmartKhataBook</span>
          </div>
          <button className="tour-skip" onClick={finish}>Skip tour</button>
        </div>

        {/* ── slide ── */}
        <div className="tour-slide" key={cur}>
          {SLIDES[cur].content}
          <div className="tour-slide-txt">
            <div className="tour-slide-title">{SLIDES[cur].title}</div>
            <div className="tour-slide-desc">{SLIDES[cur].desc}</div>
          </div>
        </div>

        {/* ── footer ── */}
        <div className="tour-footer">
          <div className="tour-dots">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`tour-dot ${i === cur ? "tour-dot--active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div className="tour-bar-wrap">
            <div className="tour-bar" style={{ width: `${barPct}%` }} />
          </div>
          <div className="tour-nav">
            {cur > 0 && (
              <button className="tour-btn" onClick={() => goTo(cur - 1)}>Back</button>
            )}
            <button
              className="tour-btn tour-btn--primary"
              onClick={isLast ? finish : () => goTo(cur + 1)}
            >
              {isLast ? "Go to dashboard" : "Next →"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}