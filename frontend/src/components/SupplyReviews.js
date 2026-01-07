import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplyReviews.css";

const SupplyReviews = ({ supplyId, onReviewSubmit }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    quality: 5,
    valueForMoney: 5,
    delivery: 5,
    images: [],
  });

  useEffect(() => {
    fetchReviews();
  }, [supplyId, page, ratingFilter, sort]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", "10");
      if (ratingFilter) params.append("rating", ratingFilter);
      params.append("sort", sort);

      const response = await api.get(`/supply-reviews/supply/${supplyId}?${params.toString()}`);
      setReviews(response.data.data);
      setTotalPages(response.data.pages);
      setRatingDistribution(response.data.ratingDistribution || {});
      setError("");
    } catch (error) {
      setError("Failed to load reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || user.role !== "customer") {
      setError("Only customers can submit reviews");
      return;
    }

    try {
      // First, get the supply to get supplier ID
      const supplyRes = await api.get(`/supplies/${supplyId}`);
      const supply = supplyRes.data.data;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("supply", supplyId);
      formData.append("supplier", supply.supplier._id);
      formData.append("rating", reviewData.rating);
      formData.append("comment", reviewData.comment || "");
      formData.append("quality", reviewData.quality);
      formData.append("valueForMoney", reviewData.valueForMoney);
      formData.append("delivery", reviewData.delivery);

      // Add images if any
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((image, index) => {
          formData.append("images", image);
        });
      }

      await api.post("/supply-reviews", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowReviewForm(false);
      setReviewData({
        rating: 5,
        comment: "",
        quality: 5,
        valueForMoney: 5,
        delivery: 5,
        images: [],
      });
      fetchReviews();
      if (onReviewSubmit) onReviewSubmit();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit review");
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await api.post(`/supply-reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const totalReviews = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="supply-reviews-container">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        {user?.role === "customer" && !showReviewForm && (
          <button onClick={() => setShowReviewForm(true)} className="btn btn-primary">
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="review-form-section">
          <h3>Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Overall Rating *</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= reviewData.rating ? "active" : ""}`}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quality</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.quality ? "active" : ""}`}
                      onClick={() => setReviewData({ ...reviewData, quality: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Value for Money</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.valueForMoney ? "active" : ""}`}
                      onClick={() => setReviewData({ ...reviewData, valueForMoney: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Delivery</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.delivery ? "active" : ""}`}
                      onClick={() => setReviewData({ ...reviewData, delivery: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                rows="4"
                placeholder="Share your experience..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="images">Photos (optional)</label>
              <div className="image-upload-container">
                <div className="upload-area" onClick={() => document.getElementById('images').click()}>
                  <div className="upload-icon">📸</div>
                  <div className="upload-text">
                    <strong>Click to upload photos</strong>
                    <br />
                    <span className="upload-subtitle">or drag and drop images here</span>
                  </div>
                  <button type="button" className="btn btn-secondary upload-btn" onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('images').click();
                  }}>
                    Choose Files
                  </button>
                </div>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    // Limit to 5 images
                    if (files.length > 5) {
                      alert("You can upload maximum 5 images");
                      return;
                    }
                    setReviewData({ ...reviewData, images: files });
                  }}
                  className="file-input-hidden"
                  style={{ display: 'none' }}
                />
                <small className="file-help">Upload up to 5 images (max 10MB each)</small>
              </div>

              {reviewData.images.length > 0 && (
                <div className="image-preview">
                  <h4>Selected Photos ({reviewData.images.length}/5)</h4>
                  <div className="preview-grid">
                    {reviewData.images.map((file, idx) => (
                      <div key={idx} className="preview-item">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = reviewData.images.filter((_, i) => i !== idx);
                            setReviewData({ ...reviewData, images: newImages });
                          }}
                          className="remove-image"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setError("");
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {totalReviews > 0 && (
        <div className="reviews-filters">
          <div className="rating-distribution">
            <h3>Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="distribution-item">
                  <span className="rating-label">{rating}★</span>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="distribution-count">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="filter-controls">
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rated</option>
              <option value="rating_low">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this supply!</p>
        </div>
      ) : (
        <>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.customer?.avatar ? (
                        <img src={review.customer.avatar} alt={review.customer.name} />
                      ) : (
                        <span>{review.customer?.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div>
                      <h4>{review.customer?.name || "Anonymous"}</h4>
                      <p className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {review.isVerified && (
                    <span className="verified-badge">Verified Purchase</span>
                  )}
                </div>

                <div className="review-rating">
                  <span className="stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="rating-value">{review.rating}/5</span>
                </div>

                {review.comment && <p className="review-comment">{review.comment}</p>}

                {(review.quality || review.valueForMoney || review.delivery) && (
                  <div className="review-details">
                    {review.quality && (
                      <span>Quality: {"★".repeat(review.quality)}</span>
                    )}
                    {review.valueForMoney && (
                      <span>Value: {"★".repeat(review.valueForMoney)}</span>
                    )}
                    {review.delivery && (
                      <span>Delivery: {"★".repeat(review.delivery)}</span>
                    )}
                  </div>
                )}

                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${image}`}
                        alt={`Review ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="review-actions">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    className="btn-helpful"
                  >
                    Helpful ({review.helpful || 0})
                  </button>
                </div>
              </div>
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
    </div>
  );
};

export default SupplyReviews;

