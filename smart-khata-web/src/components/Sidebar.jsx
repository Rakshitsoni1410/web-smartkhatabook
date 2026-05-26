import { useState } from "react";
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

function Tooltip({ label, children, visible }) {
  if (!visible) return children;
  return (
    <div className="sb-tooltip-wrap">
      {children}
      <span className="sb-tooltip">{label}</span>
    </div>
  );
}

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role || "Retailer";
  const userName = user.name || user.fullName || "User";

  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const menu = role === "Wholesaler" ? WHOLESALER_MENU : RETAILER_MENU;

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
          aria-label="Toggle sidebar"
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
                <div
                  className={`sb-item ${active ? "sb-item-active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.name : undefined}
                >
                  {active && <span className="sb-active-bar" />}
                  <span className="sb-item-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="sb-item-label">{item.name}</span>
                  )}
                </div>
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
          <div
            className="sb-item sb-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span className="sb-item-icon">
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </span>
            {!collapsed && (
              <span className="sb-item-label">
                {darkMode ? "Light mode" : "Dark mode"}
              </span>
            )}
          </div>
        </Tooltip>

        {/* Profile */}
        <div className="sb-profile-wrap">
          {showProfile && !collapsed && (
            <div className="sb-dropdown">
              <div
                className="sb-dropdown-item"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/profile");
                }}
              >
                <FiUser size={13} /> View profile
              </div>
              <div
                className="sb-dropdown-item"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
              >
                <FiSettings size={13} /> Settings
              </div>
              <div className="sb-dropdown-divider" />
              <div
                className="sb-dropdown-item sb-dropdown-logout"
                onClick={handleLogout}
              >
                <FiLogOut size={13} /> Logout
              </div>
            </div>
          )}

          <Tooltip label={userName} visible={collapsed}>
            <div
              className={`sb-profile ${showProfile ? "sb-profile-open" : ""}`}
              onClick={() => setShowProfile(!showProfile)}
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
            </div>
          </Tooltip>
        </div>

        {/* Collapsed logout shortcut */}
        {collapsed && (
          <Tooltip label="Logout" visible={true}>
            <div className="sb-item sb-logout-icon" onClick={handleLogout}>
              <span className="sb-item-icon">
                <FiLogOut size={16} />
              </span>
            </div>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
