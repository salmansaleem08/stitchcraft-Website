import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import SearchBar from "./SearchBar";
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
        <div className="header-top">
          <Link to="/" className="logo">
            StitchCraft
          </Link>
          <SearchBar />
          <div className="header-actions">
            {user ? (
              <>
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
          </div>
        </div>
        <nav className="main-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/tailors" className="nav-link">
            Find Tailors
          </Link>
          <Link to="/fabrics" className="nav-link">
            Fabrics
          </Link>
          <Link to="/supplies" className="nav-link">
            Supplies
          </Link>
          <Link to="/price-comparison" className="nav-link">
            Price Comparison
          </Link>
          <Link to="/equipment" className="nav-link">
            Equipment
          </Link>
          <Link to="/patterns" className="nav-link">
            Patterns
          </Link>
          <Link to="/pattern-tools" className="nav-link">
            Pattern Tools
          </Link>
          <Link to="/learning" className="nav-link">
            Learning Portal
          </Link>
          {user && (user.role === "tailor" || user.role === "supplier") && (
            <>
              <Link to="/patterns/new" className="nav-link">
                Create Pattern
              </Link>
              <Link to="/pattern-designer" className="nav-link">
                Pattern Designer
              </Link>
            </>
          )}
          {user && user.role === "tailor" && (
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
                  {user && user.role === "supplier" && (
                    <>
                      <Link to="/dashboard" className="nav-link">
                        Dashboard
                      </Link>
                      <Link to={`/suppliers/${user._id}/edit`} className="nav-link">
                        My Profile
                      </Link>
                      <Link to="/supplier-orders" className="nav-link">
                        My Orders
                      </Link>
                      <Link to="/fabrics/me/list" className="nav-link">
                        My Fabrics
                      </Link>
                      <Link to="/supplies/me/list" className="nav-link">
                        My Supplies
                      </Link>
                    </>
                  )}
                  {user && user.role === "customer" && (
                    <>
                      <Link to="/cart" className="nav-link">
                        Cart
                      </Link>
                      <Link to="/orders" className="nav-link">
                        My Orders
                      </Link>
                    </>
                  )}
                  {user && user.role === "admin" && (
                    <>
                      <Link to="/admin/dashboard" className="nav-link">
                        Dashboard
                      </Link>
                      <Link to="/admin/verifications" className="nav-link">
                        Verifications
                      </Link>
                    </>
                  )}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;

