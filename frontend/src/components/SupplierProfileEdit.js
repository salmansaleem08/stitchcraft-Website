import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplierProfileEdit.css";

const SupplierProfileEdit = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    businessRegistrationNumber: "",
    taxId: "",
    cnic: "",
    yearsInBusiness: "",
    productCategories: [],
    phone: "",
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
    minimumOrderQuantity: 1,
    bulkDiscountEnabled: false,
    bulkDiscountTiers: [],
    distributionCenters: [],
  });

  const [newDistributionCenter, setNewDistributionCenter] = useState({
    name: "",
    address: { street: "", city: "", province: "", postalCode: "" },
    phone: "",
  });

  const [newDiscountTier, setNewDiscountTier] = useState({
    minQuantity: "",
    discountPercentage: "",
  });

  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    documentType: "",
    documentUrl: "",
  });

  useEffect(() => {
    if (!user || user.role !== "supplier" || user._id !== id) {
      navigate("/");
      return;
    }
    fetchSupplierProfile();
  }, [id, user]);

  const fetchSupplierProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/suppliers/${id}`);
      const supplier = response.data.data;

      setFormData({
        businessName: supplier.businessName || "",
        businessDescription: supplier.businessDescription || "",
        businessRegistrationNumber: supplier.businessRegistrationNumber || "",
        taxId: supplier.taxId || "",
        cnic: supplier.cnic || "",
        yearsInBusiness: supplier.yearsInBusiness || "",
        productCategories: supplier.productCategories || [],
        phone: supplier.phone || "",
        address: supplier.address || {
          street: "",
          city: "",
          province: "",
          postalCode: "",
        },
        minimumOrderQuantity: supplier.minimumOrderQuantity || 1,
        bulkDiscountEnabled: supplier.bulkDiscountEnabled || false,
        bulkDiscountTiers: supplier.bulkDiscountTiers || [],
        distributionCenters: supplier.distributionCenters || [],
      });
      setVerificationDocuments(supplier.verificationDocuments || []);
      setError("");
    } catch (error) {
      setError("Failed to load supplier profile");
      console.error("Error fetching supplier profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [field]: value,
        },
      });
    } else if (name === "productCategories") {
      const updatedCategories = checked
        ? [...formData.productCategories, value]
        : formData.productCategories.filter((item) => item !== value);
      setFormData({
        ...formData,
        productCategories: updatedCategories,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
    setError("");
    setSuccess("");
  };

  const handleDistributionCenterChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("centerAddress.")) {
      const field = name.split(".")[1];
      setNewDistributionCenter({
        ...newDistributionCenter,
        address: {
          ...newDistributionCenter.address,
          [field]: value,
        },
      });
    } else {
      setNewDistributionCenter({
        ...newDistributionCenter,
        [name]: value,
      });
    }
  };

  const addDistributionCenter = () => {
    if (!newDistributionCenter.name) {
      setError("Please enter center name");
      return;
    }
    setFormData({
      ...formData,
      distributionCenters: [
        ...(formData.distributionCenters || []),
        { ...newDistributionCenter, isActive: true },
      ],
    });
    setNewDistributionCenter({
      name: "",
      address: { street: "", city: "", province: "", postalCode: "" },
      phone: "",
    });
  };

  const removeDistributionCenter = (index) => {
    const updated = formData.distributionCenters.filter((_, i) => i !== index);
    setFormData({ ...formData, distributionCenters: updated });
  };

  const addDiscountTier = () => {
    if (!newDiscountTier.minQuantity || !newDiscountTier.discountPercentage) {
      setError("Please fill in both quantity and discount percentage");
      return;
    }
    setFormData({
      ...formData,
      bulkDiscountTiers: [
        ...formData.bulkDiscountTiers,
        {
          minQuantity: parseInt(newDiscountTier.minQuantity),
          discountPercentage: parseFloat(newDiscountTier.discountPercentage),
        },
      ],
    });
    setNewDiscountTier({ minQuantity: "", discountPercentage: "" });
  };

  const removeDiscountTier = (index) => {
    const updated = formData.bulkDiscountTiers.filter((_, i) => i !== index);
    setFormData({ ...formData, bulkDiscountTiers: updated });
  };

  const handleAddVerificationDocument = async () => {
    if (!newDocument.documentType || !newDocument.documentUrl) {
      setError("Please provide document type and URL");
      return;
    }

    try {
      const response = await api.post("/suppliers/verification-documents", newDocument);
      setVerificationDocuments(response.data.data.verificationDocuments || []);
      setNewDocument({ documentType: "", documentUrl: "" });
      setSuccess("Verification document uploaded successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload document");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.put("/suppliers/profile", formData);
      setSuccess("Profile updated successfully");
      setTimeout(() => {
        navigate(`/suppliers/${id}`);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const productCategories = [
    "Fabric",
    "Textiles",
    "Threads",
    "Needles",
    "Buttons",
    "Zippers",
    "Sewing Machines",
    "Embroidery Materials",
    "Mannequins",
    "Measuring Tools",
    "Packaging Materials",
    "Other",
  ];

  if (loading) {
    return (
      <div className="supplier-profile-edit-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-profile-edit-container">
      <div className="container">
        <Link to={`/suppliers/${id}`} className="back-link">
          ← Back to Profile
        </Link>

        <div className="edit-header">
          <h1>Edit Supplier Profile</h1>
          <p>Update your business information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <h2>Business Information</h2>

            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessDescription">Business Description</label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your business and products..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="businessRegistrationNumber">Registration Number</label>
                <input
                  type="text"
                  id="businessRegistrationNumber"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId">Tax ID</label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cnic">CNIC</label>
                <input
                  type="text"
                  id="cnic"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="yearsInBusiness">Years in Business</label>
                <input
                  type="number"
                  id="yearsInBusiness"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Contact Information</h2>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.street">Street Address</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.province">Province</label>
                <input
                  type="text"
                  id="address.province"
                  name="address.province"
                  value={formData.address.province}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.postalCode">Postal Code</label>
                <input
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Product Categories</h2>
            <div className="checkbox-group">
              {productCategories.map((category) => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="productCategories"
                    value={category}
                    checked={formData.productCategories.includes(category)}
                    onChange={handleChange}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Distribution Centers</h2>
            {formData.distributionCenters && formData.distributionCenters.length > 0 && (
              <div className="centers-list">
                {formData.distributionCenters.map((center, idx) => (
                  <div key={idx} className="center-item">
                    <div className="center-info">
                      <strong>{center.name}</strong>
                      {center.address && (
                        <p>
                          {center.address.street && `${center.address.street}, `}
                          {center.address.city && `${center.address.city}, `}
                          {center.address.province && center.address.province}
                        </p>
                      )}
                      {center.phone && <p>Phone: {center.phone}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDistributionCenter(idx)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="add-center-form">
              <h3>Add New Distribution Center</h3>
              <div className="form-group">
                <label htmlFor="centerName">Center Name *</label>
                <input
                  type="text"
                  id="centerName"
                  name="name"
                  value={newDistributionCenter.name}
                  onChange={handleDistributionCenterChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="centerAddress.street">Street Address</label>
                <input
                  type="text"
                  id="centerAddress.street"
                  name="centerAddress.street"
                  value={newDistributionCenter.address.street}
                  onChange={handleDistributionCenterChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="centerAddress.city">City</label>
                  <input
                    type="text"
                    id="centerAddress.city"
                    name="centerAddress.city"
                    value={newDistributionCenter.address.city}
                    onChange={handleDistributionCenterChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="centerAddress.province">Province</label>
                  <input
                    type="text"
                    id="centerAddress.province"
                    name="centerAddress.province"
                    value={newDistributionCenter.address.province}
                    onChange={handleDistributionCenterChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="centerPhone">Phone</label>
                <input
                  type="tel"
                  id="centerPhone"
                  name="phone"
                  value={newDistributionCenter.phone}
                  onChange={handleDistributionCenterChange}
                />
              </div>

              <button
                type="button"
                onClick={addDistributionCenter}
                className="btn btn-secondary"
              >
                Add Center
              </button>
            </div>
          </div>

          <div className="form-section">
            <h2>Verification Documents</h2>
            <p className="section-description">
              Upload verification documents to get your supplier account verified. This helps build trust with customers.
            </p>

            {verificationDocuments.length > 0 && (
              <div className="documents-list">
                <h3>Uploaded Documents</h3>
                {verificationDocuments.map((doc, idx) => (
                  <div key={idx} className="document-item">
                    <div className="document-info">
                      <strong>{doc.documentType}</strong>
                      <span className={`doc-status ${doc.verified ? "verified" : "pending"}`}>
                        {doc.verified ? "Verified" : "Pending Review"}
                      </span>
                    </div>
                    {doc.documentUrl && (
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="add-document-form">
              <h3>Add Verification Document</h3>
              <div className="form-group">
                <label htmlFor="documentType">Document Type *</label>
                <select
                  id="documentType"
                  value={newDocument.documentType}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, documentType: e.target.value })
                  }
                >
                  <option value="">Select document type</option>
                  <option value="Business Registration">Business Registration</option>
                  <option value="Tax Certificate">Tax Certificate</option>
                  <option value="CNIC">CNIC</option>
                  <option value="Trade License">Trade License</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="documentUrl">Document URL *</label>
                <input
                  type="url"
                  id="documentUrl"
                  value={newDocument.documentUrl}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, documentUrl: e.target.value })
                  }
                  placeholder="https://example.com/document.pdf"
                />
                <small>Upload your document to a file hosting service and paste the URL here</small>
              </div>

              <button
                type="button"
                onClick={handleAddVerificationDocument}
                className="btn btn-secondary"
              >
                Upload Document
              </button>
            </div>
          </div>

          <div className="form-section">
            <h2>Bulk Discount Settings</h2>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="bulkDiscountEnabled"
                  checked={formData.bulkDiscountEnabled}
                  onChange={handleChange}
                />
                Enable Bulk Discounts
              </label>
            </div>

            {formData.bulkDiscountEnabled && (
              <>
                <div className="form-group">
                  <label htmlFor="minimumOrderQuantity">Minimum Order Quantity</label>
                  <input
                    type="number"
                    id="minimumOrderQuantity"
                    name="minimumOrderQuantity"
                    value={formData.minimumOrderQuantity}
                    onChange={handleChange}
                    min="1"
                  />
                </div>

                {formData.bulkDiscountTiers.length > 0 && (
                  <div className="discount-tiers-list">
                    <h3>Discount Tiers</h3>
                    {formData.bulkDiscountTiers.map((tier, idx) => (
                      <div key={idx} className="tier-item">
                        <span>
                          {tier.minQuantity}+ items: {tier.discountPercentage}% off
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDiscountTier(idx)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="add-tier-form">
                  <h3>Add Discount Tier</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="tierMinQuantity">Minimum Quantity</label>
                      <input
                        type="number"
                        id="tierMinQuantity"
                        value={newDiscountTier.minQuantity}
                        onChange={(e) =>
                          setNewDiscountTier({
                            ...newDiscountTier,
                            minQuantity: e.target.value,
                          })
                        }
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="tierDiscount">Discount Percentage</label>
                      <input
                        type="number"
                        id="tierDiscount"
                        value={newDiscountTier.discountPercentage}
                        onChange={(e) =>
                          setNewDiscountTier({
                            ...newDiscountTier,
                            discountPercentage: e.target.value,
                          })
                        }
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label>&nbsp;</label>
                      <button
                        type="button"
                        onClick={addDiscountTier}
                        className="btn btn-secondary"
                      >
                        Add Tier
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <Link to={`/suppliers/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierProfileEdit;

