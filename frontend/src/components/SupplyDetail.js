import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import SupplyReviews from "./SupplyReviews";
import "./SupplyDetail.css";

const SupplyDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [supply, setSupply] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchSupply();
  }, [id]);

  const fetchSupply = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/supplies/${id}`);
      setSupply(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load supply details. Please try again.");
      console.error("Error fetching supply:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="supply-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !supply) {
    return (
      <div className="supply-detail-container">
        <div className="container">
          <div className="error-message">{error || "Supply not found"}</div>
          <Link to="/supplies" className="btn btn-secondary">
            Back to supplies
          </Link>
        </div>
      </div>
    );
  }

  const isSupplier = user?.role === "supplier" && user?._id === supply.supplier._id;

  return (
    <div className="supply-detail-container">
      <div className="container">
        <Link to="/supplies" className="back-link">
          ← Back
        </Link>

        <div className="supply-detail-layout">
          <div className="supply-images">
            <div className="main-image">
              {supply.images && supply.images.length > 0 ? (
                <img src={supply.images[selectedImageIndex]} alt={supply.name} />
              ) : (
                <div className="image-placeholder">
                  {supply.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {supply.images && supply.images.length > 1 && (
              <div className="image-thumbnails">
                {supply.images.map((image, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail ${selectedImageIndex === idx ? "active" : ""}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={image} alt={`${supply.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="supply-info">
            <div className="supply-header">
              <h1>{supply.name}</h1>
              {supply.supplier?.verificationStatus === "verified" && (
                <span className="verified-badge">Verified</span>
              )}
            </div>

            <div className="supplier-link-wrapper">
              <Link to={`/suppliers/${supply.supplier._id}`} className="supplier-link">
                <span className="supplier-label">Supplier:</span>
                <span className="supplier-name">
                  {supply.supplier?.businessName || supply.supplier?.name}
                </span>
              </Link>
              {supply.supplier?.qualityRating > 0 && (
                <div className="supplier-rating">
                  <span className="rating-stars">
                    {"★".repeat(Math.floor(supply.supplier.qualityRating))}
                    {"☆".repeat(5 - Math.floor(supply.supplier.qualityRating))}
                  </span>
                  <span className="rating-value">
                    {supply.supplier.qualityRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <div className="price-section">
              <div className="price-main">
                <span className="price-label">Price</span>
                <span className="price-value">
                  PKR {supply.price?.toLocaleString()}
                </span>
              </div>
              <p className="price-unit">Per {supply.unit || "piece"}</p>
            </div>

            {supply.sustainability?.isSustainable && (
              <div className="sustainability-badge">
                Sustainable: {supply.sustainability.certification || "Eco-friendly"}
              </div>
            )}

            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Category</span>
                <span className="spec-value">{supply.category}</span>
              </div>
              {supply.subcategory && (
                <div className="spec-item">
                  <span className="spec-label">Subcategory</span>
                  <span className="spec-value">{supply.subcategory}</span>
                </div>
              )}
              {supply.brand && (
                <div className="spec-item">
                  <span className="spec-label">Brand</span>
                  <span className="spec-value">{supply.brand}</span>
                </div>
              )}
              {supply.color && (
                <div className="spec-item">
                  <span className="spec-label">Color</span>
                  <span className="spec-value">{supply.color}</span>
                </div>
              )}
              {supply.size && (
                <div className="spec-item">
                  <span className="spec-label">Size</span>
                  <span className="spec-value">{supply.size}</span>
                </div>
              )}
              {supply.material && (
                <div className="spec-item">
                  <span className="spec-label">Material</span>
                  <span className="spec-value">{supply.material}</span>
                </div>
              )}
            </div>

            {supply.specifications && Object.keys(supply.specifications).length > 0 && (
              <div className="specifications-section">
                <h3>Specifications</h3>
                <div className="specs-list">
                  {Object.entries(supply.specifications).map(([key, value]) => (
                    <div key={key} className="spec-entry">
                      <span className="spec-key">{key}:</span>
                      <span className="spec-val">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {supply.tags && supply.tags.length > 0 && (
              <div className="tags-section">
                <span className="tags-label">Tags</span>
                <div className="tags-list">
                  {supply.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="stock-section">
              {supply.stockQuantity !== undefined && (
                <div className="stock-info">
                  <span className="stock-label">Stock</span>
                  <span
                    className={`stock-value ${
                      supply.stockQuantity > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {supply.stockQuantity > 0
                      ? `${supply.stockQuantity} ${supply.unit || "pieces"} available`
                      : "Out of stock"}
                  </span>
                </div>
              )}
              {supply.minimumOrderQuantity && (
                <div className="min-order">
                  <span className="min-order-label">Minimum order</span>
                  <span className="min-order-value">
                    {supply.minimumOrderQuantity} {supply.unit || "pieces"}
                  </span>
                </div>
              )}
            </div>

            {supply.description && (
              <div className="description-section">
                <h3>Description</h3>
                <p>{supply.description}</p>
              </div>
            )}

            {supply.rating > 0 && (
              <div className="rating-section">
                <h3>Rating</h3>
                <div className="rating-display">
                  <span className="rating-stars-large">
                    {"★".repeat(Math.floor(supply.rating))}
                    {"☆".repeat(5 - Math.floor(supply.rating))}
                  </span>
                  <span className="rating-value-large">
                    {supply.rating.toFixed(1)} / 5.0
                  </span>
                  <span className="reviews-count">
                    ({supply.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            )}

            <div className="actions-section">
              {isSupplier ? (
                <Link
                  to={`/supplies/${supply._id}/edit`}
                  className="btn btn-secondary"
                >
                  Edit supply
                </Link>
              ) : user?.role === "customer" && supply.stockQuantity > 0 ? (
                <button
                  onClick={async () => {
                    try {
                      await api.post("/cart/items", {
                        productType: "supply",
                        productId: supply._id,
                        quantity: 1,
                      });
                      alert("Item added to cart!");
                    } catch (error) {
                      alert(error.response?.data?.message || "Failed to add to cart");
                    }
                  }}
                  className="btn btn-primary"
                >
                  Add to cart
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <SupplyReviews
          supplyId={supply._id}
          onReviewSubmit={() => {
            fetchSupply();
          }}
        />
      </div>
    </div>
  );
};

export default SupplyDetail;
