import { useState } from "react";
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

export default function Sidebar({
  role = "Retailer",
}) {
  const [collapsed, setCollapsed] =
    useState(false);

  const isWholesaler =
    role === "Wholesaler";

  const menu = isWholesaler
    ? [
        {
          icon: <FiGrid />,
          name: "Overview",
        },
        {
          icon: <FiBox />,
          name: "Stock",
        },
        {
          icon: <FiUsers />,
          name: "Employees",
        },
        {
          icon: <FiFileText />,
          name: "Orders",
        },
        {
          icon: <FiStar />,
          name: "Reviews",
        },
      ]
    : [
        {
          icon: <FiGrid />,
          name: "Overview",
        },
        {
          icon: <FiBox />,
          name: "Stock",
        },
        {
          icon: <FiUsers />,
          name: "Customers",
        },
        {
          icon: <FiFileText />,
          name: "Ledger",
        },
        {
          icon: <FiStar />,
          name: "Reports",
        },
      ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <aside
      className={`sidebar ${
        collapsed
          ? "collapsed"
          : ""
      }`}
    >

      {/* HEADER */}
      <div>

        <div className="side-header">

          <div className="brand-row">

            <img
              src="/icons.svg"
              alt="logo"
              className="side-logo"
            />

            {!collapsed && (
              <div>
                <h2 className="brand">
                  Smart Khata
                </h2>

                <span className="role-badge">
                  {role}
                </span>
              </div>
            )}

          </div>

          <button
            className="toggle-btn"
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
          >
            {collapsed ? (
              <FiMenu />
            ) : (
              <FiChevronLeft />
            )}
          </button>

        </div>

        {/* MENU */}
        <div className="menu-wrap">
          {menu.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                className={`menu-item ${
                  index === 0
                    ? "active"
                    : ""
                }`}
              >
                <span className="menu-icon">
                  {item.icon}
                </span>

                {!collapsed && (
                  <p>
                    {item.name}
                  </p>
                )}
              </div>
            )
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div
        className="logout-btn"
        onClick={handleLogout}
      >
        <span className="menu-icon">
          <FiLogOut />
        </span>

        {!collapsed && (
          <p>Logout</p>
        )}
      </div>

    </aside>
  );
}