import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./TailorListing.css";

const TailorListing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    fabricExpertise: "",
    city: "",
    province: "",
    minRating: "",
    minExperience: "",
    search: "",
    sortBy: "rating",
    minBudget: "",
    maxBudget: "",
    language: "",
    urgency: false,
    useLocation: false,
    maxDistance: "50",
  });
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Redirect suppliers away from tailor listings
  useEffect(() => {
    if (user?.role === "supplier") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role !== "supplier") {
      fetchTailors();
    }
  }, [filters, pagination.page, user]);

  useEffect(() => {
    if (filters.useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [filters.useLocation]);

  const fetchTailors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== false) {
          params.append(key, filters[key]);
        }
      });
      if (filters.useLocation && userLocation.latitude && userLocation.longitude) {
        params.append("latitude", userLocation.latitude);
        params.append("longitude", userLocation.longitude);
      }
      params.append("page", pagination.page);
      params.append("limit", "12");

      const response = await api.get(`/tailors?${params.toString()}`);
      setTailors(response.data.data || []);
      setPagination({
        ...pagination,
        total: response.data.count || 0,
        pages: response.data.pages || 1,
      });
      setError("");
    } catch (error) {
      setError("Failed to load tailors. Please try again.");
      console.error("Error fetching tailors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      specialization: "",
      fabricExpertise: "",
      city: "",
      province: "",
      minRating: "",
      minExperience: "",
      search: "",
      sortBy: "rating",
      minBudget: "",
      maxBudget: "",
      language: "",
      urgency: false,
      useLocation: false,
      maxDistance: "50",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const specializations = [
    "Traditional Wear",
    "Western Wear",
    "Bridal Wear",
    "Embroidery",
    "Alterations",
    "Custom Design",
  ];

  const fabricTypes = [
    "Cotton",
    "Silk",
    "Linen",
    "Wool",
    "Polyester",
    "Rayon",
    "Chiffon",
    "Georgette",
    "Organza",
    "Velvet",
    "Denim",
    "Khadar",
    "Muslin",
    "Lawn",
  ];

  const provinces = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Gilgit-Baltistan",
    "Azad Jammu and Kashmir",
  ];

  // Don't render for suppliers
  if (user?.role === "supplier") {
    return null;
  }

  return (
    <div className="tailor-listing-container">
      <div className="container">
        <div className="page-header">
          <div className="header-text">
            <h1>Find a Tailor</h1>
            <p className="dashboard-subtitle">
              Discover skilled tailors in your area. Browse profiles, read reviews, and find the perfect artisan for your tailoring needs.
            </p>
          </div>
        </div>

        <div className="listing-controls">
          <div className="search-controls">
            <div className="search-wrapper">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name, specialization, or location..."
                className="search-input"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-toggle-filters ${showFilters ? "active" : ""}`}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-field">
                  <label htmlFor="specialization">Specialization</label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={filters.specialization}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="province">Province</label>
                  <select
                    id="province"
                    name="province"
                    value={filters.province}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Provinces</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    placeholder="Enter city name"
                  />
                </div>

                <div className="filter-field">
                  <label htmlFor="minRating">Minimum Rating</label>
                  <select
                    id="minRating"
                    name="minRating"
                    value={filters.minRating}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="minExperience">Min Experience (Years)</label>
                  <input
                    type="number"
                    id="minExperience"
                    name="minExperience"
                    value={filters.minExperience}
                    onChange={handleFilterChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="filter-field">
                  <label htmlFor="sortBy">Sort By</label>
                  <select
                    id="sortBy"
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="experience">Most Experienced</option>
                    <option value="orders">Most Orders</option>
                    <option value="response">Fastest Response</option>
                  </select>
                </div>
              </div>
              <div className="filters-actions">
                <button onClick={clearFilters} className="btn-clear-filters">
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : tailors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👔</div>
            <p>No tailors found matching your criteria</p>
            <p className="empty-subtitle">Try adjusting your filters or search terms to find more tailors</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="results-count">
              <span className="results-text">{pagination.total} {pagination.total === 1 ? 'tailor' : 'tailors'} found</span>
            </div>
            <div className="tailors-grid">
              {tailors.map((tailor) => (
                <Link
                  key={tailor._id}
                  to={`/tailors/${tailor._id}`}
                  className="tailor-card"
                >
                  <div className="tailor-card-header">
                    {tailor.avatar ? (
                      <img
                        src={tailor.avatar}
                        alt={tailor.name}
                        className="tailor-avatar"
                      />
                    ) : (
                      <div className="tailor-avatar placeholder">
                        {tailor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="tailor-info">
                      <h3>{tailor.shopName || tailor.name}</h3>
                      {tailor.address?.city && tailor.address?.province && (
                        <p className="tailor-location">
                          {tailor.address.city}, {tailor.address.province}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="tailor-rating">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`star ${i < Math.floor(tailor.rating || 0) ? "filled" : ""}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="rating-info">
                      <span className="rating-value">
                        {tailor.rating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="rating-count">
                        ({tailor.totalReviews || 0} {tailor.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>

                  {tailor.specialization?.length > 0 && (
                    <div className="tailor-specializations">
                      {tailor.specialization.slice(0, 2).map((spec, idx) => (
                        <span key={idx} className="specialization-tag">
                          {spec}
                        </span>
                      ))}
                      {tailor.specialization.length > 2 && (
                        <span className="specialization-tag">
                          +{tailor.specialization.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="tailor-stats">
                    <div className="tailor-stat">
                      <span className="stat-label">Experience</span>
                      <span className="stat-value">{tailor.experience || 0} years</span>
                    </div>
                    <div className="tailor-stat">
                      <span className="stat-label">Orders</span>
                      <span className="stat-value">{tailor.totalOrders || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
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

export default TailorListing;
