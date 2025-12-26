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
    setPage(1); // Reset to first page when filters change
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
          <p>Loading fabrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fabric-listing-container">
      <div className="container">
        <div className="listing-header">
          <h1>Fabric Marketplace</h1>
          <p>Browse our wide selection of quality fabrics</p>
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
                placeholder="Search fabrics..."
              />
            </div>

            <div className="filter-group">
              <label htmlFor="fabricType">Fabric Type</label>
              <select
                id="fabricType"
                name="fabricType"
                value={filters.fabricType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
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
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="weight">Weight</label>
              <select
                id="weight"
                name="weight"
                value={filters.weight}
                onChange={handleFilterChange}
              >
                <option value="">All Weights</option>
                <option value="Light">Light</option>
                <option value="Medium">Medium</option>
                <option value="Heavy">Heavy</option>
                <option value="Very Heavy">Very Heavy</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="season">Season</label>
              <select
                id="season"
                name="season"
                value={filters.season}
                onChange={handleFilterChange}
              >
                <option value="">All Seasons</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
                <option value="All Season">All Season</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="occasion">Occasion</label>
              <select
                id="occasion"
                name="occasion"
                value={filters.occasion}
                onChange={handleFilterChange}
              >
                <option value="">All Occasions</option>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Wedding">Wedding</option>
                <option value="Party">Party</option>
                <option value="Office">Office</option>
                <option value="Traditional">Traditional</option>
                <option value="Festive">Festive</option>
                <option value="Everyday">Everyday</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="pattern">Pattern</label>
              <select
                id="pattern"
                name="pattern"
                value={filters.pattern}
                onChange={handleFilterChange}
              >
                <option value="">All Patterns</option>
                <option value="Solid">Solid</option>
                <option value="Striped">Striped</option>
                <option value="Polka Dot">Polka Dot</option>
                <option value="Floral">Floral</option>
                <option value="Geometric">Geometric</option>
                <option value="Abstract">Abstract</option>
                <option value="Paisley">Paisley</option>
                <option value="Embroidered">Embroidered</option>
                <option value="Printed">Printed</option>
                <option value="Plain">Plain</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="filter-group">
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

            <div className="filter-group">
              <label htmlFor="minPrice">Min Price (PKR)</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxPrice">Max Price (PKR)</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                min="0"
              />
            </div>
          </aside>

          <main className="fabrics-main">
            <div className="fabrics-header">
              <h2>
                {fabrics.length > 0
                  ? `Found ${fabrics.length} fabric${fabrics.length !== 1 ? "s" : ""}`
                  : "No fabrics found"}
              </h2>
              <div className="sort-controls">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sort} onChange={handleSortChange}>
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {fabrics.length === 0 && !loading ? (
              <div className="no-results">
                <p>No fabrics match your filters. Try adjusting your search criteria.</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="fabrics-grid">
                  {fabrics.map((fabric) => (
                    <Link
                      key={fabric._id}
                      to={`/fabrics/${fabric._id}`}
                      className="fabric-card"
                    >
                      <div className="fabric-image">
                        {fabric.images && fabric.images.length > 0 ? (
                          <img src={fabric.images[0]} alt={fabric.name} />
                        ) : (
                          <div className="fabric-placeholder">
                            {fabric.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {fabric.supplier?.verificationStatus === "verified" && (
                          <span className="verified-badge">Verified</span>
                        )}
                      </div>
                      <div className="fabric-info">
                        <h3>{fabric.name}</h3>
                        <p className="fabric-supplier">
                          {fabric.supplier?.businessName || fabric.supplier?.name}
                        </p>
                        <div className="fabric-details">
                          <span className="fabric-type">{fabric.fabricType}</span>
                          <span className="fabric-color">{fabric.color}</span>
                        </div>
                        <div className="fabric-price-rating">
                          <span className="fabric-price">
                            PKR {fabric.pricePerMeter?.toLocaleString()}/meter
                          </span>
                          {fabric.rating > 0 && (
                            <span className="fabric-rating">
                              {"★".repeat(Math.floor(fabric.rating))}
                              {"☆".repeat(5 - Math.floor(fabric.rating))} {fabric.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {fabric.stockQuantity !== undefined && (
                          <p className="fabric-stock">
                            {fabric.stockQuantity > 0
                              ? `In Stock: ${fabric.stockQuantity} ${fabric.unit || "meters"}`
                              : "Out of Stock"}
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
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
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

export default FabricListing;

