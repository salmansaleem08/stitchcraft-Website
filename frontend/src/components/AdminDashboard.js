import React, { useState, useEffect, useContext } from "react";
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

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboard();
    }
  }, [user]);


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
                  <div className="stat-value">{stats?.totalCustomers || 0}</div>
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
                  <div className="stat-value">{stats?.totalTailors || 0}</div>
                  <div className="stat-label">Total Tailors</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaStore />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.totalSuppliers || 0}</div>
                  <div className="stat-label">Total Suppliers</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaGraduationCap />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.totalMentors || 0}</div>
                  <div className="stat-label">Mentors</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.verifiedSuppliers || 0}</div>
                  <div className="stat-label">Verified Suppliers</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaClipboardCheck />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.pendingVerifications || 0}</div>
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
                  <div className="stat-value">{stats?.totalOrders || 0}</div>
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
                  <div className="stat-value">{stats?.pendingOrders || 0}</div>
                  <div className="stat-label">Pending Orders</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.completedOrders || 0}</div>
                  <div className="stat-label">Completed Orders</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaDollarSign />
                </div>
                <div className="stat-content">
                  <div className="stat-value">Rs. {stats?.totalRevenue?.toLocaleString() || 0}</div>
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
                  <div className="stat-value">{stats?.totalProducts || 0}</div>
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
                  <div className="stat-value">{stats?.totalFabrics || 0}</div>
                  <div className="stat-label">Fabrics</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaWarehouse />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.totalSupplies || 0}</div>
                  <div className="stat-label">Supplies</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaTools />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.totalEquipment || 0}</div>
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
                  <div className="stat-value">{stats?.totalCourses || 0}</div>
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
                  <div className="stat-value">{stats?.totalWorkshops || 0}</div>
                  <div className="stat-label">Workshops</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaFileAlt />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.totalPatterns || 0}</div>
                  <div className="stat-label">Patterns</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaVideo />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.totalVideos || 0}</div>
                  <div className="stat-label">Videos</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaNewspaper />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.totalNews || 0}</div>
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
