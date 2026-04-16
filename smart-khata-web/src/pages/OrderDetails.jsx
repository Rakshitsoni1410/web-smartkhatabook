import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiCheckCircle, FiTruck, FiXCircle } from "react-icons/fi";
import "./Dashboard.css";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [order, setOrder] = useState(null);

  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const url =
        user.role === "Wholesaler"
          ? `http://localhost:4000/api/orders/wholesaler/${user._id}`
          : `http://localhost:4000/api/orders/retailer/${user._id}`;

      const res = await axios.get(url);

      const found = res.data.find((item) => item._id === id);

      setOrder(found);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (status) => {
    try {
      await axios.patch(`http://localhost:4000/api/orders/${id}/status`, {
        status,
      });

      setToast(`Order ${status}`);

      fetchOrder();

      setTimeout(() => {
        setToast("");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
 fetchOrders();

 const timer =
   setInterval(
     fetchOrders,
     5000
   );

 return () =>
   clearInterval(timer);
}, []);
  if (!order) return <div className="dashboard-main">Loading...</div>;

  return (
    <div className="dashboard-main">
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#16a34a",
            color: "white",
            padding: "12px 18px",
            borderRadius: "12px",
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}

      {/* Top */}
      <div className="topbar">
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <button className="back-btn" onClick={() => navigate("/orders")}>
            <FiArrowLeft />
          </button>

          <h2>Order Details</h2>
        </div>
      </div>

      {/* Card */}
      <div className="focus-card">
        <h2>{order.productName}</h2>

        <p>Quantity: {order.quantity}</p>

        <p>Price / Unit: ₹{order.pricePerUnit}</p>

        <p>Total: ₹{order.totalAmount}</p>

        <p>
          Payment:
          {order.paymentStatus}
        </p>

        <p>
          Status:
          {order.orderStatus}
        </p>
      </div>

      {/* Only Wholesaler can change */}
      {user.role === "Wholesaler" && (
        <div
          style={{
            marginTop: "25px",
            display: "grid",
            gap: "12px",
          }}
        >
          <button className="save-btn" onClick={() => updateStatus("approved")}>
            <FiCheckCircle /> Approve
          </button>

          <button className="save-btn" onClick={() => updateStatus("onTheWay")}>
            <FiTruck /> On The Way
          </button>

          <button
            className="save-btn"
            onClick={() => updateStatus("delivered")}
          >
            <FiCheckCircle /> Delivered
          </button>

          <button
            className="save-btn"
            onClick={() => updateStatus("rejected")}
            style={{
              background: "#ef4444",
            }}
          >
            <FiXCircle /> Reject
          </button>
        </div>
      )}
    </div>
  );
}
