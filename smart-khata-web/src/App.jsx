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
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Ledger from "./pages/Ledger.jsx";
import Billing from "./pages/Billing.jsx";
import Report from "./pages/Report.jsx"; 

import OnboardingTour from "./components/OnboardingTour";
import ChatBot from "./components/ChatBot";
import { getStoredUser } from "./utils/session";

// ✅ Customer Portal
import CustomerLayout from "./components/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProducts from "./pages/customer/CustomerProducts";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerBills from "./pages/customer/CustomerBills";

function ProtectedRoute({ children }) {
  const user = getStoredUser();
  const token = localStorage.getItem("token");

  if (!token || !user._id || !user.role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  const [showSplash, setShowSplash] = useState(true);
  const [splashKey, setSplashKey] = useState(0);

  useEffect(() => {
    setSplashKey((k) => k + 1);
    setShowSplash(true);
  }, [location.pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && (
        <SplashScreen key={splashKey} onComplete={handleSplashComplete} />
      )}

      <Routes>
        {/* AUTH */}

        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* PROTECTED */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wholesalers/:category"
          element={
            <ProtectedRoute>
              <WholesalerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-detail"
          element={
            <ProtectedRoute>
              <EmployeeDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ledger"
          element={
            <ProtectedRoute>
              <Ledger />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />

        {/* ✅ REPORT */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        {/* TOUR */}

        <Route path="/tour" element={<OnboardingTour />} />

        {/* ✅ CUSTOMER PORTAL */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute>
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

        {/* FALLBACK */}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Floating rule-based assistant */}
      <ChatBot />
    </>
  );
}
