import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import FabricRecommendations from "./FabricRecommendations";
import "./FabricDetail.css";

const FabricDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [fabric, setFabric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchFabric();
  }, [id]);

  const fetchFabric = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/fabrics/${id}`);
      setFabric(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load fabric details. Please try again.");
      console.error("Error fetching fabric:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fabric-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading fabric details...</p>
        </div>
      </div>
    );
  }

  if (error || !fabric) {
    return (
      <div className="fabric-detail-container">
        <div className="error-message">{error || "Fabric not found"}</div>
        <Link to="/fabrics" className="btn btn-primary">
          Back to Fabrics
        </Link>
      </div>
    );
  }

  const isSupplier = user?.role === "supplier" && user?._id === fabric.supplier._id;

  return (
    <div className="fabric-detail-container">
      <div className="container">
        <Link to="/fabrics" className="back-link">
          ← Back to Fabrics
        </Link>

        <div className="fabric-detail-grid">
          <div className="fabric-images-section">
            <div className="main-image">
              {fabric.images && fabric.images.length > 0 ? (
                <img
                  src={fabric.images[selectedImageIndex]}
                  alt={fabric.name}
                />
              ) : (
                <div className="image-placeholder">
                  {fabric.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {fabric.images && fabric.images.length > 1 && (
              <div className="image-thumbnails">
                {fabric.images.map((image, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail ${selectedImageIndex === idx ? "active" : ""}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={image} alt={`${fabric.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="fabric-info-section">
            <div className="fabric-header">
              <h1>{fabric.name}</h1>
              {fabric.supplier?.verificationStatus === "verified" && (
                <span className="verified-badge-large">Verified Supplier</span>
              )}
            </div>

            <div className="supplier-info">
              <Link to={`/suppliers/${fabric.supplier._id}`} className="supplier-link">
                <span className="supplier-label">Supplier:</span>
                <span className="supplier-name">
                  {fabric.supplier?.businessName || fabric.supplier?.name}
                </span>
              </Link>
              {fabric.supplier?.qualityRating > 0 && (
                <div className="supplier-rating">
                  <span className="stars">
                    {"★".repeat(Math.floor(fabric.supplier.qualityRating))}
                    {"☆".repeat(5 - Math.floor(fabric.supplier.qualityRating))}
                  </span>
                  <span className="rating-value">
                    {fabric.supplier.qualityRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <div className="fabric-price-section">
              <div className="price-main">
                <span className="price-label">Price per Meter:</span>
                <span className="price-value">
                  PKR {fabric.pricePerMeter?.toLocaleString()}
                </span>
              </div>
              {fabric.unit && (
                <p className="price-unit">Unit: {fabric.unit}</p>
              )}
            </div>

            <div className="fabric-specs">
              <div className="spec-item">
                <span className="spec-label">Fabric Type:</span>
                <span className="spec-value">{fabric.fabricType}</span>
              </div>
              {fabric.weight && (
                <div className="spec-item">
                  <span className="spec-label">Weight:</span>
                  <span className="spec-value">{fabric.weight}</span>
                </div>
              )}
              {fabric.color && (
                <div className="spec-item">
                  <span className="spec-label">Color:</span>
                  <span className="spec-value">{fabric.color}</span>
                </div>
              )}
              {fabric.pattern && (
                <div className="spec-item">
                  <span className="spec-label">Pattern:</span>
                  <span className="spec-value">{fabric.pattern}</span>
                </div>
              )}
              {fabric.composition && (
                <div className="spec-item">
                  <span className="spec-label">Composition:</span>
                  <span className="spec-value">{fabric.composition}</span>
                </div>
              )}
              {fabric.width && (
                <div className="spec-item">
                  <span className="spec-label">Width:</span>
                  <span className="spec-value">
                    {fabric.width} {fabric.widthUnit || "inches"}
                  </span>
                </div>
              )}
              {fabric.origin && (
                <div className="spec-item">
                  <span className="spec-label">Origin:</span>
                  <span className="spec-value">{fabric.origin}</span>
                </div>
              )}
            </div>

            {fabric.season && fabric.season.length > 0 && (
              <div className="fabric-tags">
                <span className="tags-label">Seasons:</span>
                <div className="tags-list">
                  {fabric.season.map((season, idx) => (
                    <span key={idx} className="tag">
                      {season}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {fabric.occasion && fabric.occasion.length > 0 && (
              <div className="fabric-tags">
                <span className="tags-label">Occasions:</span>
                <div className="tags-list">
                  {fabric.occasion.map((occ, idx) => (
                    <span key={idx} className="tag">
                      {occ}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {fabric.tags && fabric.tags.length > 0 && (
              <div className="fabric-tags">
                <span className="tags-label">Tags:</span>
                <div className="tags-list">
                  {fabric.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="fabric-stock-section">
              {fabric.stockQuantity !== undefined && (
                <div className="stock-info">
                  <span className="stock-label">Stock:</span>
                  <span
                    className={`stock-value ${
                      fabric.stockQuantity > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {fabric.stockQuantity > 0
                      ? `${fabric.stockQuantity} ${fabric.unit || "meters"} available`
                      : "Out of Stock"}
                  </span>
                </div>
              )}
              {fabric.minimumOrderMeters && (
                <div className="min-order">
                  <span className="min-order-label">Minimum Order:</span>
                  <span className="min-order-value">
                    {fabric.minimumOrderMeters} {fabric.unit || "meters"}
                  </span>
                </div>
              )}
            </div>

            {fabric.description && (
              <div className="fabric-description">
                <h3>Description</h3>
                <p>{fabric.description}</p>
              </div>
            )}

            {fabric.careInstructions && (
              <div className="fabric-care">
                <h3>Care Instructions</h3>
                <p>{fabric.careInstructions}</p>
              </div>
            )}

            {fabric.rating > 0 && (
              <div className="fabric-rating-section">
                <h3>Rating</h3>
                <div className="rating-display">
                  <span className="stars-large">
                    {"★".repeat(Math.floor(fabric.rating))}
                    {"☆".repeat(5 - Math.floor(fabric.rating))}
                  </span>
                  <span className="rating-value-large">
                    {fabric.rating.toFixed(1)} / 5.0
                  </span>
                  <span className="reviews-count">
                    ({fabric.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            )}

            {isSupplier && (
              <div className="supplier-actions">
                <Link
                  to={`/fabrics/${fabric._id}/edit`}
                  className="btn btn-primary"
                >
                  Edit Fabric
                </Link>
              </div>
            )}

            {user && user.role === "customer" && (
              <div className="customer-actions">
                <Link
                  to={`/fabrics/${fabric._id}/sample-order`}
                  className="btn btn-primary"
                >
                  Order Sample
                </Link>
              </div>
            )}
          </div>
        </div>

        <FabricRecommendations fabricId={fabric._id} />
      </div>
    </div>
  );
};

export default FabricDetail;

