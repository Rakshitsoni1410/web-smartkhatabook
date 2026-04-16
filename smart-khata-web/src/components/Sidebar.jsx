import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Customers", path: "/customers" },
    { name: "Employees", path: "/employees" },
    { name: "Bills", path: "/bills" },
  ];

  return (
    <div className="sidebar">
      <h2 className="logo">Smart Khata</h2>

      {menu.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={
            location.pathname === item.path
              ? "menu active"
              : "menu"
          }
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}