import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplierAnalytics.css";

const SupplierAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [overview, setOverview] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      return;
    }
    fetchAnalytics();
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, trendsRes, productsRes, statsRes] = await Promise.all([
        api.get("/analytics/overview"),
        api.get(`/analytics/revenue-trends?period=${period}&months=6`),
        api.get("/analytics/top-products?limit=10"),
        api.get("/analytics/order-stats"),
      ]);

      setOverview(overviewRes.data.data);
      setRevenueTrends(trendsRes.data.data);
      setTopProducts(productsRes.data.data);
      setOrderStats(statsRes.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load analytics data");
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxRevenue = () => {
    if (revenueTrends.length === 0) return 0;
    return Math.max(...revenueTrends.map((d) => d.revenue));
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount?.toLocaleString() || 0}`;
  };

  if (loading) {
    return (
      <div className="supplier-analytics-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-analytics-container">
      <div className="container">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <div className="header-actions">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="period-select"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
            <Link to="/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {overview && (
          <>
            <div className="overview-cards">
              <div className="stat-card revenue">
                <div className="stat-icon">Revenue</div>
                <div className="stat-value">{formatCurrency(overview.revenue.monthly)}</div>
                <div className="stat-label">This Month</div>
                <div className="stat-change">
                  {overview.revenue.growth >= 0 ? "+" : ""}
                  {overview.revenue.growth.toFixed(1)}% from last month
                </div>
                <div className="stat-total">Total: {formatCurrency(overview.revenue.total)}</div>
              </div>

              <div className="stat-card orders">
                <div className="stat-icon">Orders</div>
                <div className="stat-value">{overview.orders.monthly}</div>
                <div className="stat-label">This Month</div>
                <div className="stat-total">Total: {overview.orders.total}</div>
              </div>

              <div className="stat-card products">
                <div className="stat-icon">Products</div>
                <div className="stat-value">{overview.products.active}</div>
                <div className="stat-label">Active Products</div>
                <div className="stat-total">Total: {overview.products.total}</div>
              </div>

              <div className="stat-card reviews">
                <div className="stat-icon">Rating</div>
                <div className="stat-value">
                  {overview.reviews.averageRating > 0
                    ? overview.reviews.averageRating.toFixed(1)
                    : "N/A"}
                </div>
                <div className="stat-label">Average Rating</div>
                <div className="stat-total">{overview.reviews.total} reviews</div>
              </div>

              {overview.estimatedProfit !== undefined && (
                <div className="stat-card profit">
                  <div className="stat-icon">Profit</div>
                  <div className="stat-value">{formatCurrency(overview.estimatedProfit)}</div>
                  <div className="stat-label">Estimated Profit</div>
                  <div className="stat-total">From {formatCurrency(overview.totalRevenue)} revenue</div>
                </div>
              )}

              {overview.totalInventoryValue !== undefined && (
                <div className="stat-card inventory">
                  <div className="stat-icon">Inventory</div>
                  <div className="stat-value">{formatCurrency(overview.totalInventoryValue)}</div>
                  <div className="stat-label">Inventory Value</div>
                  <div className="stat-total">{overview.totalItemsLeft || 0} items left</div>
                </div>
              )}
            </div>

            <div className="analytics-grid">
              <div className="chart-card">
                <h2>Revenue Trends</h2>
                <div className="revenue-chart">
                  {revenueTrends.length > 0 ? (
                    <>
                      <div className="chart-bars">
                        {revenueTrends.map((data, idx) => {
                          const maxRevenue = getMaxRevenue();
                          const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                          return (
                            <div key={idx} className="chart-bar-container">
                              <div
                                className="chart-bar"
                                style={{ height: `${height}%` }}
                                title={formatCurrency(data.revenue)}
                              >
                                <span className="bar-value">
                                  {data.revenue > 0 ? formatCurrency(data.revenue) : ""}
                                </span>
                              </div>
                              <div className="bar-label">{data.period}</div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="no-data">No revenue data available</div>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <h2>Top Products</h2>
                {topProducts.length > 0 ? (
                  <div className="top-products-list">
                    {topProducts.map((product, idx) => (
                      <div key={product.id} className="product-item">
                        <div className="product-rank">#{idx + 1}</div>
                        <div className="product-image">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <div className="product-placeholder">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <p className="product-category">{product.category}</p>
                          <div className="product-stats">
                            <span>Revenue: {formatCurrency(product.revenue)}</span>
                            <span>Orders: {product.orders}</span>
                            <span>Qty: {product.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">No product sales data available</div>
                )}
              </div>
            </div>

            {orderStats && (
              <div className="analytics-grid">
                <div className="chart-card">
                  <h2>Order Statistics</h2>
                  <div className="order-stats-content">
                    <div className="stat-item">
                      <span className="stat-label">Total Orders:</span>
                      <span className="stat-value">{orderStats.total}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Order Value:</span>
                      <span className="stat-value">
                        {formatCurrency(orderStats.averageOrderValue)}
                      </span>
                    </div>
                    <div className="order-types">
                      <h3>Orders by Type</h3>
                      <div className="type-stats">
                        <div className="type-stat">
                          <span>Supply Orders:</span>
                          <span>{orderStats.ordersByType.supply}</span>
                        </div>
                        <div className="type-stat">
                          <span>Bulk Orders:</span>
                          <span>{orderStats.ordersByType.bulk}</span>
                        </div>
                        <div className="type-stat">
                          <span>Sample Orders:</span>
                          <span>{orderStats.ordersByType.sample}</span>
                        </div>
                      </div>
                    </div>
                    <div className="status-distribution">
                      <h3>Status Distribution</h3>
                      <div className="status-stats">
                        {Object.entries(orderStats.statusDistribution).map(([status, count]) => (
                          <div key={status} className="status-stat">
                            <span className="status-label">
                              {status.charAt(0).toUpperCase() + status.slice(1)}:
                            </span>
                            <span className="status-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierAnalytics;

