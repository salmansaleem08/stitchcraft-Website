import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
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
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {stats && (
          <div className="dashboard-stats">
            <div className="stat-card pending">
              <div className="stat-icon">PENDING</div>
              <div className="stat-content">
                <div className="stat-value">{stats.pendingVerifications || 0}</div>
                <div className="stat-label">Pending Verifications</div>
              </div>
            </div>

            <div className="stat-card suppliers">
              <div className="stat-icon">SUPPLIERS</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalSuppliers || 0}</div>
                <div className="stat-label">Total Suppliers</div>
              </div>
            </div>

            <div className="stat-card tailors">
              <div className="stat-icon">TAILORS</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalTailors || 0}</div>
                <div className="stat-label">Total Tailors</div>
              </div>
            </div>

            <div className="stat-card customers">
              <div className="stat-icon">CUSTOMERS</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalCustomers || 0}</div>
                <div className="stat-label">Total Customers</div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-actions">
          <Link to="/admin/verifications" className="action-card">
            <h3>Verification Requests</h3>
            <p>Review and approve supplier verification documents</p>
            <div className="action-badge">{stats?.pendingVerifications || 0} pending</div>
          </Link>
          <Link to="/admin/videos" className="action-card">
            <h3>Video Management</h3>
            <p>Manage YouTube videos for Learning Portal</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

