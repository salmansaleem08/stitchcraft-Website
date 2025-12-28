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
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [retention, setRetention] = useState(null);
  const [popularServices, setPopularServices] = useState(null);
  const [seasonalDemand, setSeasonalDemand] = useState(null);
  const [benchmarking, setBenchmarking] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "tailor") {
      return;
    }
    fetchStats();
    fetchRecentOrders();
    fetchAllOrders();
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
    if (activeTab === "timeline") {
      fetchAllOrders();
    }
    if (activeTab === "communication") {
      fetchMessages();
    }
    if (activeTab === "payments") {
      fetchPayments();
    }
    if (activeTab === "delivery") {
      fetchDeliveries();
    }
  }, [user, activeTab]);

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

  const fetchAllOrders = async () => {
    try {
      const response = await api.get("/orders");
      setAllOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [overview, earningsData, retentionData, servicesData, seasonalData, benchmarkData] = await Promise.all([
        api.get("/analytics/tailor/overview"),
        api.get("/analytics/tailor/earnings?period=monthly&months=6"),
        api.get("/analytics/tailor/retention"),
        api.get("/analytics/tailor/popular-services"),
        api.get("/analytics/tailor/seasonal-demand"),
        api.get("/analytics/tailor/benchmarking"),
      ]);
      setAnalytics(overview.data.data);
      setEarnings(earningsData.data.data);
      setRetention(retentionData.data.data);
      setPopularServices(servicesData.data.data);
      setSeasonalDemand(seasonalData.data.data);
      setBenchmarking(benchmarkData.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get("/orders");
      const orders = response.data.data || [];
      const allMessages = [];
      orders.forEach((order) => {
        if (order.messages && order.messages.length > 0) {
          order.messages.forEach((msg) => {
            allMessages.push({
              ...msg,
              orderNumber: order.orderNumber,
              orderId: order._id,
              customer: order.customer,
            });
          });
        }
      });
      setMessages(allMessages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get("/orders");
      const orders = response.data.data || [];
      const allPayments = [];
      orders.forEach((order) => {
        if (order.paymentSchedule && order.paymentSchedule.length > 0) {
          order.paymentSchedule.forEach((payment) => {
            allPayments.push({
              ...payment,
              orderNumber: order.orderNumber,
              orderId: order._id,
              customer: order.customer,
              totalPrice: order.totalPrice,
            });
          });
        }
      });
      setPayments(allPayments.sort((a, b) => new Date(b.dueDate || b.createdAt) - new Date(a.dueDate || a.createdAt)));
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get("/orders");
      const orders = response.data.data || [];
      const deliveries = orders
        .filter((order) => order.delivery && order.delivery.deliveryAddress)
        .map((order) => ({
          ...order.delivery,
          orderNumber: order.orderNumber,
          orderId: order._id,
          customer: order.customer,
          status: order.status,
        }));
      setDeliveries(deliveries.sort((a, b) => new Date(b.estimatedDeliveryDate || b.createdAt) - new Date(a.estimatedDeliveryDate || a.createdAt)));
    } catch (error) {
      console.error("Error fetching deliveries:", error);
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

        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            Timeline Management
          </button>
          <button
            className={`tab-btn ${activeTab === "communication" ? "active" : ""}`}
            onClick={() => setActiveTab("communication")}
          >
            Communication Center
          </button>
          <button
            className={`tab-btn ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payment Tracking
          </button>
          <button
            className={`tab-btn ${activeTab === "delivery" ? "active" : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            Delivery Scheduling
          </button>
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Business Analytics
          </button>
        </div>

        {activeTab === "overview" && (
          <>
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
          </>
        )}

        {activeTab === "timeline" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Order Timeline Management</h2>
            </div>
            <div className="timeline-view">
              {allOrders
                .filter((order) => order.status !== "completed" && order.status !== "cancelled")
                .sort((a, b) => {
                  const dateA = new Date(a.estimatedCompletionDate || a.createdAt);
                  const dateB = new Date(b.estimatedCompletionDate || b.createdAt);
                  return dateA - dateB;
                })
                .map((order) => (
                  <div key={order._id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h3>Order #{order.orderNumber || order._id.toString().slice(-6)}</h3>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="timeline-details">
                        <p><strong>Customer:</strong> {order.customer?.name || "N/A"}</p>
                        <p><strong>Service:</strong> {order.garmentType}</p>
                        <p><strong>Price:</strong> PKR {order.totalPrice?.toLocaleString() || 0}</p>
                        {order.estimatedCompletionDate && (
                          <p><strong>Due Date:</strong> {new Date(order.estimatedCompletionDate).toLocaleDateString()}</p>
                        )}
                        {order.timeline && order.timeline.length > 0 && (
                          <div className="timeline-milestones">
                            {order.timeline.map((milestone, idx) => (
                              <div key={idx} className="milestone">
                                <span className="milestone-date">{new Date(milestone.date).toLocaleDateString()}</span>
                                <span className="milestone-status">{milestone.status}</span>
                                {milestone.notes && <span className="milestone-notes">{milestone.notes}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="timeline-actions">
                        <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              {allOrders.filter((order) => order.status !== "completed" && order.status !== "cancelled").length === 0 && (
                <p className="no-data">No active orders</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Customer Communication Center</h2>
            </div>
            <div className="communication-center">
              {messages.length > 0 ? (
                <div className="messages-list">
                  {messages.slice(0, 20).map((msg, idx) => (
                    <div key={idx} className="message-item">
                      <div className="message-header">
                        <span className="message-order">Order #{msg.orderNumber || msg.orderId?.toString().slice(-6)}</span>
                        <span className="message-date">{new Date(msg.sentAt).toLocaleString()}</span>
                      </div>
                      <div className="message-sender">
                        <strong>{msg.sender?.name || (msg.sender?.toString() === user?._id ? "You" : "Customer")}</strong>
                      </div>
                      <div className="message-content">{msg.content}</div>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="message-attachments">
                          {msg.attachments.map((att, attIdx) => (
                            <a key={attIdx} href={att.url} target="_blank" rel="noopener noreferrer">
                              {att.filename || "Attachment"}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="message-actions">
                        <Link to={`/orders/${msg.orderId}`} className="btn btn-primary btn-sm">
                          View Order
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No messages</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Payment Tracking</h2>
            </div>
            <div className="payment-tracking">
              <div className="payment-summary">
                <div className="payment-stat">
                  <div className="payment-label">Total Expected</div>
                  <div className="payment-value">
                    PKR {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div className="payment-stat">
                  <div className="payment-label">Paid</div>
                  <div className="payment-value paid">
                    PKR {payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div className="payment-stat">
                  <div className="payment-label">Pending</div>
                  <div className="payment-value pending">
                    PKR {payments.filter((p) => p.status !== "paid").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="payments-list">
                {payments.length > 0 ? (
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Customer</th>
                        <th>Payment Type</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, idx) => (
                        <tr key={idx}>
                          <td>#{payment.orderNumber || payment.orderId?.toString().slice(-6)}</td>
                          <td>{payment.customer?.name || "N/A"}</td>
                          <td>{payment.type || "Milestone"}</td>
                          <td>PKR {payment.amount?.toLocaleString() || 0}</td>
                          <td>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "N/A"}</td>
                          <td>
                            <span className={`status-badge ${payment.status === "paid" ? "status-completed" : "status-pending"}`}>
                              {payment.status?.toUpperCase() || "PENDING"}
                            </span>
                          </td>
                          <td>
                            <Link to={`/orders/${payment.orderId}`} className="btn btn-primary btn-sm">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No payment records</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Delivery Scheduling</h2>
            </div>
            <div className="delivery-scheduling">
              <div className="deliveries-list">
                {deliveries.length > 0 ? (
                  deliveries.map((delivery, idx) => (
                    <div key={idx} className="delivery-item">
                      <div className="delivery-header">
                        <h3>Order #{delivery.orderNumber || delivery.orderId?.toString().slice(-6)}</h3>
                        <span className={`status-badge status-${delivery.status || "pending"}`}>
                          {(delivery.status || "pending").replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="delivery-details">
                        <p><strong>Customer:</strong> {delivery.customer?.name || "N/A"}</p>
                        <p><strong>Delivery Method:</strong> {delivery.deliveryMethod || "Pickup"}</p>
                        {delivery.estimatedDeliveryDate && (
                          <p><strong>Estimated Delivery:</strong> {new Date(delivery.estimatedDeliveryDate).toLocaleDateString()}</p>
                        )}
                        {delivery.deliveryAddress && (
                          <div className="delivery-address">
                            <p><strong>Address:</strong></p>
                            <p>
                              {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}, {delivery.deliveryAddress.province}
                            </p>
                            <p>Phone: {delivery.deliveryAddress.phone}</p>
                          </div>
                        )}
                        {delivery.deliveryTrackingNumber && (
                          <p><strong>Tracking Number:</strong> {delivery.deliveryTrackingNumber}</p>
                        )}
                      </div>
                      <div className="delivery-actions">
                        <Link to={`/orders/${delivery.orderId}`} className="btn btn-primary btn-sm">
                          View Order
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No delivery records</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Business Analytics</h2>
            </div>
            {analytics && (
              <div className="analytics-overview">
                <div className="analytics-stats">
                  <div className="analytics-stat-card">
                    <div className="analytics-stat-label">Monthly Revenue</div>
                    <div className="analytics-stat-value">
                      PKR {analytics.revenue?.monthly?.toLocaleString() || 0}
                    </div>
                    <div className="analytics-stat-change">
                      {analytics.revenue?.growth > 0 ? "+" : ""}{analytics.revenue?.growth || 0}% vs last month
                    </div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="analytics-stat-label">Total Customers</div>
                    <div className="analytics-stat-value">{analytics.totalCustomers || 0}</div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="analytics-stat-label">Average Order Value</div>
                    <div className="analytics-stat-value">
                      PKR {analytics.averageOrderValue?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="analytics-stat-card">
                    <div className="analytics-stat-label">Retention Rate</div>
                    <div className="analytics-stat-value">
                      {retention?.retentionRate || 0}%
                    </div>
                  </div>
                </div>

                {earnings && (
                  <div className="analytics-section">
                    <h3>Earnings Report & Projections</h3>
                    <div className="earnings-chart">
                      <div className="earnings-projection">
                        <p><strong>Projected Next Month:</strong> PKR {earnings.projection?.nextMonth?.toLocaleString() || 0}</p>
                        <p><strong>Growth Rate:</strong> {earnings.projection?.growthRate || 0}%</p>
                      </div>
                      <div className="earnings-history">
                        <h4>Historical Earnings (Last 6 Months)</h4>
                        <div className="earnings-list">
                          {earnings.historical?.map((item, idx) => (
                            <div key={idx} className="earnings-item">
                              <span className="earnings-period">{item.period}</span>
                              <span className="earnings-amount">PKR {item.revenue?.toLocaleString() || 0}</span>
                              <span className="earnings-orders">{item.orders} orders</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {retention && (
                  <div className="analytics-section">
                    <h3>Customer Retention Metrics</h3>
                    <div className="retention-metrics">
                      <div className="retention-stat">
                        <div className="retention-label">Total Customers</div>
                        <div className="retention-value">{retention.totalCustomers || 0}</div>
                      </div>
                      <div className="retention-stat">
                        <div className="retention-label">Repeat Customers</div>
                        <div className="retention-value">{retention.repeatCustomers || 0}</div>
                      </div>
                      <div className="retention-stat">
                        <div className="retention-label">Retention Rate</div>
                        <div className="retention-value">{retention.retentionRate || 0}%</div>
                      </div>
                      <div className="retention-stat">
                        <div className="retention-label">Average Lifetime Value</div>
                        <div className="retention-value">PKR {retention.averageLifetimeValue?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                    <div className="top-customers">
                      <h4>Top Customers by Revenue</h4>
                      <div className="customers-list">
                        {retention.topCustomersByRevenue?.slice(0, 5).map((customer, idx) => (
                          <div key={idx} className="customer-item">
                            <span className="customer-name">{customer.customer?.name || "N/A"}</span>
                            <span className="customer-orders">{customer.orderCount} orders</span>
                            <span className="customer-revenue">PKR {customer.totalSpent?.toLocaleString() || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {popularServices && (
                  <div className="analytics-section">
                    <h3>Popular Service Analysis</h3>
                    <div className="services-analysis">
                      <div className="services-list">
                        <h4>Top Service Types</h4>
                        {popularServices.serviceTypes?.slice(0, 5).map((service, idx) => (
                          <div key={idx} className="service-item">
                            <span className="service-name">{service.type}</span>
                            <span className="service-count">{service.count} orders</span>
                            <span className="service-revenue">PKR {service.revenue?.toLocaleString() || 0}</span>
                            <span className="service-avg">Avg: PKR {service.averagePrice?.toLocaleString() || 0}</span>
                          </div>
                        ))}
                      </div>
                      <div className="garments-list">
                        <h4>Top Garment Types</h4>
                        {popularServices.garmentTypes?.slice(0, 5).map((garment, idx) => (
                          <div key={idx} className="garment-item">
                            <span className="garment-name">{garment.type}</span>
                            <span className="garment-count">{garment.count} orders</span>
                            <span className="garment-revenue">PKR {garment.revenue?.toLocaleString() || 0}</span>
                            <span className="garment-avg">Avg: PKR {garment.averagePrice?.toLocaleString() || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {seasonalDemand && (
                  <div className="analytics-section">
                    <h3>Seasonal Demand Forecasting</h3>
                    <div className="seasonal-analysis">
                      <div className="seasonal-forecast">
                        <h4>Current Season Forecast</h4>
                        <p><strong>Season:</strong> {seasonalDemand.forecast?.season}</p>
                        <p><strong>Projected Orders:</strong> {seasonalDemand.forecast?.projectedOrders || 0}</p>
                        <p><strong>Projected Revenue:</strong> PKR {seasonalDemand.forecast?.projectedRevenue?.toLocaleString() || 0}</p>
                      </div>
                      <div className="seasonal-stats">
                        <h4>Seasonal Breakdown</h4>
                        {seasonalDemand.seasonal?.map((season, idx) => (
                          <div key={idx} className="season-item">
                            <span className="season-name">{season.season}</span>
                            <span className="season-orders">{season.orders} orders</span>
                            <span className="season-revenue">PKR {season.revenue?.toLocaleString() || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {benchmarking && (
                  <div className="analytics-section">
                    <h3>Performance Benchmarking</h3>
                    <div className="benchmarking-metrics">
                      {Object.entries(benchmarking.performance || {}).map(([key, metric]) => (
                        <div key={key} className="benchmark-item">
                          <div className="benchmark-label">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                          <div className="benchmark-comparison">
                            <span className="benchmark-value">Your: {metric.value}</span>
                            <span className="benchmark-benchmark">Benchmark: {metric.benchmark}</span>
                            <span className={`benchmark-status ${metric.status}`}>
                              {metric.status === "above" ? "Above Average" : "Below Average"}
                            </span>
                            <span className="benchmark-diff">
                              {metric.difference > 0 ? "+" : ""}{metric.difference}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorDashboard;

