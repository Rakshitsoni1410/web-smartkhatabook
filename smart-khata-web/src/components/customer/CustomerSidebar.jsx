import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaTimes,
} from "react-icons/fa";

const navItems = [
  { to: "/customer/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
  { to: "/customer/products", icon: <FaBoxOpen />, label: "Browse Products" },
  { to: "/customer/orders", icon: <FaShoppingCart />, label: "My Orders" },
  { to: "/customer/bills", icon: <FaFileInvoiceDollar />, label: "My Bills" },
];

const CustomerSidebar = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SK</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">SmartKhata</p>
            <p className="text-xs text-indigo-500 font-medium">Customer</p>
          </div>
        </div>
        <button
          className="lg:hidden text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          SmartKhataBooks © 2025
        </p>
      </div>
    </div>
  );
};

export default CustomerSidebar;