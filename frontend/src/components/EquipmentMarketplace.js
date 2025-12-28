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
    isAvailableForRental: "",
    isAvailableForSale: "",
    condition: "",
    city: "",
    search: "",
  });
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  if (loading) {
    return (
      <div className="equipment-marketplace-container">
        <div className="loading-container">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="equipment-marketplace-container">
      <div className="container">
        <div className="page-header">
          <h1>Equipment Marketplace</h1>
          <p>Rent or purchase sewing machines, equipment, and tools</p>
          {user && (
            <Link to="/equipment/new" className="btn btn-primary">
              List Equipment
            </Link>
          )}
        </div>

        <div className="filters-section">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="Sewing Machine">Sewing Machines</option>
            <option value="Embroidery Machine">Embroidery Machines</option>
            <option value="Cutting Machine">Cutting Machines</option>
            <option value="Pressing Equipment">Pressing Equipment</option>
            <option value="Measuring Tools">Measuring Tools</option>
            <option value="Mannequin">Mannequins</option>
          </select>
          <select
            value={filters.isAvailableForRental}
            onChange={(e) => setFilters({ ...filters, isAvailableForRental: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Available for Rental</option>
          </select>
          <select
            value={filters.isAvailableForSale}
            onChange={(e) => setFilters({ ...filters, isAvailableForSale: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Available for Sale</option>
          </select>
          <select
            value={filters.condition}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
          <input
            type="text"
            placeholder="Search equipment..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="equipment-grid">
          {equipment.map((item) => (
            <div key={item._id} className="equipment-card">
              {item.images && item.images.length > 0 && (
                <div className="equipment-image">
                  <img src={item.images[0]} alt={item.name} />
                </div>
              )}
              <div className="equipment-content">
                <div className="equipment-header">
                  <h3>{item.name}</h3>
                  <span className="condition-badge condition-{item.condition.toLowerCase().replace(' ', '-')}">
                    {item.condition}
                  </span>
                </div>
                <p className="equipment-category">{item.category}</p>
                {item.brand && item.model && (
                  <p className="equipment-brand">{item.brand} {item.model}</p>
                )}
                <div className="equipment-pricing">
                  {item.isAvailableForRental && item.rentalPrice && (
                    <div className="price-item">
                      <span className="price-label">Rental:</span>
                      <span className="price-value">
                        PKR {item.rentalPrice.toLocaleString()}/{item.rentalPeriod || "month"}
                      </span>
                    </div>
                  )}
                  {item.isAvailableForSale && item.salePrice && (
                    <div className="price-item">
                      <span className="price-label">Sale:</span>
                      <span className="price-value">PKR {item.salePrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {item.location?.city && (
                  <div className="equipment-location">
                    Location: {item.location.city}, {item.location.province}
                  </div>
                )}
                {item.rating > 0 && (
                  <div className="equipment-rating">
                    Rating: {item.rating.toFixed(1)}/5 ({item.totalReviews} reviews)
                  </div>
                )}
                <div className="equipment-actions">
                  <Link to={`/equipment/${item._id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn btn-secondary"
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

