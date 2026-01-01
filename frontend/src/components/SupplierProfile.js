import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import SupplierReviews from "./SupplierReviews";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaShieldAlt,
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaTag,
  FaWarehouse,
  FaPercent,
  FaShoppingCart,
  FaUser,
  FaCalendarAlt,
  FaBriefcase,
  FaIdCard,
  FaEllipsisV,
  FaPlus,
  FaEye,
} from "react-icons/fa";
import "./SupplierProfile.css";

const SupplierProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

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
        return (
          <span className="verification-badge verified">
            <FaCheckCircle className="badge-icon" />
            Verified Supplier
          </span>
        );
      case "under_review":
        return (
          <span className="verification-badge under-review">
            <FaClock className="badge-icon" />
            Under Review
          </span>
        );
      case "rejected":
        return (
          <span className="verification-badge rejected">
            <FaTimesCircle className="badge-icon" />
            Verification Rejected
          </span>
        );
      default:
        return (
          <span className="verification-badge pending">
            <FaClock className="badge-icon" />
            Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="supplier-profile-container">
      <div className="container">
        <Link to="/suppliers" className="back-link">
          <FaArrowLeft className="back-icon" />
          Back to Suppliers
        </Link>

        <div className="profile-layout">
          {/* Left Column - Profile Details */}
          <div className="profile-left-column">
            <div className="profile-card">
              <div className="profile-header-section">
                <div className="profile-avatar-wrapper">
                  {supplier.avatar ? (
                    <img src={supplier.avatar} alt={supplier.businessName} className="profile-avatar-img" />
                  ) : (
                    <div className="profile-avatar-img placeholder">
                      {supplier.businessName?.charAt(0).toUpperCase() || supplier.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-name-section">
                  <h1 className="profile-name">{supplier.businessName || supplier.name}</h1>
                  <p className="supplier-id">#{supplier._id?.slice(-8).toUpperCase() || "SUPPLIER"}</p>
                </div>
                <button className="profile-menu-btn">
                  <FaEllipsisV />
                </button>
              </div>

              {/* About Section */}
              <div className="info-section">
                <h3 className="section-title">About</h3>
                {supplier.phone && (
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <span className="info-value">{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <span className="info-value">{supplier.email}</span>
                  </div>
                )}
              </div>

              {/* Address Section */}
              {supplier.address && (
                <div className="info-section">
                  <h3 className="section-title">Address</h3>
                  {supplier.address.street && (
                    <div className="info-item">
                      <FaBuilding className="info-icon" />
                      <span className="info-value">{supplier.address.street}</span>
                    </div>
                  )}
                  {supplier.address.city && supplier.address.province && (
                    <div className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <span className="info-value">
                        {supplier.address.city} {supplier.address.province}
                      </span>
                    </div>
                  )}
                  {supplier.address.postalCode && (
                    <div className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <span className="info-value">{supplier.address.postalCode}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Supplier Details Section */}
              <div className="info-section">
                <h3 className="section-title">Supplier details</h3>
                {supplier.yearsInBusiness && (
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <span className="info-value">Established: {supplier.yearsInBusiness} years</span>
                  </div>
                )}
                {supplier.businessRegistrationNumber && (
                  <div className="info-item">
                    <FaIdCard className="info-icon" />
                    <span className="info-value">Reg: {supplier.businessRegistrationNumber}</span>
                  </div>
                )}
                {supplier.businessType && (
                  <div className="info-item">
                    <FaBriefcase className="info-icon" />
                    <span className="info-value">{supplier.businessType}</span>
                  </div>
                )}
                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <span className="info-value">
                    Joined: {new Date(supplier.createdAt || Date.now()).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {/* Verification Status */}
              <div className="verification-section">
                {getVerificationBadge()}
                {supplier.qualityGuarantee?.enabled && (
                  <span className="quality-badge">
                    <FaShieldAlt className="badge-icon" />
                    Quality Guaranteed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Reviews & Details */}
          <div className="profile-right-column">
            {/* Reviews Section - Full Display */}
            <div className="info-card reviews-card">
              <div className="card-header">
                <h3 className="card-title">Reviews</h3>
                <div className="reviews-rating-header">
                  <div className="stars-container">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`star-icon ${i < Math.floor(reviewsData.averageRating || 0) ? "filled" : "empty"}`}
                      />
                    ))}
                  </div>
                  <span className="rating-value">
                    {reviewsData.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="reviews-count">
                    ({reviewsData.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="reviews-content">
                <SupplierReviews 
                  supplierId={supplier._id} 
                  onDataLoad={(data) => setReviewsData(data)}
                />
              </div>
            </div>

            {/* Categories Tags */}
            {supplier.productCategories && supplier.productCategories.length > 0 && (
              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">Product Categories</h3>
                </div>
                <div className="categories-tags-list">
                  {supplier.productCategories.map((category, idx) => (
                    <span key={idx} className="category-tag-orange">{category}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Section */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">Activity</h3>
              </div>
              <div className="activity-list">
                {supplier.createdAt && (
                  <div className="activity-item">
                    <div className="activity-avatar">
                      {supplier.avatar ? (
                        <img src={supplier.avatar} alt="Supplier" />
                      ) : (
                        <span>{supplier.businessName?.charAt(0).toUpperCase() || supplier.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="activity-content">
                      <p className="activity-name">{supplier.businessName || supplier.name}</p>
                      <p className="activity-action">Account created</p>
                    </div>
                    <div className="activity-time">
                      {new Date(supplier.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
                {supplier.updatedAt && supplier.updatedAt !== supplier.createdAt && (
                  <div className="activity-item">
                    <div className="activity-avatar">
                      {supplier.avatar ? (
                        <img src={supplier.avatar} alt="Supplier" />
                      ) : (
                        <span>{supplier.businessName?.charAt(0).toUpperCase() || supplier.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="activity-content">
                      <p className="activity-name">{supplier.businessName || supplier.name}</p>
                      <p className="activity-action">Profile updated</p>
                    </div>
                    <div className="activity-time">
                      {new Date(supplier.updatedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
                <Link to={`/suppliers/${supplier._id}/reviews`} className="view-all-link">
                  <FaEye className="link-icon" />
                  View all
                </Link>
              </div>
            </div>

            {/* Additional Information and Distribution Centers - Side by Side */}
            <div className="info-cards-grid">
              {/* Additional Information - Left */}
              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">Additional Information</h3>
                </div>
                <div className="additional-details">
                  {supplier.businessDescription && (
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span className="detail-text">{supplier.businessDescription}</span>
                    </div>
                  )}
                  {supplier.taxId && (
                    <div className="detail-row">
                      <span className="detail-label">Tax ID:</span>
                      <span className="detail-text">{supplier.taxId}</span>
                    </div>
                  )}
                  {supplier.businessRegistrationNumber && (
                    <div className="detail-row">
                      <span className="detail-label">Registration Number:</span>
                      <span className="detail-text">{supplier.businessRegistrationNumber}</span>
                    </div>
                  )}
                  {supplier.bulkDiscountEnabled && supplier.bulkDiscountTiers && supplier.bulkDiscountTiers.length > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Bulk Discounts:</span>
                      <span className="detail-text">Available ({supplier.bulkDiscountTiers.length} tiers)</span>
                    </div>
                  )}
                  {supplier.qualityGuarantee?.enabled && (
                    <div className="detail-row">
                      <span className="detail-label">Quality Guarantee:</span>
                      <span className="detail-text">Enabled</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Distribution Centers - Right */}
              {supplier.distributionCenters && supplier.distributionCenters.length > 0 && (
                <div className="info-card">
                  <div className="card-header">
                    <h3 className="card-title">Distribution Centers</h3>
                  </div>
                  <div className="distribution-centers-list-compact">
                    {supplier.distributionCenters.map((center, idx) => (
                      <div key={idx} className="center-card-compact">
                        <h4>{center.name}</h4>
                        {center.address && (
                          <p className="center-address">
                            {center.address.street && `${center.address.street}, `}
                            {center.address.city && `${center.address.city}, `}
                            {center.address.province && center.address.province}
                          </p>
                        )}
                        {center.phone && (
                          <p className="center-phone">
                            <FaPhone className="phone-icon" />
                            {center.phone}
                          </p>
                        )}
                        {!center.isActive && <span className="inactive-badge">Inactive</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupplierProfile;

