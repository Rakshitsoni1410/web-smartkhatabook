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
} from "react-icons/fi";

import logo from "../assets/hero.png";

export default function Sidebar({ role = "Retailer" }) {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
          icon: <FiMessageSquare />,
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
          icon: <FiFileText />,
          name: "Ledger",
          path: "/ledger",
        },
        {
          icon: <FiBarChart2 />,
          name: "Reports",
          path: "/reports",
        },
        {
          icon: <FiMessageSquare />,
          name: "Reviews",
          path: "/reviews",
        },
      ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate("/");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div>
        {/* HEADER */}
        <div className="side-header">
          <div className="brand-row">
            <img src={logo} alt="logo" className="side-logo" />

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
              title={item.name}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>

              {!collapsed && <p>{item.name}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div>
        {!collapsed && (
          <div className="user-profile">
            <div className="user-avatar">R</div>
          </div>
        )}

        <div className="logout-btn" onClick={handleLogout}>
          <span className="menu-icon">
            <FiLogOut />
          </span>

          {!collapsed && <p>Logout</p>}
        </div>
      </div>
    </aside>
  );
}
