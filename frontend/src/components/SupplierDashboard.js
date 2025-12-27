import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplierDashboard.css";

const SupplierDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/suppliers/stats/me");
      setStats(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load dashboard statistics");
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
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
          <h1>Supplier Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">PROD</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.totalProducts || 0}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">ORD</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.totalOrders || 0}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">REV</div>
            <div className="stat-content">
              <div className="stat-value">PKR {stats?.totalRevenue?.toLocaleString() || 0}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">RATE</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.averageRating?.toFixed(1) || "0.0"}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <div className="action-card">
            <h3>Profile Management</h3>
            <p>Update your business information and settings</p>
            <Link to={`/suppliers/${user?._id}/edit`} className="btn btn-primary">
              Edit Profile
            </Link>
          </div>

          <div className="action-card">
            <h3>Verification Status</h3>
            <p>
              Status: <strong>{stats?.verificationStatus || "pending"}</strong>
            </p>
            {stats?.verificationStatus !== "verified" && (
              <Link to={`/suppliers/${user?._id}/edit`} className="btn btn-secondary">
                Upload Documents
              </Link>
            )}
          </div>

          <div className="action-card">
            <h3>Fabrics</h3>
            <p>Manage your fabric inventory</p>
            <Link to="/fabrics/me/list" className="btn btn-primary">
              Manage Fabrics
            </Link>
          </div>

          <div className="action-card">
            <h3>Supplies</h3>
            <p>Manage your supplies inventory</p>
            <Link to="/supplies/me/list" className="btn btn-primary">
              Manage Supplies
            </Link>
          </div>

          <div className="action-card">
            <h3>Inventory</h3>
            <p>View inventory summary and low stock alerts</p>
            <Link to="/inventory/manage" className="btn btn-primary">
              View Inventory
            </Link>
          </div>

          <div className="action-card">
            <h3>Analytics</h3>
            <p>View sales statistics and performance metrics</p>
            <Link to="/analytics" className="btn btn-primary">
              View Analytics
            </Link>
          </div>

          <div className="action-card">
            <h3>Orders</h3>
            <p>View and manage customer orders</p>
            <Link to="/orders" className="btn btn-primary">
              View Orders
            </Link>
          </div>
        </div>

        <div className="quick-links">
          <h2>Quick Links</h2>
          <div className="links-grid">
            <Link to="/suppliers" className="link-card">
              <h4>Browse Suppliers</h4>
              <p>View other suppliers on the platform</p>
            </Link>
            <Link to="/materials" className="link-card">
              <h4>Materials Marketplace</h4>
              <p>Explore materials and supplies</p>
            </Link>
            <Link to={`/suppliers/${user?._id}`} className="link-card">
              <h4>My Public Profile</h4>
              <p>View how customers see your profile</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

