import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./SupplyListing.css";

const SupplyListing = () => {
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading supplies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supply-listing-container">
      <div className="container">
        <div className="listing-header">
          <h1>Tailoring Supplies Marketplace</h1>
          <p>Find all your tailoring needs in one place</p>
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
                placeholder="Search supplies..."
              />
            </div>

            <div className="filter-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                placeholder="Enter brand name"
              />
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

          <main className="supplies-main">
            <div className="supplies-header">
              <h2>
                {supplies.length > 0
                  ? `Found ${supplies.length} suppl${supplies.length !== 1 ? "ies" : "y"}`
                  : "No supplies found"}
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

            {supplies.length === 0 && !loading ? (
              <div className="no-results">
                <p>No supplies match your filters. Try adjusting your search criteria.</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="supplies-grid">
                  {supplies.map((supply) => (
                    <Link
                      key={supply._id}
                      to={`/supplies/${supply._id}`}
                      className="supply-card"
                    >
                      <div className="supply-image">
                        {supply.images && supply.images.length > 0 ? (
                          <img src={supply.images[0]} alt={supply.name} />
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
                        <div className="supply-details">
                          <span className="supply-category">{supply.category}</span>
                          {supply.brand && <span className="supply-brand">{supply.brand}</span>}
                        </div>
                        <div className="supply-price-rating">
                          <span className="supply-price">
                            PKR {supply.price?.toLocaleString()}/{supply.unit || "piece"}
                          </span>
                          {supply.rating > 0 && (
                            <span className="supply-rating">
                              {"★".repeat(Math.floor(supply.rating))}
                              {"☆".repeat(5 - Math.floor(supply.rating))} {supply.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {supply.stockQuantity !== undefined && (
                          <p className="supply-stock">
                            {supply.stockQuantity > 0
                              ? `In Stock: ${supply.stockQuantity} ${supply.unit || "pieces"}`
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

export default SupplyListing;

