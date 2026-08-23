import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

export default function SplashScreen({ onComplete = () => {} }) {
  const [phase, setPhase] = useState("init");
  // init → bookOpen → writeLines → brandReveal → exit

  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  ).current;

  useEffect(() => {
    // Respect reduced-motion: skip straight to the brand, exit quickly.
    if (prefersReducedMotion) {
      setPhase("brandReveal");
      const t = setTimeout(() => {
        setPhase("exit");
        setTimeout(onComplete, 200);
      }, 900);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase("bookOpen"), 300);
    const t2 = setTimeout(() => setPhase("writeLines"), 1150);
    const t3 = setTimeout(() => setPhase("brandReveal"), 2000);
    const t4 = setTimeout(() => setPhase("exit"), 3600);
    // Fire onComplete only after the exit fade/scale transition (0.75s) has finished.
    const t5 = setTimeout(() => onComplete(), 4380);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOpen = phase !== "init";
  const showLines =
    phase === "writeLines" || phase === "brandReveal" || phase === "exit";
  const showBrand = phase === "brandReveal" || phase === "exit";
  const isExiting = phase === "exit";

  const brandText = "Smart Khatabook";

  // Portal straight to document.body — guarantees this is centered on the
  // real viewport even if a parent wrapper has a CSS transform/filter/
  // perspective on it (any of those turns `position: fixed` into
  // "fixed relative to that ancestor" instead of the whole screen, which
  // is what was pushing the book off to one side).
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Smart Khatabook"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "radial-gradient(circle at 50% 30%, #14203f 0%, #0f1729 60%, #0a0f1e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: isExiting
          ? "opacity 0.75s cubic-bezier(0.5,0,0.75,0), transform 0.75s cubic-bezier(0.5,0,0.75,0)"
          : "none",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "scale(1.08)" : "scale(1)",
      }}
    >
      {/* Screen-reader-only text — decorative visuals below are hidden from AT */}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Smart Khatabook is loading, please wait.
      </span>

      {/* ── Keyframes & animation styles ── */}
      <style>{`
        @keyframes writeLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.5) rotate(-8deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translate(0,0); }
          50%      { transform: translate(6px,-10px); }
        }
        @keyframes pencilWrite {
          0%   { opacity: 0; transform: translate(0,0) rotate(45deg); }
          15%  { opacity: 1; }
          50%  { transform: translate(-14px,8px) rotate(40deg); }
          85%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-26px,16px) rotate(45deg); }
        }
        @keyframes loadBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 1;   transform: translate(-50%,-50%) scale(1.12); }
        }
        @keyframes letterUp {
          from { opacity: 0; transform: translateY(16px) rotateX(60deg); }
          to   { opacity: 1; transform: translateY(0) rotateX(0deg); }
        }
        @keyframes bookSettle {
          0%   { transform: translateY(-6px) scale(0.96); }
          60%  { transform: translateY(2px) scale(1.01); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes taglineWave {
          from { letter-spacing: 0.4em; opacity: 0; }
          to   { letter-spacing: 0.2em; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      {/* Ambient glow — pulsing */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.16) 0%, rgba(72,185,248,0.06) 45%, transparent 72%)",
          transition: "opacity 1s",
          opacity: showBrand ? 1 : 0,
          animation:
            showBrand && !prefersReducedMotion
              ? "glowPulse 3.2s ease-in-out infinite"
              : "none",
          pointerEvents: "none",
        }}
      />

      {/* Floating particles */}
      {!prefersReducedMotion &&
        [...Array(9)].map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              width: i % 3 === 0 ? 5 : 3,
              height: i % 3 === 0 ? 5 : 3,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#6c63ff" : "#48b9f8",
              left: `${10 + i * 9}%`,
              top: `${18 + (i % 4) * 20}%`,
              boxShadow:
                i % 2 === 0
                  ? "0 0 8px rgba(108,99,255,0.8)"
                  : "0 0 8px rgba(72,185,248,0.8)",
              opacity: showBrand ? 0.6 : 0,
              transition: `opacity 0.9s ease ${i * 0.08}s`,
              animation: showBrand
                ? `floatDot ${2.4 + (i % 3) * 0.6}s ease-in-out infinite ${i * 0.35}s`
                : "none",
            }}
          />
        ))}

      {/* ── BOOK ── */}
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          width: 160,
          height: 200,
          marginBottom: 36,
          perspective: 900,
          animation:
            isOpen && !prefersReducedMotion
              ? "bookSettle 0.9s cubic-bezier(0.34,1.35,0.64,1) 0.05s both"
              : "none",
        }}
      >
        {/* Book spine / back cover */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(160deg, #1a4fa8 0%, #0d3070 100%)",
            borderRadius: "4px 14px 14px 4px",
            boxShadow:
              "0 24px 70px rgba(26,79,168,0.45), 0 6px 20px rgba(0,0,0,0.45)",
          }}
        />

        {/* Front cover — flips fully open */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            transform: isOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
            transition: "transform 1s cubic-bezier(0.34,1.15,0.64,1)",
            transformStyle: "preserve-3d",
            zIndex: 3,
          }}
        >
          {/* Front face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(160deg, #2563eb 0%, #1a4fa8 100%)",
              borderRadius: "4px 14px 14px 4px",
              backfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: 16,
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.15)",
            }}
          >
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Smart Khatabook
            </span>
          </div>
          {/* Back of cover (inside) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#f8f9ff",
              borderRadius: "4px 14px 14px 4px",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          />
        </div>

        {/* Pages (inside the book) */}
        <div
          style={{
            position: "absolute",
            inset: "4px 6px",
            background: "#ffffff",
            borderRadius: "2px 10px 10px 2px",
            zIndex: 2,
            padding: "14px 12px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 7,
            boxShadow: "inset -6px 0 14px rgba(0,0,0,0.04)",
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <div
                style={{
                  width: 1,
                  height: 12,
                  background: "#ffb3b3",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: 1.5,
                  background: "#e8eaf0",
                  borderRadius: 1,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {showLines && i < 7 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        i % 3 === 0
                          ? "linear-gradient(to right, #6c63ff, #8b83ff)"
                          : i % 3 === 1
                            ? "linear-gradient(to right, #1a4fa8, #4878d4)"
                            : "linear-gradient(to right, #48b9f8, #7dd4fc)",
                      borderRadius: 1,
                      transformOrigin: "left",
                      animation: prefersReducedMotion
                        ? "none"
                        : "writeLine 0.42s cubic-bezier(0.4,0,0.2,1) forwards",
                      animationDelay: `${i * 0.075}s`,
                      transform: prefersReducedMotion
                        ? "scaleX(1)"
                        : "scaleX(0)",
                      width: `${50 + ((i * 7) % 45)}%`,
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Rupee symbol */}
          {showLines && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                fontSize: 22,
                color: "#6c63ff",
                fontWeight: 800,
                opacity: prefersReducedMotion ? 1 : 0,
                animation: prefersReducedMotion
                  ? "none"
                  : "fadeInScale 0.45s cubic-bezier(0.34,1.6,0.64,1) 0.65s forwards",
              }}
            >
              ₹
            </div>
          )}
        </div>

        {/* Page curl shadow */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              right: -6,
              top: "10%",
              bottom: "10%",
              width: 6,
              background:
                "linear-gradient(to right, rgba(0,0,0,0.14), transparent)",
              borderRadius: "0 4px 4px 0",
            }}
          />
        )}

        {/* Pencil writing animation */}
        {showLines && !prefersReducedMotion && (
          <div
            style={{
              position: "absolute",
              right: -14,
              top: 18,
              fontSize: 24,
              transformOrigin: "center",
              animation: "pencilWrite 1.3s ease-in-out forwards",
              opacity: 0,
            }}
          >
            ✏️
          </div>
        )}
      </div>

      {/* ── BRAND ── */}
      <div
        style={{
          textAlign: "center",
          transform: showBrand ? "translateY(0)" : "translateY(24px)",
          opacity: showBrand ? 1 : 0,
          transition:
            "transform 0.7s cubic-bezier(0.34,1.4,0.64,1), opacity 0.7s ease",
        }}
      >
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "2rem",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            margin: "0 0 6px",
            lineHeight: 1,
            display: "flex",
            justifyContent: "center",
            perspective: 300,
          }}
        >
          {brandText.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: prefersReducedMotion ? 1 : 0,
                animation:
                  showBrand && !prefersReducedMotion
                    ? `letterUp 0.5s cubic-bezier(0.2,0.9,0.3,1.2) ${0.05 * i}s forwards`
                    : "none",
              }}
            >
              {ch}
            </span>
          ))}
        </h1>

        <p
          style={{
            color: "#6c63ff",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            fontWeight: 700,
            margin: "0 0 20px",
            opacity: prefersReducedMotion ? 1 : 0,
            animation:
              showBrand && !prefersReducedMotion
                ? "taglineWave 0.6s ease 0.55s forwards"
                : "none",
          }}
        >
          Track · Manage · Profit
        </p>

        {/* Loading bar with shimmer */}
        <div
          style={{
            width: 140,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 10,
            margin: "0 auto",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(to right, #6c63ff, #48b9f8)",
              borderRadius: 10,
              animation:
                showBrand && !prefersReducedMotion
                  ? "loadBar 1.6s cubic-bezier(0.4,0,0.2,1) 0.2s forwards"
                  : "none",
              transform: prefersReducedMotion ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                width: "40%",
                animation:
                  showBrand && !prefersReducedMotion
                    ? "shimmer 1.3s ease-in-out 0.5s infinite"
                    : "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
