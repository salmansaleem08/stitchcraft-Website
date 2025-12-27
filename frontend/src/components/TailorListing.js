import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./TailorListing.css";

const TailorListing = () => {
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

  useEffect(() => {
    fetchTailors();
  }, [filters, pagination.page]);

  useEffect(() => {
    // Request user location if location-based search is enabled
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
          setUserLocation({ latitude: null, longitude: null });
        }
      );
    }
  }, [filters.useLocation]);

  const fetchTailors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 12,
      });

      // Add filters (excluding boolean and location-specific)
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "urgency" && value) {
          params.append(key, "true");
        } else if (key === "useLocation" || key === "maxDistance") {
          // Handle separately
        } else if (value !== "" && value !== false) {
          params.append(key, value);
        }
      });

      // Add location parameters if enabled
      if (filters.useLocation && userLocation.latitude && userLocation.longitude) {
        params.append("latitude", userLocation.latitude);
        params.append("longitude", userLocation.longitude);
        params.append("maxDistance", filters.maxDistance || "50");
        params.append("sortBy", filters.sortBy === "distance" ? "distance" : filters.sortBy);
      }

      const response = await api.get(`/tailors?${params}`);
      setTailors(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages,
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
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
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
    setUserLocation({ latitude: null, longitude: null });
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

  const fabricTypes = ["Cotton", "Silk", "Linen", "Wool", "Synthetic", "Mixed"];

  const provinces = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Islamabad",
    "Azad Kashmir",
    "Gilgit-Baltistan",
  ];

  return (
    <div className="tailor-listing-container">
      <div className="container">
        <div className="listing-header">
          <h1>Find a Tailor</h1>
          <p>Discover skilled tailors in your area</p>
        </div>

        <div className="listing-content">
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-filters-btn">
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
                placeholder="Search by name or shop..."
              />
            </div>

            <div className="filter-group">
              <label>Specialization</label>
              <select
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

            <div className="filter-group">
              <label>Fabric Expertise</label>
              <select
                name="fabricExpertise"
                value={filters.fabricExpertise}
                onChange={handleFilterChange}
              >
                <option value="">All Fabrics</option>
                {fabricTypes.map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Province</label>
              <select
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

            <div className="filter-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Enter city name"
              />
            </div>

            <div className="filter-group">
              <label>Minimum Rating</label>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Minimum Experience (Years)</label>
              <input
                type="number"
                name="minExperience"
                value={filters.minExperience}
                onChange={handleFilterChange}
                placeholder="e.g., 5"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label>Budget Range (PKR)</label>
              <div className="budget-range">
                <input
                  type="number"
                  name="minBudget"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  min="0"
                />
                <span className="range-separator">-</span>
                <input
                  type="number"
                  name="maxBudget"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Language</label>
              <select
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
              >
                <option value="">All Languages</option>
                <option value="Urdu">Urdu</option>
                <option value="English">English</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Sindhi">Sindhi</option>
                <option value="Pashto">Pashto</option>
                <option value="Balochi">Balochi</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="urgency"
                  checked={filters.urgency}
                  onChange={(e) =>
                    setFilters({ ...filters, urgency: e.target.checked })
                  }
                />
                Accepts Rush Orders
              </label>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="useLocation"
                  checked={filters.useLocation}
                  onChange={(e) =>
                    setFilters({ ...filters, useLocation: e.target.checked })
                  }
                />
                Use My Location
              </label>
              {filters.useLocation && (
                <div className="location-options">
                  <label>Max Distance (km)</label>
                  <input
                    type="number"
                    name="maxDistance"
                    value={filters.maxDistance}
                    onChange={handleFilterChange}
                    min="1"
                    max="500"
                    placeholder="50"
                  />
                </div>
              )}
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="orders">Most Orders</option>
                <option value="response">Fastest Response</option>
                <option value="urgency">Fastest Delivery</option>
                {filters.useLocation && (
                  <option value="distance">Nearest First</option>
                )}
              </select>
            </div>
          </aside>

          <main className="tailors-grid">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading tailors...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : tailors.length === 0 ? (
              <div className="no-results">
                <p>No tailors found matching your criteria.</p>
                <button onClick={clearFilters} className="btn btn-secondary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="results-info">
                  <p>
                    Showing {tailors.length} of {pagination.total} tailors
                  </p>
                </div>
                <div className="tailors-list">
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
                          <p className="tailor-name">{tailor.name}</p>
                          {tailor.address?.city && tailor.address?.province && (
                            <p className="tailor-location">
                              {tailor.address.city}, {tailor.address.province}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="tailor-rating">
                        <span className="stars">
                          {"★".repeat(Math.floor(tailor.rating || 0))}
                          {"☆".repeat(5 - Math.floor(tailor.rating || 0))}
                        </span>
                        <span className="rating-text">
                          {tailor.rating?.toFixed(1) || "0.0"} ({tailor.totalReviews || 0}{" "}
                          reviews)
                        </span>
                      </div>

                      {tailor.specialization?.length > 0 && (
                        <div className="tailor-specializations">
                          {tailor.specialization.slice(0, 3).map((spec, idx) => (
                            <span key={idx} className="specialization-tag">
                              {spec}
                            </span>
                          ))}
                          {tailor.specialization.length > 3 && (
                            <span className="specialization-tag">
                              +{tailor.specialization.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="tailor-stats">
                        <div className="stat-item">
                          <span className="stat-label">Experience</span>
                          <span className="stat-value">{tailor.experience || 0} years</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Orders</span>
                          <span className="stat-value">{tailor.totalOrders || 0}</span>
                        </div>
                        {tailor.averageResponseTime > 0 && (
                          <div className="stat-item">
                            <span className="stat-label">Response</span>
                            <span className="stat-value">
                              {tailor.averageResponseTime.toFixed(1)}h
                            </span>
                          </div>
                        )}
                      </div>

                      {tailor.badges?.length > 0 && (
                        <div className="tailor-badges">
                          {tailor.badges.slice(0, 2).map((badge, idx) => (
                            <span key={idx} className="badge">
                              {badge.type}
                            </span>
                          ))}
                        </div>
                      )}

                      {tailor.distance && (
                        <div className="tailor-distance">
                          <span className="distance-label">Distance:</span>
                          <span className="distance-value">
                            {tailor.distance.toFixed(1)} km
                          </span>
                        </div>
                      )}

                      {tailor.urgencyHandling?.rushOrders && (
                        <div className="rush-order-badge">
                          Rush Orders Available
                        </div>
                      )}

                      {tailor.languages && tailor.languages.length > 0 && (
                        <div className="tailor-languages">
                          <span className="languages-label">Languages:</span>
                          <span className="languages-value">
                            {tailor.languages.slice(0, 2).join(", ")}
                            {tailor.languages.length > 2 && ` +${tailor.languages.length - 2}`}
                          </span>
                        </div>
                      )}
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default TailorListing;

