import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaSearch, FaShoppingCart, FaBox, FaWarehouse, FaClipboardList, FaChevronDown } from "react-icons/fa";
import "../App.css";
import "./Navigation.css";

const Navigation = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [marketplaceDropdownOpen, setMarketplaceDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setMarketplaceDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMarketplaceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getProfilePath = () => {
    if (user?.role === "tailor") {
      return `/tailors/${user._id}`;
    } else if (user?.role === "supplier") {
      return `/suppliers/${user._id}`;
    } else if (user?.role === "admin") {
      return "/admin/dashboard";
    }
    return "/dashboard";
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      tailor: "Tailor",
      customer: "Customer",
      supplier: "Supplier",
      admin: "Admin",
    };
    return roleNames[role] || role;
  };

  // Get navigation links based on role
  const getNavigationLinks = () => {
    if (!user) {
      return [
        { path: "/", label: "Home" },
      ];
    }

    const links = [];

    // Home/Dashboard - All roles
    if (user.role === "customer") {
      links.push({ path: "/", label: "Home" });
    } else {
      links.push({ path: "/dashboard", label: "Dashboard" });
    }

    // My Orders - Customer, Tailor, Supplier
    if (["customer", "tailor", "supplier"].includes(user.role)) {
      if (user.role === "supplier") {
        links.push({ path: "/supplier-orders", label: "My Orders" });
      } else {
        links.push({ path: "/orders", label: "My Orders" });
      }
    }

    // Marketplace - Customer, Tailor, Supplier (will be handled as dropdown)
    // Removed from links array as it's now a dropdown

    // My Fabrics - Supplier only
    if (user.role === "supplier") {
      links.push({ path: "/fabrics/me/list", label: "My Fabrics" });
    }

    // List Equipment - Supplier only
    if (user.role === "supplier") {
      links.push({ path: "/equipment/new", label: "List Equipment" });
    }

    // Design Tools - Customer, Tailor
    if (["customer", "tailor"].includes(user.role)) {
      links.push({ path: "/virtual-stylist", label: "Design Tools" });
    }

    // Compare Prices - Customer, Tailor
    if (["customer", "tailor"].includes(user.role)) {
      links.push({ path: "/price-comparison", label: "Compare Prices" });
    }

    // Create Pattern (merged Pattern Designer) - Tailor only
    if (user.role === "tailor") {
      links.push({ path: "/pattern-designer", label: "Create Pattern" });
    }

    // Community - Tailor only
    if (user.role === "tailor") {
      links.push({ path: "/learning", label: "Community" });
    }

    // Admin links
    if (user.role === "admin") {
      links.push({ path: "/admin/verifications", label: "Verifications" });
      links.push({ path: "/admin/videos", label: "Videos" });
      links.push({ path: "/admin/workshops", label: "Workshops" });
      links.push({ path: "/admin/news", label: "News" });
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          {/* Left: Logo */}
          <div className="header-left">
            <Link to={user?.role === "tailor" ? "/dashboard" : "/"} className="logo">
              StitchCraft
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="main-nav">
            <div className="nav-items">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Marketplace Dropdown */}
              {["customer", "tailor", "supplier"].includes(user?.role) && (
                <div className="dropdown-wrapper" ref={dropdownRef}>
                  <button
                    className={`nav-link dropdown-trigger ${marketplaceDropdownOpen ? "active" : ""} ${
                      isActive("/fabrics") || isActive("/supplies") || isActive("/equipment") ? "active" : ""
                    }`}
                    onClick={() => setMarketplaceDropdownOpen(!marketplaceDropdownOpen)}
                  >
                    Marketplace
                    <FaChevronDown className={`dropdown-icon ${marketplaceDropdownOpen ? "open" : ""}`} />
                  </button>
                  {marketplaceDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link
                        to="/fabrics"
                        className={`dropdown-item ${isActive("/fabrics") ? "active" : ""}`}
                        onClick={() => setMarketplaceDropdownOpen(false)}
                      >
                        Fabrics
                      </Link>
                      <Link
                        to="/supplies"
                        className={`dropdown-item ${isActive("/supplies") ? "active" : ""}`}
                        onClick={() => setMarketplaceDropdownOpen(false)}
                      >
                        Supplies
                      </Link>
                      <Link
                        to="/equipment"
                        className={`dropdown-item ${isActive("/equipment") ? "active" : ""}`}
                        onClick={() => setMarketplaceDropdownOpen(false)}
                      >
                        Equipment
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Right: Icons + Profile */}
          <div className="header-right">
            {/* Role-specific icons */}
            {user && (
              <>
                {/* Customer: Cart */}
                {user.role === "customer" && (
                  <Link to="/cart" className="nav-icon-link" aria-label="Cart">
                    <FaShoppingCart className="nav-icon" />
                  </Link>
                )}

                {/* Tailor: Package */}
                {user.role === "tailor" && (
                  <Link to="/packages/manage" className="nav-icon-link" aria-label="Packages">
                    <FaBox className="nav-icon" />
                  </Link>
                )}

                {/* Supplier: My Supplies + Inventory */}
                {user.role === "supplier" && (
                  <>
                    <Link to="/supplies/me/list" className="nav-icon-link" aria-label="My Supplies">
                      <FaWarehouse className="nav-icon" />
                    </Link>
                    <Link to="/inventory" className="nav-icon-link" aria-label="Inventory">
                      <FaClipboardList className="nav-icon" />
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Search Icon - All users */}
            <Link to="/search" className="nav-icon-link" aria-label="Search">
              <FaSearch className="nav-icon" />
            </Link>

            {/* Profile Icon - All logged in users */}
            {user ? (
              <Link
                to={getProfilePath()}
                className="user-profile-wrapper"
                aria-label="Go to profile"
              >
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="user-role-text">{getRoleDisplayName(user.role)}</span>
              </Link>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-text">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-small">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="mobile-nav-items">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Marketplace Dropdown for Mobile */}
            {["customer", "tailor", "supplier"].includes(user?.role) && (
              <div className="mobile-dropdown-wrapper">
                <div className="mobile-dropdown-trigger">Marketplace</div>
                <div className="mobile-dropdown-items">
                  <Link
                    to="/fabrics"
                    className={`mobile-nav-link ${isActive("/fabrics") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Fabrics
                  </Link>
                  <Link
                    to="/supplies"
                    className={`mobile-nav-link ${isActive("/supplies") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Supplies
                  </Link>
                  <Link
                    to="/equipment"
                    className={`mobile-nav-link ${isActive("/equipment") ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Equipment
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
