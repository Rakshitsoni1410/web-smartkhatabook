import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import CustomerSidebar from "./CustomerSidebar";

const CustomerLayout = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read logged-in user safely
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to read customer user:", error);
      return null;
    }
  };

  const user = getStoredUser();

  const customerName =
    user?.name ||
    user?.fullName ||
    "Customer";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/", {
      replace: true,
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =========================================
          DESKTOP SIDEBAR
      ========================================= */}

      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 shadow-sm z-30">
        <CustomerSidebar />
      </aside>

      {/* =========================================
          MOBILE SIDEBAR
      ========================================= */}

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="absolute inset-0 w-full h-full bg-black/40"
          />

          {/* Sidebar */}
          <div className="relative w-72 max-w-[85%] h-full bg-white shadow-2xl">
            <CustomerSidebar onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* =========================================
            HEADER
        ========================================= */}

        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
            {/* Left */}

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                <FaBars />
              </button>

              <div>
                <p className="text-xs text-gray-400">
                  Customer Portal
                </p>

                <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                  SmartKhata
                </h2>
              </div>
            </div>

            {/* Right */}

            <div className="flex items-center gap-3">
              {/* User Info */}

              <div className="hidden sm:flex items-center gap-2">
                <FaUserCircle className="text-2xl text-indigo-500" />

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    {customerName}
                  </p>

                  <p className="text-xs text-gray-400">
                    Customer
                  </p>
                </div>
              </div>

              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
              >
                <FaSignOutAlt />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* =========================================
            PAGE CONTENT
        ========================================= */}

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>

        {/* =========================================
            MOBILE FOOTER
        ========================================= */}

        <footer className="lg:hidden px-4 py-4 text-center border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400">
            SmartKhataBooks © 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CustomerLayout;