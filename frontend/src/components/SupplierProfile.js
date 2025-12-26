import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import "./SupplierProfile.css";

const SupplierProfile = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSupplierProfile();
  }, [id]);

  const fetchSupplierProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/suppliers/${id}`);
      setSupplier(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load supplier profile. Please try again.");
      console.error("Error fetching supplier profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="supplier-profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading supplier profile...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="supplier-profile-container">
        <div className="error-message">{error || "Supplier not found"}</div>
        <Link to="/suppliers" className="btn btn-primary">
          Back to Suppliers
        </Link>
      </div>
    );
  }

  const getVerificationBadge = () => {
    switch (supplier.verificationStatus) {
      case "verified":
        return <span className="verification-badge verified">Verified Supplier</span>;
      case "under_review":
        return <span className="verification-badge under-review">Under Review</span>;
      case "rejected":
        return <span className="verification-badge rejected">Verification Rejected</span>;
      default:
        return <span className="verification-badge pending">Pending Verification</span>;
    }
  };

  return (
    <div className="supplier-profile-container">
      <div className="container">
        <Link to="/suppliers" className="back-link">
          ← Back to Suppliers
        </Link>

        <div className="profile-header">
          <div className="profile-avatar-section">
            {supplier.avatar ? (
              <img src={supplier.avatar} alt={supplier.businessName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">
                {supplier.businessName?.charAt(0).toUpperCase() || supplier.name.charAt(0).toUpperCase()}
              </div>
            )}
            {getVerificationBadge()}
          </div>

          <div className="profile-info">
            <h1>{supplier.businessName || supplier.name}</h1>
            <p className="supplier-name">{supplier.name}</p>
            {supplier.address && (
              <p className="profile-location">
                {supplier.address.street && `${supplier.address.street}, `}
                {supplier.address.city && `${supplier.address.city}, `}
                {supplier.address.province && supplier.address.province}
              </p>
            )}

            <div className="profile-rating">
              <span className="stars-large">
                {"★".repeat(Math.floor(supplier.qualityRating || 0))}
                {"☆".repeat(5 - Math.floor(supplier.qualityRating || 0))}
              </span>
              <span className="rating-value">
                {supplier.qualityRating?.toFixed(1) || "0.0"}
              </span>
              <span className="reviews-count">
                ({supplier.totalQualityReviews || 0} reviews)
              </span>
            </div>

            {supplier.businessDescription && (
              <p className="profile-bio">{supplier.businessDescription}</p>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{supplier.yearsInBusiness || 0}</div>
            <div className="stat-label">Years in Business</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{supplier.businessType || "N/A"}</div>
            <div className="stat-label">Business Type</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{supplier.productCategories?.length || 0}</div>
            <div className="stat-label">Product Categories</div>
          </div>
          {supplier.distributionCenters && supplier.distributionCenters.length > 0 && (
            <div className="stat-card">
              <div className="stat-value">{supplier.distributionCenters.length}</div>
              <div className="stat-label">Distribution Centers</div>
            </div>
          )}
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Business Information</h3>
            <div className="detail-grid">
              {supplier.businessRegistrationNumber && (
                <div className="detail-item">
                  <span className="detail-label">Registration Number:</span>
                  <span className="detail-value">{supplier.businessRegistrationNumber}</span>
                </div>
              )}
              {supplier.taxId && (
                <div className="detail-item">
                  <span className="detail-label">Tax ID:</span>
                  <span className="detail-value">{supplier.taxId}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{supplier.phone}</span>
                </div>
              )}
              {supplier.email && (
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{supplier.email}</span>
                </div>
              )}
            </div>
          </div>

          {supplier.productCategories && supplier.productCategories.length > 0 && (
            <div className="detail-section">
              <h3>Product Categories</h3>
              <div className="categories-list">
                {supplier.productCategories.map((category, idx) => (
                  <span key={idx} className="category-tag">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {supplier.distributionCenters && supplier.distributionCenters.length > 0 && (
            <div className="detail-section">
              <h3>Distribution Centers</h3>
              <div className="distribution-centers-list">
                {supplier.distributionCenters.map((center, idx) => (
                  <div key={idx} className="center-card">
                    <h4>{center.name}</h4>
                    {center.address && (
                      <p>
                        {center.address.street && `${center.address.street}, `}
                        {center.address.city && `${center.address.city}, `}
                        {center.address.province && center.address.province}
                      </p>
                    )}
                    {center.phone && <p>Phone: {center.phone}</p>}
                    {!center.isActive && <span className="inactive-badge">Inactive</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {supplier.bulkDiscountEnabled && (
            <div className="detail-section">
              <h3>Bulk Discounts</h3>
              <div className="bulk-discounts">
                {supplier.bulkDiscountTiers?.map((tier, idx) => (
                  <div key={idx} className="discount-tier">
                    <span>{tier.minQuantity}+ items: {tier.discountPercentage}% off</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;

