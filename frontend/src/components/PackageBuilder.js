import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./PackageBuilder.css";

const PackageBuilder = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    packageType: "custom",
    originalPrice: "",
    packagePrice: "",
    garments: [{ garmentType: "", quantity: 1 }],
    fabricIncluded: false,
    fabricDetails: { fabricType: "", color: "", quantity: 0 },
    features: [],
    validUntil: "",
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (!user || user.role !== "tailor") {
      navigate("/");
      return;
    }
    fetchPackages();
  }, [user]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pricing/packages");
      setPackages(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("fabricDetails.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        fabricDetails: {
          ...formData.fabricDetails,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleGarmentChange = (index, field, value) => {
    const updated = [...formData.garments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, garments: updated });
  };

  const addGarment = () => {
    setFormData({
      ...formData,
      garments: [...formData.garments, { garmentType: "", quantity: 1 }],
    });
  };

  const removeGarment = (index) => {
    const updated = formData.garments.filter((_, i) => i !== index);
    setFormData({ ...formData, garments: updated });
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
      const originalPrice = parseFloat(formData.originalPrice) || parseFloat(formData.packagePrice);
      const packagePrice = parseFloat(formData.packagePrice);
      const discount = originalPrice - packagePrice;
      const discountPercentage = originalPrice > 0 ? (discount / originalPrice) * 100 : 0;

      const packageData = {
        name: formData.name,
        description: formData.description,
        packageType: formData.packageType,
        garments: formData.garments.filter(g => g.garmentType),
        fabricIncluded: formData.fabricIncluded,
        fabricDetails: formData.fabricIncluded ? formData.fabricDetails : null,
        originalPrice,
        packagePrice,
        discount,
        discountPercentage,
        features: formData.features,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
        isActive: formData.isActive,
      };

      if (editingPackage) {
        await api.put(`/pricing/packages/${editingPackage._id}`, packageData);
      } else {
        await api.post("/pricing/packages", packageData);
      }

      setShowForm(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      alert(error.response?.data?.message || "Failed to save package");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      packageType: "custom",
      originalPrice: "",
      packagePrice: "",
      garments: [{ garmentType: "", quantity: 1 }],
      fabricIncluded: false,
      fabricDetails: { fabricType: "", color: "", quantity: 0 },
      features: [],
      validUntil: "",
      isActive: true,
    });
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || "",
      description: pkg.description || "",
      packageType: pkg.packageType || "custom",
      originalPrice: pkg.originalPrice || pkg.packagePrice || "",
      packagePrice: pkg.packagePrice || "",
      garments: (pkg.garments && Array.isArray(pkg.garments) && pkg.garments.length > 0) ? pkg.garments : [{ garmentType: "", quantity: 1 }],
      fabricIncluded: pkg.fabricIncluded || false,
      fabricDetails: pkg.fabricDetails || { fabricType: "", color: "", quantity: 0 },
      features: Array.isArray(pkg.features) ? pkg.features : [],
      validUntil: pkg.validUntil ? new Date(pkg.validUntil).toISOString().split("T")[0] : "",
      isActive: pkg.isActive !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (pkgId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await api.delete(`/pricing/packages/${pkgId}`);
        fetchPackages();
      } catch (error) {
        console.error("Error deleting package:", error);
        alert("Failed to delete package");
      }
    }
  };

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

  if (loading) {
    return (
      <div className="package-builder-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="package-builder-container">
      <div className="container">
        <div className="package-header">
          <h1>Package Builder</h1>
          <p>Create and manage service packages for your customers</p>
          <button onClick={() => { setShowForm(true); resetForm(); setEditingPackage(null); }} className="btn btn-primary">
            Create New Package
          </button>
        </div>

        {showForm && (
          <div className="package-form-section">
            <h2>{editingPackage ? "Edit Package" : "Create New Package"}</h2>
            <form onSubmit={handleSubmit} className="package-form">
              <div className="form-group">
                <label htmlFor="name">Package Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Wedding Package, Corporate Package"
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
                  placeholder="Describe what's included in this package..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="packageType">Package Type *</label>
                <select
                  id="packageType"
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
                  required
                >
                  <option value="custom">Custom</option>
                  <option value="fabric_stitching">Fabric + Stitching</option>
                  <option value="multiple_garments">Multiple Garments</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="originalPrice">Original Price (PKR)</label>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Price before discount"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="packagePrice">Package Price (PKR) *</label>
                  <input
                    type="number"
                    id="packagePrice"
                    name="packagePrice"
                    value={formData.packagePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="validUntil">Valid Until</label>
                  <input
                    type="date"
                    id="validUntil"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Garments Included</label>
                {formData.garments.map((garment, index) => (
                  <div key={index} className="garment-item">
                    <select
                      value={garment.garmentType}
                      onChange={(e) => handleGarmentChange(index, "garmentType", e.target.value)}
                      required
                    >
                      <option value="">Select garment type</option>
                      {garmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={garment.quantity}
                      onChange={(e) => handleGarmentChange(index, "quantity", parseInt(e.target.value))}
                      placeholder="Qty"
                      required
                    />
                    {formData.garments.length > 1 && (
                      <button type="button" onClick={() => removeGarment(index)} className="btn-remove">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addGarment} className="btn btn-secondary btn-small">
                  Add Garment
                </button>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="fabricIncluded"
                    checked={formData.fabricIncluded}
                    onChange={handleChange}
                  />
                  Fabric Included
                </label>
                {formData.fabricIncluded && (
                  <div className="fabric-details">
                    <input
                      type="text"
                      name="fabricDetails.fabricType"
                      value={formData.fabricDetails.fabricType}
                      onChange={handleChange}
                      placeholder="Fabric Type (e.g., Silk, Cotton)"
                    />
                    <input
                      type="text"
                      name="fabricDetails.color"
                      value={formData.fabricDetails.color}
                      onChange={handleChange}
                      placeholder="Color"
                    />
                    <input
                      type="number"
                      name="fabricDetails.quantity"
                      value={formData.fabricDetails.quantity}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="Quantity (meters)"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Features</label>
                <div className="features-list">
                  {formData.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                      <button type="button" onClick={() => removeFeature(index)} className="feature-remove">
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
                    placeholder="Add feature (e.g., Free alterations, Rush delivery)"
                  />
                  <button type="button" onClick={addFeature} className="btn btn-secondary btn-small">
                    Add
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Active (Available for booking)
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); setEditingPackage(null); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="packages-list">
          <h2>Your Packages ({packages?.length || 0})</h2>
          {!packages || packages.length === 0 ? (
            <div className="no-packages">
              <p>No packages created yet. Create your first package to get started!</p>
            </div>
          ) : (
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg._id} className={`package-card ${!pkg.isActive ? "unavailable" : ""}`}>
                  <div className="package-header-card">
                    <h3>{pkg.name}</h3>
                    {!pkg.isActive && <span className="unavailable-badge">Unavailable</span>}
                    {pkg.discountPercentage > 0 && (
                      <span className="discount-badge">{pkg.discountPercentage.toFixed(0)}% OFF</span>
                    )}
                  </div>
                  <div className="package-price">
                    {pkg.originalPrice > pkg.packagePrice && (
                      <span className="original-price">PKR {pkg.originalPrice.toLocaleString()}</span>
                    )}
                    <span className="current-price">PKR {pkg.packagePrice.toLocaleString()}</span>
                  </div>
                  {pkg.description && <p className="package-description">{pkg.description}</p>}
                  <div className="package-details">
                    <div className="package-garments">
                      <strong>Garments:</strong>
                      {pkg.garments?.map((g, idx) => (
                        <span key={idx}>{g.garmentType} (x{g.quantity})</span>
                      ))}
                    </div>
                      {pkg.fabricIncluded && (
                        <div className="package-fabric">
                          <strong>Fabric:</strong> {pkg.fabricDetails?.fabricType} 
                          {pkg.fabricDetails?.color && ` - ${pkg.fabricDetails.color}`}
                          ({pkg.fabricDetails?.quantity}m)
                        </div>
                      )}
                    {pkg.features?.length > 0 && (
                      <div className="package-features">
                        <strong>Features:</strong>
                        {pkg.features.map((f, idx) => (
                          <span key={idx} className="feature-tag-small">{f}</span>
                        ))}
                      </div>
                    )}
                    {pkg.validUntil && (
                      <div className="package-validity">
                        Valid until: {new Date(pkg.validUntil).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="package-actions">
                    <button onClick={() => handleEdit(pkg)} className="btn btn-secondary btn-small">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(pkg._id)} className="btn btn-danger btn-small">
                      Delete
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

export default PackageBuilder;

