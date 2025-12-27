import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./TailorDashboard.css";

const TailorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "tailor") {
      return;
    }
    fetchStats();
    fetchRecentOrders();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tailors/stats");
      setStats(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load dashboard statistics");
      console.error("Error fetching stats:", error);
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        rating: 0,
        totalReviews: 0,
        averageResponseTime: 0,
        completionRate: 0,
        portfolioItems: 0,
        badges: 0,
        totalRevenue: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
        averageOrderValue: 0,
        recentOrders: 0,
        totalCustomers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get("/orders?limit=5");
      setRecentOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  if (loading) {
    return (
      <div className="tailor-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tailor-dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Tailor Dashboard</h1>
            <p>Welcome back, {user?.name || user?.shopName}</p>
          </div>
          <Link to={`/tailors/${user?._id}/edit`} className="btn btn-secondary">
            Edit Profile
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">ORD</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.totalOrders || 0}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">COMP</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.completedOrders || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">PEND</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.pendingOrders || 0}</div>
              <div className="stat-label">Pending</div>
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
              <div className="stat-value">{stats?.rating?.toFixed(1) || "0.0"}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">CUST</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.totalCustomers || 0}</div>
              <div className="stat-label">Total Customers</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="action-cards">
              <Link to="/tailor-orders" className="action-card">
                <div className="action-icon">Orders</div>
                <h3>View All Orders</h3>
                <p>Manage and track all your orders</p>
              </Link>

              <Link to={`/tailors/${user?._id}/edit`} className="action-card">
                <div className="action-icon">Edit</div>
                <h3>Edit Profile</h3>
                <p>Update your profile and portfolio</p>
              </Link>

              <Link to="/packages/manage" className="action-card">
                <div className="action-icon">Packages</div>
                <h3>Manage Packages</h3>
                <p>Create and manage service packages</p>
              </Link>

              <Link to="/patterns/new" className="action-card">
                <div className="action-icon">Design</div>
                <h3>Create Pattern</h3>
                <p>Design and publish new patterns</p>
              </Link>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Performance Metrics</h2>
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Completion Rate</div>
                <div className="metric-value">{stats?.completionRate?.toFixed(1) || 0}%</div>
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill"
                    style={{ width: `${stats?.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Average Response Time</div>
                <div className="metric-value">
                  {stats?.averageResponseTime
                    ? `${stats.averageResponseTime.toFixed(1)} hours`
                    : "N/A"}
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Average Order Value</div>
                <div className="metric-value">
                  PKR {stats?.averageOrderValue?.toLocaleString() || 0}
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Portfolio Items</div>
                <div className="metric-value">{stats?.portfolioItems || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/tailor-orders" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.customer?.name || "N/A"}</td>
                      <td>{order.garmentType}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td>PKR {order.totalPrice?.toLocaleString() || 0}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No recent orders</p>
          )}
        </div>

        {stats?.ordersByStatus && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Orders by Status</h2>
            </div>
            <div className="status-breakdown">
              <div className="status-item">
                <span className="status-label">Pending</span>
                <span className="status-count">{stats.ordersByStatus.pending || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-label">In Progress</span>
                <span className="status-count">{stats.ordersByStatus.in_progress || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Revision Requested</span>
                <span className="status-count">{stats.ordersByStatus.revision_requested || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Quality Check</span>
                <span className="status-count">{stats.ordersByStatus.quality_check || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Completed</span>
                <span className="status-count">{stats.ordersByStatus.completed || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Cancelled</span>
                <span className="status-count">{stats.ordersByStatus.cancelled || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Revenue Summary</h2>
          </div>
          <div className="revenue-summary">
            <div className="revenue-item">
              <div className="revenue-label">Total Revenue</div>
              <div className="revenue-value">PKR {stats?.totalRevenue?.toLocaleString() || 0}</div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Completed Orders Revenue</div>
              <div className="revenue-value">PKR {stats?.completedRevenue?.toLocaleString() || 0}</div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Pending Orders Revenue</div>
              <div className="revenue-value">PKR {stats?.pendingRevenue?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard;

