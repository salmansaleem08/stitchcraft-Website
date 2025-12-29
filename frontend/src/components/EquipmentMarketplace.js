import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./EquipmentMarketplace.css";

const EquipmentMarketplace = () => {
  const { user } = useContext(AuthContext);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    isRentable: "",
    isSellable: "",
    condition: "",
    city: "",
    search: "",
  });
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, [filters, sort, page]);

  const fetchEquipment = async () => {
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

      const response = await api.get(`/equipment?${params.toString()}`);
      setEquipment(response.data.data || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "true" : "") : value,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      isRentable: "",
      isSellable: "",
      condition: "",
      city: "",
      search: "",
    });
    setPage(1);
  };

  if (loading) {
    return (
      <div className="equipment-marketplace-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-marketplace-container">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Equipment marketplace</h1>
            <p>Rent or purchase sewing machines, equipment, and tools</p>
          </div>
          {user && user.role === "supplier" && (
            <Link to="/equipment/new" className="btn btn-primary">
              List equipment
            </Link>
          )}
        </div>

        <div className="marketplace-controls">
          <div className="search-controls">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search equipment..."
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
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All categories</option>
                    <option value="Sewing Machine">Sewing machines</option>
                    <option value="Embroidery Machine">Embroidery machines</option>
                    <option value="Cutting Machine">Cutting machines</option>
                    <option value="Pressing Equipment">Pressing equipment</option>
                    <option value="Mannequin">Mannequins</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="condition">Condition</label>
                  <select
                    id="condition"
                    name="condition"
                    value={filters.condition}
                    onChange={handleFilterChange}
                  >
                    <option value="">All conditions</option>
                    <option value="New">New</option>
                    <option value="Like New">Like new</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div className="filter-field checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      name="isRentable"
                      checked={filters.isRentable === "true"}
                      onChange={handleFilterChange}
                    />
                    Available for rental
                  </label>
                </div>

                <div className="filter-field checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      name="isSellable"
                      checked={filters.isSellable === "true"}
                      onChange={handleFilterChange}
                    />
                    Available for sale
                  </label>
                </div>
              </div>
              <button onClick={clearFilters} className="btn btn-text">
                Clear all filters
              </button>
            </div>
          )}

          <div className="sort-controls">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="price_low">Price: Low to high</option>
              <option value="price_high">Price: High to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>

        <div className="results-count">
          <span>{equipment.length} item{equipment.length !== 1 ? "s" : ""} found</span>
        </div>

        <div className="equipment-grid">
          {equipment.map((item) => (
            <Link key={item._id} to={`/equipment/${item._id}`} className="equipment-card">
              <div className="equipment-image-wrapper">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.name} className="equipment-image" />
                ) : (
                  <div className="equipment-placeholder">No image</div>
                )}
                {item.isRentable && item.isSellable && (
                  <span className="equipment-badge dual">Rent & Sale</span>
                )}
                {item.isRentable && !item.isSellable && (
                  <span className="equipment-badge rent">Rental</span>
                )}
                {!item.isRentable && item.isSellable && (
                  <span className="equipment-badge sale">For sale</span>
                )}
              </div>
              <div className="equipment-content">
                <div className="equipment-header">
                  <h3>{item.name}</h3>
                </div>
                <p className="equipment-category">{item.category}</p>
                {item.brand && item.model && (
                  <p className="equipment-brand">{item.brand} {item.model}</p>
                )}
                <div className="equipment-pricing">
                  {item.isRentable && item.rentalPricePerDay && (
                    <div className="price-item">
                      <span className="price-label">Rental:</span>
                      <span className="price-value">
                        PKR {item.rentalPricePerDay.toLocaleString()}/day
                      </span>
                    </div>
                  )}
                  {item.isSellable && item.salePrice && (
                    <div className="price-item">
                      <span className="price-label">Sale:</span>
                      <span className="price-value">
                        PKR {item.salePrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                {item.rating > 0 && (
                  <div className="equipment-rating">
                    <span className="rating-star">★</span>
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="rating-reviews">({item.totalReviews || 0})</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {equipment.length === 0 && !loading && (
          <div className="empty-state">
            <p>No equipment found. Try adjusting your filters.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentMarketplace;
