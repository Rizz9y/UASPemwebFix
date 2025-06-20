import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="sidebar">
      <h3>Navigation</h3>
      <ul>
        {user.role === "admin" && (
          <>
            {/* ... (Admin links remain unchanged) ... */}
            <li>
              <Link
                to="/admin/dashboard"
                className={
                  location.pathname === "/admin/dashboard" ? "active" : ""
                }
              >
                Admin Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className={
                  location.pathname === "/admin/products" ? "active" : ""
                }
              >
                Manage Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className={location.pathname === "/admin/users" ? "active" : ""}
              >
                Manage Users
              </Link>
            </li>
            <li>
              <Link
                to="/admin/suppliers"
                className={
                  location.pathname === "/admin/suppliers" ? "active" : ""
                }
              >
                Manage Suppliers
              </Link>
            </li>
            <li>
              <Link
                to="/admin/categories"
                className={
                  location.pathname === "/admin/categories" ? "active" : ""
                }
              >
                Manage Categories
              </Link>
            </li>
            <li>
              <Link
                to="/admin/stock"
                className={
                  location.pathname.startsWith("/admin/stock") ? "active" : ""
                }
              >
                Stock Management
              </Link>
            </li>
            <li>
              <Link
                to="/admin/logs"
                className={location.pathname === "/admin/logs" ? "active" : ""}
              >
                Activity Logs
              </Link>
            </li>
          </>
        )}
        {user.role === "staff" && (
          <>
            <li>
              <Link
                to="/staff/dashboard"
                className={
                  location.pathname === "/staff/dashboard" ? "active" : ""
                }
              >
                Staff Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/staff/products"
                className={
                  location.pathname === "/staff/products" ? "active" : ""
                }
              >
                View Products
              </Link>
            </li>
            {/* --- INI BAGIAN PENTING YANG HARUS SAMA DENGAN ROUTE DI APP.JS --- */}
            <li>
              <Link
                to="/staff/stock/in"
                className={
                  location.pathname === "/staff/stock/in" ? "active" : ""
                }
              >
                Stock In
              </Link>
            </li>
            <li>
              <Link
                to="/staff/stock/out"
                className={
                  location.pathname === "/staff/stock/out" ? "active" : ""
                }
              >
                Stock Out
              </Link>
            </li>
            <li>
              <Link
                to="/staff/stock/adjustment"
                className={
                  location.pathname === "/staff/stock/adjustment"
                    ? "active"
                    : ""
                }
              >
                Stock Adjustment
              </Link>
            </li>
            <li>
              <Link
                to="/staff/stock/history"
                className={
                  location.pathname === "/staff/stock/history" ? "active" : ""
                }
              >
                Stock History
              </Link>
            </li>
            {/* --- END BAGIAN PENTING --- */}
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
