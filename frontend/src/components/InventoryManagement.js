import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  FaArrowUp, FaBox, FaWarehouse, FaExclamationTriangle, 
  FaDollarSign, FaCheckCircle, FaTimesCircle, FaPlus
} from "react-icons/fa";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [lowStockFabrics, setLowStockFabrics] = useState([]);
  const [lowStockSupplies, setLowStockSupplies] = useState([]);
  const [wasteAnalytics, setWasteAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  
  // Counter animation refs
  const totalFabricsRef = useRef(null);
  const totalSuppliesRef = useRef(null);
  const activeFabricsRef = useRef(null);
  const activeSuppliesRef = useRef(null);
  const lowStockRef = useRef(null);
  const outOfStockRef = useRef(null);
  const totalValueRef = useRef(null);
  const countersAnimated = useRef(false);

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      return;
    }
    fetchInventoryData();
  }, [user]);

  useEffect(() => {
    if (!loading && summary && !countersAnimated.current) {
      const timer = setTimeout(() => {
        animateCounters();
        countersAnimated.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, summary]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lowStockRes, wasteRes] = await Promise.all([
        api.get("/inventory/summary"),
        api.get("/inventory/low-stock?threshold=10"),
        api.get("/inventory/waste-analytics").catch(() => ({ data: { data: null } })),
      ]);
      setSummary(summaryRes.data.data);
      if (lowStockRes.data.fabrics && lowStockRes.data.supplies) {
        setLowStockFabrics(lowStockRes.data.fabrics || []);
        setLowStockSupplies(lowStockRes.data.supplies || []);
      } else {
        setLowStockFabrics(lowStockRes.data.data || []);
        setLowStockSupplies([]);
      }
      setWasteAnalytics(wasteRes.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load inventory data");
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Counter animation function
  const animateCounters = () => {
    const duration = 1500;

    const totalFabrics = summary?.totalFabrics || 0;
    if (totalFabricsRef.current) {
      animateValue(totalFabricsRef.current, 0, totalFabrics, duration);
    }

    const totalSupplies = summary?.totalSupplies || 0;
    if (totalSuppliesRef.current) {
      animateValue(totalSuppliesRef.current, 0, totalSupplies, duration);
    }

    const activeFabrics = summary?.activeFabrics || 0;
    if (activeFabricsRef.current) {
      animateValue(activeFabricsRef.current, 0, activeFabrics, duration);
    }

    const activeSupplies = summary?.activeSupplies || 0;
    if (activeSuppliesRef.current) {
      animateValue(activeSuppliesRef.current, 0, activeSupplies, duration);
    }

    const lowStock = (summary?.lowStockFabrics || 0) + (summary?.lowStockSupplies || 0);
    if (lowStockRef.current) {
      animateValue(lowStockRef.current, 0, lowStock, duration);
    }

    const outOfStock = (summary?.outOfStockFabrics || 0) + (summary?.outOfStockSupplies || 0);
    if (outOfStockRef.current) {
      animateValue(outOfStockRef.current, 0, outOfStock, duration);
    }

    const totalValue = (summary?.totalStockValue || 0) + (summary?.totalSuppliesValue || 0);
    if (totalValueRef.current) {
      animateValue(totalValueRef.current, 0, totalValue, duration);
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

  if (loading) {
    return (
      <div className="inventory-management-container">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-management-container">
      <div className="container">
        <div className="inventory-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Inventory Management</h1>
              <p className="dashboard-subtitle">
                Monitor your inventory levels, track stock quantities, manage low stock alerts, and analyze waste patterns to optimize your supply chain.
              </p>
            </div>
            <div className="header-actions">
              <Link to="/fabrics/new" className="btn-primary-header">
                <FaPlus className="btn-icon" />
                Add Fabric
              </Link>
              <Link to="/supplies/new" className="btn-primary-header">
                <FaPlus className="btn-icon" />
                Add Supply
              </Link>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="inventory-tabs">
          <button
            className={`view-btn ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          <button
            className={`view-btn ${activeTab === "low-stock" ? "active" : ""}`}
            onClick={() => setActiveTab("low-stock")}
          >
            Low Stock
          </button>
          <button
            className={`view-btn ${activeTab === "waste" ? "active" : ""}`}
            onClick={() => setActiveTab("waste")}
          >
            Waste Analytics
          </button>
        </div>

        {activeTab === "summary" && summary && (
          <div className="inventory-summary">
            <div className="stats-grid">
              <div className="stat-item stat-item-primary">
                <div className="stat-corner-icon">
                  <FaBox />
                </div>
                <div className="stat-content">
                  <div className="stat-value"><span ref={totalFabricsRef}>0</span></div>
                  <div className="stat-label">Total Fabrics</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaWarehouse />
                </div>
                <div className="stat-content">
                  <div className="stat-value"><span ref={totalSuppliesRef}>0</span></div>
                  <div className="stat-label">Total Supplies</div>
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
                  <div className="stat-value"><span ref={activeFabricsRef}>0</span></div>
                  <div className="stat-label">Active Fabrics</div>
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
                  <div className="stat-value"><span ref={activeSuppliesRef}>0</span></div>
                  <div className="stat-label">Active Supplies</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaExclamationTriangle />
                </div>
                <div className="stat-content">
                  <div className="stat-value"><span ref={lowStockRef}>0</span></div>
                  <div className="stat-label">Low Stock Items</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-corner-icon">
                  <FaTimesCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-value"><span ref={outOfStockRef}>0</span></div>
                  <div className="stat-label">Out of Stock</div>
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
                  <div className="stat-value">PKR <span ref={totalValueRef}>0</span></div>
                  <div className="stat-label">Total Stock Value</div>
                  <div className="stat-trend">
                    <FaArrowUp className="trend-icon" />
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {Object.keys(summary.byType).length > 0 && (
              <div className="type-breakdown">
                <h2>Breakdown by Type/Category</h2>
                <div className="type-grid">
                  {Object.entries(summary.byType).map(([type, data]) => (
                    <div key={type} className="type-card">
                      <div className="type-header">
                        <h3>{type}</h3>
                        {data.type && (
                          <span className="type-badge">{data.type}</span>
                        )}
                      </div>
                      <div className="type-stats">
                        <div className="type-stat">
                          <span className="stat-label">Count:</span>
                          <span className="stat-value">{data.count}</span>
                        </div>
                        <div className="type-stat">
                          <span className="stat-label">Stock:</span>
                          <span className="stat-value">{data.totalStock} units</span>
                        </div>
                        <div className="type-stat">
                          <span className="stat-label">Value:</span>
                          <span className="stat-value">
                            PKR {data.totalValue?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "low-stock" && (
          <div className="low-stock-section">
            {lowStockFabrics.length === 0 && lowStockSupplies.length === 0 ? (
              <div className="no-low-stock">
                <p>No low stock items. All products are well stocked!</p>
              </div>
            ) : (
              <div className="low-stock-list">
                {lowStockFabrics.map((fabric) => (
                  <div key={fabric._id} className="low-stock-item">
                    <div className="item-info">
                      <h3>{fabric.name}</h3>
                      <p className="item-type">Fabric: {fabric.fabricType} - {fabric.color}</p>
                      <p className="item-stock">
                        Stock: <strong>{fabric.stockQuantity} {fabric.unit || "meters"}</strong>
                      </p>
                    </div>
                    <div className="item-actions">
                      <Link
                        to={`/fabrics/${fabric._id}/edit`}
                        className="btn btn-secondary btn-small"
                      >
                        Update Stock
                      </Link>
                    </div>
                  </div>
                ))}
                {lowStockSupplies.map((supply) => (
                  <div key={supply._id} className="low-stock-item">
                    <div className="item-info">
                      <h3>{supply.name}</h3>
                      <p className="item-type">Supply: {supply.category} {supply.brand ? `- ${supply.brand}` : ""}</p>
                      <p className="item-stock">
                        Stock: <strong>{supply.stockQuantity} {supply.unit || "pieces"}</strong>
                      </p>
                    </div>
                    <div className="item-actions">
                      <Link
                        to={`/supplies/${supply._id}/edit`}
                        className="btn btn-secondary btn-small"
                      >
                        Update Stock
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "waste" && wasteAnalytics && (
          <div className="waste-analytics-section">
            <div className="waste-summary">
              <h2>Waste Summary</h2>
              <div className="waste-cards">
                <div className="waste-card">
                  <div className="waste-value">{wasteAnalytics.summary.totalFabricWaste.toFixed(2)}</div>
                  <div className="waste-label">Fabric Waste (meters)</div>
                  <div className="waste-percentage">{wasteAnalytics.summary.fabricWastePercentage}%</div>
                </div>
                <div className="waste-card">
                  <div className="waste-value">{wasteAnalytics.summary.totalSupplyWaste.toFixed(2)}</div>
                  <div className="waste-label">Supply Waste (units)</div>
                  <div className="waste-percentage">{wasteAnalytics.summary.supplyWastePercentage}%</div>
                </div>
                <div className="waste-card">
                  <div className="waste-value">
                    PKR {wasteAnalytics.summary.estimatedWasteCost.toLocaleString()}
                  </div>
                  <div className="waste-label">Estimated Waste Cost</div>
                </div>
              </div>
            </div>

            {wasteAnalytics.topWastefulItems.fabrics.length > 0 && (
              <div className="wasteful-items">
                <h3>Top Wasteful Fabrics</h3>
                <div className="wasteful-list">
                  {wasteAnalytics.topWastefulItems.fabrics.map((item) => (
                    <div key={item.id} className="wasteful-item">
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>{item.fabricType}</p>
                        <div className="waste-stats">
                          <span>Waste: {item.waste} meters ({item.wastePercentage.toFixed(2)}%)</span>
                          <span>Stock: {item.stockQuantity} meters</span>
                        </div>
                      </div>
                      <Link to={`/fabrics/${item.id}/edit`} className="btn btn-secondary btn-small">
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wasteAnalytics.topWastefulItems.supplies.length > 0 && (
              <div className="wasteful-items">
                <h3>Top Wasteful Supplies</h3>
                <div className="wasteful-list">
                  {wasteAnalytics.topWastefulItems.supplies.map((item) => (
                    <div key={item.id} className="wasteful-item">
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>{item.category}</p>
                        <div className="waste-stats">
                          <span>Waste: {item.waste} units ({item.wastePercentage.toFixed(2)}%)</span>
                          <span>Stock: {item.stockQuantity} units</span>
                        </div>
                      </div>
                      <Link to={`/supplies/${item.id}/edit`} className="btn btn-secondary btn-small">
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wasteAnalytics.recommendations && wasteAnalytics.recommendations.length > 0 && (
              <div className="waste-recommendations">
                <h3>Waste Reduction Recommendations</h3>
                <div className="recommendations-list">
                  {wasteAnalytics.recommendations.map((rec, idx) => (
                    <div key={idx} className={`recommendation-card priority-${rec.priority.toLowerCase()}`}>
                      <div className="recommendation-header">
                        <span className={`priority-badge priority-${rec.priority.toLowerCase()}`}>
                          {rec.priority}
                        </span>
                        <span className="recommendation-category">{rec.category}</span>
                      </div>
                      <h4>{rec.issue}</h4>
                      <p className="recommendation-text">{rec.recommendation}</p>
                      <p className="recommendation-action">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;

