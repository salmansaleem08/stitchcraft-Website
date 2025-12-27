import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import "./PatternDetail.css";

const PatternDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pattern, setPattern] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationMessage, setCollaborationMessage] = useState("");

  useEffect(() => {
    fetchPattern();
  }, [id]);

  const fetchPattern = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patterns/${id}`);
      setPattern(response.data.data.pattern);
      setReviews(response.data.data.reviews || []);
      setHasPurchased(response.data.data.hasPurchased || false);
      setError("");
    } catch (error) {
      setError("Failed to load pattern");
      console.error("Error fetching pattern:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setPurchasing(true);
      await api.post(`/patterns/${id}/purchase`);
      setHasPurchased(true);
      alert("Pattern purchased successfully!");
      fetchPattern();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to purchase pattern");
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!hasPurchased && !pattern.isFree) {
      alert("Please purchase this pattern first");
      return;
    }

    try {
      setDownloading(true);
      const response = await api.get(`/patterns/${id}/download`);
      // In a real app, you would download the file
      window.open(response.data.data.downloadUrl, "_blank");
      alert("Download started!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to download pattern");
    } finally {
      setDownloading(false);
    }
  };

  const handleCollaborationRequest = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await api.post(`/patterns/${id}/collaborate`, {
        message: collaborationMessage,
      });
      alert("Collaboration request sent successfully!");
      setShowCollaborationModal(false);
      setCollaborationMessage("");
      fetchPattern();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send collaboration request");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !pattern) {
    return (
      <div className="container">
        <div className="error-message">{error || "Pattern not found"}</div>
        <Link to="/patterns" className="btn btn-primary">
          Back to Patterns
        </Link>
      </div>
    );
  }

  const primaryImage = pattern.images?.[activeImageIndex] || pattern.images?.[0];

  return (
    <div className="pattern-detail">
      <div className="container">
        <Link to="/patterns" className="back-link">
          ← Back to Patterns
        </Link>

        <div className="pattern-detail-content">
          <div className="pattern-images">
            <div className="main-image">
              {primaryImage ? (
                <img src={primaryImage.url} alt={pattern.title} />
              ) : (
                <div className="image-placeholder">No Image</div>
              )}
            </div>
            {pattern.images && pattern.images.length > 1 && (
              <div className="image-thumbnails">
                {pattern.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`thumbnail ${activeImageIndex === index ? "active" : ""}`}
                  >
                    <img src={img.url} alt={`${pattern.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pattern-info-section">
            <div className="pattern-header">
              <h1>{pattern.title}</h1>
              <div className="pattern-badges">
                {pattern.isFree && <span className="badge free">Free</span>}
                {pattern.featured && <span className="badge featured">Featured</span>}
                <span className="badge difficulty">{pattern.difficulty}</span>
              </div>
            </div>

            <div className="pattern-meta-info">
              <div className="meta-item">
                <strong>Category:</strong> {pattern.category}
              </div>
              <div className="meta-item">
                <strong>Design Type:</strong> {pattern.designType}
              </div>
              <div className="meta-item">
                <strong>Designer:</strong> {pattern.designer?.name || "Unknown"}
              </div>
              <div className="meta-item">
                <strong>Rating:</strong>{" "}
                <span className="rating">
                  ★ {pattern.stats?.rating?.toFixed(1) || "0.0"} ({pattern.stats?.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            <div className="pattern-price-section">
              {pattern.isFree ? (
                <div className="price free-price">Free</div>
              ) : (
                <div className="price">PKR {pattern.price.toLocaleString()}</div>
              )}
            </div>

            <div className="pattern-actions">
              {hasPurchased || pattern.isFree ? (
                <button onClick={handleDownload} disabled={downloading} className="btn btn-primary">
                  {downloading ? "Downloading..." : "Download Pattern"}
                </button>
              ) : (
                <button onClick={handlePurchase} disabled={purchasing} className="btn btn-primary">
                  {purchasing ? "Processing..." : "Purchase Pattern"}
                </button>
              )}
              {pattern.collaboration?.enabled && (
                <button
                  onClick={() => setShowCollaborationModal(true)}
                  className="btn btn-secondary"
                >
                  Request Collaboration
                </button>
              )}
              {user && pattern.designer?._id === user._id && (
                <Link
                  to={`/patterns/${id}/collaboration`}
                  className="btn btn-secondary"
                >
                  Manage Collaboration Requests
                </Link>
              )}
            </div>

            <div className="pattern-description">
              <h3>Description</h3>
              <p>{pattern.description}</p>
            </div>

            {pattern.fabricRequirements && (
              <div className="pattern-fabric-requirements">
                <h3>Fabric Requirements</h3>
                <ul>
                  {pattern.fabricRequirements.fabricType && (
                    <li>
                      <strong>Fabric Type:</strong> {pattern.fabricRequirements.fabricType}
                    </li>
                  )}
                  {pattern.fabricRequirements.estimatedMeters && (
                    <li>
                      <strong>Estimated Meters:</strong> {pattern.fabricRequirements.estimatedMeters} m
                    </li>
                  )}
                  {pattern.fabricRequirements.estimatedYards && (
                    <li>
                      <strong>Estimated Yards:</strong> {pattern.fabricRequirements.estimatedYards} yds
                    </li>
                  )}
                  {pattern.fabricRequirements.notes && <li>{pattern.fabricRequirements.notes}</li>}
                </ul>
              </div>
            )}

            {pattern.careInstructions && (
              <div className="pattern-care-instructions">
                <h3>Care Instructions</h3>
                <ul>
                  {pattern.careInstructions.washing && (
                    <li>
                      <strong>Washing:</strong> {pattern.careInstructions.washing}
                    </li>
                  )}
                  {pattern.careInstructions.ironing && (
                    <li>
                      <strong>Ironing:</strong> {pattern.careInstructions.ironing}
                    </li>
                  )}
                  {pattern.careInstructions.specialNotes && (
                    <li>{pattern.careInstructions.specialNotes}</li>
                  )}
                </ul>
              </div>
            )}

            {pattern.copyright && (
              <div className="pattern-copyright">
                <h3>Copyright Information</h3>
                <p>
                  <strong>License:</strong> {pattern.copyright.license}
                </p>
                {pattern.copyright.licenseDetails && <p>{pattern.copyright.licenseDetails}</p>}
              </div>
            )}

            {pattern.tags && pattern.tags.length > 0 && (
              <div className="pattern-tags">
                {pattern.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="pattern-reviews-section">
            <h2>Reviews ({reviews.length})</h2>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <strong>{review.user?.name || "Anonymous"}</strong>
                      {review.verifiedPurchase && <span className="verified-badge">Verified Purchase</span>}
                    </div>
                    <div className="review-rating">
                      {"★".repeat(review.rating)}
                      <span className="rating-number">{review.rating}/5</span>
                    </div>
                  </div>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                  {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((img, index) => (
                        <img key={index} src={img} alt={`Review ${index + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showCollaborationModal && (
          <div className="modal-overlay" onClick={() => setShowCollaborationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Request Collaboration</h3>
              <textarea
                value={collaborationMessage}
                onChange={(e) => setCollaborationMessage(e.target.value)}
                placeholder="Tell the designer why you'd like to collaborate..."
                rows="5"
              />
              <div className="modal-actions">
                <button onClick={handleCollaborationRequest} className="btn btn-primary">
                  Send Request
                </button>
                <button onClick={() => setShowCollaborationModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternDetail;

