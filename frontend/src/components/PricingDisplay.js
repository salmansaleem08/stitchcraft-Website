import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./PricingDisplay.css";

const PricingDisplay = ({ tailorId: propTailorId }) => {
  const { id: paramTailorId } = useParams();
  const tailorId = propTailorId || paramTailorId;
  const { user } = useContext(AuthContext);
  const [tiers, setTiers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tiers");

  useEffect(() => {
    if (tailorId) {
      fetchPricingData();
    }
  }, [tailorId]);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const [tiersResponse, packagesResponse] = await Promise.all([
        api.get(`/pricing/tiers/${tailorId}`),
        api.get(`/pricing/packages/${tailorId}`),
      ]);
      setTiers(tiersResponse.data.data);
      setPackages(packagesResponse.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load pricing information");
      console.error("Error fetching pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pricing-display-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading pricing...</p>
        </div>
      </div>
    );
  }

  const tierTypeLabels = {
    basic: "Basic Stitching",
    premium: "Premium Stitching",
    luxury: "Luxury Tier",
    bulk: "Bulk Orders",
  };

  return (
    <div className="pricing-display-container">
      <div className="container">
        <div className="pricing-header">
          <h2>Pricing & Packages</h2>
          <p>Choose the service that fits your needs</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="pricing-tabs">
          <button
            className={`tab-btn ${activeTab === "tiers" ? "active" : ""}`}
            onClick={() => setActiveTab("tiers")}
          >
            Service Tiers
          </button>
          <button
            className={`tab-btn ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => setActiveTab("packages")}
          >
            Packages {packages.length > 0 && <span className="tab-count">({packages.length})</span>}
          </button>
        </div>

        {activeTab === "tiers" && (
          <div className="pricing-content">
            {tiers.length === 0 ? (
              <div className="no-data">
                <p>No pricing tiers available</p>
              </div>
            ) : (
              <div className="tiers-grid">
                {tiers.map((tier) => (
                  <div key={tier._id} className="tier-card">
                    <div className="tier-header">
                      <div>
                        <h3>{tier.name}</h3>
                        <span className="tier-type">{tierTypeLabels[tier.tierType] || tier.tierType}</span>
                      </div>
                    </div>
                    <div className="tier-price">
                      <span className="price-label">Starting from</span>
                      <span className="price-value">PKR {tier.basePrice?.toLocaleString()}</span>
                    </div>
                    {tier.description && (
                      <p className="tier-description">{tier.description}</p>
                    )}
                    {tier.features && tier.features.length > 0 && (
                      <ul className="tier-features">
                        {tier.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    )}
                    {tier.discounts && (
                      <div className="tier-discounts">
                        {tier.discounts.multipleGarments?.enabled && (
                          <div className="discount-badge">
                            {tier.discounts.multipleGarments.percentage}% off on{" "}
                            {tier.discounts.multipleGarments.threshold}+ garments
                          </div>
                        )}
                        {tier.discounts.seasonal?.enabled && (
                          <div className="discount-badge seasonal">
                            Seasonal Discount Available
                          </div>
                        )}
                        {tier.discounts.corporate?.enabled && (
                          <div className="discount-badge corporate">
                            Corporate Discount Available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "packages" && (
          <div className="pricing-content">
            {packages.length === 0 ? (
              <div className="no-data">
                <p>No packages available</p>
              </div>
            ) : (
              <div className="packages-grid">
                {packages.map((pkg) => (
                  <div key={pkg._id} className="package-card">
                    <div className="package-header">
                      <h3>{pkg.name}</h3>
                      {pkg.discountPercentage > 0 && (
                        <span className="discount-tag">
                          {pkg.discountPercentage.toFixed(0)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="package-price">
                      {pkg.originalPrice > pkg.packagePrice && (
                        <span className="original-price">
                          PKR {pkg.originalPrice}
                        </span>
                      )}
                      <span className="current-price">PKR {pkg.packagePrice}</span>
                    </div>
                    {pkg.description && (
                      <p className="package-description">{pkg.description}</p>
                    )}
                    {pkg.garments && pkg.garments.length > 0 && (
                      <div className="package-contents">
                        <h4>Includes:</h4>
                        <ul>
                          {pkg.garments.map((garment, idx) => (
                            <li key={idx}>
                              {garment.quantity}x {garment.garmentType}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pkg.fabricIncluded && (
                      <div className="fabric-included">
                        <span>Fabric Included</span>
                        {pkg.fabricDetails && (
                          <span className="fabric-details">
                            {pkg.fabricDetails.fabricType} - {pkg.fabricDetails.color}
                          </span>
                        )}
                      </div>
                    )}
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="package-features">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    )}
                    {pkg.validUntil && (
                      <p className="package-validity">
                        Valid until: {new Date(pkg.validUntil).toLocaleDateString()}
                      </p>
                    )}
                    {pkg.isLimited && (
                      <p className="package-limited">
                        Limited: {pkg.maxOrders - pkg.currentOrders} remaining
                      </p>
                    )}
                    {user && user.role === "customer" && user._id !== tailorId && (
                      <Link
                        to={`/tailors/${tailorId}/book?package=${pkg._id}`}
                        className="btn btn-primary package-order-btn"
                      >
                        Order This Package
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingDisplay;

