import { useEffect, useState } from "react";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import SplashScreen from "./components/Splashscreen";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Stock from "./pages/Stock";
import WholesalerDashboard from "./pages/WholesalerDashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Reviews from "./pages/Reviews";
import Employee from "./pages/Employee";
import EmployeeDetail from "./pages/EmployeeDetail";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Ledger from "./pages/Ledger.jsx";
import Billing from "./pages/Billing.jsx";
import Report from "./pages/Report.jsx";

import OnboardingTour from "./components/OnboardingTour";
import ChatBot from "./components/ChatBot";

import { getStoredUser } from "./utils/session";

// =====================================================
// CUSTOMER PORTAL
// =====================================================

import CustomerLayout from "./components/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProducts from "./pages/customer/CustomerProducts";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerBills from "./pages/customer/CustomerBills";

// =====================================================
// ROLES
// =====================================================

const ROLES = {
  RETAILER: "retailer",
  WHOLESALER: "wholesaler",
  CUSTOMER: "customer",
};

// =====================================================
// TOKEN HELPERS
// =====================================================

function getToken() {
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function isTokenExpired(token) {
  if (!token) {
    return true;
  }

  try {
    const parts = token.split(".");

    /*
      JWT normally has:
      header.payload.signature

      If token is not JWT-shaped,
      leave validation to backend.
    */
    if (parts.length !== 3) {
      return false;
    }

    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");

    const decoded = JSON.parse(
      decodeURIComponent(
        Array.prototype.map
          .call(
            atob(padded),
            (char) => `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`,
          )
          .join(""),
      ),
    );

    if (!decoded?.exp) {
      return false;
    }

    return Date.now() >= decoded.exp * 1000;
  } catch {
    /*
      Do not assume malformed decoding
      means authenticated.

      Treat bad JWT as expired.
    */
    return true;
  }
}

// =====================================================
// SESSION HELPERS
// =====================================================

function getSession() {
  const user = getStoredUser?.() || null;

  const token = getToken();

  if (!token || !user?._id || !user?.role || isTokenExpired(token)) {
    return {
      authenticated: false,

      user: null,

      role: "",
    };
  }

  return {
    authenticated: true,

    user,

    role: String(user.role).trim().toLowerCase(),
  };
}

// =====================================================
// DEFAULT PAGE BY ROLE
// =====================================================

function getHomeForRole(role) {
  switch (String(role).trim().toLowerCase()) {
    case ROLES.CUSTOMER:
      return "/customer/dashboard";

    case ROLES.RETAILER:
    case ROLES.WHOLESALER:
      return "/dashboard";

    default:
      return "/";
  }
}

// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const session = getSession();

  // Not logged in
  if (!session.authenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
    Role protection.

    Example:
    Customer manually enters /stock
    -> redirected to customer dashboard.
  */
  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(session.role)
  ) {
    return <Navigate to={getHomeForRole(session.role)} replace />;
  }

  return children;
}

// =====================================================
// PUBLIC ONLY ROUTE
// =====================================================

function PublicOnlyRoute({ children }) {
  const session = getSession();

  /*
    Logged-in users should not manually
    go back to Login / Signup.
  */
  if (session.authenticated) {
    return <Navigate to={getHomeForRole(session.role)} replace />;
  }

  return children;
}

// =====================================================
// UNKNOWN ROUTE REDIRECT
// =====================================================

function UnknownRoute() {
  const session = getSession();

  if (!session.authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getHomeForRole(session.role)} replace />;
}

// =====================================================
// APP
// =====================================================

export default function App() {
  const location = useLocation();

  const [showSplash, setShowSplash] = useState(true);

  const [splashKey, setSplashKey] = useState(0);

  // =====================================================
  // SPLASH ON ROUTE CHANGE
  // =====================================================

  useEffect(() => {
    setSplashKey((key) => key + 1);

    setShowSplash(true);
  }, [location.pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {showSplash && (
        <SplashScreen key={splashKey} onComplete={handleSplashComplete} />
      )}

      <Routes>
        {/* =================================================
            PUBLIC AUTH ROUTES
        ================================================= */}

        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        {/* =================================================
            RETAILER + WHOLESALER DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            STOCK
        ================================================= */}

        <Route
          path="/stock"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Stock />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            WHOLESALER SEARCH / CATEGORY
        ================================================= */}

        <Route
          path="/wholesalers/:category"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER]}>
              <WholesalerDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            EMPLOYEES
        ================================================= */}

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Employee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-detail"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <EmployeeDetail />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ORDERS
        ================================================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            REVIEWS
        ================================================= */}

        <Route
          path="/reviews"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Reviews />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER, ROLES.CUSTOMER]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            LEDGER
        ================================================= */}

        <Route
          path="/ledger"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Ledger />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            BILLING
        ================================================= */}

        <Route
          path="/billing"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Billing />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            REPORT
        ================================================= */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER]}>
              <Report />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            TOUR
        ================================================= */}

        <Route
          path="/tour"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.RETAILER, ROLES.WHOLESALER, ROLES.CUSTOMER]}
            >
              <OnboardingTour />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CUSTOMER PORTAL
        ================================================= */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<CustomerDashboard />} />

          <Route path="products" element={<CustomerProducts />} />

          <Route path="orders" element={<CustomerOrders />} />

          <Route path="bills" element={<CustomerBills />} />
        </Route>

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route path="*" element={<UnknownRoute />} />
      </Routes>

      {/* =================================================
          CHATBOT
      ================================================= */}

      <ChatBot />
    </>
  );
}
