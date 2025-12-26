import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplyForm.css";

const SupplyForm = () => {
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
    category: "",
    subcategory: "",
    brand: "",
    color: "",
    size: "",
    material: "",
    price: "",
    unit: "piece",
    minimumOrderQuantity: 1,
    stockQuantity: 0,
    images: [],
    specifications: {},
    tags: [],
    isActive: true,
    isFeatured: false,
    bulkDiscountEnabled: false,
    bulkDiscountTiers: [],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTag, setNewTag] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      navigate("/");
      return;
    }

    if (isEditMode) {
      fetchSupply();
    }
  }, [id, user]);

  const fetchSupply = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/supplies/${id}`);
      const supply = response.data.data;

      if (supply.supplier._id.toString() !== user._id.toString()) {
        navigate("/");
        return;
      }

      // Convert Map to object for form handling
      const specsObj = {};
      if (supply.specifications) {
        supply.specifications.forEach((value, key) => {
          specsObj[key] = value;
        });
      }

      setFormData({
        name: supply.name || "",
        description: supply.description || "",
        category: supply.category || "",
        subcategory: supply.subcategory || "",
        brand: supply.brand || "",
        color: supply.color || "",
        size: supply.size || "",
        material: supply.material || "",
        price: supply.price || "",
        unit: supply.unit || "piece",
        minimumOrderQuantity: supply.minimumOrderQuantity || 1,
        stockQuantity: supply.stockQuantity || 0,
        images: supply.images || [],
        specifications: specsObj,
        tags: supply.tags || [],
        isActive: supply.isActive !== undefined ? supply.isActive : true,
        isFeatured: supply.isFeatured || false,
        bulkDiscountEnabled: supply.bulkDiscountEnabled || false,
        bulkDiscountTiers: supply.bulkDiscountTiers || [],
      });
      setError("");
    } catch (error) {
      setError("Failed to load supply details");
      console.error("Error fetching supply:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    });
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

  const addSpecification = () => {
    if (!specKey.trim() || !specValue.trim()) {
      setError("Please enter both key and value");
      return;
    }
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [specKey.trim()]: specValue.trim(),
      },
    });
    setSpecKey("");
    setSpecValue("");
    setError("");
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({
      ...formData,
      specifications: newSpecs,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Convert specifications object to Map format for backend
      const submitData = {
        ...formData,
        specifications: formData.specifications,
      };

      if (isEditMode) {
        await api.put(`/supplies/${id}`, submitData);
        setSuccess("Supply updated successfully");
      } else {
        await api.post("/supplies", submitData);
        setSuccess("Supply created successfully");
      }
      setTimeout(() => {
        navigate("/supplies/me/list");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save supply");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="supply-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading supply details...</p>
        </div>
      </div>
    );
  }

  const categories = [
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

  const units = ["piece", "pack", "set", "meter", "yard", "kg", "gram", "box", "dozen"];

  return (
    <div className="supply-form-container">
      <div className="container">
        <Link to="/supplies/me/list" className="back-link">
          ← Back to My Supplies
        </Link>

        <div className="form-header">
          <h1>{isEditMode ? "Edit Supply" : "Add New Supply"}</h1>
          <p>Fill in the details to {isEditMode ? "update" : "add"} your supply</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="supply-form">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="name">Supply Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Premium Cotton Thread"
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
                placeholder="Describe the supply..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subcategory">Subcategory</label>
                <input
                  type="text"
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g., Embroidery Thread"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Brand name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Red, Blue"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="size">Size</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g., Small, Medium, Large"
                />
              </div>

              <div className="form-group">
                <label htmlFor="material">Material</label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="e.g., Cotton, Polyester"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing & Stock</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (PKR) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
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
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
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
            <h2>Specifications</h2>

            <div className="form-group">
              <label htmlFor="specKey">Add Specification</label>
              <div className="spec-input-group">
                <input
                  type="text"
                  id="specKey"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  placeholder="Key (e.g., Length)"
                />
                <input
                  type="text"
                  id="specValue"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  placeholder="Value (e.g., 100m)"
                />
                <button type="button" onClick={addSpecification} className="btn btn-secondary">
                  Add
                </button>
              </div>
            </div>

            {Object.keys(formData.specifications).length > 0 && (
              <div className="specs-list">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span>
                      <strong>{key}:</strong> {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
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
                    <img src={image} alt={`Supply ${idx + 1}`} />
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
            <Link to="/supplies/me/list" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Supply" : "Create Supply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyForm;

