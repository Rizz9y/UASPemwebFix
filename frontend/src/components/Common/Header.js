import React from "react";
import { useAuth } from "../Auth/AuthProvider";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <h1>Koper & Ransel Inventory</h1>
      <nav className="app-nav">
        {user ? (
          <ul>
            <li>
              Welcome, {user.username} ({user.role})
            </li>
            <li>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;
