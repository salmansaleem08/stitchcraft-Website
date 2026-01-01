import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import "./SupplyListing.css";

const SupplyListing = () => {
  const { user } = useContext(AuthContext);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    brand: "",
    color: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSupplies();
  }, [filters, sort, page]);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      params.append("sort", sort);
      params.append("page", page);
      params.append("limit", "20");

      const response = await api.get(`/supplies?${params.toString()}`);
      setSupplies(response.data.data);
      setTotalPages(response.data.pages);
      setError("");
    } catch (error) {
      setError("Failed to load supplies. Please try again.");
      console.error("Error fetching supplies:", error);
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
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      subcategory: "",
      brand: "",
      color: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    });
    setPage(1);
  };

  const categories = [
    "Threads",
    "Needles",
    "Buttons",
    "Zippers",
    "Sewing Machines",
    "Embroidery Materials",
    "Mannequins",
    "Measuring Tools",
    "Packaging Materials",
    "Other",
  ];

  if (loading && supplies.length === 0) {
    return (
      <div className="supply-listing-container">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading supplies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supply-listing-container">
      <div className="container">
        <div className="listing-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Supplies Marketplace</h1>
              <p className="dashboard-subtitle">
                Browse and discover all your tailoring supplies. Find threads, needles, buttons, zippers, and more from verified suppliers.
              </p>
            </div>
            {user && user.role === "supplier" && (
              <Link to="/supplies/new" className="btn-primary-header">
                <FaPlus className="btn-icon" />
                Add Supply
              </Link>
            )}
          </div>
        </div>

        <div className="listing-controls">
          <div className="search-controls">
            <div className="input-wrapper">
              <FaSearch className="input-icon" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search supplies..."
                className="search-input"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-toggle-btn"
            >
              <FaFilter className="btn-icon" />
              {showFilters ? "Hide filters" : "Show filters"}
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-field">
                  <label htmlFor="category">
                    <FaFilter className="label-icon" />
                    Category
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="category"
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="">All categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-field">
                  <label htmlFor="brand">
                    <FaFilter className="label-icon" />
                    Brand
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={filters.brand}
                      onChange={handleFilterChange}
                      placeholder="Enter brand name"
                      className="filter-input"
                    />
                  </div>
                </div>

                <div className="filter-field">
                  <label htmlFor="color">
                    <FaFilter className="label-icon" />
                    Color
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={filters.color}
                      onChange={handleFilterChange}
                      placeholder="Enter color"
                      className="filter-input"
                    />
                  </div>
                </div>

                <div className="filter-field">
                  <label htmlFor="minPrice">
                    <FaFilter className="label-icon" />
                    Min Price
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="minPrice"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      min="0"
                      className="filter-input"
                    />
                  </div>
                </div>

                <div className="filter-field">
                  <label htmlFor="maxPrice">
                    <FaFilter className="label-icon" />
                    Max Price
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="maxPrice"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      min="0"
                      className="filter-input"
                    />
                  </div>
                </div>
              </div>
              <button onClick={clearFilters} className="btn-clear-filters">
                Clear all filters
              </button>
            </div>
          )}

          <div className="sort-controls">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={handleSortChange}>
              <option value="newest">Newest first</option>
              <option value="price_low">Price: Low to high</option>
              <option value="price_high">Price: High to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {supplies.length === 0 && !loading ? (
          <div className="empty-state">
            <p>No supplies match your filters. Try adjusting your search criteria.</p>
            <button onClick={clearFilters} className="btn-primary-header">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="results-count">
              <span>
                {supplies.length} suppl{supplies.length !== 1 ? "ies" : "y"} found
              </span>
            </div>
            <div className="supplies-grid">
              {supplies.map((supply) => (
                <Link
                  key={supply._id}
                  to={`/supplies/${supply._id}`}
                  className="supply-card"
                >
                  <div className="supply-image-wrapper">
                    {supply.images && supply.images.length > 0 ? (
                      <img src={supply.images[0]} alt={supply.name} className="supply-image" />
                    ) : (
                      <div className="supply-placeholder">
                        {supply.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {supply.supplier?.verificationStatus === "verified" && (
                      <span className="verified-badge">Verified</span>
                    )}
                  </div>
                  <div className="supply-info">
                    <h3>{supply.name}</h3>
                    <p className="supply-supplier">
                      {supply.supplier?.businessName || supply.supplier?.name}
                    </p>
                    <div className="supply-tags">
                      <span className="supply-tag">{supply.category}</span>
                      {supply.brand && <span className="supply-tag">{supply.brand}</span>}
                    </div>
                    <div className="supply-footer">
                      <span className="supply-price">
                        PKR {supply.price?.toLocaleString()}/{supply.unit || "piece"}
                      </span>
                      {supply.rating > 0 && (
                        <span className="supply-rating">
                          <span className="rating-star">★</span>
                          {supply.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {supply.stockQuantity !== undefined && (
                      <p className="supply-stock">
                        {supply.stockQuantity > 0
                          ? `In stock: ${supply.stockQuantity} ${supply.unit || "pieces"}`
                          : "Out of stock"}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupplyListing;
