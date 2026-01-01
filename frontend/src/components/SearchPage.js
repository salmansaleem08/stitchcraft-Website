import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../utils/api";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [results, setResults] = useState({ fabrics: [], supplies: [], suppliers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [searchParams]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("q", query);
      if (type !== "all") params.append("type", type);
      if (category) params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("sort", sort);

      const response = await api.get(`/search?${params.toString()}`);
      setResults(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to perform search");
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type !== "all") params.set("type", type);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort !== "newest") params.set("sort", sort);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery("");
    setType("all");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setSearchParams({});
    setResults({ fabrics: [], supplies: [], suppliers: [] });
  };

  const totalResults = results.fabrics.length + results.supplies.length + results.suppliers.length;

  return (
    <div className="search-page-container">
      <div className="container">
        <div className="search-header">
          <div className="header-text">
            <h1>Search</h1>
            <p className="dashboard-subtitle">
              Find fabrics, supplies, and suppliers. Use filters to narrow down your search and discover the perfect products for your needs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <div className="input-wrapper">
              <FaSearch className="input-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for fabrics, supplies, or suppliers..."
                className="search-input"
              />
            </div>
            <button type="submit" className="btn-primary-header">
              <FaSearch className="btn-icon" />
              Search
            </button>
          </div>

          <div className="search-filters">
            <div className="filter-group">
              <label htmlFor="type">
                <FaFilter className="label-icon" />
                Type
              </label>
              <div className="select-wrapper">
                <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="filter-select">
                  <option value="all">All</option>
                  <option value="fabric">Fabrics</option>
                  <option value="supply">Supplies</option>
                  <option value="supplier">Suppliers</option>
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="category">
                <FaFilter className="label-icon" />
                Category
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="minPrice">
                <FaFilter className="label-icon" />
                Min Price
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="minPrice"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  min="0"
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="maxPrice">
                <FaFilter className="label-icon" />
                Max Price
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="maxPrice"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  min="0"
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="sort">
                <FaFilter className="label-icon" />
                Sort By
              </label>
              <div className="select-wrapper">
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="filter-select">
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <button type="button" onClick={clearFilters} className="btn-clear-filters">
              <FaTimes className="btn-icon" />
              Clear Filters
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : query.trim() && totalResults === 0 ? (
          <div className="no-results">
            <p>No results found for "{query}"</p>
            <p className="suggestion">Try adjusting your search terms or filters</p>
          </div>
        ) : query.trim() ? (
          <div className="search-results">
            <div className="results-header">
              <h2>
                Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
              </h2>
            </div>

            {results.fabrics.length > 0 && (
              <div className="results-section">
                <h3>Fabrics ({results.fabrics.length})</h3>
                <div className="results-grid">
                  {results.fabrics.map((fabric) => (
                    <Link
                      key={fabric._id}
                      to={`/fabrics/${fabric._id}`}
                      className="result-card"
                    >
                      <div className="result-image">
                        {fabric.images && fabric.images.length > 0 ? (
                          <img src={fabric.images[0]} alt={fabric.name} />
                        ) : (
                          <div className="result-placeholder">
                            {fabric.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="result-info">
                        <h4>{fabric.name}</h4>
                        <p className="result-category">{fabric.fabricType}</p>
                        <p className="result-price">
                          PKR {fabric.pricePerMeter?.toLocaleString()}/meter
                        </p>
                        {fabric.rating > 0 && (
                          <p className="result-rating">
                            {"★".repeat(Math.floor(fabric.rating))}
                            {"☆".repeat(5 - Math.floor(fabric.rating))} {fabric.rating.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.supplies.length > 0 && (
              <div className="results-section">
                <h3>Supplies ({results.supplies.length})</h3>
                <div className="results-grid">
                  {results.supplies.map((supply) => (
                    <Link
                      key={supply._id}
                      to={`/supplies/${supply._id}`}
                      className="result-card"
                    >
                      <div className="result-image">
                        {supply.images && supply.images.length > 0 ? (
                          <img src={supply.images[0]} alt={supply.name} />
                        ) : (
                          <div className="result-placeholder">
                            {supply.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="result-info">
                        <h4>{supply.name}</h4>
                        <p className="result-category">{supply.category}</p>
                        <p className="result-price">
                          PKR {supply.price?.toLocaleString()}/{supply.unit || "piece"}
                        </p>
                        {supply.rating > 0 && (
                          <p className="result-rating">
                            {"★".repeat(Math.floor(supply.rating))}
                            {"☆".repeat(5 - Math.floor(supply.rating))} {supply.rating.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.suppliers.length > 0 && (
              <div className="results-section">
                <h3>Suppliers ({results.suppliers.length})</h3>
                <div className="results-grid">
                  {results.suppliers.map((supplier) => (
                    <Link
                      key={supplier._id}
                      to={`/suppliers/${supplier._id}`}
                      className="result-card supplier-card"
                    >
                      <div className="result-image">
                        {supplier.avatar ? (
                          <img src={supplier.avatar} alt={supplier.businessName || supplier.name} />
                        ) : (
                          <div className="result-placeholder">
                            {(supplier.businessName || supplier.name).charAt(0).toUpperCase()}
                          </div>
                        )}
                        {supplier.verificationStatus === "verified" && (
                          <span className="verified-badge">Verified</span>
                        )}
                      </div>
                      <div className="result-info">
                        <h4>{supplier.businessName || supplier.name}</h4>
                        {supplier.businessDescription && (
                          <p className="result-description">
                            {supplier.businessDescription.substring(0, 100)}...
                          </p>
                        )}
                        {supplier.qualityRating > 0 && (
                          <p className="result-rating">
                            {"★".repeat(Math.floor(supplier.qualityRating))}
                            {"☆".repeat(5 - Math.floor(supplier.qualityRating))}{" "}
                            {supplier.qualityRating.toFixed(1)}
                          </p>
                        )}
                        {supplier.productCategories && supplier.productCategories.length > 0 && (
                          <div className="result-tags">
                            {supplier.productCategories.slice(0, 3).map((cat, idx) => (
                              <span key={idx} className="tag">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="search-prompt">
            <p>Enter a search term to find fabrics, supplies, or suppliers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

