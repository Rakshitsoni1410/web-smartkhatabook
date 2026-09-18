import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// =====================================================
// PARTICLES
// =====================================================

const PARTICLES = [
  {
    left: "8%",
    top: "18%",
    size: 5,
    color: "#6c63ff",
    delay: 0,
    duration: 2.8,
  },
  {
    left: "18%",
    top: "70%",
    size: 3,
    color: "#48b9f8",
    delay: 0.3,
    duration: 3.2,
  },
  {
    left: "30%",
    top: "30%",
    size: 3,
    color: "#6c63ff",
    delay: 0.6,
    duration: 2.6,
  },
  {
    left: "42%",
    top: "78%",
    size: 4,
    color: "#48b9f8",
    delay: 0.9,
    duration: 3.5,
  },
  {
    left: "55%",
    top: "16%",
    size: 3,
    color: "#6c63ff",
    delay: 1.2,
    duration: 2.9,
  },
  {
    left: "67%",
    top: "72%",
    size: 5,
    color: "#48b9f8",
    delay: 0.4,
    duration: 3.3,
  },
  {
    left: "78%",
    top: "26%",
    size: 3,
    color: "#6c63ff",
    delay: 0.8,
    duration: 2.7,
  },
  {
    left: "88%",
    top: "62%",
    size: 4,
    color: "#48b9f8",
    delay: 1.1,
    duration: 3.1,
  },
  {
    left: "94%",
    top: "38%",
    size: 3,
    color: "#6c63ff",
    delay: 0.5,
    duration: 3.4,
  },
];

// =====================================================
// SPLASH SCREEN
// =====================================================

export default function SplashScreen({ onComplete = () => {} }) {
  const [phase, setPhase] = useState("init");

  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef([]);

  // =====================================================
  // KEEP CALLBACK CURRENT
  // =====================================================

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // =====================================================
  // REDUCED MOTION
  // =====================================================

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    media.addEventListener?.("change", handleChange);

    return () => {
      media.removeEventListener?.("change", handleChange);
    };
  }, []);

  // =====================================================
  // COMPLETE
  // =====================================================

  const completeSplash = () => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;

    onCompleteRef.current?.();
  };

  // =====================================================
  // CLEAR TIMERS
  // =====================================================

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));

    timersRef.current = [];
  };

  // =====================================================
  // TIMELINE
  // =====================================================

  useEffect(() => {
    completedRef.current = false;

    clearTimers();

    if (prefersReducedMotion) {
      setPhase("brandReveal");

      const exitTimer = setTimeout(() => {
        setPhase("exit");
      }, 700);

      const completeTimer = setTimeout(() => {
        completeSplash();
      }, 950);

      timersRef.current = [exitTimer, completeTimer];

      return () => {
        clearTimers();
      };
    }

    const timeline = [
      {
        delay: 250,
        phase: "bookOpen",
      },
      {
        delay: 1100,
        phase: "writeLines",
      },
      {
        delay: 1950,
        phase: "brandReveal",
      },
      {
        delay: 3550,
        phase: "exit",
      },
    ];

    timersRef.current = timeline.map(({ delay, phase: nextPhase }) =>
      setTimeout(() => {
        setPhase(nextPhase);
      }, delay),
    );

    const completeTimer = setTimeout(() => {
      completeSplash();
    }, 4300);

    timersRef.current.push(completeTimer);

    return () => {
      clearTimers();
    };
  }, [prefersReducedMotion]);

  // =====================================================
  // LOCK PAGE SCROLL
  // =====================================================

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // =====================================================
  // PHASE HELPERS
  // =====================================================

  const isOpen = phase !== "init";

  const showLines = ["writeLines", "brandReveal", "exit"].includes(phase);

  const showBrand = ["brandReveal", "exit"].includes(phase);

  const isExiting = phase === "exit";

  const brandText = "Smart Khatabook";

  // =====================================================
  // SSR SAFETY
  // =====================================================

  if (typeof document === "undefined") {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Smart Khatabook"
      className={`skb-splash-root ${isExiting ? "skb-splash-exit" : ""}`}
    >
      {/* SCREEN READER */}

      <span className="skb-sr-only">
        Smart Khatabook is loading. Please wait.
      </span>

      {/* BACKGROUND */}

      <div aria-hidden="true" className="skb-bg-orb skb-bg-orb-one" />

      <div aria-hidden="true" className="skb-bg-orb skb-bg-orb-two" />

      <div
        aria-hidden="true"
        className={`skb-main-glow ${showBrand ? "skb-main-glow-show" : ""}`}
      />

      {/* PARTICLES */}

      {!prefersReducedMotion &&
        PARTICLES.map((particle, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`skb-particle ${showBrand ? "skb-particle-show" : ""}`}
            style={{
              "--particle-left": particle.left,
              "--particle-top": particle.top,
              "--particle-size": `${particle.size}px`,
              "--particle-color": particle.color,
              "--particle-delay": `${particle.delay}s`,
              "--particle-duration": `${particle.duration}s`,
            }}
          />
        ))}

      {/* CONTENT */}

      <div className="skb-splash-content">
        {/* =====================================================
            BOOK
        ===================================================== */}

        <div
          aria-hidden="true"
          className={`skb-book-wrap ${isOpen ? "skb-book-open" : ""}`}
        >
          <div className="skb-book-floor-shadow" />

          {/* BACK COVER */}

          <div className="skb-book-back" />

          {/* PAGES */}

          <div className="skb-pages">
            {[...Array(8)].map((_, index) => (
              <div className="skb-page-row" key={index}>
                <span className="skb-page-margin" />

                <span className="skb-page-rule">
                  {showLines && index < 7 && (
                    <span
                      className={`skb-written-line skb-line-${index % 3}`}
                      style={{
                        "--line-width": `${52 + ((index * 7) % 40)}%`,
                        "--line-delay": `${index * 0.075}s`,
                      }}
                    />
                  )}
                </span>
              </div>
            ))}

            {showLines && <div className="skb-rupee">₹</div>}
          </div>

          {/* FRONT COVER */}

          <div className="skb-front-cover">
            <div className="skb-cover-face skb-cover-front">
              <div className="skb-cover-logo">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />

                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>

              <span>Smart Khatabook</span>

              <small>Business Ledger</small>
            </div>

            <div className="skb-cover-face skb-cover-inside">
              <div className="skb-inside-decoration">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          {/* PAGE CURL */}

          {isOpen && <div className="skb-page-curl" />}

          {/* PENCIL */}

          {showLines && !prefersReducedMotion && (
            <div className="skb-pencil">✏️</div>
          )}
        </div>

        {/* =====================================================
            BRAND
        ===================================================== */}

        <div
          className={`skb-brand-area ${showBrand ? "skb-brand-visible" : ""}`}
        >
          <h1 className="skb-brand-title">
            {brandText.split("").map((character, index) => (
              <span
                key={index}
                style={{
                  "--letter-delay": `${0.045 * index}s`,
                }}
                className={
                  showBrand
                    ? "skb-brand-letter skb-brand-letter-show"
                    : "skb-brand-letter"
                }
              >
                {character}
              </span>
            ))}
          </h1>

          <p className="skb-tagline">
            Track
            <span>•</span>
            Manage
            <span>•</span>
            Profit
          </p>

          {/* LOADING */}

          <div className="skb-loading-track">
            <div
              className={`skb-loading-fill ${
                showBrand ? "skb-loading-fill-active" : ""
              }`}
            >
              <span className="skb-loading-shimmer" />
            </div>
          </div>

          <div className="skb-loading-label">Smart business. Simple khata.</div>
        </div>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        /* =====================================================
           RESET
        ===================================================== */

        .skb-splash-root,
        .skb-splash-root * {
          box-sizing: border-box;
        }

        /* =====================================================
           ROOT
        ===================================================== */

        .skb-splash-root {
          position: fixed;

          inset: 0;

          z-index: 999999;

          width: 100%;

          height: 100vh;
          height: 100dvh;

          overflow: hidden;

          display: flex;

          align-items: center;

          justify-content: center;

          padding:
            max(
              20px,
              env(safe-area-inset-top)
            )
            max(
              20px,
              env(safe-area-inset-right)
            )
            max(
              20px,
              env(safe-area-inset-bottom)
            )
            max(
              20px,
              env(safe-area-inset-left)
            );

          background:
            radial-gradient(
              circle at 50% 28%,
              #19284d 0%,
              #10192e 43%,
              #0b1120 72%,
              #070b14 100%
            );

          font-family:
            "Plus Jakarta Sans",
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          opacity: 1;

          transform: scale(1);

          transition:
            opacity 0.72s
              cubic-bezier(
                0.5,
                0,
                0.75,
                0
              ),
            transform 0.72s
              cubic-bezier(
                0.5,
                0,
                0.75,
                0
              );
        }

        .skb-splash-root::before {
          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              115deg,
              rgba(
                255,
                255,
                255,
                0.015
              ),
              transparent 30%,
              rgba(
                108,
                99,
                255,
                0.03
              ) 60%,
              transparent
            );
        }

        .skb-splash-exit {
          opacity: 0;

          transform: scale(1.07);

          pointer-events: none;
        }

        /* =====================================================
           SCREEN READER
        ===================================================== */

        .skb-sr-only {
          position: absolute;

          width: 1px;

          height: 1px;

          padding: 0;

          margin: -1px;

          overflow: hidden;

          clip: rect(
            0,
            0,
            0,
            0
          );

          white-space: nowrap;

          border: 0;
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .skb-splash-content {
          position: relative;

          z-index: 10;

          width: 100%;

          max-width: 680px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap:
            clamp(
              20px,
              4vh,
              34px
            );
        }

        /* =====================================================
           BACKGROUND ORBS
        ===================================================== */

        .skb-bg-orb {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(2px);
        }

        .skb-bg-orb-one {
          width:
            min(
              60vw,
              650px
            );

          aspect-ratio: 1;

          left: -20%;

          top: -28%;

          background:
            radial-gradient(
              circle,
              rgba(
                79,
                70,
                229,
                0.16
              ),
              transparent 68%
            );
        }

        .skb-bg-orb-two {
          width:
            min(
              55vw,
              600px
            );

          aspect-ratio: 1;

          right: -20%;

          bottom: -34%;

          background:
            radial-gradient(
              circle,
              rgba(
                56,
                189,
                248,
                0.1
              ),
              transparent 70%
            );
        }

        /* =====================================================
           MAIN GLOW
        ===================================================== */

        .skb-main-glow {
          position: absolute;

          left: 50%;

          top: 43%;

          width:
            clamp(
              300px,
              65vw,
              650px
            );

          aspect-ratio: 1;

          border-radius: 50%;

          pointer-events: none;

          opacity: 0;

          transform:
            translate(
              -50%,
              -50%
            );

          background:
            radial-gradient(
              circle,
              rgba(
                108,
                99,
                255,
                0.18
              ) 0%,
              rgba(
                72,
                185,
                248,
                0.07
              ) 45%,
              transparent 72%
            );

          transition:
            opacity 0.8s ease;
        }

        .skb-main-glow-show {
          opacity: 1;

          animation:
            skbGlowPulse
            3.2s
            ease-in-out
            infinite;
        }

        /* =====================================================
           PARTICLES
        ===================================================== */

        .skb-particle {
          position: absolute;

          left:
            var(
              --particle-left
            );

          top:
            var(
              --particle-top
            );

          width:
            var(
              --particle-size
            );

          height:
            var(
              --particle-size
            );

          border-radius: 50%;

          background:
            var(
              --particle-color
            );

          opacity: 0;

          pointer-events: none;

          box-shadow:
            0
            0
            10px
            var(
              --particle-color
            );

          transition:
            opacity 0.8s ease;
        }

        .skb-particle-show {
          opacity: 0.55;

          animation:
            skbFloatParticle
            var(
              --particle-duration
            )
            ease-in-out
            infinite
            var(
              --particle-delay
            );
        }

        /* =====================================================
           BOOK
        ===================================================== */

        .skb-book-wrap {
          --book-width:
            clamp(
              120px,
              26vw,
              165px
            );

          --book-height:
            calc(
              var(
                --book-width
              ) *
              1.24
            );

          /*
           * Important fix:
           * when the front cover opens to the left,
           * the visual width becomes approximately
           * two book widths.
           *
           * Moving the wrapper by half a book width
           * keeps the COMPLETE OPEN BOOK centered.
           */
          --book-open-offset:
            calc(
              var(
                --book-width
              ) *
              0.5
            );

          position: relative;

          width:
            var(
              --book-width
            );

          height:
            var(
              --book-height
            );

          perspective: 1100px;

          -webkit-perspective:
            1100px;

          transform-style:
            preserve-3d;

          -webkit-transform-style:
            preserve-3d;
        }

        .skb-book-open {
          animation:
            skbBookSettle
            0.9s
            cubic-bezier(
              0.34,
              1.35,
              0.64,
              1
            )
            0.05s
            both;
        }

        /* =====================================================
           FLOOR SHADOW
        ===================================================== */

        .skb-book-floor-shadow {
          position: absolute;

          left: 50%;

          bottom: -18%;

          width: 125%;

          height: 18%;

          border-radius: 50%;

          transform:
            translateX(-50%);

          background:
            rgba(
              0,
              0,
              0,
              0.36
            );

          filter: blur(14px);

          opacity: 0.7;
        }

        /* =====================================================
           BACK COVER
        ===================================================== */

        .skb-book-back {
          position: absolute;

          inset: 0;

          border-radius:
            4px
            14px
            14px
            4px;

          background:
            linear-gradient(
              150deg,
              #245fc2 0%,
              #164187 48%,
              #0d2c66 100%
            );

          box-shadow:
            0
            24px
            70px
            rgba(
              26,
              79,
              168,
              0.38
            ),
            0
            8px
            25px
            rgba(
              0,
              0,
              0,
              0.38
            );
        }

        /* =====================================================
           PAGES
        ===================================================== */

        .skb-pages {
          position: absolute;

          inset:
            4px
            6px;

          z-index: 2;

          overflow: hidden;

          padding:
            clamp(
              10px,
              2.8vw,
              14px
            )
            clamp(
              9px,
              2.4vw,
              12px
            );

          border-radius:
            2px
            10px
            10px
            2px;

          background:
            linear-gradient(
              90deg,
              #f5f6fa,
              #ffffff 14%,
              #ffffff 90%,
              #f1f3f8
            );

          box-shadow:
            inset
            -6px
            0
            14px
            rgba(
              0,
              0,
              0,
              0.05
            );
        }

        .skb-page-row {
          display: flex;

          align-items: center;

          gap:
            clamp(
              4px,
              1.3vw,
              6px
            );

          margin-bottom:
            clamp(
              5px,
              1.3vw,
              7px
            );
        }

        .skb-page-margin {
          width: 1px;

          height:
            clamp(
              8px,
              2.5vw,
              12px
            );

          flex-shrink: 0;

          background: #fca5a5;
        }

        .skb-page-rule {
          position: relative;

          flex: 1;

          height: 2px;

          overflow: hidden;

          border-radius: 2px;

          background: #e8eaf0;
        }

        .skb-written-line {
          position: absolute;

          inset:
            0
            auto
            0
            0;

          width:
            var(
              --line-width
            );

          border-radius: 2px;

          transform:
            scaleX(0);

          transform-origin: left;

          animation:
            skbWriteLine
            0.42s
            cubic-bezier(
              0.4,
              0,
              0.2,
              1
            )
            var(
              --line-delay
            )
            forwards;
        }

        .skb-line-0 {
          background:
            linear-gradient(
              90deg,
              #6c63ff,
              #908aff
            );
        }

        .skb-line-1 {
          background:
            linear-gradient(
              90deg,
              #1a4fa8,
              #4878d4
            );
        }

        .skb-line-2 {
          background:
            linear-gradient(
              90deg,
              #48b9f8,
              #7dd4fc
            );
        }

        /* =====================================================
           RUPEE
        ===================================================== */

        .skb-rupee {
          position: absolute;

          right:
            clamp(
              8px,
              2.5vw,
              12px
            );

          bottom:
            clamp(
              8px,
              2.5vw,
              12px
            );

          color: #6c63ff;

          font-size:
            clamp(
              17px,
              5vw,
              22px
            );

          font-weight: 900;

          opacity: 0;

          animation:
            skbRupeeIn
            0.45s
            cubic-bezier(
              0.34,
              1.6,
              0.64,
              1
            )
            0.62s
            forwards;
        }

        /* =====================================================
           FRONT COVER
        ===================================================== */

        .skb-front-cover {
          position: absolute;

          inset: 0;

          z-index: 4;

          transform-origin:
            left center;

          transform:
            rotateY(0deg);

          -webkit-transform:
            rotateY(0deg);

          transform-style:
            preserve-3d;

          -webkit-transform-style:
            preserve-3d;

          transition:
            transform
            1s
            cubic-bezier(
              0.34,
              1.15,
              0.64,
              1
            );
        }

        .skb-book-open
        .skb-front-cover {
          transform:
            rotateY(-180deg);

          -webkit-transform:
            rotateY(-180deg);
        }

        .skb-cover-face {
          position: absolute;

          inset: 0;

          backface-visibility:
            hidden;

          -webkit-backface-visibility:
            hidden;

          border-radius:
            4px
            14px
            14px
            4px;
        }

        /* =====================================================
           FRONT FACE
        ===================================================== */

        .skb-cover-front {
          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap:
            clamp(
              7px,
              2vw,
              10px
            );

          padding: 14px;

          color:
            rgba(
              255,
              255,
              255,
              0.95
            );

          text-align: center;

          background:
            linear-gradient(
              145deg,
              #3b82f6 0%,
              #2563eb 42%,
              #194aa0 100%
            );

          box-shadow:
            inset
            0
            0
            45px
            rgba(
              0,
              0,
              0,
              0.14
            );
        }

        .skb-cover-front::after {
          content: "";

          position: absolute;

          inset: 0;

          border-radius: inherit;

          pointer-events: none;

          background:
            linear-gradient(
              120deg,
              rgba(
                255,
                255,
                255,
                0.13
              ),
              transparent 35%,
              transparent 70%,
              rgba(
                255,
                255,
                255,
                0.04
              )
            );
        }

        .skb-cover-logo {
          width:
            clamp(
              34px,
              8vw,
              42px
            );

          height:
            clamp(
              34px,
              8vw,
              42px
            );
        }

        .skb-cover-logo svg {
          width: 100%;

          height: 100%;
        }

        .skb-cover-front span {
          font-size:
            clamp(
              8px,
              2.4vw,
              11px
            );

          font-weight: 800;

          letter-spacing:
            0.08em;

          text-transform: uppercase;
        }

        .skb-cover-front small {
          color:
            rgba(
              255,
              255,
              255,
              0.58
            );

          font-size:
            clamp(
              6px,
              1.8vw,
              8px
            );

          letter-spacing:
            0.08em;

          text-transform: uppercase;
        }

        /* =====================================================
           INSIDE COVER
        ===================================================== */

        .skb-cover-inside {
          transform:
            rotateY(180deg);

          -webkit-transform:
            rotateY(180deg);

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            linear-gradient(
              145deg,
              #f7f8ff,
              #e8ebf8
            );
        }

        .skb-inside-decoration {
          width: 55%;

          display: flex;

          flex-direction: column;

          gap: 7px;

          opacity: 0.55;
        }

        .skb-inside-decoration span {
          height: 2px;

          border-radius: 20px;

          background: #b8c0d9;
        }

        .skb-inside-decoration
        span:nth-child(2) {
          width: 72%;
        }

        .skb-inside-decoration
        span:nth-child(3) {
          width: 42%;
        }

        /* =====================================================
           PAGE CURL
        ===================================================== */

        .skb-page-curl {
          position: absolute;

          right: -6px;

          top: 10%;

          bottom: 10%;

          width: 6px;

          border-radius:
            0
            4px
            4px
            0;

          background:
            linear-gradient(
              90deg,
              rgba(
                0,
                0,
                0,
                0.15
              ),
              transparent
            );
        }

        /* =====================================================
           PENCIL
        ===================================================== */

        .skb-pencil {
          position: absolute;

          right:
            clamp(
              -17px,
              -3vw,
              -12px
            );

          top:
            clamp(
              12px,
              3vw,
              20px
            );

          z-index: 6;

          font-size:
            clamp(
              19px,
              5vw,
              25px
            );

          transform-origin: center;

          opacity: 0;

          animation:
            skbPencilWrite
            1.3s
            ease-in-out
            forwards;
        }

        /* =====================================================
           BRAND AREA
        ===================================================== */

        .skb-brand-area {
          width: 100%;

          max-width: 520px;

          margin-inline: auto;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          opacity: 0;

          transform:
            translateY(24px);

          transition:
            opacity
              0.7s
              ease,
            transform
              0.7s
              cubic-bezier(
                0.34,
                1.4,
                0.64,
                1
              );
        }

        .skb-brand-visible {
          opacity: 1;

          transform:
            translateY(0);
        }

        .skb-brand-title {
          width: 100%;

          margin:
            0
            0
            9px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-wrap: nowrap;

          perspective: 300px;

          color: #ffffff;

          font-size:
            clamp(
              1.65rem,
              6vw,
              2.25rem
            );

          font-weight: 900;

          line-height: 1.05;

          letter-spacing:
            -0.035em;
        }

        .skb-brand-letter {
          display: inline-block;

          white-space: pre;

          opacity: 0;
        }

        .skb-brand-letter-show {
          animation:
            skbLetterUp
            0.5s
            cubic-bezier(
              0.2,
              0.9,
              0.3,
              1.2
            )
            var(
              --letter-delay
            )
            forwards;
        }

        /* =====================================================
           TAGLINE
        ===================================================== */

        .skb-tagline {
          margin:
            0
            0
            20px;

          display: flex;

          justify-content: center;

          align-items: center;

          gap:
            clamp(
              6px,
              2vw,
              10px
            );

          color: #8b83ff;

          font-size:
            clamp(
              0.6rem,
              2.3vw,
              0.72rem
            );

          font-weight: 800;

          letter-spacing:
            0.16em;

          text-transform: uppercase;

          opacity: 0;

          animation:
            skbTaglineReveal
            0.6s
            ease
            0.48s
            forwards;
        }

        .skb-tagline span {
          color:
            rgba(
              255,
              255,
              255,
              0.35
            );
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .skb-loading-track {
          position: relative;

          width:
            clamp(
              120px,
              36vw,
              170px
            );

          height: 4px;

          margin:
            0
            auto;

          overflow: hidden;

          border-radius: 20px;

          background:
            rgba(
              255,
              255,
              255,
              0.08
            );
        }

        .skb-loading-fill {
          position: relative;

          width: 100%;

          height: 100%;

          overflow: hidden;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #6c63ff,
              #48b9f8
            );

          transform:
            scaleX(0);

          transform-origin: left;
        }

        .skb-loading-fill-active {
          animation:
            skbLoadBar
            1.6s
            cubic-bezier(
              0.4,
              0,
              0.2,
              1
            )
            0.15s
            forwards;
        }

        .skb-loading-shimmer {
          position: absolute;

          inset: 0;

          width: 40%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(
                255,
                255,
                255,
                0.8
              ),
              transparent
            );

          animation:
            skbShimmer
            1.3s
            ease-in-out
            0.45s
            infinite;
        }

        .skb-loading-label {
          margin-top: 10px;

          color:
            rgba(
              255,
              255,
              255,
              0.36
            );

          font-size:
            clamp(
              9px,
              2.4vw,
              11px
            );

          font-weight: 500;

          letter-spacing:
            0.04em;
        }

        /* =====================================================
           WRITE LINE
        ===================================================== */

        @keyframes skbWriteLine {
          from {
            transform:
              scaleX(0);
          }

          to {
            transform:
              scaleX(1);
          }
        }

        /* =====================================================
           RUPEE
        ===================================================== */

        @keyframes skbRupeeIn {
          from {
            opacity: 0;

            transform:
              scale(0.45)
              rotate(-8deg);
          }

          to {
            opacity: 1;

            transform:
              scale(1)
              rotate(0);
          }
        }

        /* =====================================================
           PENCIL
        ===================================================== */

        @keyframes skbPencilWrite {
          0% {
            opacity: 0;

            transform:
              translate(
                0,
                0
              )
              rotate(45deg);
          }

          15% {
            opacity: 1;
          }

          50% {
            transform:
              translate(
                -14px,
                8px
              )
              rotate(40deg);
          }

          85% {
            opacity: 1;
          }

          100% {
            opacity: 0;

            transform:
              translate(
                -26px,
                16px
              )
              rotate(45deg);
          }
        }

        /* =====================================================
           LOADING BAR
        ===================================================== */

        @keyframes skbLoadBar {
          from {
            transform:
              scaleX(0);
          }

          to {
            transform:
              scaleX(1);
          }
        }

        @keyframes skbShimmer {
          from {
            transform:
              translateX(-110%);
          }

          to {
            transform:
              translateX(260%);
          }
        }

        /* =====================================================
           GLOW
        ===================================================== */

        @keyframes skbGlowPulse {
          0%,
          100% {
            transform:
              translate(
                -50%,
                -50%
              )
              scale(1);
          }

          50% {
            transform:
              translate(
                -50%,
                -50%
              )
              scale(1.1);
          }
        }

        /* =====================================================
           BRAND LETTER
        ===================================================== */

        @keyframes skbLetterUp {
          from {
            opacity: 0;

            transform:
              translateY(16px)
              rotateX(60deg);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              rotateX(0);
          }
        }

        /* =====================================================
           BOOK CENTERING FIX
        ===================================================== */

        @keyframes skbBookSettle {
          0% {
            transform:
              translateX(
                var(
                  --book-open-offset
                )
              )
              translateY(-7px)
              scale(0.96);
          }

          60% {
            transform:
              translateX(
                var(
                  --book-open-offset
                )
              )
              translateY(2px)
              scale(1.015);
          }

          100% {
            transform:
              translateX(
                var(
                  --book-open-offset
                )
              )
              translateY(0)
              scale(1);
          }
        }

        /* =====================================================
           TAGLINE
        ===================================================== */

        @keyframes skbTaglineReveal {
          from {
            opacity: 0;

            transform:
              translateY(6px);

            letter-spacing:
              0.28em;
          }

          to {
            opacity: 1;

            transform:
              translateY(0);

            letter-spacing:
              0.16em;
          }
        }

        /* =====================================================
           PARTICLES
        ===================================================== */

        @keyframes skbFloatParticle {
          0%,
          100% {
            transform:
              translate(
                0,
                0
              );
          }

          50% {
            transform:
              translate(
                6px,
                -11px
              );
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (
          max-width: 600px
        ) {
          .skb-splash-root {
            padding:
              max(
                18px,
                env(
                  safe-area-inset-top
                )
              )
              16px
              max(
                18px,
                env(
                  safe-area-inset-bottom
                )
              );
          }

          .skb-splash-content {
            width: 100%;

            max-width: 100%;

            gap:
              clamp(
                18px,
                4vh,
                28px
              );
          }

          .skb-book-wrap {
            --book-width:
              clamp(
                116px,
                36vw,
                145px
              );
          }

          .skb-brand-area {
            width: 100%;

            max-width: 100%;

            padding-inline: 8px;
          }

          .skb-brand-title {
            width: 100%;

            justify-content: center;

            font-size:
              clamp(
                1.5rem,
                7vw,
                2rem
              );
          }

          .skb-bg-orb-one {
            width: 100vw;
          }

          .skb-bg-orb-two {
            width: 90vw;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (
          max-width: 380px
        ) {
          .skb-splash-root {
            padding-left: 12px;

            padding-right: 12px;
          }

          .skb-book-wrap {
            --book-width:
              clamp(
                106px,
                36vw,
                130px
              );
          }

          .skb-brand-title {
            font-size:
              clamp(
                1.35rem,
                7vw,
                1.7rem
              );

            letter-spacing:
              -0.045em;
          }

          .skb-tagline {
            margin-bottom: 16px;

            font-size: 0.58rem;

            gap: 5px;

            letter-spacing:
              0.13em;
          }

          .skb-particle:nth-of-type(n + 7) {
            display: none;
          }
        }

        /* =====================================================
           VERY SMALL WIDTH
        ===================================================== */

        @media (
          max-width: 320px
        ) {
          .skb-splash-root {
            padding-left: 8px;

            padding-right: 8px;
          }

          .skb-book-wrap {
            --book-width:
              clamp(
                98px,
                34vw,
                114px
              );
          }

          .skb-brand-area {
            padding-inline: 4px;
          }

          .skb-brand-title {
            font-size: 1.27rem;

            letter-spacing:
              -0.055em;
          }

          .skb-tagline {
            font-size: 0.53rem;

            letter-spacing:
              0.1em;
          }
        }

        /* =====================================================
           SHORT / LANDSCAPE
        ===================================================== */

        @media (
          max-height: 620px
        ) {
          .skb-splash-root {
            align-items: center;
          }

          .skb-splash-content {
            /*
             * Important:
             * do NOT move brand to the side.
             * Keep Smart Khatabook directly
             * underneath the book.
             */
            flex-direction: column;

            max-width: 680px;

            gap:
              clamp(
                13px,
                3vh,
                20px
              );
          }

          .skb-book-wrap {
            --book-width:
              clamp(
                88px,
                19vh,
                116px
              );

            flex-shrink: 0;
          }

          .skb-brand-area {
            width: 100%;

            max-width: 500px;

            min-width: 0;
          }

          .skb-brand-title {
            font-size:
              clamp(
                1.2rem,
                4vw,
                1.7rem
              );

            justify-content: center;
          }

          .skb-tagline {
            margin-bottom: 11px;
          }

          .skb-loading-label {
            margin-top: 7px;
          }
        }

        /* =====================================================
           VERY SHORT SCREEN
        ===================================================== */

        @media (
          max-height: 430px
        ) {
          .skb-splash-root {
            padding: 8px;
          }

          .skb-splash-content {
            gap: 10px;
          }

          .skb-book-wrap {
            --book-width: 82px;
          }

          .skb-brand-title {
            margin-bottom: 5px;

            font-size: 1.2rem;
          }

          .skb-tagline {
            margin-bottom: 8px;

            font-size: 0.52rem;
          }

          .skb-loading-label {
            display: none;
          }

          .skb-loading-track {
            height: 3px;
          }
        }

        /* =====================================================
           TOUCH DEVICES
        ===================================================== */

        @media (
          hover: none
        ) {
          .skb-splash-root {
            -webkit-tap-highlight-color:
              transparent;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .skb-splash-root,
          .skb-splash-root *,
          .skb-splash-root *::before,
          .skb-splash-root *::after {
            animation-duration:
              0.01ms !important;

            animation-delay:
              0ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;
          }

          .skb-brand-letter {
            opacity: 1;
          }

          .skb-tagline {
            opacity: 1;
          }

          .skb-loading-fill {
            transform:
              scaleX(1);
          }

          .skb-rupee {
            opacity: 1;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}
