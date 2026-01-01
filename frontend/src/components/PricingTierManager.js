import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./PricingTierManager.css";

const PricingTierManager = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({
    tierType: "",
    name: "",
    description: "",
    basePrice: "",
    garmentPricing: {},
    additionalCharges: {
      embroidery: "",
      alterations: "",
      rushOrder: "",
      customDesign: "",
    },
    minimumOrder: 1,
    discounts: {
      multipleGarments: {
        enabled: false,
        threshold: "",
        percentage: "",
      },
      seasonal: {
        enabled: false,
        percentage: "",
        startDate: "",
        endDate: "",
      },
      corporate: {
        enabled: false,
        percentage: "",
        minimumOrders: "",
      },
    },
    features: [],
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState("");
  const [newGarmentType, setNewGarmentType] = useState("");
  const [newGarmentPrice, setNewGarmentPrice] = useState("");

  const garmentTypes = [
    "Shalwar Kameez",
    "Sherwani",
    "Lehenga",
    "Suit",
    "Dress",
    "Pants/Trousers",
    "Kurta",
    "Other",
  ];

  useEffect(() => {
    if (!user || user.role !== "tailor") {
      navigate("/");
      return;
    }
    fetchTiers();
  }, [user]);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pricing/tiers/${user._id}`);
      setTiers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      setTiers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("additionalCharges.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        additionalCharges: {
          ...formData.additionalCharges,
          [field]: value ? parseFloat(value) : "",
        },
      });
    } else if (name.startsWith("discounts.")) {
      const parts = name.split(".");
      const discountType = parts[1];
      const field = parts[2];
      
      setFormData({
        ...formData,
        discounts: {
          ...formData.discounts,
          [discountType]: {
            ...formData.discounts[discountType],
            [field]: type === "checkbox" ? checked : (field === "enabled" ? checked : value),
          },
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const addGarmentPricing = () => {
    if (newGarmentType && newGarmentPrice) {
      setFormData({
        ...formData,
        garmentPricing: {
          ...formData.garmentPricing,
          [newGarmentType]: parseFloat(newGarmentPrice),
        },
      });
      setNewGarmentType("");
      setNewGarmentPrice("");
    }
  };

  const removeGarmentPricing = (garmentType) => {
    const updated = { ...formData.garmentPricing };
    delete updated[garmentType];
    setFormData({ ...formData, garmentPricing: updated });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tierData = {
        tierType: formData.tierType,
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        garmentPricing: formData.garmentPricing,
        additionalCharges: {
          embroidery: formData.additionalCharges.embroidery || 0,
          alterations: formData.additionalCharges.alterations || 0,
          rushOrder: formData.additionalCharges.rushOrder || 0,
          customDesign: formData.additionalCharges.customDesign || 0,
        },
        minimumOrder: parseInt(formData.minimumOrder) || 1,
        discounts: {
          multipleGarments: {
            enabled: formData.discounts.multipleGarments.enabled || false,
            threshold: formData.discounts.multipleGarments.threshold ? parseInt(formData.discounts.multipleGarments.threshold) : 0,
            percentage: formData.discounts.multipleGarments.percentage ? parseFloat(formData.discounts.multipleGarments.percentage) : 0,
          },
          seasonal: {
            enabled: formData.discounts.seasonal.enabled || false,
            percentage: formData.discounts.seasonal.percentage ? parseFloat(formData.discounts.seasonal.percentage) : 0,
            startDate: formData.discounts.seasonal.startDate ? new Date(formData.discounts.seasonal.startDate) : undefined,
            endDate: formData.discounts.seasonal.endDate ? new Date(formData.discounts.seasonal.endDate) : undefined,
          },
          corporate: {
            enabled: formData.discounts.corporate.enabled || false,
            percentage: formData.discounts.corporate.percentage ? parseFloat(formData.discounts.corporate.percentage) : 0,
            minimumOrders: formData.discounts.corporate.minimumOrders ? parseInt(formData.discounts.corporate.minimumOrders) : 0,
          },
        },
        features: formData.features,
        isActive: formData.isActive,
      };

      if (editingTier) {
        await api.put(`/pricing/tiers/${editingTier._id}`, tierData);
      } else {
        await api.post("/pricing/tiers", tierData);
      }

      setShowForm(false);
      setEditingTier(null);
      resetForm();
      fetchTiers();
    } catch (error) {
      console.error("Error saving pricing tier:", error);
      alert(error.response?.data?.message || "Failed to save pricing tier");
    }
  };

  const resetForm = () => {
    setFormData({
      tierType: "",
      name: "",
      description: "",
      basePrice: "",
      garmentPricing: {},
      additionalCharges: {
        embroidery: "",
        alterations: "",
        rushOrder: "",
        customDesign: "",
      },
      minimumOrder: 1,
      discounts: {
        multipleGarments: {
          enabled: false,
          threshold: "",
          percentage: "",
        },
        seasonal: {
          enabled: false,
          percentage: "",
          startDate: "",
          endDate: "",
        },
        corporate: {
          enabled: false,
          percentage: "",
          minimumOrders: "",
        },
      },
      features: [],
      isActive: true,
    });
  };

  const handleEdit = (tier) => {
    setEditingTier(tier);
    const garmentPricingObj = {};
    if (tier.garmentPricing && tier.garmentPricing instanceof Map) {
      tier.garmentPricing.forEach((value, key) => {
        garmentPricingObj[key] = value;
      });
    } else if (tier.garmentPricing) {
      Object.assign(garmentPricingObj, tier.garmentPricing);
    }

    setFormData({
      tierType: tier.tierType || "",
      name: tier.name || "",
      description: tier.description || "",
      basePrice: tier.basePrice || "",
      garmentPricing: garmentPricingObj,
      additionalCharges: {
        embroidery: tier.additionalCharges?.embroidery || "",
        alterations: tier.additionalCharges?.alterations || "",
        rushOrder: tier.additionalCharges?.rushOrder || "",
        customDesign: tier.additionalCharges?.customDesign || "",
      },
      minimumOrder: tier.minimumOrder || 1,
      discounts: {
        multipleGarments: {
          enabled: tier.discounts?.multipleGarments?.enabled || false,
          threshold: tier.discounts?.multipleGarments?.threshold || "",
          percentage: tier.discounts?.multipleGarments?.percentage || "",
        },
        seasonal: {
          enabled: tier.discounts?.seasonal?.enabled || false,
          percentage: tier.discounts?.seasonal?.percentage || "",
          startDate: tier.discounts?.seasonal?.startDate ? new Date(tier.discounts.seasonal.startDate).toISOString().split("T")[0] : "",
          endDate: tier.discounts?.seasonal?.endDate ? new Date(tier.discounts.seasonal.endDate).toISOString().split("T")[0] : "",
        },
        corporate: {
          enabled: tier.discounts?.corporate?.enabled || false,
          percentage: tier.discounts?.corporate?.percentage || "",
          minimumOrders: tier.discounts?.corporate?.minimumOrders || "",
        },
      },
      features: Array.isArray(tier.features) ? tier.features : [],
      isActive: tier.isActive !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (tierId) => {
    if (window.confirm("Are you sure you want to delete this pricing tier?")) {
      try {
        await api.put(`/pricing/tiers/${tierId}`, { isActive: false });
        fetchTiers();
      } catch (error) {
        console.error("Error deleting pricing tier:", error);
        alert("Failed to delete pricing tier");
      }
    }
  };

  if (loading) {
    return (
      <div className="pricing-tier-manager-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading pricing tiers...</p>
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
    <div className="pricing-tier-manager-container">
      <div className="container">
        <div className="pricing-tier-header">
          <div>
            <h1>Pricing Tiers</h1>
            <p>Manage your service pricing structure</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              resetForm();
              setEditingTier(null);
            }}
            className="btn btn-primary"
          >
            Create Pricing Tier
          </button>
        </div>

        {showForm && (
          <div className="tier-form-section">
            <h2>{editingTier ? "Edit Pricing Tier" : "Create New Pricing Tier"}</h2>
            <form onSubmit={handleSubmit} className="tier-form">
              <div className="form-group">
                <label htmlFor="tierType">Tier Type *</label>
                <select
                  id="tierType"
                  name="tierType"
                  value={formData.tierType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select tier type</option>
                  <option value="basic">Basic Stitching</option>
                  <option value="premium">Premium Stitching</option>
                  <option value="luxury">Luxury Tier</option>
                  <option value="bulk">Bulk Orders</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Tier Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Standard Service, Premium Collection"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe what's included in this tier..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="basePrice">Base Price (PKR) *</label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Starting price for this tier"
                />
              </div>

              <div className="form-group">
                <label>Garment-Specific Pricing (Optional)</label>
                <div className="garment-pricing-list">
                  {Object.entries(formData.garmentPricing).map(([garmentType, price]) => (
                    <div key={garmentType} className="garment-pricing-item">
                      <span className="garment-type">{garmentType}</span>
                      <span className="garment-price">PKR {price.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => removeGarmentPricing(garmentType)}
                        className="btn-remove-small"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="garment-pricing-add">
                  <select
                    value={newGarmentType}
                    onChange={(e) => setNewGarmentType(e.target.value)}
                    className="garment-select"
                  >
                    <option value="">Select garment type</option>
                    {garmentTypes
                      .filter((type) => !formData.garmentPricing[type])
                      .map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    value={newGarmentPrice}
                    onChange={(e) => setNewGarmentPrice(e.target.value)}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    className="garment-price-input"
                  />
                  <button
                    type="button"
                    onClick={addGarmentPricing}
                    className="btn btn-secondary btn-small"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Additional Charges (PKR)</label>
                <div className="additional-charges-grid">
                  <div className="form-group-small">
                    <label htmlFor="embroidery">Embroidery</label>
                    <input
                      type="number"
                      id="embroidery"
                      name="additionalCharges.embroidery"
                      value={formData.additionalCharges.embroidery}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group-small">
                    <label htmlFor="alterations">Alterations</label>
                    <input
                      type="number"
                      id="alterations"
                      name="additionalCharges.alterations"
                      value={formData.additionalCharges.alterations}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group-small">
                    <label htmlFor="rushOrder">Rush Order</label>
                    <input
                      type="number"
                      id="rushOrder"
                      name="additionalCharges.rushOrder"
                      value={formData.additionalCharges.rushOrder}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group-small">
                    <label htmlFor="customDesign">Custom Design</label>
                    <input
                      type="number"
                      id="customDesign"
                      name="additionalCharges.customDesign"
                      value={formData.additionalCharges.customDesign}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="minimumOrder">Minimum Order Quantity</label>
                <input
                  type="number"
                  id="minimumOrder"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleChange}
                  min="1"
                  placeholder="1"
                />
              </div>

              <div className="discounts-section">
                <h3>Discounts</h3>
                
                <div className="discount-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="discounts.multipleGarments.enabled"
                      checked={formData.discounts.multipleGarments.enabled}
                      onChange={handleChange}
                    />
                    Multiple Garments Discount
                  </label>
                  {formData.discounts.multipleGarments.enabled && (
                    <div className="discount-inputs">
                      <div className="form-group-small">
                        <label>Threshold (quantity)</label>
                        <input
                          type="number"
                          name="discounts.multipleGarments.threshold"
                          value={formData.discounts.multipleGarments.threshold}
                          onChange={handleChange}
                          min="2"
                          placeholder="2"
                        />
                      </div>
                      <div className="form-group-small">
                        <label>Discount (%)</label>
                        <input
                          type="number"
                          name="discounts.multipleGarments.percentage"
                          value={formData.discounts.multipleGarments.percentage}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="discount-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="discounts.seasonal.enabled"
                      checked={formData.discounts.seasonal.enabled}
                      onChange={handleChange}
                    />
                    Seasonal Discount
                  </label>
                  {formData.discounts.seasonal.enabled && (
                    <div className="discount-inputs">
                      <div className="form-group-small">
                        <label>Discount (%)</label>
                        <input
                          type="number"
                          name="discounts.seasonal.percentage"
                          value={formData.discounts.seasonal.percentage}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="15"
                        />
                      </div>
                      <div className="form-group-small">
                        <label>Start Date</label>
                        <input
                          type="date"
                          name="discounts.seasonal.startDate"
                          value={formData.discounts.seasonal.startDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group-small">
                        <label>End Date</label>
                        <input
                          type="date"
                          name="discounts.seasonal.endDate"
                          value={formData.discounts.seasonal.endDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="discount-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="discounts.corporate.enabled"
                      checked={formData.discounts.corporate.enabled}
                      onChange={handleChange}
                    />
                    Corporate Discount
                  </label>
                  {formData.discounts.corporate.enabled && (
                    <div className="discount-inputs">
                      <div className="form-group-small">
                        <label>Discount (%)</label>
                        <input
                          type="number"
                          name="discounts.corporate.percentage"
                          value={formData.discounts.corporate.percentage}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="20"
                        />
                      </div>
                      <div className="form-group-small">
                        <label>Minimum Orders</label>
                        <input
                          type="number"
                          name="discounts.corporate.minimumOrders"
                          value={formData.discounts.corporate.minimumOrders}
                          onChange={handleChange}
                          min="1"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Features</label>
                <div className="features-list">
                  {formData.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="feature-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="feature-input">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    placeholder="Add feature (e.g., Free consultation, Premium fabric)"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn btn-secondary btn-small"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Active (Available for customers)
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                    setEditingTier(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTier ? "Update Tier" : "Create Tier"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="tiers-list">
          <h2>Your Pricing Tiers ({tiers.length})</h2>
          {tiers.length === 0 ? (
            <div className="no-tiers">
              <p>No pricing tiers created yet. Create your first tier to get started!</p>
            </div>
          ) : (
            <div className="tiers-grid">
              {tiers.map((tier) => (
                <div key={tier._id} className={`tier-card ${!tier.isActive ? "inactive" : ""}`}>
                  <div className="tier-card-header">
                    <div>
                      <h3>{tier.name}</h3>
                      <span className="tier-type-badge">{tierTypeLabels[tier.tierType] || tier.tierType}</span>
                    </div>
                    {!tier.isActive && <span className="inactive-badge">Inactive</span>}
                  </div>
                  
                  <div className="tier-price-display">
                    <span className="price-label">Starting from</span>
                    <span className="price-value">PKR {tier.basePrice?.toLocaleString()}</span>
                  </div>

                  {tier.description && (
                    <p className="tier-description">{tier.description}</p>
                  )}

                  {tier.features && tier.features.length > 0 && (
                    <div className="tier-features-list">
                      <strong>Features:</strong>
                      <ul>
                        {tier.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tier.discounts && (
                    <div className="tier-discounts-info">
                      {tier.discounts.multipleGarments?.enabled && (
                        <span className="discount-info">
                          {tier.discounts.multipleGarments.percentage}% off on {tier.discounts.multipleGarments.threshold}+ garments
                        </span>
                      )}
                      {tier.discounts.seasonal?.enabled && (
                        <span className="discount-info seasonal">
                          Seasonal discount available
                        </span>
                      )}
                      {tier.discounts.corporate?.enabled && (
                        <span className="discount-info corporate">
                          Corporate discount available
                        </span>
                      )}
                    </div>
                  )}

                  <div className="tier-actions">
                    <button
                      onClick={() => handleEdit(tier)}
                      className="btn btn-secondary btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tier._id)}
                      className="btn btn-danger btn-small"
                    >
                      {tier.isActive ? "Deactivate" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingTierManager;
