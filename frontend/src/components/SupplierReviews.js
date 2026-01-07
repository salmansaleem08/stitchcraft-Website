import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import {
  FaStar,
  FaUser,
  FaCheckCircle,
  FaBox,
  FaTag,
  FaThumbsUp,
  FaDollarSign,
  FaTruck,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./SupplierReviews.css";

const SupplierReviews = ({ supplierId, onDataLoad }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [supplierId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", "10");

      const response = await api.get(`/supply-reviews/supplier/${supplierId}?${params.toString()}`);
      setReviews(response.data.data);
      setTotalPages(response.data.pages);
      const avgRating = response.data.averageRating || 0;
      const total = response.data.total || 0;
      setAverageRating(avgRating);
      setTotalReviews(total);
      
      // Pass data to parent component
      if (onDataLoad) {
        onDataLoad({
          averageRating: avgRating,
          totalReviews: total,
        });
      }
      setError("");
    } catch (error) {
      setError("Failed to load reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="supplier-reviews-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-reviews-container">
      {error && <div className="error-message">{error}</div>}

      {reviews.length === 0 ? (
        <div className="no-reviews-creative">
          <div className="empty-reviews-icon">
            <FaStar />
          </div>
          <h3>No Reviews Yet</h3>
          <p>Be the first to review this supplier!</p>
        </div>
      ) : (
        <>
          <div className="reviews-list-creative">
            {reviews.map((review, index) => (
              <div key={review._id} className="review-card-creative" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="review-card-gradient"></div>
                <div className="review-card-content">
                  <div className="review-header-creative">
                    <div className="reviewer-section">
                      <div className="reviewer-avatar-creative">
                        {review.customer?.avatar ? (
                          <img src={review.customer.avatar} alt={review.customer.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            <FaUser />
                          </div>
                        )}
                        <div className="avatar-ring"></div>
                      </div>
                      <div className="reviewer-details">
                        <h4 className="reviewer-name">{review.customer?.name || "Anonymous"}</h4>
                        <p className="review-date-creative">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    {review.isVerified && (
                      <div className="verified-badge-creative">
                        <FaCheckCircle className="verified-icon" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="review-rating-creative">
                    <div className="stars-container-creative">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`star-icon-creative ${i < review.rating ? "filled" : "empty"}`}
                        />
                      ))}
                    </div>
                    <span className="rating-badge">{review.rating}/5</span>
                  </div>

                  {review.supply && (
                    <div className="review-supply-creative">
                      <div className="supply-icon-wrapper">
                        <FaBox className="supply-icon" />
                      </div>
                      <div className="supply-info">
                        <Link to={`/supplies/${review.supply._id}`} className="supply-link-creative">
                          {review.supply.name}
                        </Link>
                        <span className="supply-category-creative">
                          <FaTag className="category-icon" />
                          {review.supply.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {review.comment && (
                    <div className="review-comment-creative">
                      <p>{review.comment}</p>
                    </div>
                  )}

                  {(review.quality || review.valueForMoney || review.delivery) && (
                    <div className="review-details-creative">
                      {review.quality && (
                        <div className="detail-badge">
                          <FaThumbsUp className="detail-icon" />
                          <span>Quality</span>
                          <div className="detail-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`mini-star ${i < review.quality ? "filled" : "empty"}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {review.valueForMoney && (
                        <div className="detail-badge">
                          <FaDollarSign className="detail-icon" />
                          <span>Value</span>
                          <div className="detail-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`mini-star ${i < review.valueForMoney ? "filled" : "empty"}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {review.delivery && (
                        <div className="detail-badge">
                          <FaTruck className="detail-icon" />
                          <span>Delivery</span>
                          <div className="detail-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`mini-star ${i < review.delivery ? "filled" : "empty"}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {review.images && review.images.length > 0 && (
                    <div className="review-images-creative">
                      <div className="images-header">
                        <FaImage className="images-icon" />
                        <span>{review.images.length} Photo{review.images.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="images-grid">
                        {review.images.map((image, idx) => (
                          <div key={idx} className="review-image-wrapper">
                            <img
                              src={`http://localhost:5000${image}`}
                              alt={`Review ${idx + 1}`}
                            />
                            <div className="image-overlay"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-creative">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                <FaChevronLeft />
                Previous
              </button>
              <div className="page-indicators">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`page-dot ${page === i + 1 ? "active" : ""}`}
                  />
                ))}
              </div>
              <span className="page-info-creative">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupplierReviews;

