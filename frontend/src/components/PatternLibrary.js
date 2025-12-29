import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./PatternLibrary.css";

const PatternLibrary = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    designType: "",
    difficulty: "",
    minPrice: "",
    maxPrice: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPatterns();
  }, [filters, pagination.page]);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "")),
      });

      const response = await api.get(`/patterns?${params}`);
      setPatterns(response.data.data);
      setPagination(response.data.pagination);
      setError("");
    } catch (error) {
      setError("Failed to load patterns");
      console.error("Error fetching patterns:", error);
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
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      designType: "",
      difficulty: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (loading && patterns.length === 0) {
    return (
      <div className="pattern-library-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pattern-library-container">
      <div className="container">
        <div className="pattern-library-header">
          <h1>Pattern library</h1>
          <p>Discover traditional Pakistani designs, modern fashion patterns, and custom creations</p>
        </div>

        <div className="pattern-library-controls">
          <div className="search-controls">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search patterns..."
              className="search-input"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
            >
              {showFilters ? "Hide filters" : "Show filters"}
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-field">
                  <label>Category</label>
                  <select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All categories</option>
                    <option value="Traditional Pakistani">Traditional Pakistani</option>
                    <option value="Modern Fashion">Modern Fashion</option>
                    <option value="Western">Western</option>
                    <option value="Fusion">Fusion</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label>Design type</label>
                  <select name="designType" value={filters.designType} onChange={handleFilterChange}>
                    <option value="">All types</option>
                    <option value="Kurta">Kurta</option>
                    <option value="Shalwar">Shalwar</option>
                    <option value="Dupatta">Dupatta</option>
                    <option value="Saree">Saree</option>
                    <option value="Lehenga">Lehenga</option>
                    <option value="Gown">Gown</option>
                    <option value="Shirt">Shirt</option>
                    <option value="Trouser">Trouser</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label>Difficulty</label>
                  <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
                    <option value="">All levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label>Price range</label>
                  <div className="price-range-inputs">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="filter-field">
                  <label>Sort by</label>
                  <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                    <option value="createdAt">Newest</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </div>
              <button onClick={clearFilters} className="btn btn-text">
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {patterns.length === 0 ? (
          <div className="empty-state">
            <p>No patterns found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="results-count">
              <span>{patterns.length} pattern{patterns.length !== 1 ? "s" : ""} found</span>
            </div>
            <div className="pattern-grid">
              {patterns.map((pattern) => {
                const primaryImage = pattern.images?.find((img) => img.isPrimary) || pattern.images?.[0];
                return (
                  <Link key={pattern._id} to={`/patterns/${pattern._id}`} className="pattern-card">
                    <div className="pattern-image-wrapper">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={pattern.title} className="pattern-image" />
                      ) : (
                        <div className="pattern-placeholder">No image</div>
                      )}
                      {pattern.isFree && <span className="pattern-badge free">Free</span>}
                      {pattern.featured && <span className="pattern-badge featured">Featured</span>}
                    </div>
                    <div className="pattern-info">
                      <h3>{pattern.title}</h3>
                      <p className="pattern-description">
                        {pattern.description?.substring(0, 80)}...
                      </p>
                      <div className="pattern-tags">
                        <span className="pattern-tag">{pattern.category}</span>
                        <span className="pattern-tag">{pattern.designType}</span>
                      </div>
                      <div className="pattern-footer">
                        <div className="pattern-price">
                          {pattern.isFree ? (
                            <span className="free-text">Free</span>
                          ) : (
                            <span>PKR {pattern.price?.toLocaleString() || 0}</span>
                          )}
                        </div>
                        {pattern.stats?.rating > 0 && (
                          <div className="pattern-rating">
                            <span className="rating-star">★</span>
                            <span>{pattern.stats.rating.toFixed(1)}</span>
                            <span className="pattern-reviews">({pattern.stats.totalReviews || 0})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
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

export default PatternLibrary;
