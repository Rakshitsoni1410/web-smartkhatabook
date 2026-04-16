import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
import "./Dashboard.css";

export default function Orders() {
  const navigate =
    useNavigate();

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    ) || {};

  const [orders, setOrders] =
    useState([]);

  useEffect(() => {
    fetchOrders();

    const timer =
      setInterval(
        fetchOrders,
        5000
      );

    return () =>
      clearInterval(
        timer
      );
  }, []);

  const fetchOrders =
    async () => {
      try {
        const role =
          user.role
            ?.trim()
            .toLowerCase();

        const url =
          role ===
          "wholesaler"
            ? `http://localhost:4000/api/orders/wholesaler/${user._id}`
            : `http://localhost:4000/api/orders/retailer/${user._id}`;

        const res =
          await axios.get(
            url
          );

        setOrders(
          res.data || []
        );
      } catch (error) {
        console.log(
          error
        );
      }
    };

  const badgeColor = (
    status
  ) => {
    if (
      status ===
      "pending"
    )
      return "#f59e0b";

    if (
      status ===
      "approved"
    )
      return "#3b82f6";

    if (
      status ===
      "onTheWay"
    )
      return "#f97316";

    if (
      status ===
      "delivered"
    )
      return "#16a34a";

    if (
      status ===
      "rejected"
    )
      return "#ef4444";

    return "#6b7280";
  };

  return (
    <div className="dashboard-main">

      {/* Topbar */}
      <div className="topbar">

        <div
          style={{
            display:
              "flex",
            gap: "12px",
            alignItems:
              "center",
          }}
        >
          <button
            className="back-btn"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            <FiArrowLeft />
          </button>

          <h2>
            Orders
          </h2>
        </div>

        <button
          className="add-btn"
          onClick={
            fetchOrders
          }
        >
          <FiRefreshCw />
          Refresh
        </button>

      </div>

      {/* Empty */}
      {orders.length ===
        0 && (
        <div
          className="focus-card"
          style={{
            textAlign:
              "center",
          }}
        >
          <h3>
            No Orders
            Found
          </h3>

          <p>
            Place an
            order from
            stock page.
          </p>
        </div>
      )}

      {/* Orders */}
      <div className="stats-grid">

        {orders.map(
          (item) => (
            <div
              key={
                item._id
              }
              className="stat-card"
              onClick={() =>
                navigate(
                  `/order/${item._id}`
                )
              }
              style={{
                cursor:
                  "pointer",
              }}
            >

              <h3>
                {
                  item.productName
                }
              </h3>

              <p>
                Qty:{" "}
                {
                  item.quantity
                }
              </p>

              <p>
                ₹
                {
                  item.totalAmount
                }
              </p>

              <span
                style={{
                  marginTop:
                    "12px",
                  display:
                    "inline-block",
                  padding:
                    "6px 12px",
                  borderRadius:
                    "12px",
                  background:
                    badgeColor(
                      item.orderStatus
                    ),
                  color:
                    "white",
                  fontSize:
                    "13px",
                  fontWeight:
                    "600",
                }}
              >
                {
                  item.orderStatus
                }
              </span>

            </div>
          )
        )}

      </div>

    </div>
  );
}