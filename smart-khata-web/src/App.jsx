import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SplashScreen from "./components/SplashScreen";
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

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  if (!user) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show once per browser session
    return !sessionStorage.getItem("skb-splash-seen");
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("skb-splash-seen", "true");
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
