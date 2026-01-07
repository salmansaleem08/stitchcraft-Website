import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import {
  FaSearch,
  FaRulerCombined,
  FaPalette,
  FaTag,
  FaCheckCircle,
  FaStar,
  FaMapMarkerAlt,
  FaBox,
  FaDollarSign,
  FaChartLine,
  FaSpinner,
} from "react-icons/fa";
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
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Supplier Price Comparison</h1>
              <p className="dashboard-subtitle">
                Compare prices across different suppliers to find the best deals. Make informed purchasing decisions with real-time price comparisons.
              </p>
            </div>
          </div>
        </div>

        <div className="comparison-filters">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${productType === "fabric" ? "active" : ""}`}
              onClick={() => setProductType("fabric")}
            >
              <FaRulerCombined className="tab-icon" />
              Fabrics
            </button>
            <button
              className={`tab-btn ${productType === "supply" ? "active" : ""}`}
              onClick={() => setProductType("supply")}
            >
              <FaBox className="tab-icon" />
              Supplies
            </button>
          </div>

          <div className="filter-form">
            {productType === "fabric" ? (
              <>
                <div className="filter-group">
                  <FaRulerCombined className="filter-icon" />
                  <select
                    value={filters.fabricType}
                    onChange={(e) => setFilters({ ...filters, fabricType: e.target.value })}
                    className="filter-select"
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
                </div>
                <div className="filter-group">
                  <FaPalette className="filter-icon" />
                  <input
                    type="text"
                    placeholder="Color (optional)"
                    value={filters.color}
                    onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                    className="filter-input"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="filter-group">
                  <FaTag className="filter-icon" />
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="filter-select"
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
                </div>
                <div className="filter-group">
                  <FaTag className="filter-icon" />
                  <input
                    type="text"
                    placeholder="Brand (optional)"
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    className="filter-input"
                  />
                </div>
              </>
            )}
            <button onClick={fetchComparisons} className="btn-primary-compare">
              <FaSearch className="btn-icon" />
              Compare Prices
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading price comparisons...</p>
          </div>
        )}

        {!loading && comparisons.length > 0 && (
          <div className="comparisons-list">
            {comparisons.map((comparison, idx) => (
              <div key={idx} className="comparison-card">
                <div className="comparison-header">
                  <div className="comparison-title-section">
                    <h3>
                      {productType === "fabric"
                        ? `${comparison.fabricType}`
                        : `${comparison.category}`}
                    </h3>
                  </div>
                  <div className="comparison-stats">
                    <div className="stat-item">
                      <FaBox className="stat-icon" />
                      <span>{comparison.statistics?.supplierCount || 0} Suppliers</span>
                    </div>
                    <div className="stat-item">
                      <FaChartLine className="stat-icon" />
                      <span>Avg: PKR {(comparison.statistics?.averagePrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="stat-item savings">
                      <FaDollarSign className="stat-icon" />
                      <span>Save up to: PKR {(comparison.statistics?.potentialSavings || 0).toFixed(2)}</span>
                    </div>
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
                        {supplier.supplier?.verificationStatus === "verified" && (
                          <span className="verified-badge">
                            <FaCheckCircle className="badge-icon" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="supplier-info">
                        <Link
                          to={`/suppliers/${supplier.supplier?._id || supplier.supplier?.id || ""}`}
                          className="supplier-name"
                        >
                          {supplier.supplier?.name || supplier.supplier?.businessName || "Unknown Supplier"}
                        </Link>
                        {supplier.supplier?.qualityRating > 0 && (
                          <div className="quality-rating">
                            <FaStar className="rating-icon filled" />
                            <span>Quality: {(supplier.supplier.qualityRating || 0).toFixed(1)}/5</span>
                          </div>
                        )}
                      </div>
                      <div className="price-section">
                        <div className="price-main">
                          <FaDollarSign className="price-icon" />
                          PKR{" "}
                          {productType === "fabric"
                            ? (supplier.pricePerMeter || 0).toLocaleString()
                            : (supplier.price || 0).toLocaleString()}
                        </div>
                        <div className="price-unit">
                          {productType === "fabric" ? "per meter" : `per ${supplier.unit || "unit"}`}
                        </div>
                        {supplier.stockQuantity !== undefined && (
                          <div className="stock-info">
                            <FaBox className="stock-icon" />
                            <span>Stock: {supplier.stockQuantity > 0 ? supplier.stockQuantity : "Out of Stock"}</span>
                          </div>
                        )}
                      </div>
                      {supplier.rating > 0 && (
                        <div className="product-rating">
                          <FaStar className="rating-icon filled" />
                          <span>Rating: {(supplier.rating || 0).toFixed(1)}/5</span>
                        </div>
                      )}
                      {supplier.supplier?.location?.city && (
                        <div className="location">
                          <FaMapMarkerAlt className="location-icon" />
                          <span>{supplier.supplier.location.city}</span>
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
            <div className="empty-icon">
              <FaChartLine />
            </div>
            <h3>No Comparisons Yet</h3>
            <p>Select filters and click "Compare Prices" to see supplier comparisons</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparison;

