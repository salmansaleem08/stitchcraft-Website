import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  FaArrowUp, FaBox, FaShoppingBag, FaDollarSign, FaStar,
  FaWarehouse, FaClipboardList, FaChartLine, FaEdit, FaCheckCircle
} from "react-icons/fa";
import "./SupplierDashboard.css";

const SupplierDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Counter animation refs
  const totalProductsRef = useRef(null);
  const totalOrdersRef = useRef(null);
  const totalRevenueRef = useRef(null);
  const averageRatingRef = useRef(null);
  const countersAnimated = useRef(false);

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      return;
    }
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (!loading && stats && !countersAnimated.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        animateCounters();
        countersAnimated.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, stats]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/suppliers/stats/me");
      setStats(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load dashboard statistics");
      console.error("Error fetching stats:", error);
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        verificationStatus: user?.verificationStatus || "pending",
      });
    } finally {
      setLoading(false);
    }
  };

  // Counter animation function
  const animateCounters = () => {
    const duration = 1500;

    // Total Products Counter
    const totalProducts = stats?.totalProducts || 0;
    if (totalProductsRef.current) {
      animateValue(totalProductsRef.current, 0, totalProducts, duration);
    }

    // Total Orders Counter
    const totalOrders = stats?.totalOrders || 0;
    if (totalOrdersRef.current) {
      animateValue(totalOrdersRef.current, 0, totalOrders, duration);
    }

    // Total Revenue Counter
    const totalRevenue = stats?.totalRevenue || 0;
    if (totalRevenueRef.current) {
      animateValue(totalRevenueRef.current, 0, totalRevenue, duration);
    }

    // Average Rating Counter
    const averageRating = stats?.averageRating || 0;
    if (averageRatingRef.current) {
      animateDecimal(averageRatingRef.current, 0, averageRating, duration);
    }
  };

  const animateValue = (element, start, end, duration) => {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      element.textContent = current.toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end.toLocaleString();
      }
    };
    window.requestAnimationFrame(step);
  };

  const animateDecimal = (element, start, end, duration) => {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = start + (end - start) * progress;
      element.textContent = current.toFixed(1);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end.toFixed(1);
      }
    };
    window.requestAnimationFrame(step);
  };

  if (loading) {
    return (
      <div className="supplier-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <div className="header-title-row">
                <h1>Dashboard</h1>
                {stats?.verificationStatus && (
                  <span className={`verification-badge ${stats.verificationStatus === "verified" ? "verified" : "pending"}`}>
                    {stats.verificationStatus === "verified" ? (
                      <>
                        <FaCheckCircle className="verification-icon" />
                        Verified
                      </>
                    ) : (
                      "Pending Verification"
                    )}
                  </span>
                )}
              </div>
              <p className="dashboard-subtitle">Manage your inventory, track orders, and grow your supplier business</p>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item stat-item-primary">
            <div className="stat-corner-icon">
              <FaBox />
            </div>
            <div className="stat-content">
              <div className="stat-value"><span ref={totalProductsRef}>0</span></div>
              <div className="stat-label">Total Products</div>
              <div className="stat-trend">
                <FaArrowUp className="trend-icon" />
                <span>Increased from last month</span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-corner-icon">
              <FaShoppingBag />
            </div>
            <div className="stat-content">
              <div className="stat-value"><span ref={totalOrdersRef}>0</span></div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-trend">
                <FaArrowUp className="trend-icon" />
                <span>Increased from last month</span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-corner-icon">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-value">PKR <span ref={totalRevenueRef}>0</span></div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-trend">
                <FaArrowUp className="trend-icon" />
                <span>Increased from last month</span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-corner-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <div className="stat-value"><span ref={averageRatingRef}>0.0</span></div>
              <div className="stat-label">Average Rating</div>
              <div className="stat-trend">
                <FaArrowUp className="trend-icon" />
                <span>Increased from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Performance */}
        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="actions-list">
              <Link to="/fabrics/me/list" className="action-link">
                <span className="action-label">Manage Fabrics</span>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/supplies/me/list" className="action-link">
                <span className="action-label">Manage Supplies</span>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/supplier-orders" className="action-link">
                <span className="action-label">View all orders</span>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/inventory" className="action-link">
                <span className="action-label">View Inventory</span>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/analytics" className="action-link">
                <span className="action-label">View Analytics</span>
                <span className="action-arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Account Status</h2>
            </div>
            <div className="metrics-list">
              {stats?.verificationStatus !== "verified" && (
                <div className="metric-row">
                  <span className="metric-label">Verification Required</span>
                  <Link to={`/suppliers/${user?._id}/edit`} className="btn btn-primary btn-sm">
                    Upload Documents
                  </Link>
                </div>
              )}
              <div className="metric-row" style={{ marginTop: stats?.verificationStatus !== "verified" ? "1.5rem" : "0" }}>
                <span className="metric-label">Account Status</span>
                <span className={`metric-value ${stats?.verificationStatus === "verified" ? "status-verified" : "status-pending"}`}>
                  {stats?.verificationStatus === "verified" ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

