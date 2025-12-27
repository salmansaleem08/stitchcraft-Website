import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./SupplierListing.css";

const SupplierListing = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    businessType: "",
    verificationStatus: "",
    minRating: "",
  });
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    fetchSuppliers();
  }, [filters, sort]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      params.append("sort", sort);

      const response = await api.get(`/suppliers?${params.toString()}`);
      setSuppliers(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load suppliers. Please try again.");
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      businessType: "",
      verificationStatus: "",
      minRating: "",
    });
    setSort("rating");
  };

  const businessTypes = [
    "Manufacturer",
    "Wholesaler",
    "Retailer",
    "Distributor",
    "Importer",
    "Exporter",
  ];

  if (loading && suppliers.length === 0) {
    return (
      <div className="supplier-listing-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-listing-container">
      <div className="container">
        <div className="listing-header">
          <h1>Suppliers Directory</h1>
          <p>Find verified suppliers for your tailoring needs</p>
        </div>

        <div className="listing-content">
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h2>Filters</h2>
              <button onClick={clearFilters} className="btn-clear-filters">
                Clear All
              </button>
            </div>

            <div className="filter-group">
              <label htmlFor="search">Search</label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search suppliers..."
              />
            </div>

            <div className="filter-group">
              <label htmlFor="businessType">Business Type</label>
              <select
                id="businessType"
                name="businessType"
                value={filters.businessType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="verificationStatus">Verification</label>
              <select
                id="verificationStatus"
                name="verificationStatus"
                value={filters.verificationStatus}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="verified">Verified Only</option>
                <option value="under_review">Under Review</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="minRating">Minimum Rating</label>
              <select
                id="minRating"
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
          </aside>

          <main className="suppliers-main">
            <div className="suppliers-header">
              <h2>
                {suppliers.length > 0
                  ? `Found ${suppliers.length} suppl${suppliers.length !== 1 ? "iers" : "ier"}`
                  : "No suppliers found"}
              </h2>
              <div className="sort-controls">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {suppliers.length === 0 && !loading ? (
              <div className="no-results">
                <p>No suppliers match your filters. Try adjusting your search criteria.</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="suppliers-grid">
                {suppliers.map((supplier) => (
                  <Link
                    key={supplier._id}
                    to={`/suppliers/${supplier._id}`}
                    className="supplier-card"
                  >
                    <div className="supplier-card-header">
                      <div className="supplier-avatar">
                        {supplier.avatar ? (
                          <img src={supplier.avatar} alt={supplier.businessName || supplier.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(supplier.businessName || supplier.name).charAt(0).toUpperCase()}
                          </div>
                        )}
                        {supplier.verificationStatus === "verified" && (
                          <span className="verified-badge">Verified</span>
                        )}
                      </div>
                      <div className="supplier-info-header">
                        <h3>{supplier.businessName || supplier.name}</h3>
                        {supplier.businessType && (
                          <p className="business-type">{supplier.businessType}</p>
                        )}
                      </div>
                    </div>

                    {supplier.businessDescription && (
                      <p className="supplier-description">
                        {supplier.businessDescription.substring(0, 120)}
                        {supplier.businessDescription.length > 120 ? "..." : ""}
                      </p>
                    )}

                    <div className="supplier-stats">
                      {supplier.qualityRating > 0 && (
                        <div className="stat-item">
                          <span className="stat-label">Rating:</span>
                          <span className="stat-value">
                            {"★".repeat(Math.floor(supplier.qualityRating))}
                            {"☆".repeat(5 - Math.floor(supplier.qualityRating))}{" "}
                            {supplier.qualityRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {supplier.yearsInBusiness > 0 && (
                        <div className="stat-item">
                          <span className="stat-label">Experience:</span>
                          <span className="stat-value">{supplier.yearsInBusiness} years</span>
                        </div>
                      )}
                      {supplier.productCategories && supplier.productCategories.length > 0 && (
                        <div className="stat-item">
                          <span className="stat-label">Categories:</span>
                          <span className="stat-value">{supplier.productCategories.length}</span>
                        </div>
                      )}
                    </div>

                    {supplier.productCategories && supplier.productCategories.length > 0 && (
                      <div className="supplier-categories">
                        {supplier.productCategories.slice(0, 3).map((category, idx) => (
                          <span key={idx} className="category-tag">
                            {category}
                          </span>
                        ))}
                        {supplier.productCategories.length > 3 && (
                          <span className="category-tag more">
                            +{supplier.productCategories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {supplier.address && (
                      <div className="supplier-location">
                        <span>
                          {supplier.address.city && `${supplier.address.city}, `}
                          {supplier.address.province && supplier.address.province}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SupplierListing;

