import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { FaArrowLeft } from "react-icons/fa";
import "./TailorProfileEdit.css";

const TailorProfileEdit = () => {
  const { user, loadUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
    specialization: [],
    fabricExpertise: [],
    experience: "",
    bio: "",
    shopName: "",
    workingHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "18:00", isOpen: true },
      sunday: { open: "09:00", close: "18:00", isOpen: false },
    },
  });

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    beforeImageUrl: "",
    afterImageUrl: "",
  });
  const [portfolioFiles, setPortfolioFiles] = useState({
    mainImage: null,
    beforeImage: null,
    afterImage: null,
  });
  const [portfolioPreviews, setPortfolioPreviews] = useState({
    mainImage: null,
    beforeImage: null,
    afterImage: null,
  });

  useEffect(() => {
    if (!user || user.role !== "tailor") {
      navigate("/");
      return;
    }
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      const tailorData = response.data;

      setFormData({
        name: tailorData.name || "",
        phone: tailorData.phone || "",
        address: {
          street: tailorData.address?.street || "",
          city: tailorData.address?.city || "",
          province: tailorData.address?.province || "",
          postalCode: tailorData.address?.postalCode || "",
        },
        specialization: tailorData.specialization || [],
        fabricExpertise: tailorData.fabricExpertise || [],
        experience: tailorData.experience || "",
        bio: tailorData.bio || "",
        shopName: tailorData.shopName || "",
        workingHours: tailorData.workingHours || formData.workingHours,
      });

      if (tailorData.portfolio) {
        setPortfolioItems(tailorData.portfolio);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, value],
      });
    } else {
      setFormData({
        ...formData,
        specialization: formData.specialization.filter((item) => item !== value),
      });
    }
  };

  const handleFabricExpertiseChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        fabricExpertise: [...formData.fabricExpertise, value],
      });
    } else {
      setFormData({
        ...formData,
        fabricExpertise: formData.fabricExpertise.filter((item) => item !== value),
      });
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          [field]: value,
        },
      },
    });
  };

  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setNewPortfolioItem({
      ...newPortfolioItem,
      [name]: value,
    });
  };

  const handlePortfolioFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setPortfolioFiles({
        ...portfolioFiles,
        [field]: file,
      });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioPreviews({
          ...portfolioPreviews,
          [field]: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePortfolioFile = (field) => {
    setPortfolioFiles({
      ...portfolioFiles,
      [field]: null,
    });
    setPortfolioPreviews({
      ...portfolioPreviews,
      [field]: null,
    });
    // Clear corresponding URL field if it exists
    if (field === "mainImage") {
      setNewPortfolioItem({ ...newPortfolioItem, imageUrl: "" });
    } else if (field === "beforeImage") {
      setNewPortfolioItem({ ...newPortfolioItem, beforeImageUrl: "" });
    } else if (field === "afterImage") {
      setNewPortfolioItem({ ...newPortfolioItem, afterImageUrl: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0,
      };

      await api.put("/tailors/profile", updateData);
      await loadUser();
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate(`/tailors/${user._id}`);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPortfolioItem = async (e) => {
    e.preventDefault();
    setError("");

    if (!portfolioFiles.mainImage && !portfolioFiles.afterImage && !newPortfolioItem.imageUrl && !newPortfolioItem.afterImageUrl) {
      setError("Please upload an image or provide an image URL");
      return;
    }

    try {
      const formData = new FormData();
      
      // Append files if they exist
      if (portfolioFiles.mainImage) {
        formData.append("mainImage", portfolioFiles.mainImage);
      }
      if (portfolioFiles.beforeImage) {
        formData.append("beforeImage", portfolioFiles.beforeImage);
      }
      if (portfolioFiles.afterImage) {
        formData.append("afterImage", portfolioFiles.afterImage);
      }
      
      // Append text fields
      formData.append("title", newPortfolioItem.title || "");
      formData.append("description", newPortfolioItem.description || "");
      formData.append("category", newPortfolioItem.category || "");
      formData.append("imageUrl", newPortfolioItem.imageUrl || "");
      formData.append("beforeImageUrl", newPortfolioItem.beforeImageUrl || "");
      formData.append("afterImageUrl", newPortfolioItem.afterImageUrl || "");

      const response = await api.post("/tailors/portfolio", formData);

      // Reload portfolio items from server to ensure we have correct URLs
      await loadUserData();

      setNewPortfolioItem({
        title: "",
        description: "",
        category: "",
        imageUrl: "",
        beforeImageUrl: "",
        afterImageUrl: "",
      });
      setPortfolioFiles({
        mainImage: null,
        beforeImage: null,
        afterImage: null,
      });
      setPortfolioPreviews({
        mainImage: null,
        beforeImage: null,
        afterImage: null,
      });
      setSuccess("Portfolio item added successfully!");
      // Clear file inputs
      document.querySelectorAll('input[type="file"]').forEach(input => {
        if (input.closest('.portfolio-form')) {
          input.value = '';
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add portfolio item");
    }
  };

  const handleDeletePortfolioItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?")) {
      return;
    }

    try {
      await api.delete(`/tailors/portfolio/${itemId}`);
      setPortfolioItems(portfolioItems.filter((item) => item._id !== itemId));
      setSuccess("Portfolio item deleted successfully!");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete portfolio item");
    }
  };

  const specializations = [
    // Traditional Wear
    "Traditional Wear",
    "Shalwar Kameez",
    "Sherwanis",
    "Lehengas",
    "Kurtas",
    "Peshawari Shalwar",
    // Western Wear
    "Western Wear",
    "Suits",
    "Dresses",
    "Casual Wear",
    "Formal Wear",
    "Blazers",
    "Trousers",
    "Shirts",
    // Specialty
    "Embroidery",
    "Bridal Wear",
    "Custom Design",
    "Alterations",
    "Repairs",
    "Design Consultation",
  ];

  const fabricTypes = ["Cotton", "Silk", "Linen", "Wool", "Synthetic", "Mixed"];

  const provinces = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Islamabad",
    "Azad Kashmir",
    "Gilgit-Baltistan",
  ];

  // Helper to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Handle relative paths that start with /
    if (url.startsWith("/")) {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const BASE_URL = API_BASE.replace("/api", "");
      return `${BASE_URL}${url}`;
    }
    // Handle any other relative paths
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const BASE_URL = API_BASE.replace("/api", "");
    return `${BASE_URL}/${url}`;
  };

  if (!user || user.role !== "tailor") {
    return null;
  }

  return (
    <div className="tailor-profile-edit-container">
      <div className="container">
        <Link to={`/tailors/${user._id}`} className="back-link">
          <FaArrowLeft className="back-icon" />
          Back to Profile
        </Link>

        <div className="edit-header">
          <h1>Edit Tailor Profile</h1>
          <p>Update your profile information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <h2>Basic information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shopName">Shop name</label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Your shop or business name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Years of experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                maxLength="1000"
                placeholder="Tell customers about yourself and your expertise..."
              />
              <span className="char-count">{formData.bio.length}/1000</span>
            </div>
          </div>

          <div className="form-section">
            <h2>Address</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="address.street">Street address</label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.province">Province</label>
                <select
                  id="address.province"
                  name="address.province"
                  value={formData.address.province}
                  onChange={handleChange}
                >
                  <option value="">Select province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="address.postalCode">Postal code</label>
                <input
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Specializations</h2>
            <div className="checkbox-grid">
              {specializations.map((spec) => (
                <label key={spec} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={spec}
                    checked={formData.specialization.includes(spec)}
                    onChange={handleSpecializationChange}
                  />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Fabric expertise</h2>
            <div className="checkbox-grid">
              {fabricTypes.map((fabric) => (
                <label key={fabric} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={fabric}
                    checked={formData.fabricExpertise.includes(fabric)}
                    onChange={handleFabricExpertiseChange}
                  />
                  <span>{fabric}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Working hours</h2>
            <div className="working-hours-list">
              {Object.entries(formData.workingHours).map(([day, hours]) => (
                <div key={day} className="hours-row">
                  <label className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) =>
                        handleWorkingHoursChange(day, "isOpen", e.target.checked)
                      }
                    />
                    <span className="day-name">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </span>
                  </label>
                  {hours.isOpen && (
                    <div className="hours-inputs">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          handleWorkingHoursChange(day, "open", e.target.value)
                        }
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          handleWorkingHoursChange(day, "close", e.target.value)
                        }
                      />
                    </div>
                  )}
                  {!hours.isOpen && <span className="closed-label">Closed</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save profile"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/tailors/${user._id}`)}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="portfolio-section">
          <h2>Portfolio</h2>
          <p className="section-description">
            Showcase your work with before and after photos. Upload images from your device or provide image URLs.
          </p>

          <form onSubmit={handleAddPortfolioItem} className="portfolio-form">
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="title">Project Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newPortfolioItem.title}
                  onChange={handlePortfolioChange}
                  placeholder="e.g., Traditional Shalwar Kameez for Wedding"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={newPortfolioItem.category}
                  onChange={handlePortfolioChange}
                  placeholder="e.g., Bridal, Traditional"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newPortfolioItem.description}
                  onChange={handlePortfolioChange}
                  rows="3"
                  placeholder="Describe this work, techniques used, materials, etc."
                />
              </div>

              <div className="form-group full-width">
                <label>Main Image *</label>
                <div className="file-upload-wrapper">
                  {portfolioPreviews.mainImage ? (
                    <div className="image-preview-container">
                      <img src={portfolioPreviews.mainImage} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={() => removePortfolioFile("mainImage")}
                        className="remove-image-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="mainImage"
                        accept="image/*"
                        onChange={(e) => handlePortfolioFileChange(e, "mainImage")}
                        className="file-input"
                      />
                      <label htmlFor="mainImage" className="file-upload-label">
                        <span className="file-upload-icon">📷</span>
                        <span>Upload image from device</span>
                      </label>
                      <div className="file-upload-or">or</div>
                      <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={newPortfolioItem.imageUrl}
                        onChange={handlePortfolioChange}
                        placeholder="Enter image URL"
                        className="url-input"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Before Image (Optional)</label>
                <div className="file-upload-wrapper">
                  {portfolioPreviews.beforeImage ? (
                    <div className="image-preview-container">
                      <img src={portfolioPreviews.beforeImage} alt="Before preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={() => removePortfolioFile("beforeImage")}
                        className="remove-image-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="beforeImage"
                        accept="image/*"
                        onChange={(e) => handlePortfolioFileChange(e, "beforeImage")}
                        className="file-input"
                      />
                      <label htmlFor="beforeImage" className="file-upload-label">
                        <span className="file-upload-icon">📷</span>
                        <span>Upload</span>
                      </label>
                      <input
                        type="url"
                        id="beforeImageUrl"
                        name="beforeImageUrl"
                        value={newPortfolioItem.beforeImageUrl}
                        onChange={handlePortfolioChange}
                        placeholder="Or enter URL"
                        className="url-input"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>After Image (Optional)</label>
                <div className="file-upload-wrapper">
                  {portfolioPreviews.afterImage ? (
                    <div className="image-preview-container">
                      <img src={portfolioPreviews.afterImage} alt="After preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={() => removePortfolioFile("afterImage")}
                        className="remove-image-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="afterImage"
                        accept="image/*"
                        onChange={(e) => handlePortfolioFileChange(e, "afterImage")}
                        className="file-input"
                      />
                      <label htmlFor="afterImage" className="file-upload-label">
                        <span className="file-upload-icon">📷</span>
                        <span>Upload</span>
                      </label>
                      <input
                        type="url"
                        id="afterImageUrl"
                        name="afterImageUrl"
                        value={newPortfolioItem.afterImageUrl}
                        onChange={handlePortfolioChange}
                        placeholder="Or enter URL"
                        className="url-input"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Add to portfolio
            </button>
          </form>

          {portfolioItems.length > 0 && (
            <div className="portfolio-items">
              <h3>Your portfolio items</h3>
              <div className="portfolio-grid">
                {portfolioItems.map((item) => (
                  <div key={item._id} className="portfolio-item-card">
                    {item.afterImage || item.imageUrl ? (
                      <img
                        src={getImageUrl(item.afterImage || item.imageUrl)}
                        alt={item.title || "Portfolio item"}
                        className="portfolio-thumbnail"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="portfolio-placeholder">No image</div>
                    )}
                    <div className="portfolio-placeholder" style={{ display: 'none' }}>
                      Failed to load image
                    </div>
                    <div className="portfolio-item-info">
                      {item.title && <h4>{item.title}</h4>}
                      {item.category && (
                        <span className="portfolio-category">{item.category}</span>
                      )}
                      <button
                        onClick={() => handleDeletePortfolioItem(item._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
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

export default TailorProfileEdit;
