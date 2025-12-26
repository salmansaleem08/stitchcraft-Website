import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [lowStockFabrics, setLowStockFabrics] = useState([]);
  const [lowStockSupplies, setLowStockSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      return;
    }
    fetchInventoryData();
  }, [user]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lowStockRes] = await Promise.all([
        api.get("/inventory/summary"),
        api.get("/inventory/low-stock?threshold=10"),
      ]);
      setSummary(summaryRes.data.data);
      if (lowStockRes.data.fabrics && lowStockRes.data.supplies) {
        setLowStockFabrics(lowStockRes.data.fabrics || []);
        setLowStockSupplies(lowStockRes.data.supplies || []);
      } else {
        setLowStockFabrics(lowStockRes.data.data || []);
        setLowStockSupplies([]);
      }
      setError("");
    } catch (error) {
      setError("Failed to load inventory data");
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inventory-management-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-management-container">
      <div className="container">
        <div className="inventory-header">
          <h1>Inventory Management</h1>
          <div className="header-actions">
            <Link to="/fabrics/new" className="btn btn-primary">
              Add Fabric
            </Link>
            <Link to="/supplies/new" className="btn btn-primary">
              Add Supply
            </Link>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="inventory-tabs">
          <button
            className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          <button
            className={`tab-btn ${activeTab === "low-stock" ? "active" : ""}`}
            onClick={() => setActiveTab("low-stock")}
          >
            Low Stock ({lowStockFabrics.length})
          </button>
        </div>

        {activeTab === "summary" && summary && (
          <div className="inventory-summary">
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-value">{summary.totalFabrics || 0}</div>
                <div className="card-label">Total Fabrics</div>
              </div>
              <div className="summary-card">
                <div className="card-value">{summary.totalSupplies || 0}</div>
                <div className="card-label">Total Supplies</div>
              </div>
              <div className="summary-card">
                <div className="card-value">{summary.activeFabrics || 0}</div>
                <div className="card-label">Active Fabrics</div>
              </div>
              <div className="summary-card">
                <div className="card-value">{summary.activeSupplies || 0}</div>
                <div className="card-label">Active Supplies</div>
              </div>
              <div className="summary-card">
                <div className="card-value">
                  {(summary.lowStockFabrics || 0) + (summary.lowStockSupplies || 0)}
                </div>
                <div className="card-label">Low Stock Items</div>
              </div>
              <div className="summary-card">
                <div className="card-value">
                  {(summary.outOfStockFabrics || 0) + (summary.outOfStockSupplies || 0)}
                </div>
                <div className="card-label">Out of Stock</div>
              </div>
              <div className="summary-card">
                <div className="card-value">
                  PKR {((summary.totalStockValue || 0) + (summary.totalSuppliesValue || 0)).toLocaleString()}
                </div>
                <div className="card-label">Total Stock Value</div>
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
      </div>
    </div>
  );
};

export default InventoryManagement;

