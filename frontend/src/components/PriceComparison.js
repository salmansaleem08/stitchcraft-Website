import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./PriceComparison.css";

const PriceComparison = () => {
  const [productType, setProductType] = useState("fabric");
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fabricType: "",
    color: "",
    category: "",
    brand: "",
  });

  useEffect(() => {
    if (filters.fabricType || filters.color || filters.category || filters.brand) {
      fetchComparisons();
    }
  }, [productType, filters]);

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (productType === "fabric") {
        if (filters.fabricType) params.append("fabricType", filters.fabricType);
        if (filters.color) params.append("color", filters.color);
      } else {
        if (filters.category) params.append("category", filters.category);
        if (filters.brand) params.append("brand", filters.brand);
      }

      const endpoint = productType === "fabric" ? "/price-comparison/fabric" : "/price-comparison/supply";
      const response = await api.get(`${endpoint}?${params.toString()}`);
      setComparisons(response.data.data || []);
    } catch (error) {
      console.error("Error fetching price comparisons:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="price-comparison-container">
      <div className="container">
        <div className="page-header">
          <h1>Supplier Price Comparison</h1>
          <p>Compare prices across different suppliers to find the best deals</p>
        </div>

        <div className="comparison-filters">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${productType === "fabric" ? "active" : ""}`}
              onClick={() => setProductType("fabric")}
            >
              Fabrics
            </button>
            <button
              className={`tab-btn ${productType === "supply" ? "active" : ""}`}
              onClick={() => setProductType("supply")}
            >
              Supplies
            </button>
          </div>

          <div className="filter-form">
            {productType === "fabric" ? (
              <>
                <select
                  value={filters.fabricType}
                  onChange={(e) => setFilters({ ...filters, fabricType: e.target.value })}
                >
                  <option value="">All Fabric Types</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Silk">Silk</option>
                  <option value="Linen">Linen</option>
                  <option value="Wool">Wool</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Chiffon">Chiffon</option>
                  <option value="Georgette">Georgette</option>
                  <option value="Velvet">Velvet</option>
                  <option value="Denim">Denim</option>
                </select>
                <input
                  type="text"
                  placeholder="Color (optional)"
                  value={filters.color}
                  onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                />
              </>
            ) : (
              <>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  <option value="Threads">Threads</option>
                  <option value="Needles">Needles</option>
                  <option value="Buttons">Buttons</option>
                  <option value="Zippers">Zippers</option>
                  <option value="Sewing Machines">Sewing Machines</option>
                  <option value="Embroidery Materials">Embroidery Materials</option>
                  <option value="Mannequins">Mannequins</option>
                  <option value="Measuring Tools">Measuring Tools</option>
                </select>
                <input
                  type="text"
                  placeholder="Brand (optional)"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                />
              </>
            )}
            <button onClick={fetchComparisons} className="btn btn-primary">
              Compare Prices
            </button>
          </div>
        </div>

        {loading && <div className="loading-container">Loading comparisons...</div>}

        {!loading && comparisons.length > 0 && (
          <div className="comparisons-list">
            {comparisons.map((comparison, idx) => (
              <div key={idx} className="comparison-card">
                <div className="comparison-header">
                  <h3>
                    {productType === "fabric"
                      ? `${comparison.fabricType} - ${comparison.color} (${comparison.pattern})`
                      : `${comparison.category} - ${comparison.brand}`}
                  </h3>
                  <div className="comparison-stats">
                    <span className="stat-item">
                      {comparison.statistics.supplierCount} Suppliers
                    </span>
                    <span className="stat-item">
                      Avg: PKR {comparison.statistics.averagePrice.toFixed(2)}
                    </span>
                    <span className="stat-item savings">
                      Save up to: PKR {comparison.statistics.potentialSavings.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="suppliers-grid">
                  {comparison.suppliers.map((supplier, sIdx) => (
                    <div key={sIdx} className="supplier-card">
                      <div className="supplier-header">
                        <Link
                          to={
                            productType === "fabric"
                              ? `/fabrics/${supplier.id}`
                              : `/supplies/${supplier.id}`
                          }
                          className="product-link"
                        >
                          <h4>{supplier.name}</h4>
                        </Link>
                        {supplier.supplier.verified && (
                          <span className="verified-badge">Verified</span>
                        )}
                      </div>
                      <div className="supplier-info">
                        <Link
                          to={`/suppliers/${supplier.supplier.id}`}
                          className="supplier-name"
                        >
                          {supplier.supplier.name}
                        </Link>
                        {supplier.supplier.qualityRating > 0 && (
                          <div className="quality-rating">
                            Quality: {supplier.supplier.qualityRating.toFixed(1)}/5
                          </div>
                        )}
                      </div>
                      <div className="price-section">
                        <div className="price-main">
                          PKR{" "}
                          {productType === "fabric"
                            ? supplier.pricePerMeter.toLocaleString()
                            : supplier.price.toLocaleString()}
                        </div>
                        <div className="price-unit">
                          {productType === "fabric" ? "per meter" : `per ${supplier.unit}`}
                        </div>
                        {supplier.stockQuantity !== undefined && (
                          <div className="stock-info">
                            Stock: {supplier.stockQuantity > 0 ? supplier.stockQuantity : "Out of Stock"}
                          </div>
                        )}
                      </div>
                      {supplier.rating > 0 && (
                        <div className="product-rating">
                          Rating: {supplier.rating.toFixed(1)}/5
                        </div>
                      )}
                      {supplier.supplier.location?.city && (
                        <div className="location">
                          Location: {supplier.supplier.location.city}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && comparisons.length === 0 && (
          <div className="no-comparisons">
            <p>Select filters and click "Compare Prices" to see supplier comparisons</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparison;

