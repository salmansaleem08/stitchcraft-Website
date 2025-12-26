import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../App.css";
import "./Navigation.css";

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      tailor: "Tailor",
      customer: "Customer",
      supplier: "Supplier",
    };
    return roleNames[role] || role;
  };

  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="logo">
          StitchCraft
        </Link>
        <nav className="main-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/tailors" className="nav-link">
            Find Tailors
          </Link>
          <Link to="/materials" className="nav-link">
            Materials
          </Link>
          {user ? (
            <>
              {user.role === "tailor" && (
                <>
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link to={`/tailors/${user._id}/edit`} className="nav-link">
                    My Profile
                  </Link>
                  <Link to="/packages/manage" className="nav-link">
                    Packages
                  </Link>
                </>
              )}
              {user.role === "supplier" && (
                <>
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link to={`/suppliers/${user._id}/edit`} className="nav-link">
                    My Profile
                  </Link>
                  <Link to="/materials" className="nav-link">
                    Materials
                  </Link>
                </>
              )}
              {user.role === "customer" && (
                <Link to="/orders" className="nav-link">
                  My Orders
                </Link>
              )}
              <div className="user-menu">
                <span className="user-info">
                  {user.name} ({getRoleDisplayName(user.role)})
                </span>
                <button onClick={handleLogout} className="btn btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-small">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;

