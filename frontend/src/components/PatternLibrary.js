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
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="pattern-library">
      <div className="container">
        <div className="pattern-library-header">
          <h1>Design & Pattern Library</h1>
          <p>Discover traditional Pakistani designs, modern fashion patterns, and custom creations</p>
        </div>

        <div className="pattern-library-content">
          <aside className="pattern-filters">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="btn-link">
                Clear All
              </button>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search patterns..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-select">
                <option value="">All Categories</option>
                <option value="Traditional Pakistani">Traditional Pakistani</option>
                <option value="Modern Fashion">Modern Fashion</option>
                <option value="Western">Western</option>
                <option value="Fusion">Fusion</option>
                <option value="Bridal">Bridal</option>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Kids">Kids</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Design Type</label>
              <select name="designType" value={filters.designType} onChange={handleFilterChange} className="filter-select">
                <option value="">All Types</option>
                <option value="Kurta">Kurta</option>
                <option value="Shalwar">Shalwar</option>
                <option value="Dupatta">Dupatta</option>
                <option value="Saree">Saree</option>
                <option value="Lehenga">Lehenga</option>
                <option value="Gown">Gown</option>
                <option value="Shirt">Shirt</option>
                <option value="Trouser">Trouser</option>
                <option value="Jacket">Jacket</option>
                <option value="Coat">Coat</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Difficulty</label>
              <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="filter-select">
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="filter-input"
                />
                <span>to</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="filter-select">
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </aside>

          <main className="pattern-grid-container">
            {error && <div className="error-message">{error}</div>}

            {patterns.length === 0 ? (
              <div className="no-patterns">
                <p>No patterns found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="pattern-grid">
                  {patterns.map((pattern) => {
                    const primaryImage = pattern.images?.find((img) => img.isPrimary) || pattern.images?.[0];
                    return (
                      <Link key={pattern._id} to={`/patterns/${pattern._id}`} className="pattern-card">
                        <div className="pattern-image">
                          {primaryImage ? (
                            <img src={primaryImage.url} alt={pattern.title} />
                          ) : (
                            <div className="pattern-placeholder">No Image</div>
                          )}
                          {pattern.isFree && <span className="pattern-badge free">Free</span>}
                          {pattern.featured && <span className="pattern-badge featured">Featured</span>}
                        </div>
                        <div className="pattern-info">
                          <h3>{pattern.title}</h3>
                          <p className="pattern-description">{pattern.description.substring(0, 80)}...</p>
                          <div className="pattern-meta">
                            <span className="pattern-category">{pattern.category}</span>
                            <span className="pattern-type">{pattern.designType}</span>
                          </div>
                          <div className="pattern-footer">
                            <div className="pattern-price">
                              {pattern.isFree ? (
                                <span className="free-text">Free</span>
                              ) : (
                                <span>PKR {pattern.price.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="pattern-rating">
                              <span>★</span>
                              <span>{pattern.stats?.rating?.toFixed(1) || "0.0"}</span>
                              <span className="pattern-reviews">({pattern.stats?.totalReviews || 0})</span>
                            </div>
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
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PatternLibrary;

