import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid, FiBox, FiUsers, FiFileText, FiLogOut, FiMenu,
  FiChevronLeft, FiBarChart2, FiMessageSquare, FiChevronDown,
  FiSun, FiMoon,
} from "react-icons/fi";

const WHOLESALER_MENU = [
  { icon: <FiGrid />,         name: "Overview",  path: "/dashboard", color: "#6366f1" },
  { icon: <FiBox />,          name: "Stock",     path: "/stock",     color: "#f59e0b" },
  { icon: <FiUsers />,        name: "Employees", path: "/employees", color: "#22c55e" },
  { icon: <FiFileText />,     name: "Orders",    path: "/orders",    color: "#0ea5e9" },
  { icon: <FiMessageSquare />,name: "Reviews",   path: "/reviews",   color: "#ec4899" },
];

const RETAILER_MENU = [
  { icon: <FiGrid />,         name: "Overview",   path: "/dashboard", color: "#6366f1" },
  { icon: <FiBox />,          name: "Stock",      path: "/stock",     color: "#f59e0b" },
  { icon: <FiUsers />,        name: "Customers",  path: "/customers", color: "#8b5cf6" },
  { icon: <FiUsers />,        name: "Employees",  path: "/employees", color: "#22c55e" },
  { icon: <FiFileText />,     name: "Orders",     path: "/orders",    color: "#0ea5e9" },
  { icon: <FiFileText />,     name: "Ledger",     path: "/ledger",    color: "#f97316" },
  { icon: <FiBarChart2 />,    name: "Reports",    path: "/reports",   color: "#14b8a6" },
  { icon: <FiMessageSquare />,name: "Reviews",    path: "/reviews",   color: "#ec4899" },
];

function Tooltip({ label, children }) {
  return (
    <div style={{ position: "relative", display: "flex" }} className="tooltip-wrap">
      {children}
      <span className="tooltip-label">{label}</span>
    </div>
  );
}

export default function Sidebar() {
  // ✅ Read everything from localStorage — no hardcoded props
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "Retailer";
  const userName = user.name || user.fullName || "User";

  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menu = role === "Wholesaler" ? WHOLESALER_MENU : RETAILER_MENU;

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  // Initials from name only — no email
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const t = darkMode ? DARK : LIGHT;

  return (
    <>
      <style>{`
        .sk-sidebar *{box-sizing:border-box;margin:0;padding:0}
        .sk-sidebar{
          display:flex;flex-direction:column;justify-content:space-between;
          height:100vh;position:sticky;top:0;
          transition:width .25s cubic-bezier(.4,0,.2,1);
          overflow:hidden;flex-shrink:0;
          font-family:'Inter','Segoe UI',sans-serif;
        }
        .sk-sidebar.open{width:240px}
        .sk-sidebar.closed{width:68px}

        .sk-header{display:flex;align-items:center;justify-content:space-between;padding:18px 14px 14px}
        .sk-brand-row{display:flex;align-items:center;gap:10px;overflow:hidden}
        .sk-logo{width:34px;height:34px;border-radius:10px;object-fit:cover;flex-shrink:0}
        .sk-brand-text h2{font-size:15px;font-weight:700;white-space:nowrap;letter-spacing:-.3px}
        .sk-brand-text span{font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;white-space:nowrap}
        .sk-toggle{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;transition:background .15s}

        .sk-divider{height:1px;margin:0 14px 10px}
        .sk-section-label{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;
          padding:6px 16px 4px;white-space:nowrap;overflow:hidden}

        .sk-menu{padding:0 10px;display:flex;flex-direction:column;gap:3px}
        .sk-item{display:flex;align-items:center;gap:11px;padding:10px 10px;border-radius:10px;
          cursor:pointer;transition:all .15s;position:relative;user-select:none}
        .sk-item:hover{transform:translateX(2px)}
        .sk-item.active{font-weight:600}
        .sk-item-icon{font-size:17px;flex-shrink:0;display:flex;align-items:center}
        .sk-item-label{font-size:13px;white-space:nowrap;overflow:hidden}
        .sk-active-bar{position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 3px 3px 0}

        .tooltip-wrap{position:relative}
        .tooltip-label{
          position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);
          background:#1e293b;color:#f1f5f9;font-size:11px;font-weight:500;
          padding:5px 10px;border-radius:7px;white-space:nowrap;pointer-events:none;
          opacity:0;transition:opacity .15s;z-index:999;
        }
        .tooltip-label::before{content:'';position:absolute;right:100%;top:50%;transform:translateY(-50%);
          border:5px solid transparent;border-right-color:#1e293b}
        .tooltip-wrap:hover .tooltip-label{opacity:1}

        .sk-profile-btn{display:flex;align-items:center;gap:10px;padding:10px 12px;
          cursor:pointer;border-radius:10px;transition:background .15s;position:relative;margin:0 10px}
        .sk-avatar{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;
          justify-content:center;font-size:13px;font-weight:700;flex-shrink:0}
        .sk-profile-info{overflow:hidden}
        .sk-profile-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sk-profile-role{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sk-profile-dropdown{
          position:absolute;bottom:calc(100% + 6px);left:10px;right:10px;
          border-radius:12px;border:1px solid;overflow:hidden;z-index:100;
          box-shadow:0 10px 40px rgba(0,0,0,.2);
        }
        .sk-dropdown-item{display:flex;align-items:center;gap:10px;padding:11px 14px;
          font-size:13px;cursor:pointer;transition:background .12s}

        .sk-logout{display:flex;align-items:center;gap:11px;padding:10px 10px;border-radius:10px;
          cursor:pointer;font-size:13px;transition:all .15s;margin:0 10px 14px}

        .sk-bottom{display:flex;flex-direction:column;gap:4px}
        .sk-scroll{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:8px}
        .sk-scroll::-webkit-scrollbar{width:3px}
        .sk-scroll::-webkit-scrollbar-thumb{border-radius:3px;background:#334155}
      `}</style>

      <aside
        className={`sk-sidebar ${collapsed ? "closed" : "open"}`}
        style={{ background: t.bg, color: t.text, borderRight: `1px solid ${t.border}` }}
      >
        {/* HEADER */}
        <div>
          <div className="sk-header">
            <div className="sk-brand-row">
              {/* ✅ Logo from public folder */}
              <img src="/logo.png" alt="logo" className="sk-logo" />
              {!collapsed && (
                <div className="sk-brand-text">
                  <h2 style={{ color: t.text }}>Smart Khata</h2>
                  <span style={{ background: t.badgeBg, color: t.badgeText }}>{role}</span>
                </div>
              )}
            </div>
            <button
              className="sk-toggle"
              style={{ background: t.toggleBg, color: t.textMuted }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <FiMenu /> : <FiChevronLeft />}
            </button>
          </div>

          <div className="sk-divider" style={{ background: t.border }} />

          {/* MENU */}
          <div className="sk-scroll">
            {!collapsed && (
              <div className="sk-section-label" style={{ color: t.textMuted }}>
                Main Menu
              </div>
            )}
            <div className="sk-menu">
              {menu.map((item, i) => {
                const active = location.pathname === item.path;
                const itemEl = (
                  <div
                    key={i}
                    className={`sk-item ${active ? "active" : ""}`}
                    style={{
                      background: active ? t.activeBg : "transparent",
                      color: active ? item.color : t.textMuted,
                    }}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = t.hoverBg; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    {active && (
                      <div className="sk-active-bar" style={{ background: item.color }} />
                    )}
                    <span className="sk-item-icon" style={{ color: active ? item.color : t.textMuted }}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="sk-item-label">{item.name}</span>}
                  </div>
                );
                return collapsed ? (
                  <Tooltip key={i} label={item.name}>{itemEl}</Tooltip>
                ) : itemEl;
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="sk-bottom">
          <div className="sk-divider" style={{ background: t.border, margin: "0 14px 8px" }} />

          {/* Dark mode toggle */}
          {collapsed ? (
            <Tooltip label={darkMode ? "Light Mode" : "Dark Mode"}>
              <div
                className="sk-item"
                style={{ margin: "0 10px", color: t.textMuted }}
                onClick={() => setDarkMode(!darkMode)}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="sk-item-icon">{darkMode ? <FiSun /> : <FiMoon />}</span>
              </div>
            </Tooltip>
          ) : (
            <div
              className="sk-item"
              style={{ margin: "0 10px", color: t.textMuted }}
              onClick={() => setDarkMode(!darkMode)}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span className="sk-item-icon">{darkMode ? <FiSun /> : <FiMoon />}</span>
              {!collapsed && (
                <span className="sk-item-label">{darkMode ? "Light Mode" : "Dark Mode"}</span>
              )}
            </div>
          )}

          {/* Profile */}
          <div style={{ position: "relative" }}>
            {showProfile && !collapsed && (
              <div
                className="sk-profile-dropdown"
                style={{ background: t.dropdownBg, borderColor: t.border }}
              >
                <div
                  className="sk-dropdown-item"
                  style={{ color: t.text }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => { setShowProfile(false); navigate("/profile"); }}
                >
                  <FiUsers size={14} /> View Profile
                </div>
                <div className="sk-divider" style={{ background: t.border, margin: "0" }} />
                <div
                  className="sk-dropdown-item"
                  style={{ color: "#ef4444" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#ef444415")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={handleLogout}
                >
                  <FiLogOut size={14} /> Logout
                </div>
              </div>
            )}

            {collapsed ? (
              <Tooltip label={userName}>
                <div
                  className="sk-profile-btn"
                  onClick={() => setShowProfile(!showProfile)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="sk-avatar" style={{ background: t.avatarBg, color: t.avatarText }}>
                    {initials}
                  </div>
                </div>
              </Tooltip>
            ) : (
              <div
                className="sk-profile-btn"
                onClick={() => setShowProfile(!showProfile)}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="sk-avatar" style={{ background: t.avatarBg, color: t.avatarText }}>
                  {initials}
                </div>
                <div className="sk-profile-info">
                  {/* ✅ Name from localStorage only — no email shown */}
                  <div className="sk-profile-name" style={{ color: t.text }}>{userName}</div>
                  <div className="sk-profile-role" style={{ color: t.textMuted }}>{role}</div>
                </div>
                <FiChevronDown
                  size={13}
                  style={{
                    color: t.textMuted,
                    marginLeft: "auto",
                    transform: showProfile ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .2s",
                    flexShrink: 0,
                  }}
                />
              </div>
            )}
          </div>

          {/* Logout shortcut when collapsed */}
          {collapsed && (
            <Tooltip label="Logout">
              <div
                className="sk-logout"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ef444415")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={handleLogout}
              >
                <span className="sk-item-icon"><FiLogOut /></span>
              </div>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
}

const DARK = {
  bg: "#0f172a",
  text: "#f1f5f9",
  textMuted: "#64748b",
  border: "#1e293b",
  hoverBg: "#1e293b",
  activeBg: "#1e293b",
  toggleBg: "#1e293b",
  badgeBg: "#1e293b",
  badgeText: "#94a3b8",
  avatarBg: "#6366f1",
  avatarText: "#fff",
  dropdownBg: "#0f172a",
};

const LIGHT = {
  bg: "#ffffff",
  text: "#0f172a",
  textMuted: "#94a3b8",
  border: "#f1f5f9",
  hoverBg: "#f8fafc",
  activeBg: "#f1f5f9",
  toggleBg: "#f1f5f9",
  badgeBg: "#eff6ff",
  badgeText: "#3b82f6",
  avatarBg: "#6366f1",
  avatarText: "#fff",
  dropdownBg: "#ffffff",
};