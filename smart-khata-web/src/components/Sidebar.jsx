import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiBarChart2,
  FiMessageSquare,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiUser,
  FiBookOpen,
  FiTruck,
  FiSettings,
} from "react-icons/fi";
import "./Sidebar.css";

const WHOLESALER_MENU = [
  { icon: <FiGrid />, name: "Overview", path: "/dashboard" },
  { icon: <FiBox />, name: "Stock", path: "/stock" },
  { icon: <FiUsers />, name: "Employees", path: "/employees" },
  { icon: <FiTruck />, name: "Orders", path: "/orders" },
  { icon: <FiBookOpen />, name: "Ledger", path: "/ledger" },
  { icon: <FiMessageSquare />, name: "Reviews", path: "/reviews" },
];

const RETAILER_MENU = [
  { icon: <FiGrid />, name: "Overview", path: "/dashboard" },
  { icon: <FiBox />, name: "Stock", path: "/stock" },
  { icon: <FiUsers />, name: "Customers", path: "/customers" },
  { icon: <FiUsers />, name: "Employees", path: "/employees" },
  { icon: <FiTruck />, name: "Orders", path: "/orders" },
  { icon: <FiBookOpen />, name: "Ledger", path: "/ledger" },
  { icon: <FiBarChart2 />, name: "Reports", path: "/reports" },
  { icon: <FiMessageSquare />, name: "Reviews", path: "/reviews" },
];

// Safe JSON parse — a corrupted or missing "user" entry no longer crashes the sidebar.
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function Tooltip({ label, children, visible }) {
  if (!visible) return children;
  return (
    <div className="sb-tooltip-wrap">
      {children}
      <span className="sb-tooltip">{label}</span>
    </div>
  );
}

// Wraps any clickable div as a real, keyboard-operable control without
// changing its markup/classes — Enter and Space both activate it.
function Clickable({ as: Tag = "div", onClick, className, children, ...rest }) {
  return (
    <Tag
      className={className}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const COLLAPSED_KEY = "skb_sidebar_collapsed";
const THEME_KEY = "skb_theme";

export default function Sidebar() {
  const user = getStoredUser();
  const role = user.role || "Retailer";
  const userName = user.name || user.fullName || "User";

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "true",
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(THEME_KEY) === "dark",
  );
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const menu = role === "Wholesaler" ? WHOLESALER_MENU : RETAILER_MENU;

  // Persist collapsed state.
  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  // Persist + actually apply theme app-wide via a root attribute, so any
  // global CSS keyed on [data-theme="dark"] picks it up — not just the sidebar.
  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  // Close the profile dropdown on outside click.
  useEffect(() => {
    if (!showProfile) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  // Only clear auth-related state — preserves unrelated preferences like
  // the chatbot's saved language and "tour seen" flag.
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/");
  };

  const initials =
    userName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <aside
      className={`sb-sidebar ${collapsed ? "sb-collapsed" : ""} ${darkMode ? "sb-dark" : "sb-light"}`}
    >
      {/* ── HEADER ── */}
      <div className="sb-header">
        <div className="sb-brand">
          <div className="sb-brand-icon">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="sb-brand-text">
              <span className="sb-brand-name">Smart Khatabook</span>
              <span className="sb-role-badge">{role}</span>
            </div>
          )}
        </div>
        <button
          className="sb-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiMenu size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      <div className="sb-divider" />

      {/* ── MENU ── */}
      <div className="sb-scroll">
        {!collapsed && <p className="sb-section-label">Main Menu</p>}
        <nav className="sb-nav">
          {menu.map((item, i) => {
            const active = location.pathname === item.path;
            return (
              <Tooltip key={i} label={item.name} visible={collapsed}>
                <Clickable
                  className={`sb-item ${active ? "sb-item-active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.name : undefined}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.name}
                >
                  {active && <span className="sb-active-bar" />}
                  <span className="sb-item-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="sb-item-label">{item.name}</span>
                  )}
                </Clickable>
              </Tooltip>
            );
          })}
        </nav>
      </div>

      {/* ── BOTTOM ── */}
      <div className="sb-bottom">
        <div className="sb-divider" />

        {/* Dark mode */}
        <Tooltip
          label={darkMode ? "Light mode" : "Dark mode"}
          visible={collapsed}
        >
          <Clickable
            className="sb-item sb-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-pressed={darkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <span className="sb-item-icon">
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </span>
            {!collapsed && (
              <span className="sb-item-label">
                {darkMode ? "Light mode" : "Dark mode"}
              </span>
            )}
          </Clickable>
        </Tooltip>

        {/* Profile */}
        <div className="sb-profile-wrap" ref={profileRef}>
          {showProfile && !collapsed && (
            <div className="sb-dropdown" role="menu">
              <Clickable
                className="sb-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/profile");
                }}
              >
                <FiUser size={13} /> View profile
              </Clickable>
              <Clickable
                className="sb-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
              >
                <FiSettings size={13} /> Settings
              </Clickable>
              <div className="sb-dropdown-divider" />
              <Clickable
                className="sb-dropdown-item sb-dropdown-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                <FiLogOut size={13} /> Logout
              </Clickable>
            </div>
          )}

          <Tooltip label={userName} visible={collapsed}>
            <Clickable
              className={`sb-profile ${showProfile ? "sb-profile-open" : ""}`}
              onClick={() => setShowProfile(!showProfile)}
              aria-haspopup="menu"
              aria-expanded={showProfile}
              aria-label={`${userName}, account menu`}
            >
              <div className="sb-avatar">{initials}</div>
              {!collapsed && (
                <>
                  <div className="sb-profile-text">
                    <span className="sb-profile-name">{userName}</span>
                    <span className="sb-profile-role">{role}</span>
                  </div>
                  <FiChevronDown
                    size={13}
                    className={`sb-chevron ${showProfile ? "sb-chevron-up" : ""}`}
                  />
                </>
              )}
            </Clickable>
          </Tooltip>
        </div>

        {/* Collapsed logout shortcut */}
        {collapsed && (
          <Tooltip label="Logout" visible={true}>
            <Clickable
              className="sb-item sb-logout-icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <span className="sb-item-icon">
                <FiLogOut size={16} />
              </span>
            </Clickable>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
