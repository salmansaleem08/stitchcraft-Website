import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./SupplierReviews.css";

const SupplierReviews = ({ supplierId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);

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
      setAverageRating(response.data.averageRating || 0);
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
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        {averageRating > 0 && (
          <div className="average-rating">
            <span className="stars-large">
              {"★".repeat(Math.floor(averageRating))}
              {"☆".repeat(5 - Math.floor(averageRating))}
            </span>
            <span className="rating-value">{averageRating.toFixed(1)}</span>
            <span className="reviews-count">({reviews.length > 0 ? "See all" : "No"} reviews)</span>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet for this supplier.</p>
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

                {review.supply && (
                  <div className="review-supply">
                    <Link to={`/supplies/${review.supply._id}`} className="supply-link">
                      {review.supply.name}
                    </Link>
                    <span className="supply-category">{review.supply.category}</span>
                  </div>
                )}

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
                      <img key={idx} src={image} alt={`Review ${idx + 1}`} />
                    ))}
                  </div>
                )}
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

export default SupplierReviews;

