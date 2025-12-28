import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import "../App.css";
import "./Navigation.css";

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
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

  // Define navigation items based on role
  const getNavigationItems = () => {
    const allItems = {
      public: [
        { path: "/", label: "Home", type: "link" },
      ],
      customer: [
        { path: "/cart", label: "Cart", type: "link" },
        { path: "/orders", label: "My Orders", type: "link" },
      ],
      tailor: [
        { path: "/dashboard", label: "Dashboard", type: "link" },
        { path: "/orders", label: "My Orders", type: "link" },
        { path: "/packages/manage", label: "Packages", type: "link" },
        { path: "/patterns/new", label: "Create Pattern", type: "link" },
        { path: "/pattern-designer", label: "Pattern Designer", type: "link" },
      ],
      supplier: [
        { path: "/dashboard", label: "Dashboard", type: "link" },
        { path: "/supplier-orders", label: "My Orders", type: "link" },
        { path: "/fabrics/me/list", label: "My Fabrics", type: "link" },
        { path: "/supplies/me/list", label: "My Supplies", type: "link" },
        { path: "/inventory", label: "Inventory", type: "link" },
        { path: "/equipment/new", label: "List Equipment", type: "link" },
      ],
      admin: [
        { path: "/admin/dashboard", label: "Dashboard", type: "link" },
        { path: "/admin/verifications", label: "Verifications", type: "link" },
        { path: "/admin/videos", label: "Videos", type: "link" },
        { path: "/admin/workshops", label: "Workshops", type: "link" },
        { path: "/admin/news", label: "News", type: "link" },
      ],
    };

    const items = [];

    // Add Home only for customers and non-logged-in users
    if (!user || user.role === "customer") {
      items.push(...allItems.public);
    }

    // Marketplace dropdown items - different for different roles
    let marketplaceItems = [];
    
    if (user?.role === "admin") {
      // Admin doesn't need marketplace
      marketplaceItems = [];
    } else {
      // Base marketplace items for all (except admin)
      marketplaceItems = [
        { path: "/fabrics", label: "Fabrics", type: "link" },
        { path: "/supplies", label: "Supplies", type: "link" },
        { path: "/equipment", label: "Equipment", type: "link" },
      ];

      // Add Patterns and Maintenance only for tailors
      if (user?.role === "tailor") {
        marketplaceItems.push(
          { path: "/patterns", label: "Patterns", type: "link" },
          { path: "/maintenance", label: "Maintenance", type: "link" }
        );
      }
      // Supplier doesn't get Patterns or Maintenance
    }

    // Design Tools dropdown items
    const designToolsItems = [
      { path: "/virtual-stylist", label: "Virtual Stylist", type: "link" },
      { path: "/virtual-tryon", label: "Virtual Try-On", type: "link", requiresAuth: true },
    ];

    // Community/Resources dropdown (for tailors only)
    const communityItems = [
      { path: "/learning", label: "Learning Portal", type: "link" },
      { path: "/forums", label: "Forums", type: "link" },
      { path: "/workshops", label: "Workshops", type: "link" },
      { path: "/mentorships", label: "Mentorship", type: "link" },
    ];

    // Add marketplace dropdown (only if not admin and has items)
    if (user?.role !== "admin" && marketplaceItems.length > 0) {
      items.push({
        label: "Marketplace",
        type: "dropdown",
        items: marketplaceItems,
      });
    }

    // Add design tools dropdown (not for supplier or admin)
    if (user?.role !== "supplier" && user?.role !== "admin") {
      items.push({
        label: "Design Tools",
        type: "dropdown",
        items: user ? designToolsItems : designToolsItems.filter(item => !item.requiresAuth),
      });
    }

    // Add community dropdown for tailors only
    if (user && user.role === "tailor") {
      items.push({
        label: "Community",
        type: "dropdown",
        items: communityItems,
      });
    }

    // Add role-specific items
    if (user) {
      if (user.role === "tailor") {
        items.push(...allItems.tailor);
        // Add Compare Prices for tailors
        items.push({ path: "/price-comparison", label: "Compare Prices", type: "link", requiresAuth: true });
      } else if (user.role === "customer") {
        items.push(...allItems.customer);
      } else if (user.role === "supplier") {
        items.push(...allItems.supplier);
        // Supplier doesn't get Compare Prices
      } else if (user.role === "admin") {
        items.push(...allItems.admin);
        // Admin doesn't get Compare Prices
      }
    }

    // Filter out items that require auth if user is not logged in
    return items.filter((item) => {
      if (item.type === "dropdown") {
        item.items = item.items.filter((subItem) => !subItem.requiresAuth || user);
        return item.items.length > 0;
      }
      return !item.requiresAuth || user;
    });
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleDropdownMouseEnter = (label) => {
    setActiveDropdown(label);
  };

  const handleDropdownMouseLeave = () => {
    setActiveDropdown(null);
  };

  const getProfileEditPath = () => {
    if (user?.role === "tailor") {
      return `/tailors/${user._id}/edit`;
    } else if (user?.role === "supplier") {
      return `/suppliers/${user._id}/edit`;
    }
    return "/profile";
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-top">
          <div className="header-left">
            <Link to={user?.role === "tailor" ? "/dashboard" : "/"} className="logo">
              StitchCraft
            </Link>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${mobileMenuOpen ? "active" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          <div className="header-center">
            <SearchBar />
          </div>

          <div className="header-right">
            {user ? (
              <div className="user-menu-wrapper">
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="user-name">{user.name}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar-large">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="user-info">
                        <div className="user-name-full">{user.name}</div>
                        <div className="user-role">{getRoleDisplayName(user.role)}</div>
                      </div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link
                      to={getProfileEditPath()}
                      className="dropdown-item"
                    >
                      Edit Profile
                    </Link>
                    <Link to="/dashboard" className="dropdown-item">
                      Dashboard
                    </Link>
                    <div className="user-dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      Logout
                    </button>
                  </div>
                )}
              </div>
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

        <nav className={`main-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="nav-items">
            {navigationItems.map((item, index) => {
              if (item.type === "dropdown") {
                return (
                  <div
                    key={index}
                    className="nav-dropdown-wrapper"
                    onMouseEnter={() => handleDropdownMouseEnter(item.label)}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <button className={`nav-link nav-dropdown-trigger ${activeDropdown === item.label ? "active" : ""}`}>
                      {item.label}
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {activeDropdown === item.label && (
                      <div className="nav-dropdown">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`nav-dropdown-item ${isActive(subItem.path) ? "active" : ""}`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              }
            })}
          </div>
        </nav>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </header>
  );
};

export default Navigation;
