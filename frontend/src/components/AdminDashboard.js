import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import {
  FaUsers,
  FaUserTie,
  FaStore,
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaBox,
  FaWarehouse,
  FaTools,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaFileAlt,
  FaVideo,
  FaNewspaper,
  FaArrowUp,
  FaClipboardCheck,
  FaChartLine,
} from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Counter animation refs
  const totalCustomersRef = useRef(null);
  const totalTailorsRef = useRef(null);
  const totalSuppliersRef = useRef(null);
  const totalMentorsRef = useRef(null);
  const totalOrdersRef = useRef(null);
  const pendingOrdersRef = useRef(null);
  const completedOrdersRef = useRef(null);
  const totalProductsRef = useRef(null);
  const totalFabricsRef = useRef(null);
  const totalSuppliesRef = useRef(null);
  const totalEquipmentRef = useRef(null);
  const totalCoursesRef = useRef(null);
  const totalWorkshopsRef = useRef(null);
  const totalPatternsRef = useRef(null);
  const totalVideosRef = useRef(null);
  const totalNewsRef = useRef(null);
  const verifiedSuppliersRef = useRef(null);
  const pendingVerificationsRef = useRef(null);
  const totalRevenueRef = useRef(null);
  const countersAnimated = useRef(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboard();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && stats && !countersAnimated.current) {
      const timer = setTimeout(() => {
        animateCounters();
        countersAnimated.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, stats]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/dashboard");
      setStats(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load dashboard");
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const animateValue = (ref, start, end, duration) => {
    if (!ref.current) return;
    const startTime = performance.now();
    const isDecimal = end % 1 !== 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * progress;

      if (isDecimal) {
        ref.current.textContent = current.toFixed(1);
      } else {
        ref.current.textContent = Math.floor(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (isDecimal) {
          ref.current.textContent = end.toFixed(1);
        } else {
          ref.current.textContent = end.toLocaleString();
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const animateCounters = () => {
    if (!stats) return;

    const duration = 1500;

    if (totalCustomersRef.current)
      animateValue(totalCustomersRef.current, 0, stats.totalCustomers || 0, duration);
    if (totalTailorsRef.current)
      animateValue(totalTailorsRef.current, 0, stats.totalTailors || 0, duration);
    if (totalSuppliersRef.current)
      animateValue(totalSuppliersRef.current, 0, stats.totalSuppliers || 0, duration);
    if (totalMentorsRef.current)
      animateValue(totalMentorsRef.current, 0, stats.totalMentors || 0, duration);
    if (totalOrdersRef.current)
      animateValue(totalOrdersRef.current, 0, stats.totalOrders || 0, duration);
    if (pendingOrdersRef.current)
      animateValue(pendingOrdersRef.current, 0, stats.pendingOrders || 0, duration);
    if (completedOrdersRef.current)
      animateValue(completedOrdersRef.current, 0, stats.completedOrders || 0, duration);
    if (totalProductsRef.current)
      animateValue(totalProductsRef.current, 0, stats.totalProducts || 0, duration);
    if (totalFabricsRef.current)
      animateValue(totalFabricsRef.current, 0, stats.totalFabrics || 0, duration);
    if (totalSuppliesRef.current)
      animateValue(totalSuppliesRef.current, 0, stats.totalSupplies || 0, duration);
    if (totalEquipmentRef.current)
      animateValue(totalEquipmentRef.current, 0, stats.totalEquipment || 0, duration);
    if (totalCoursesRef.current)
      animateValue(totalCoursesRef.current, 0, stats.totalCourses || 0, duration);
    if (totalWorkshopsRef.current)
      animateValue(totalWorkshopsRef.current, 0, stats.totalWorkshops || 0, duration);
    if (totalPatternsRef.current)
      animateValue(totalPatternsRef.current, 0, stats.totalPatterns || 0, duration);
    if (totalVideosRef.current)
      animateValue(totalVideosRef.current, 0, stats.totalVideos || 0, duration);
    if (totalNewsRef.current)
      animateValue(totalNewsRef.current, 0, stats.totalNews || 0, duration);
    if (verifiedSuppliersRef.current)
      animateValue(verifiedSuppliersRef.current, 0, stats.verifiedSuppliers || 0, duration);
    if (pendingVerificationsRef.current)
      animateValue(pendingVerificationsRef.current, 0, stats.pendingVerifications || 0, duration);
    if (totalRevenueRef.current)
      animateValue(totalRevenueRef.current, 0, stats.totalRevenue || 0, duration);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Admin Dashboard</h1>
              <p className="dashboard-subtitle">
                Complete overview of your platform. Monitor users, orders, products, and resources.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {stats && (
          <>
            {/* User Statistics */}
            <div className="section-header">
              <h2>User Statistics</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item stat-item-primary">
                <div className="stat-corner-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalCustomersRef}>0</div>
                  <div className="stat-label">Total Customers</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>Active users</span>
                  </div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaUserTie />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalTailorsRef}>0</div>
                  <div className="stat-label">Total Tailors</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaStore />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalSuppliersRef}>0</div>
                  <div className="stat-label">Total Suppliers</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaGraduationCap />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalMentorsRef}>0</div>
                  <div className="stat-label">Mentors</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={verifiedSuppliersRef}>0</div>
                  <div className="stat-label">Verified Suppliers</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaClipboardCheck />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={pendingVerificationsRef}>0</div>
                  <div className="stat-label">Pending Verifications</div>
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="section-header">
              <h2>Order Statistics</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item stat-item-primary">
                <div className="stat-corner-icon">
                  <FaShoppingBag />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalOrdersRef}>0</div>
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>All time</span>
                  </div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaClock />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={pendingOrdersRef}>0</div>
                  <div className="stat-label">Pending Orders</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={completedOrdersRef}>0</div>
                  <div className="stat-label">Completed Orders</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaDollarSign />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalRevenueRef}>0</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>
            </div>

            {/* Product Statistics */}
            <div className="section-header">
              <h2>Product Statistics</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item stat-item-primary">
                <div className="stat-corner-icon">
                  <FaBox />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalProductsRef}>0</div>
                  <div className="stat-label">Total Products</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>All categories</span>
                  </div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaBox />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalFabricsRef}>0</div>
                  <div className="stat-label">Fabrics</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaWarehouse />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalSuppliesRef}>0</div>
                  <div className="stat-label">Supplies</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaTools />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalEquipmentRef}>0</div>
                  <div className="stat-label">Equipment</div>
                </div>
              </div>
            </div>

            {/* Learning Resources */}
            <div className="section-header">
              <h2>Learning Resources</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item stat-item-primary">
                <div className="stat-corner-icon">
                  <FaGraduationCap />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalCoursesRef}>0</div>
                  <div className="stat-label">Courses</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaChalkboardTeacher />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalWorkshopsRef}>0</div>
                  <div className="stat-label">Workshops</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaFileAlt />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalPatternsRef}>0</div>
                  <div className="stat-label">Patterns</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaVideo />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalVideosRef}>0</div>
                  <div className="stat-label">Videos</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaNewspaper />
                </div>
                <div className="stat-content">
                  <div className="stat-value" ref={totalNewsRef}>0</div>
                  <div className="stat-label">News Articles</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="dashboard-actions">
              <Link to="/admin/verifications" className="action-card">
                <div className="action-icon">
                  <FaClipboardCheck />
                </div>
                <h3>Verification Requests</h3>
                <p>Review and approve supplier verification documents</p>
                {stats.pendingVerifications > 0 && (
                  <div className="action-badge">{stats.pendingVerifications} pending</div>
                )}
              </Link>
              <Link to="/admin/videos" className="action-card">
                <div className="action-icon">
                  <FaVideo />
                </div>
                <h3>Video Management</h3>
                <p>Manage YouTube videos for Learning Portal</p>
              </Link>
              <Link to="/admin/workshops" className="action-card">
                <div className="action-icon">
                  <FaChalkboardTeacher />
                </div>
                <h3>Workshop Management</h3>
                <p>Create and manage skill sharing workshops</p>
              </Link>
              <Link to="/admin/news" className="action-card">
                <div className="action-icon">
                  <FaNewspaper />
                </div>
                <h3>News Management</h3>
                <p>Share industry news and updates</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
