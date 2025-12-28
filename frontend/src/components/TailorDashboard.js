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
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-greeting">Welcome back, {user?.name || user?.shopName}</p>
          </div>
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
            Timeline
          </button>
          <button
            className={`tab-btn ${activeTab === "communication" ? "active" : ""}`}
            onClick={() => setActiveTab("communication")}
          >
            Messages
          </button>
          <button
            className={`tab-btn ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </button>
          <button
            className={`tab-btn ${activeTab === "delivery" ? "active" : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            Delivery
          </button>
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats?.totalOrders || 0}</div>
                <div className="stat-label">Total orders</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats?.completedOrders || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats?.pendingOrders || 0}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item stat-item-primary">
                <div className="stat-value">PKR {stats?.totalRevenue?.toLocaleString() || 0}</div>
                <div className="stat-label">Total revenue</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats?.rating?.toFixed(1) || "0.0"}</div>
                <div className="stat-label">Rating</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats?.totalCustomers || 0}</div>
                <div className="stat-label">Customers</div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Quick actions</h2>
                </div>
                <div className="actions-list">
                  <Link to="/orders" className="action-link">
                    <span className="action-label">View all orders</span>
                    <span className="action-arrow">→</span>
                  </Link>
                  <Link to="/packages/manage" className="action-link">
                    <span className="action-label">Manage packages</span>
                    <span className="action-arrow">→</span>
                  </Link>
                  <Link to="/patterns/new" className="action-link">
                    <span className="action-label">Create pattern</span>
                    <span className="action-arrow">→</span>
                  </Link>
                  <Link to="/pattern-designer" className="action-link">
                    <span className="action-label">Pattern designer</span>
                    <span className="action-arrow">→</span>
                  </Link>
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Performance</h2>
                </div>
                <div className="metrics-list">
                  <div className="metric-row">
                    <span className="metric-label">Completion rate</span>
                    <span className="metric-value">{stats?.completionRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="metric-bar-container">
                    <div className="metric-bar" style={{ width: `${stats?.completionRate || 0}%` }}></div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Response time</span>
                    <span className="metric-value">
                      {stats?.averageResponseTime ? `${stats.averageResponseTime.toFixed(1)}h` : "N/A"}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Avg order value</span>
                    <span className="metric-value">PKR {stats?.averageOrderValue?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent orders</h2>
                <Link to="/orders" className="section-link">View all</Link>
              </div>
              {recentOrders.length > 0 ? (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <Link key={order._id} to={`/orders/${order._id}`} className="order-item">
                      <div className="order-main">
                        <div className="order-id">#{order.orderNumber}</div>
                        <div className="order-customer">{order.customer?.name || "N/A"}</div>
                        <div className="order-service">{order.garmentType}</div>
                      </div>
                      <div className="order-meta">
                        <span className={`status-badge status-${order.status}`}>
                          {order.status.replace("_", " ")}
                        </span>
                        <div className="order-amount">PKR {order.totalPrice?.toLocaleString() || 0}</div>
                        <div className="order-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No recent orders</p>
              )}
            </div>
          </>
        )}

        {activeTab === "timeline" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Active orders</h2>
            </div>
            <div className="timeline-list">
              {allOrders
                .filter((order) => order.status !== "completed" && order.status !== "cancelled")
                .sort((a, b) => {
                  const dateA = new Date(a.estimatedCompletionDate || a.createdAt);
                  const dateB = new Date(b.estimatedCompletionDate || b.createdAt);
                  return dateA - dateB;
                })
                .map((order) => (
                  <div key={order._id} className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h3>Order #{order.orderNumber || order._id.toString().slice(-6)}</h3>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="timeline-details">
                        <p><strong>Customer:</strong> {order.customer?.name || "N/A"}</p>
                        <p><strong>Service:</strong> {order.garmentType}</p>
                        <p><strong>Price:</strong> PKR {order.totalPrice?.toLocaleString() || 0}</p>
                        {order.estimatedCompletionDate && (
                          <p><strong>Due:</strong> {new Date(order.estimatedCompletionDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                        View details
                      </Link>
                    </div>
                  </div>
                ))}
              {allOrders.filter((order) => order.status !== "completed" && order.status !== "cancelled").length === 0 && (
                <p className="empty-state">No active orders</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Messages</h2>
            </div>
            <div className="messages-list">
              {messages.length > 0 ? (
                messages.slice(0, 20).map((msg, idx) => (
                  <div key={idx} className="message-item">
                    <div className="message-header">
                      <span className="message-order">Order #{msg.orderNumber || msg.orderId?.toString().slice(-6)}</span>
                      <span className="message-date">{new Date(msg.sentAt).toLocaleString()}</span>
                    </div>
                    <div className="message-sender">
                      <strong>{msg.sender?.name || (msg.sender?.toString() === user?._id ? "You" : "Customer")}</strong>
                    </div>
                    <div className="message-content">{msg.content}</div>
                    <Link to={`/orders/${msg.orderId}`} className="btn btn-secondary btn-sm">
                      View order
                    </Link>
                  </div>
                ))
              ) : (
                <p className="empty-state">No messages</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Payments</h2>
            </div>
            <div className="payment-summary-grid">
              <div className="payment-summary-item">
                <div className="payment-label">Total expected</div>
                <div className="payment-value">
                  PKR {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="payment-summary-item">
                <div className="payment-label">Paid</div>
                <div className="payment-value paid">
                  PKR {payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="payment-summary-item">
                <div className="payment-label">Pending</div>
                <div className="payment-value pending">
                  PKR {payments.filter((p) => p.status !== "paid").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="payments-table-container">
              {payments.length > 0 ? (
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Due date</th>
                      <th>Status</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-state">No payment records</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Deliveries</h2>
            </div>
            <div className="deliveries-list">
              {deliveries.length > 0 ? (
                deliveries.map((delivery, idx) => (
                  <div key={idx} className="delivery-item">
                    <div className="delivery-header">
                      <h3>Order #{delivery.orderNumber || delivery.orderId?.toString().slice(-6)}</h3>
                      <span className={`status-badge status-${delivery.status || "pending"}`}>
                        {(delivery.status || "pending").replace("_", " ")}
                      </span>
                    </div>
                    <div className="delivery-details">
                      <p><strong>Customer:</strong> {delivery.customer?.name || "N/A"}</p>
                      <p><strong>Method:</strong> {delivery.deliveryMethod || "Pickup"}</p>
                      {delivery.estimatedDeliveryDate && (
                        <p><strong>Estimated:</strong> {new Date(delivery.estimatedDeliveryDate).toLocaleDateString()}</p>
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
                    </div>
                    <Link to={`/orders/${delivery.orderId}`} className="btn btn-secondary btn-sm">
                      View order
                    </Link>
                  </div>
                ))
              ) : (
                <p className="empty-state">No delivery records</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && analytics && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Analytics</h2>
            </div>
            <div className="analytics-content">
              <div className="analytics-stats-grid">
                <div className="analytics-stat">
                  <div className="analytics-label">Monthly revenue</div>
                  <div className="analytics-value">
                    PKR {analytics.revenue?.monthly?.toLocaleString() || 0}
                  </div>
                  {analytics.revenue?.growth && (
                    <div className="analytics-change">
                      {analytics.revenue.growth > 0 ? "+" : ""}{analytics.revenue.growth || 0}% vs last month
                    </div>
                  )}
                </div>
                <div className="analytics-stat">
                  <div className="analytics-label">Total customers</div>
                  <div className="analytics-value">{analytics.totalCustomers || 0}</div>
                </div>
                <div className="analytics-stat">
                  <div className="analytics-label">Avg order value</div>
                  <div className="analytics-value">
                    PKR {analytics.averageOrderValue?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="analytics-stat">
                  <div className="analytics-label">Retention rate</div>
                  <div className="analytics-value">
                    {retention?.retentionRate || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorDashboard;
