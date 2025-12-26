import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./FabricForm.css";

const FabricForm = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fabricType: "",
    weight: "",
    season: [],
    occasion: [],
    color: "",
    pattern: "",
    origin: "",
    pricePerMeter: "",
    minimumOrderMeters: 1,
    stockQuantity: 0,
    unit: "meter",
    images: [],
    careInstructions: "",
    width: "",
    widthUnit: "inches",
    composition: "",
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      navigate("/");
      return;
    }

    if (isEditMode) {
      fetchFabric();
    }
  }, [id, user]);

  const fetchFabric = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/fabrics/${id}`);
      const fabric = response.data.data;

      if (fabric.supplier._id.toString() !== user._id.toString()) {
        navigate("/");
        return;
      }

      setFormData({
        name: fabric.name || "",
        description: fabric.description || "",
        fabricType: fabric.fabricType || "",
        weight: fabric.weight || "",
        season: fabric.season || [],
        occasion: fabric.occasion || [],
        color: fabric.color || "",
        pattern: fabric.pattern || "",
        origin: fabric.origin || "",
        pricePerMeter: fabric.pricePerMeter || "",
        minimumOrderMeters: fabric.minimumOrderMeters || 1,
        stockQuantity: fabric.stockQuantity || 0,
        unit: fabric.unit || "meter",
        images: fabric.images || [],
        careInstructions: fabric.careInstructions || "",
        width: fabric.width || "",
        widthUnit: fabric.widthUnit || "inches",
        composition: fabric.composition || "",
        tags: fabric.tags || [],
        isActive: fabric.isActive !== undefined ? fabric.isActive : true,
        isFeatured: fabric.isFeatured || false,
      });
      setError("");
    } catch (error) {
      setError("Failed to load fabric details");
      console.error("Error fetching fabric:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "season" || name === "occasion") {
      const currentValues = formData[name] || [];
      const updatedValues = checked
        ? [...currentValues, value]
        : currentValues.filter((item) => item !== value);
      setFormData({
        ...formData,
        [name]: updatedValues,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
      });
    }
    setError("");
    setSuccess("");
  };

  const addImage = () => {
    if (!newImageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }
    setFormData({
      ...formData,
      images: [...formData.images, newImageUrl.trim()],
    });
    setNewImageUrl("");
    setError("");
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (!newTag.trim()) {
      return;
    }
    if (formData.tags.includes(newTag.trim())) {
      setError("Tag already exists");
      return;
    }
    setFormData({
      ...formData,
      tags: [...formData.tags, newTag.trim()],
    });
    setNewTag("");
    setError("");
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.fabricType || !formData.color || !formData.pricePerMeter) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        await api.put(`/fabrics/${id}`, formData);
        setSuccess("Fabric updated successfully");
      } else {
        await api.post("/fabrics", formData);
        setSuccess("Fabric created successfully");
      }
      setTimeout(() => {
        navigate("/fabrics/me/list");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save fabric");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fabric-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading fabric details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fabric-form-container">
      <div className="container">
        <Link to="/fabrics/me/list" className="back-link">
          ← Back to My Fabrics
        </Link>

        <div className="form-header">
          <h1>{isEditMode ? "Edit Fabric" : "Add New Fabric"}</h1>
          <p>Fill in the details to {isEditMode ? "update" : "add"} your fabric</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="fabric-form">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="name">Fabric Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Premium Cotton Lawn"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the fabric..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fabricType">Fabric Type *</label>
                <select
                  id="fabricType"
                  name="fabricType"
                  value={formData.fabricType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Silk">Silk</option>
                  <option value="Linen">Linen</option>
                  <option value="Wool">Wool</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Rayon">Rayon</option>
                  <option value="Chiffon">Chiffon</option>
                  <option value="Georgette">Georgette</option>
                  <option value="Organza">Organza</option>
                  <option value="Velvet">Velvet</option>
                  <option value="Denim">Denim</option>
                  <option value="Khadar">Khadar</option>
                  <option value="Muslin">Muslin</option>
                  <option value="Lawn">Lawn</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight</label>
                <select
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                >
                  <option value="">Select weight</option>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                  <option value="Very Heavy">Very Heavy</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="color">Color *</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Navy Blue"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pattern">Pattern</label>
                <select
                  id="pattern"
                  name="pattern"
                  value={formData.pattern}
                  onChange={handleChange}
                >
                  <option value="Plain">Plain</option>
                  <option value="Solid">Solid</option>
                  <option value="Striped">Striped</option>
                  <option value="Polka Dot">Polka Dot</option>
                  <option value="Floral">Floral</option>
                  <option value="Geometric">Geometric</option>
                  <option value="Abstract">Abstract</option>
                  <option value="Paisley">Paisley</option>
                  <option value="Embroidered">Embroidered</option>
                  <option value="Printed">Printed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing & Stock</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pricePerMeter">Price per Meter (PKR) *</label>
                <input
                  type="number"
                  id="pricePerMeter"
                  name="pricePerMeter"
                  value={formData.pricePerMeter}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="meter">Meter</option>
                  <option value="yard">Yard</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minimumOrderMeters">Minimum Order Quantity</label>
                <input
                  type="number"
                  id="minimumOrderMeters"
                  name="minimumOrderMeters"
                  value={formData.minimumOrderMeters}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stockQuantity">Stock Quantity</label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="origin">Origin</label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="e.g., Pakistan, India"
                />
              </div>

              <div className="form-group">
                <label htmlFor="composition">Composition</label>
                <input
                  type="text"
                  id="composition"
                  name="composition"
                  value={formData.composition}
                  onChange={handleChange}
                  placeholder="e.g., 100% Cotton"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="width">Width</label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="widthUnit">Width Unit</label>
                <select
                  id="widthUnit"
                  name="widthUnit"
                  value={formData.widthUnit}
                  onChange={handleChange}
                >
                  <option value="inches">Inches</option>
                  <option value="cm">Centimeters</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="careInstructions">Care Instructions</label>
              <textarea
                id="careInstructions"
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleChange}
                rows="3"
                placeholder="e.g., Machine wash cold, gentle cycle..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Season & Occasion</h2>

            <div className="form-group">
              <label>Season (Select all that apply)</label>
              <div className="checkbox-group">
                {["Spring", "Summer", "Fall", "Winter", "All Season"].map((season) => (
                  <label key={season} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="season"
                      value={season}
                      checked={formData.season.includes(season)}
                      onChange={handleChange}
                    />
                    <span>{season}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Occasion (Select all that apply)</label>
              <div className="checkbox-group">
                {["Casual", "Formal", "Wedding", "Party", "Office", "Traditional", "Festive", "Everyday"].map(
                  (occ) => (
                    <label key={occ} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="occasion"
                        value={occ}
                        checked={formData.occasion.includes(occ)}
                        onChange={handleChange}
                      />
                      <span>{occ}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Images</h2>

            <div className="form-group">
              <label htmlFor="newImageUrl">Add Image URL</label>
              <div className="image-input-group">
                <input
                  type="url"
                  id="newImageUrl"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <button type="button" onClick={addImage} className="btn btn-secondary">
                  Add
                </button>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="images-list">
                {formData.images.map((image, idx) => (
                  <div key={idx} className="image-item">
                    <img src={image} alt={`Fabric ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Tags</h2>

            <div className="form-group">
              <label htmlFor="newTag">Add Tag</label>
              <div className="tag-input-group">
                <input
                  type="text"
                  id="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Enter tag"
                />
                <button type="button" onClick={addTag} className="btn btn-secondary">
                  Add
                </button>
              </div>
            </div>

            {formData.tags.length > 0 && (
              <div className="tags-list">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Settings</h2>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active (Visible to customers)
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                Featured
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/fabrics/me/list" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Fabric" : "Create Fabric"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FabricForm;

