import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("init");
  // init → bookOpen → writeLines → brandReveal → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("bookOpen"),   300);
    const t2 = setTimeout(() => setPhase("writeLines"), 1100);
    const t3 = setTimeout(() => setPhase("brandReveal"),1900);
    const t4 = setTimeout(() => setPhase("exit"),       3400);
    const t5 = setTimeout(() => onComplete(),           4100);
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout);
  }, []);

  const isOpen    = phase !== "init";
  const showLines = phase === "writeLines" || phase === "brandReveal" || phase === "exit";
  const showBrand = phase === "brandReveal" || phase === "exit";
  const isExiting = phase === "exit";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0f1729",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      transition: isExiting ? "opacity 0.7s ease, transform 0.7s ease" : "none",
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? "scale(1.04)" : "scale(1)",
    }}>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "40%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
        transition: "opacity 1s",
        opacity: showBrand ? 1 : 0,
        pointerEvents: "none",
      }}/>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 4, height: 4, borderRadius: "50%",
          background: i % 2 === 0 ? "#6c63ff" : "#48b9f8",
          left: `${15 + i * 14}%`,
          top: `${20 + (i % 3) * 25}%`,
          opacity: showBrand ? 0.5 : 0,
          transition: `opacity 0.8s ease ${i * 0.1}s`,
          animation: showBrand ? `floatDot 3s ease-in-out infinite ${i * 0.5}s` : "none",
        }}/>
      ))}

      {/* ── BOOK ── */}
      <div style={{
        position: "relative",
        width: 160, height: 200,
        marginBottom: 36,
        perspective: 800,
      }}>

        {/* Book spine / back cover */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, #1a4fa8 0%, #0d3070 100%)",
          borderRadius: "4px 14px 14px 4px",
          boxShadow: "0 20px 60px rgba(26,79,168,0.4), 0 4px 16px rgba(0,0,0,0.4)",
          transition: "transform 0.8s cubic-bezier(0.34,1.2,0.64,1)",
        }}/>

        {/* Front cover — flips open */}
        <div style={{
          position: "absolute", inset: 0,
          transformOrigin: "left center",
          transform: isOpen ? "rotateY(-160deg)" : "rotateY(0deg)",
          transition: "transform 0.9s cubic-bezier(0.34,1.1,0.64,1)",
          transformStyle: "preserve-3d",
          zIndex: 3,
        }}>
          {/* Front face */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, #2563eb 0%, #1a4fa8 100%)",
            borderRadius: "4px 14px 14px 4px",
            backfaceVisibility: "hidden",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 10, padding: 16,
          }}>
            {/* Book icon on cover */}
            <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Smart Khatabook</span>
          </div>
          {/* Back of cover (inside) */}
          <div style={{
            position: "absolute", inset: 0,
            background: "#f8f9ff",
            borderRadius: "4px 14px 14px 4px",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}/>
        </div>

        {/* Pages (inside the book) */}
        <div style={{
          position: "absolute", inset: "4px 6px",
          background: "#ffffff",
          borderRadius: "2px 10px 10px 2px",
          zIndex: 2,
          padding: "14px 12px",
          overflow: "hidden",
          display: "flex", flexDirection: "column", gap: 7,
        }}>
          {/* Ruled lines with writing animation */}
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {/* Red margin line */}
              <div style={{ width: 1, height: 12, background: "#ffb3b3", flexShrink: 0 }}/>
              {/* Line content */}
              <div style={{
                flex: 1, height: 1.5,
                background: "#e8eaf0",
                borderRadius: 1,
                overflow: "hidden",
                position: "relative",
              }}>
                {/* Written content fill */}
                {showLines && i < 7 && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: i % 3 === 0
                      ? "linear-gradient(to right, #6c63ff, #8b83ff)"
                      : i % 3 === 1
                      ? "linear-gradient(to right, #1a4fa8, #4878d4)"
                      : "linear-gradient(to right, #48b9f8, #7dd4fc)",
                    borderRadius: 1,
                    transformOrigin: "left",
                    animation: `writeLine 0.4s ease forwards`,
                    animationDelay: `${i * 0.07}s`,
                    transform: "scaleX(0)",
                    width: `${50 + (i * 7) % 45}%`,
                  }}/>
                )}
              </div>
            </div>
          ))}

          {/* Rupee symbol */}
          {showLines && (
            <div style={{
              position: "absolute", bottom: 12, right: 12,
              fontSize: 22, color: "#6c63ff", fontWeight: 800,
              opacity: 0,
              animation: "fadeInScale 0.4s ease 0.6s forwards",
            }}>₹</div>
          )}
        </div>

        {/* Page curl shadow */}
        {isOpen && (
          <div style={{
            position: "absolute", right: -6, top: "10%", bottom: "10%",
            width: 6,
            background: "linear-gradient(to right, rgba(0,0,0,0.12), transparent)",
            borderRadius: "0 4px 4px 0",
          }}/>
        )}

        {/* Pencil writing animation */}
        {showLines && (
          <div style={{
            position: "absolute",
            right: -20, top: 20,
            fontSize: 24,
            transform: "rotate(45deg)",
            animation: "pencilWrite 1.2s ease forwards",
            opacity: 0,
          }}>✏️</div>
        )}
      </div>

      {/* ── BRAND ── */}
      <div style={{
        textAlign: "center",
        transform: showBrand ? "translateY(0)" : "translateY(24px)",
        opacity: showBrand ? 1 : 0,
        transition: "all 0.7s cubic-bezier(0.34,1.4,0.64,1)",
      }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "2rem", fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-0.03em",
          margin: "0 0 6px",
          lineHeight: 1,
        }}>
          Smart Khatabook
        </h1>

        <p style={{
          color: "#6c63ff",
          fontSize: "0.72rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 700,
          margin: "0 0 20px",
        }}>
          Track · Manage · Profit
        </p>

        {/* Loading bar */}
        <div style={{
          width: 140, height: 3,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 10,
          margin: "0 auto",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(to right, #6c63ff, #48b9f8)",
            borderRadius: 10,
            animation: "loadBar 1.5s ease forwards",
            transform: "scaleX(0)",
            transformOrigin: "left",
          }}/>
        </div>
      </div>

    </div>
  );
}