import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./TailorProfile.css";

const TailorProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [tailor, setTailor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTailorProfile();
  }, [id]);

  const fetchTailorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tailors/${id}`);
      setTailor(response.data.data.tailor);
      setReviews(response.data.data.recentReviews);
      setError("");
    } catch (error) {
      setError("Failed to load tailor profile. Please try again.");
      console.error("Error fetching tailor profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tailor-profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tailor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !tailor) {
    return (
      <div className="tailor-profile-container">
        <div className="error-message">
          {error || "Tailor not found"}
        </div>
        <Link to="/tailors" className="btn btn-primary">
          Back to Tailors
        </Link>
      </div>
    );
  }

  return (
    <div className="tailor-profile-container">
      <div className="container">
        <Link to="/tailors" className="back-link">
          ← Back to Tailors
        </Link>

        <div className="profile-header">
          <div className="profile-avatar-section">
            {tailor.avatar ? (
              <img src={tailor.avatar} alt={tailor.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">
                {tailor.name.charAt(0).toUpperCase()}
              </div>
            )}
            {tailor.badges?.length > 0 && (
              <div className="profile-badges">
                {tailor.badges.map((badge, idx) => (
                  <span key={idx} className="badge-large">
                    {badge.type}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1>{tailor.shopName || tailor.name}</h1>
            <p className="tailor-name">{tailor.name}</p>
            {tailor.address && (
              <p className="profile-location">
                {tailor.address.street && `${tailor.address.street}, `}
                {tailor.address.city && `${tailor.address.city}, `}
                {tailor.address.province && tailor.address.province}
              </p>
            )}

            <div className="profile-rating">
              <span className="stars-large">
                {"★".repeat(Math.floor(tailor.rating || 0))}
                {"☆".repeat(5 - Math.floor(tailor.rating || 0))}
              </span>
              <span className="rating-value">
                {tailor.rating?.toFixed(1) || "0.0"}
              </span>
              <span className="reviews-count">
                ({tailor.totalReviews || 0} reviews)
              </span>
            </div>

            {tailor.bio && <p className="profile-bio">{tailor.bio}</p>}
            {user && user._id === tailor._id && (
              <Link to={`/tailors/${tailor._id}/edit`} className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{tailor.experience || 0}</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{tailor.totalOrders || 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{tailor.completedOrders || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{tailor.completionRate?.toFixed(0) || 0}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
          {tailor.averageResponseTime > 0 && (
            <div className="stat-card">
              <div className="stat-value">{tailor.averageResponseTime.toFixed(1)}h</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
          )}
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
            onClick={() => setActiveTab("portfolio")}
          >
            Portfolio ({tailor.portfolio?.length || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "overview" && (
            <div className="tab-content">
              <div className="content-section">
                <h3>Specializations</h3>
                {tailor.specialization?.length > 0 ? (
                  <div className="specializations-list">
                    {tailor.specialization.map((spec, idx) => (
                      <span key={idx} className="specialization-badge">
                        {spec}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No specializations listed</p>
                )}
              </div>

              <div className="content-section">
                <h3>Fabric Expertise</h3>
                {tailor.fabricExpertise?.length > 0 ? (
                  <div className="specializations-list">
                    {tailor.fabricExpertise.map((fabric, idx) => (
                      <span key={idx} className="specialization-badge">
                        {fabric}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No fabric expertise listed</p>
                )}
              </div>

              {tailor.workingHours && (
                <div className="content-section">
                  <h3>Working Hours</h3>
                  <div className="working-hours">
                    {Object.entries(tailor.workingHours).map(([day, hours]) => (
                      <div key={day} className="hours-row">
                        <span className="day-name">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                        <span className="hours-time">
                          {hours.isOpen
                            ? `${hours.open} - ${hours.close}`
                            : "Closed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="tab-content">
              {tailor.portfolio?.length > 0 ? (
                <div className="portfolio-grid">
                  {tailor.portfolio.map((item, idx) => (
                    <div key={idx} className="portfolio-item">
                      {item.afterImage ? (
                        <img
                          src={item.afterImage}
                          alt={item.title || "Portfolio item"}
                          className="portfolio-image"
                        />
                      ) : item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title || "Portfolio item"}
                          className="portfolio-image"
                        />
                      ) : (
                        <div className="portfolio-placeholder">No Image</div>
                      )}
                      {item.title && (
                        <div className="portfolio-info">
                          <h4>{item.title}</h4>
                          {item.description && <p>{item.description}</p>}
                          {item.category && (
                            <span className="portfolio-category">{item.category}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>No portfolio items yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="tab-content">
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          {review.customer?.avatar ? (
                            <img
                              src={review.customer.avatar}
                              alt={review.customer.name}
                              className="reviewer-avatar"
                            />
                          ) : (
                            <div className="reviewer-avatar placeholder">
                              {review.customer?.name?.charAt(0).toUpperCase() || "C"}
                            </div>
                          )}
                          <div>
                            <p className="reviewer-name">
                              {review.customer?.name || "Anonymous"}
                            </p>
                            <p className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="review-rating">
                          <span className="stars">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                      {review.photos?.length > 0 && (
                        <div className="review-photos">
                          {review.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Review photo ${idx + 1}`}
                              className="review-photo"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TailorProfile;

