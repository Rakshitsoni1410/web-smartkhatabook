import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Stock from "./pages/Stock";
import WholesalerDashboard from "./pages/WholesalerDashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

export default function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/stock"
        element={<Stock />}
      />

      <Route
        path="/wholesalers/:category"
        element={
          <WholesalerDashboard />
        }
      />

      {/* Orders */}
      <Route
        path="/orders"
        element={<Orders />}
      />

      <Route
        path="/order/:id"
        element={
          <OrderDetails />
        }
      />

    </Routes>
  );
}