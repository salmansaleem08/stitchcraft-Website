import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  FaArrowUp, FaShoppingBag, FaCheckCircle, FaClock, FaDollarSign, FaStar, FaUsers,
  FaCalendarAlt, FaEye
} from "react-icons/fa";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import "./TailorDashboard.css";

const TailorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [retention, setRetention] = useState(null);
  const [popularServices, setPopularServices] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  
  // Counter animation refs
  const totalRevenueRef = useRef(null);
  const totalExpectedRef = useRef(null);
  const paidRef = useRef(null);
  const pendingRef = useRef(null);
  const totalEarnedRef = useRef(null);
  const countersAnimated = useRef(false);

  useEffect(() => {
    if (!user || user.role !== "tailor") {
      return;
    }
    fetchAllData();
  }, [user]);

  useEffect(() => {
    if (!loading && stats && payments && !countersAnimated.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        animateCounters();
        countersAnimated.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, stats, payments]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentOrders(),
        fetchAllOrders(),
        fetchAnalytics(),
        fetchPayments(),
      ]);
      setError("");
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/tailors/stats");
      setStats(response.data.data);
    } catch (error) {
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
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get("/orders?limit=6");
      setRecentOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await api.get("/orders");
      const orders = response.data.data || [];
      setAllOrders(orders);
      // Filter active orders for timeline
      const active = orders
        .filter((order) => order.status !== "completed" && order.status !== "cancelled")
        .sort((a, b) => {
          const dateA = new Date(a.estimatedCompletionDate || a.createdAt);
          const dateB = new Date(b.estimatedCompletionDate || b.createdAt);
          return dateA - dateB;
        });
      setActiveOrders(active);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [overview, earningsData, retentionData, servicesData] = await Promise.all([
        api.get("/analytics/tailor/overview").catch(() => ({ data: { data: null } })),
        api.get("/analytics/tailor/earnings?period=monthly&months=6").catch(() => ({ data: { data: null } })),
        api.get("/analytics/tailor/retention").catch(() => ({ data: { data: null } })),
        api.get("/analytics/tailor/popular-services").catch(() => ({ data: { data: null } })),
      ]);
      setAnalytics(overview.data.data);
      setEarnings(earningsData.data.data);
      setRetention(retentionData.data.data);
      setPopularServices(servicesData.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
              status: payment.paid ? "paid" : "pending", // Convert paid boolean to status
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
      setPayments([]);
    }
  };

  // Counter animation function
  const animateCounters = () => {
    const duration = 1500;

    // Total Revenue Counter
    const totalRevenue = stats?.totalRevenue || 0;
    if (totalRevenueRef.current) {
      animateValue(totalRevenueRef.current, 0, totalRevenue, duration);
    }

    // Total Expected Counter - sum of all payment amounts
    const totalExpected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    if (totalExpectedRef.current) {
      animateValue(totalExpectedRef.current, 0, totalExpected, duration);
    }

    // Paid Counter - sum of paid payments
    const paid = payments.filter((p) => p.paid === true || p.status === "paid").reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    if (paidRef.current) {
      animateValue(paidRef.current, 0, paid, duration);
    }

    // Pending Counter - sum of unpaid payments
    const pending = payments.filter((p) => p.paid === false || p.status === "pending").reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    if (pendingRef.current) {
      animateValue(pendingRef.current, 0, pending, duration);
    }

    // Total Earned (completed revenue) - use completedRevenue from stats
    const totalEarned = stats?.completedRevenue || 0;
    if (totalEarnedRef.current) {
      animateValue(totalEarnedRef.current, 0, totalEarned, duration);
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

  // Chart colors
  const COLORS = ['#ff8c42', '#e67a33', '#ffa366', '#ffb380', '#ffc299'];
  const CHART_COLORS = {
    primary: '#ff8c42',
    secondary: '#e67a33',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  // Prepare earnings chart data
  const earningsChartData = earnings?.historical?.map(item => ({
    name: item.period,
    Revenue: item.revenue,
    Completed: item.completedRevenue,
    Orders: item.orders,
  })) || [];

  // Prepare popular services chart data
  const servicesChartData = popularServices?.services?.slice(0, 5).map(item => ({
    name: item.service || 'Other',
    value: item.count || 0,
    revenue: item.revenue || 0,
  })) || [];

  // Prepare order status pie chart data
  const orderStatusData = [
    { name: 'Completed', value: stats?.completedOrders || 0 },
    { name: 'Pending', value: stats?.pendingOrders || 0 },
    { name: 'In Progress', value: (stats?.totalOrders || 0) - (stats?.completedOrders || 0) - (stats?.pendingOrders || 0) },
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // These values are only used for initial display, animation will update them

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Dashboard</h1>
              <p className="dashboard-subtitle">Manage your orders, track performance, and grow your tailoring business</p>
            </div>
            <Link to="/orders" className="btn-primary-header">
              View All Orders
            </Link>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Grid */}
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
                <span>Increased from last month</span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-corner-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.completedOrders || 0}</div>
              <div className="stat-label">Completed Orders</div>
              <div className="stat-trend">
                <FaArrowUp className="trend-icon" />
                <span>Increased from last month</span>
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
              <div className="stat-value">{stats?.rating?.toFixed(1) || "0.0"}</div>
              <div className="stat-label">Rating</div>
              <div className="stat-trend">
                <FaArrowUp className="trend-icon" />
                <span>Increased from last month</span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-corner-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.totalCustomers || 0}</div>
              <div className="stat-label">Total Customers</div>
              <div className="stat-trend">
                <FaArrowUp className="trend-icon" />
                <span>Increased from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Overview */}
        <div className="dashboard-section payment-overview-section">
          <div className="section-header">
            <h2>Payments Overview</h2>
          </div>
          <div className="payment-summary-grid">
            <div className="payment-summary-item">
              <div className="payment-label">Total Expected</div>
              <div className="payment-value">
                PKR <span ref={totalExpectedRef}>0</span>
              </div>
            </div>
            <div className="payment-summary-item payment-paid">
              <div className="payment-label">Paid</div>
              <div className="payment-value paid">
                PKR <span ref={paidRef}>0</span>
              </div>
            </div>
            <div className="payment-summary-item payment-pending">
              <div className="payment-label">Pending</div>
              <div className="payment-value pending">
                PKR <span ref={pendingRef}>0</span>
              </div>
            </div>
            <div className="payment-summary-item payment-earned">
              <div className="payment-label">Total Earned</div>
              <div className="payment-value earned">
                PKR <span ref={totalEarnedRef}>0</span>
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
              <Link to="/orders" className="action-link">
                <span className="action-label">View all orders</span>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/packages/manage" className="action-link">
                <span className="action-label">Manage packages</span>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/pattern-designer" className="action-link">
                <span className="action-label">Create pattern</span>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/patterns/new" className="action-link">
                <span className="action-label">Pattern library</span>
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

        {/* Recent Orders - Grid Layout */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/orders" className="section-link">View all</Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="orders-grid">
              {recentOrders.map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id">#{order.orderNumber || order._id}</div>
                    <span className={`status-badge status-${order.status?.toLowerCase() || 'pending'}`}>
                      {order.status ? order.status.replace(/_/g, " ").toLowerCase() : "Pending"}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-service">{order.garmentType || "Garment"}</div>
                  </div>
                  <div className="order-card-footer">
                    <div className="order-amount">PKR {order.totalPrice?.toLocaleString() || 0}</div>
                    <div className="order-date">
                      <FaCalendarAlt className="date-icon" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent orders</p>
          )}
        </div>

        {/* Active Orders Timeline - Grid Layout */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Active Orders Timeline</h2>
            <Link to="/orders" className="section-link">View all orders</Link>
          </div>
          {activeOrders.length > 0 ? (
            <div className="timeline-grid">
              {activeOrders.map((order) => (
                <div key={order._id} className="timeline-card">
                  <div className="timeline-card-header">
                    <div>
                      <h3>Order #{order.orderNumber || order._id.toString().slice(-6)}</h3>
                      <div className="timeline-customer">{order.customer?.name || "N/A"}</div>
                    </div>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="timeline-card-body">
                    <div className="timeline-detail-item">
                      <span className="detail-label">Service:</span>
                      <span className="detail-value">{order.garmentType}</span>
                    </div>
                    <div className="timeline-detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">PKR {order.totalPrice?.toLocaleString() || 0}</span>
                    </div>
                    {order.estimatedCompletionDate && (
                      <div className="timeline-detail-item">
                        <span className="detail-label">Due Date:</span>
                        <span className="detail-value">
                          <FaCalendarAlt className="date-icon-small" />
                          {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="timeline-description">
                      {order.description || order.notes || `Active order for ${order.garmentType || 'garment'} - currently in ${order.status.replace("_", " ")} stage`}
                    </div>
                  </div>
                  <div className="timeline-card-footer">
                    <Link to={`/orders/${order._id}`} className="btn-action btn-view">
                      <FaEye /> View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No active orders</p>
          )}
        </div>

        {/* Analytics Section with Charts */}
        {analytics && (
          <>
            <div className="analytics-stats-grid">
              <div className="analytics-stat">
                <div className="analytics-label">Monthly Revenue</div>
                <div className="analytics-value">
                  PKR {analytics.revenue?.monthly?.toLocaleString() || 0}
                </div>
                {analytics.revenue?.growth && (
                  <div className="analytics-change positive">
                    <FaArrowUp /> {analytics.revenue.growth > 0 ? "+" : ""}{analytics.revenue.growth || 0}% vs last month
                  </div>
                )}
              </div>
              <div className="analytics-stat">
                <div className="analytics-label">Total Customers</div>
                <div className="analytics-value">{analytics.totalCustomers || retention?.totalCustomers || 0}</div>
              </div>
              <div className="analytics-stat">
                <div className="analytics-label">Avg Order Value</div>
                <div className="analytics-value">
                  PKR {analytics.averageOrderValue?.toLocaleString() || 0}
                </div>
              </div>
              <div className="analytics-stat">
                <div className="analytics-label">Retention Rate</div>
                <div className="analytics-value">
                  {retention?.retentionRate || 0}%
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Revenue Trend</h3>
                  <span className="chart-subtitle">Last 6 months</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={earningsChartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Revenue" 
                      stroke={CHART_COLORS.primary} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Completed" 
                      stroke={CHART_COLORS.success} 
                      fillOpacity={0.5} 
                      fill={CHART_COLORS.success} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Order Status Distribution</h3>
                  <span className="chart-subtitle">Current orders</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {earningsChartData.length > 0 && (
                <div className="chart-card chart-card-wide">
                  <div className="chart-header">
                    <h3>Monthly Earnings & Orders</h3>
                    <span className="chart-subtitle">Revenue and order volume</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={earningsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis yAxisId="left" stroke="#666" />
                      <YAxis yAxisId="right" orientation="right" stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #f0f0f0',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="Revenue" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                      <Bar yAxisId="left" dataKey="Completed" fill={CHART_COLORS.success} radius={[8, 8, 0, 0]} />
                      <Bar yAxisId="right" dataKey="Orders" fill={CHART_COLORS.secondary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {servicesChartData.length > 0 && (
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Popular Services</h3>
                    <span className="chart-subtitle">Top 5 services</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={servicesChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#666" />
                      <YAxis dataKey="name" type="category" stroke="#666" width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #f0f0f0',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TailorDashboard;
