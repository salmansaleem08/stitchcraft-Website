import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./FabricListing.css";

const FabricListing = () => {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    fabricType: "",
    weight: "",
    season: "",
    occasion: "",
    color: "",
    pattern: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFabrics();
  }, [filters, sort, page]);

  const fetchFabrics = async () => {
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

      const response = await api.get(`/fabrics?${params.toString()}`);
      setFabrics(response.data.data);
      setTotalPages(response.data.pages);
      setError("");
    } catch (error) {
      setError("Failed to load fabrics. Please try again.");
      console.error("Error fetching fabrics:", error);
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
      fabricType: "",
      weight: "",
      season: "",
      occasion: "",
      color: "",
      pattern: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    });
    setPage(1);
  };

  if (loading && fabrics.length === 0) {
    return (
      <div className="fabric-listing-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fabric-listing-container">
      <div className="container">
        <div className="listing-header">
          <h1>Fabrics</h1>
          <p>Browse quality fabrics from verified suppliers</p>
        </div>

        <div className="listing-controls">
          <div className="search-controls">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search fabrics..."
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
                  <label htmlFor="fabricType">Fabric type</label>
                  <select
                    id="fabricType"
                    name="fabricType"
                    value={filters.fabricType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All types</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Silk">Silk</option>
                    <option value="Linen">Linen</option>
                    <option value="Wool">Wool</option>
                    <option value="Polyester">Polyester</option>
                    <option value="Rayon">Rayon</option>
                    <option value="Chiffon">Chiffon</option>
                    <option value="Georgette">Georgette</option>
                    <option value="Organza">Organza</option>
                    <option value="Velvet">Velvet</option>
                    <option value="Denim">Denim</option>
                    <option value="Khadar">Khadar</option>
                    <option value="Muslin">Muslin</option>
                    <option value="Lawn">Lawn</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="weight">Weight</label>
                  <select
                    id="weight"
                    name="weight"
                    value={filters.weight}
                    onChange={handleFilterChange}
                  >
                    <option value="">All weights</option>
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="color">Color</label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={filters.color}
                    onChange={handleFilterChange}
                    placeholder="Enter color"
                  />
                </div>

                <div className="filter-field">
                  <label htmlFor="minPrice">Min price (PKR)</label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="filter-field">
                  <label htmlFor="maxPrice">Max price (PKR)</label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="filter-field">
                  <label htmlFor="sort">Sort by</label>
                  <select id="sort" value={sort} onChange={handleSortChange}>
                    <option value="newest">Newest first</option>
                    <option value="price_low">Price: Low to high</option>
                    <option value="price_high">Price: High to low</option>
                    <option value="rating">Highest rated</option>
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

        {fabrics.length === 0 && !loading ? (
          <div className="empty-state">
            <p>No fabrics found matching your criteria.</p>
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="results-count">
              <span>{fabrics.length} fabric{fabrics.length !== 1 ? "s" : ""} found</span>
            </div>
            <div className="fabrics-grid">
              {fabrics.map((fabric) => (
                <Link
                  key={fabric._id}
                  to={`/fabrics/${fabric._id}`}
                  className="fabric-card"
                >
                  <div className="fabric-image-wrapper">
                    {fabric.images && fabric.images.length > 0 ? (
                      <img src={fabric.images[0]} alt={fabric.name} className="fabric-image" />
                    ) : (
                      <div className="fabric-placeholder">
                        {fabric.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="fabric-info">
                    <h3>{fabric.name}</h3>
                    <p className="fabric-supplier">
                      {fabric.supplier?.businessName || fabric.supplier?.name}
                    </p>
                    <div className="fabric-tags">
                      <span className="fabric-tag">{fabric.fabricType}</span>
                      {fabric.color && <span className="fabric-tag">{fabric.color}</span>}
                    </div>
                    <div className="fabric-price">
                      PKR {fabric.pricePerMeter?.toLocaleString()}/meter
                    </div>
                    {fabric.stockQuantity !== undefined && (
                      <p className="fabric-stock">
                        {fabric.stockQuantity > 0
                          ? `In stock: ${fabric.stockQuantity} ${fabric.unit || "meters"}`
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

export default FabricListing;
