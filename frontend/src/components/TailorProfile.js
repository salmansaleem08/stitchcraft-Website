import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import PricingDisplay from "./PricingDisplay";
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
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !tailor) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="error-message">{error || "Tailor not found"}</div>
          <Link to="/tailors" className="btn btn-secondary">
            Back to tailors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="container">
        <Link to="/tailors" className="back-link">
          ← Back
        </Link>

        <div className="profile-hero">
          <div className="profile-avatar-wrapper">
            {tailor.avatar ? (
              <img src={tailor.avatar} alt={tailor.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">
                {tailor.name.charAt(0).toUpperCase()}
              </div>
            )}
            {tailor.badges?.length > 0 && (
              <div className="profile-badges-inline">
                {tailor.badges.slice(0, 2).map((badge, idx) => (
                  <span key={idx} className="badge-tag" title={typeof badge === 'object' ? badge.name : badge}>
                    {typeof badge === 'object' ? badge.name || badge.type : badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="profile-hero-content">
            <h1>{tailor.shopName || tailor.name}</h1>
            <p className="profile-subtitle">{tailor.name}</p>
            {tailor.address && (
              <p className="profile-location">
                {tailor.address.street && `${tailor.address.street}, `}
                {tailor.address.city && `${tailor.address.city}, `}
                {tailor.address.province && tailor.address.province}
              </p>
            )}

            <div className="profile-rating-inline">
              <span className="rating-number">{tailor.rating?.toFixed(1) || "0.0"}</span>
              <span className="rating-count">({tailor.totalReviews || 0} reviews)</span>
            </div>

            {tailor.bio && <p className="profile-bio">{tailor.bio}</p>}

            <div className="profile-actions">
              {user && user._id === tailor._id && (
                <Link to={`/tailors/${tailor._id}/edit`} className="btn btn-secondary">
                  Edit profile
                </Link>
              )}
              {user && user.role === "customer" && user._id !== tailor._id && (
                <Link to={`/tailors/${tailor._id}/book`} className="btn btn-primary">
                  Book service
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="profile-stats-row">
          <div className="profile-stat">
            <div className="stat-number">{tailor.experience || 0}</div>
            <div className="stat-text">Years experience</div>
          </div>
          <div className="profile-stat">
            <div className="stat-number">{tailor.totalOrders || 0}</div>
            <div className="stat-text">Total orders</div>
          </div>
          <div className="profile-stat">
            <div className="stat-number">{tailor.completedOrders || 0}</div>
            <div className="stat-text">Completed</div>
          </div>
          <div className="profile-stat">
            <div className="stat-number">{tailor.completionRate?.toFixed(0) || 0}%</div>
            <div className="stat-text">Completion rate</div>
          </div>
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
            Portfolio {tailor.portfolio?.length > 0 && `(${tailor.portfolio.length})`}
          </button>
          <button
            className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </button>
          <button
            className={`tab-btn ${activeTab === "pricing" ? "active" : ""}`}
            onClick={() => setActiveTab("pricing")}
          >
            Pricing
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "overview" && (
            <div className="tab-content">
              {tailor.specialization?.length > 0 && (
                <div className="content-block">
                  <h2>Specializations</h2>
                  <div className="tags-list">
                    {tailor.specialization.map((spec, idx) => (
                      <span key={idx} className="tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tailor.fabricExpertise?.length > 0 && (
                <div className="content-block">
                  <h2>Fabric expertise</h2>
                  <div className="tags-list">
                    {tailor.fabricExpertise.map((fabric, idx) => (
                      <span key={idx} className="tag">
                        {fabric}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tailor.workingHours && (
                <div className="content-block">
                  <h2>Working hours</h2>
                  <div className="hours-list">
                    {Object.entries(tailor.workingHours).map(([day, hours]) => (
                      <div key={day} className="hours-item">
                        <span className="hours-day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                        <span className="hours-time">
                          {hours.isOpen ? `${hours.open} - ${hours.close}` : "Closed"}
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
                    <div key={idx} className="portfolio-card">
                      <div className="portfolio-image-container">
                        {item.afterImage ? (
                          <img src={item.afterImage} alt={item.title || "Portfolio item"} className="portfolio-image" />
                        ) : item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title || "Portfolio item"} className="portfolio-image" />
                        ) : (
                          <div className="portfolio-placeholder">No image</div>
                        )}
                      </div>
                      <div className="portfolio-info">
                        {item.title && <h3>{item.title}</h3>}
                        {item.description && <p className="portfolio-description">{item.description}</p>}
                        <div className="portfolio-meta">
                          {item.category && <span className="portfolio-category">{item.category}</span>}
                          {item.createdAt && (
                            <span className="portfolio-date">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
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
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer">
                          {review.customer?.avatar ? (
                            <img src={review.customer.avatar} alt={review.customer.name} className="reviewer-avatar" />
                          ) : (
                            <div className="reviewer-avatar placeholder">
                              {review.customer?.name?.charAt(0).toUpperCase() || "C"}
                            </div>
                          )}
                          <div>
                            <div className="reviewer-name">{review.customer?.name || "Anonymous"}</div>
                            <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="review-rating">
                          <span className="rating-stars">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                        </div>
                      </div>
                      {review.comment && <p className="review-text">{review.comment}</p>}
                      {review.photos?.length > 0 && (
                        <div className="review-photos">
                          {review.photos.map((photo, idx) => (
                            <img key={idx} src={photo} alt={`Review ${idx + 1}`} className="review-photo" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="tab-content pricing-content">
              <PricingDisplay tailorId={tailor._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TailorProfile;
