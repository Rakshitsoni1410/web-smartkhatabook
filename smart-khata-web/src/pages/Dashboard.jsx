import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  const user =
    JSON.parse(
      localStorage.getItem("user")
    ) || {};

  const [stats, setStats] =
    useState({
      stock: 0,
      employees: 0,
      orders: 0,
      reviews: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard =
    async () => {
      try {
        const res =
          await axios.get(
            `http://localhost:4000/api/dashboard/${user.role}?userId=${user._id}`
          );

        setStats(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  const cards = [
    {
      title: "Stock Items",
      value: stats.stock,
    },
    {
      title: "Employees",
      value: stats.employees,
    },
    {
      title: "Orders",
      value: stats.orders,
    },
    {
      title: "Reviews",
      value: stats.reviews,
    },
  ];

  return (
    <div className="dashboard-layout">

      <Sidebar role={user.role} />

      <div className="dashboard-main">

        {/* Topbar */}
        <div className="topbar">
          <h2>Dashboard</h2>

          <p>
            Welcome,
            {" "}
            {user.name ||
              "User"}
          </p>
        </div>

        {/* Welcome */}
        <div className="welcome-card">
          <h2>
            Good Evening,
            {" "}
            {user.name}
          </h2>

          <p>
            {user.shopName}
          </p>

          <span>
            {user.businessType}
          </span>
        </div>

        {/* Cards */}
        {loading ? (
          <h3>
            Loading...
          </h3>
        ) : (
          <div className="stats-grid">
            {cards.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  className="stat-card"
                >
                  <h1>
                    {item.value}
                  </h1>

                  <p>
                    {item.title}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Focus */}
        <div className="focus-card">
          <h3>
            Today's Focus
          </h3>

          <p>
            Monitor stock,
            orders,
            employees and
            business growth.
          </p>
        </div>

      </div>
    </div>
  );
}