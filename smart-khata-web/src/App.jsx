import { Routes, Route } from "react-router-dom";

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
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/stock" element={<Stock />} />

      <Route path="/wholesalers/:category" element={<WholesalerDashboard />} />
      <Route path="/employees" element={<Employee />} />
      <Route path="/employee-detail" element={<EmployeeDetail />} />
      {/* Orders */}
      <Route path="/orders" element={<Orders />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>
      <Route path="/order/:id" element={<OrderDetails />} />
      <Route path="/reviews" element={<Reviews />} />
    </Routes>
  );
}
