import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiUsers,
  FiFileText,
  FiStar,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
} from "react-icons/fi";

export default function Sidebar({ role = "Retailer" }) {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  const isWholesaler = role === "Wholesaler";

  const menu = isWholesaler
    ? [
        {
          icon: <FiGrid />,
          name: "Overview",
          path: "/dashboard",
        },
        {
          icon: <FiBox />,
          name: "Stock",
          path: "/stock",
        },
        {
          icon: <FiUsers />,
          name: "Employees",
          path: "/employees",
        },
        {
          icon: <FiFileText />,
          name: "Orders",
          path: "/orders",
        },
        {
          icon: <FiStar />,
          name: "Reviews",
          path: "/reviews",
        },
      ]
    : [
        {
          icon: <FiGrid />,
          name: "Overview",
          path: "/dashboard",
        },
        {
          icon: <FiBox />,
          name: "Stock",
          path: "/stock",
        },
        {
          icon: <FiUsers />,
          name: "Customers",
          path: "/customers",
        },
        {
          icon: <FiFileText />,
          name: "Orders",
          path: "/orders",
        },
        {
          icon: <FiFileText />,
          name: "Ledger",
          path: "/ledger",
        },
        {
          icon: <FiStar />,
          name: "Reports",
          path: "/reports",
        },
        {
          icon: <FiStar />,
          name: "Reviews",
          path: "/reviews",
        },
      ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div>
        <div className="side-header">
          <div className="brand-row">
            <img src="/icons.svg" alt="logo" className="side-logo" />

            {!collapsed && (
              <div>
                <h2 className="brand">Smart Khata</h2>

                <span className="role-badge">{role}</span>
              </div>
            )}
          </div>

          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <FiMenu /> : <FiChevronLeft />}
          </button>
        </div>

        {/* MENU */}
        <div className="menu-wrap">
          {menu.map((item, index) => (
            <div
              key={index}
              className={`menu-item ${index === 0 ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>

              {!collapsed && <p>{item.name}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="logout-btn" onClick={handleLogout}>
        <span className="menu-icon">
          <FiLogOut />
        </span>

        {!collapsed && <p>Logout</p>}
      </div>
    </aside>
  );
}
