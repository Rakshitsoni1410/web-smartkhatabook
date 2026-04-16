import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiPhone,
  FiMapPin,
  FiShoppingCart,
} from "react-icons/fi";

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";
import "./Dashboard.css";

export default function WholesalerDashboard() {
  const navigate = useNavigate();
  const { category } = useParams();

  const [list, setList] =
    useState([]);

  const [toast, setToast] =
    useState("");

  useEffect(() => {
    fetchWholesalers();
  }, []);

  const fetchWholesalers =
    async () => {
      try {
        const res =
          await axios.get(
            `http://localhost:4000/api/user/wholesalers/${category}`
          );

        setList(
          res.data.users
        );
      } catch (error) {
        console.log(error);
      }
    };

  const handleOrder = (
    shop
  ) => {
    setToast(
      `Order request sent to ${shop}`
    );

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  return (
    <div className="dashboard-main">

      {/* Toast */}
      {toast && (
        <div
          style={{
            position:
              "fixed",
            top: "20px",
            right: "20px",
            background:
              "#16a34a",
            color:
              "white",
            padding:
              "12px 18px",
            borderRadius:
              "12px",
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}

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
                "/stock"
              )
            }
          >
            <FiArrowLeft />
          </button>

          <h2>
            {category} Suppliers
          </h2>
        </div>

        <p>
          Verified wholesalers
        </p>

      </div>

      {/* Banner */}
      <div className="welcome-card">

        <h2>
          Need Extra Stock?
        </h2>

        <p>
          You can order in
          advance for sales,
          festivals or demand.
        </p>

        <span>
          Smart restocking
          for your business
        </span>

      </div>

      {/* Cards */}
      <div className="stats-grid">

        {list.map(
          (item) => (
            <div
              className="stat-card"
              key={
                item._id
              }
            >

              <h3>
                {
                  item.shopName
                }
              </h3>

              <p>
                Owner:{" "}
                {
                  item.name
                }
              </p>

              <p
                style={{
                  marginTop:
                    "8px",
                }}
              >
                <FiPhone />{" "}
                {
                  item.phone
                }
              </p>

              <p
                style={{
                  marginTop:
                    "8px",
                }}
              >
                <FiMapPin />{" "}
                {
                  item.address
                }
              </p>

              <button
                onClick={() =>
                  handleOrder(
                    item.shopName
                  )
                }
                style={{
                  marginTop:
                    "16px",
                  width:
                    "100%",
                  border:
                    "none",
                  padding:
                    "12px",
                  borderRadius:
                    "12px",
                  background:
                    "linear-gradient(135deg,#7c3aed,#6366f1)",
                  color:
                    "white",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                }}
              >
                <FiShoppingCart />{" "}
                Order Now
              </button>

            </div>
          )
        )}

      </div>

    </div>
  );
}