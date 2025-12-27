import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import "./PatternForm.css";

const PatternForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    designType: "",
    difficulty: "Intermediate",
    price: "",
    isFree: false,
    tags: [],
    images: [],
    patternFile: null,
    measurements: {
      sizes: [],
      customSizing: false,
    },
    fabricRequirements: {
      fabricType: "",
      estimatedYards: "",
      estimatedMeters: "",
      notes: "",
    },
    careInstructions: {
      washing: "",
      ironing: "",
      dryCleaning: false,
      specialNotes: "",
    },
    copyright: {
      owner: "",
      license: "All Rights Reserved",
      licenseDetails: "",
      watermark: true,
    },
    collaboration: {
      enabled: false,
    },
    isPublished: false,
    featured: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [patternFile, setPatternFile] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchPattern();
    } else {
      // Set default copyright owner to current user
      setFormData((prev) => ({
        ...prev,
        copyright: {
          ...prev.copyright,
          owner: user?.name || "",
        },
      }));
    }
  }, [id, user]);

  const fetchPattern = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patterns/${id}`);
      const pattern = response.data.data.pattern;

      // Check if user is the owner
      if (pattern.designer._id !== user._id && user.role !== "admin") {
        navigate("/patterns");
        return;
      }

      setFormData({
        title: pattern.title || "",
        description: pattern.description || "",
        category: pattern.category || "",
        designType: pattern.designType || "",
        difficulty: pattern.difficulty || "Intermediate",
        price: pattern.price || "",
        isFree: pattern.isFree || false,
        tags: pattern.tags || [],
        images: pattern.images || [],
        patternFile: pattern.patternFile || null,
        measurements: pattern.measurements || { sizes: [], customSizing: false },
        fabricRequirements: pattern.fabricRequirements || {
          fabricType: "",
          estimatedYards: "",
          estimatedMeters: "",
          notes: "",
        },
        careInstructions: pattern.careInstructions || {
          washing: "",
          ironing: "",
          dryCleaning: false,
          specialNotes: "",
        },
        copyright: pattern.copyright || {
          owner: user?.name || "",
          license: "All Rights Reserved",
          licenseDetails: "",
          watermark: true,
        },
        collaboration: pattern.collaboration || { enabled: false },
        isPublished: pattern.isPublished || false,
        featured: pattern.featured || false,
      });
    } catch (error) {
      setError("Failed to load pattern");
      console.error("Error fetching pattern:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "number" ? (value === "" ? "" : Number(value)) : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    // Preview images (for display only, not sent as base64)
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              url: reader.result, // Preview URL only
              caption: "",
              isPrimary: prev.images.length === 0,
              isNew: true, // Mark as new file to upload
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePatternFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPatternFile(file);
      setFormData((prev) => ({
        ...prev,
        patternFile: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        sizes: prev.measurements.sizes.includes(size)
          ? prev.measurements.sizes.filter((s) => s !== size)
          : [...prev.measurements.sizes, size],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.designType) {
      setError("Please fill in all required fields");
      return;
    }

    if (!formData.isFree && !formData.price) {
      setError("Please set a price or mark as free");
      return;
    }

    if (formData.images.length === 0 && imageFiles.length === 0) {
      setError("Please add at least one image");
      return;
    }

    if (!formData.patternFile && !patternFile && !isEditMode) {
      setError("Please upload a pattern file");
      return;
    }

    try {
      setLoading(true);

      // Upload images if there are new ones
      let imageUrls = formData.images.filter((img) => !img.isNew); // Keep existing images
      
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((file) => {
          imageFormData.append("images", file);
        });

        const imageResponse = await api.post("/upload/images", imageFormData);

        // Add new uploaded images
        const newImages = imageResponse.data.data.map((url, index) => ({
          url: `http://localhost:5000${url}`,
          caption: "",
          isPrimary: imageUrls.length === 0 && index === 0,
        }));

        // If no existing images, set first new image as primary
        if (imageUrls.length === 0 && newImages.length > 0) {
          newImages[0].isPrimary = true;
        } else if (imageUrls.length > 0 && newImages.length > 0) {
          // Ensure only one primary image
          const hasPrimary = imageUrls.some((img) => img.isPrimary);
          if (!hasPrimary) {
            imageUrls[0].isPrimary = true;
          }
        }

        imageUrls = [...imageUrls, ...newImages];
      } else if (imageUrls.length > 0) {
        // Ensure at least one primary image
        const hasPrimary = imageUrls.some((img) => img.isPrimary);
        if (!hasPrimary) {
          imageUrls[0].isPrimary = true;
        }
      }

      // Upload pattern file if there's a new one
      let patternFileData = formData.patternFile;
      if (patternFile && !isEditMode) {
        const fileFormData = new FormData();
        fileFormData.append("patternFile", patternFile);

        const fileResponse = await api.post("/upload/pattern-file", fileFormData);

        patternFileData = {
          ...fileResponse.data.data,
          url: `http://localhost:5000${fileResponse.data.data.url}`,
        };
      }

      // Prepare submit data
      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        designType: formData.designType,
        difficulty: formData.difficulty,
        price: formData.price ? Number(formData.price) : 0,
        isFree: formData.isFree,
        tags: formData.tags,
        images: imageUrls,
        patternFile: patternFileData,
        measurements: formData.measurements,
        fabricRequirements: formData.fabricRequirements,
        careInstructions: formData.careInstructions,
        copyright: formData.copyright,
        collaboration: formData.collaboration,
        isPublished: formData.isPublished,
        featured: formData.featured,
      };

      if (isEditMode) {
        await api.put(`/patterns/${id}`, submitData);
        alert("Pattern updated successfully!");
      } else {
        await api.post("/patterns", submitData);
        alert("Pattern created successfully!");
      }

      navigate("/patterns");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save pattern");
      console.error("Error saving pattern:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const availableSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

  return (
    <div className="pattern-form">
      <div className="container">
        <div className="form-header">
          <h1>{isEditMode ? "Edit Pattern" : "Create New Pattern"}</h1>
          <Link to="/patterns" className="back-link">
            ← Back to Patterns
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="pattern-form-content">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Traditional Kurta Pattern"
                />
              </div>
              <div className="form-group">
                <label>
                  Category <span className="required">*</span>
                </label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="Traditional Pakistani">Traditional Pakistani</option>
                  <option value="Modern Fashion">Modern Fashion</option>
                  <option value="Western">Western</option>
                  <option value="Fusion">Fusion</option>
                  <option value="Bridal">Bridal</option>
                  <option value="Casual">Casual</option>
                  <option value="Formal">Formal</option>
                  <option value="Kids">Kids</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Design Type <span className="required">*</span>
                </label>
                <select name="designType" value={formData.designType} onChange={handleChange} required>
                  <option value="">Select Design Type</option>
                  <option value="Kurta">Kurta</option>
                  <option value="Shalwar">Shalwar</option>
                  <option value="Dupatta">Dupatta</option>
                  <option value="Saree">Saree</option>
                  <option value="Lehenga">Lehenga</option>
                  <option value="Gown">Gown</option>
                  <option value="Shirt">Shirt</option>
                  <option value="Trouser">Trouser</option>
                  <option value="Jacket">Jacket</option>
                  <option value="Coat">Coat</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Difficulty Level</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe your pattern, its features, and any special instructions..."
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-group">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag and press Enter"
                />
                <button type="button" onClick={handleAddTag} className="btn btn-secondary">
                  Add
                </button>
              </div>
              <div className="tags-display">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing</h2>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                />
                This pattern is free
              </label>
            </div>
            {!formData.isFree && (
              <div className="form-group">
                <label>
                  Price (PKR) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required={!formData.isFree}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Images</h2>
            <div className="form-group">
              <label>
                Upload Images <span className="required">*</span>
              </label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} />
              <p className="form-hint">Upload at least one image. First image will be primary.</p>
            </div>
            {formData.images.length > 0 && (
              <div className="images-preview">
                {formData.images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={img.url} alt={`Preview ${index + 1}`} />
                    {img.isPrimary && <span className="primary-badge">Primary</span>}
                    <div className="image-actions">
                      {!img.isPrimary && (
                        <button type="button" onClick={() => handleSetPrimaryImage(index)} className="btn-small">
                          Set Primary
                        </button>
                      )}
                      <button type="button" onClick={() => handleRemoveImage(index)} className="btn-small btn-danger">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Pattern File</h2>
            <div className="form-group">
              <label>
                Upload Pattern File <span className="required">*</span>
              </label>
              <input type="file" accept=".pdf,.zip,.rar,.dwg,.dxf" onChange={handlePatternFileChange} />
              <p className="form-hint">Upload pattern file (PDF, ZIP, DWG, DXF, etc.)</p>
              {formData.patternFile && (
                <div className="file-info">
                  <strong>File:</strong> {formData.patternFile.fileName || "Uploaded"}
                  {formData.patternFile.fileSize && (
                    <span> ({(formData.patternFile.fileSize / 1024).toFixed(2)} KB)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Measurements</h2>
            <div className="form-group">
              <label>Available Sizes</label>
              <div className="size-checkboxes">
                {availableSizes.map((size) => (
                  <label key={size} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.measurements.sizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="measurements.customSizing"
                  checked={formData.measurements.customSizing}
                  onChange={handleChange}
                />
                Support custom sizing
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>Fabric Requirements</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Fabric Type</label>
                <input
                  type="text"
                  name="fabricRequirements.fabricType"
                  value={formData.fabricRequirements.fabricType}
                  onChange={handleChange}
                  placeholder="e.g., Cotton, Silk, Linen"
                />
              </div>
              <div className="form-group">
                <label>Estimated Meters</label>
                <input
                  type="number"
                  name="fabricRequirements.estimatedMeters"
                  value={formData.fabricRequirements.estimatedMeters}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
              <div className="form-group">
                <label>Estimated Yards</label>
                <input
                  type="number"
                  name="fabricRequirements.estimatedYards"
                  value={formData.fabricRequirements.estimatedYards}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="fabricRequirements.notes"
                value={formData.fabricRequirements.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Additional fabric requirements or notes..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Care Instructions</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Washing Instructions</label>
                <input
                  type="text"
                  name="careInstructions.washing"
                  value={formData.careInstructions.washing}
                  onChange={handleChange}
                  placeholder="e.g., Machine wash cold"
                />
              </div>
              <div className="form-group">
                <label>Ironing Instructions</label>
                <input
                  type="text"
                  name="careInstructions.ironing"
                  value={formData.careInstructions.ironing}
                  onChange={handleChange}
                  placeholder="e.g., Iron on low heat"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="careInstructions.dryCleaning"
                  checked={formData.careInstructions.dryCleaning}
                  onChange={handleChange}
                />
                Dry cleaning recommended
              </label>
            </div>
            <div className="form-group">
              <label>Special Notes</label>
              <textarea
                name="careInstructions.specialNotes"
                value={formData.careInstructions.specialNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Any special care instructions..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Copyright & License</h2>
            <div className="form-group">
              <label>
                Copyright Owner <span className="required">*</span>
              </label>
              <input
                type="text"
                name="copyright.owner"
                value={formData.copyright.owner}
                onChange={handleChange}
                required
                placeholder="Your name or business name"
              />
            </div>
            <div className="form-group">
              <label>License Type</label>
              <select name="copyright.license" value={formData.copyright.license} onChange={handleChange}>
                <option value="All Rights Reserved">All Rights Reserved</option>
                <option value="Personal Use">Personal Use Only</option>
                <option value="Commercial Use">Commercial Use Allowed</option>
                <option value="Creative Commons">Creative Commons</option>
                <option value="Custom">Custom License</option>
              </select>
            </div>
            {formData.copyright.license === "Custom" && (
              <div className="form-group">
                <label>License Details</label>
                <textarea
                  name="copyright.licenseDetails"
                  value={formData.copyright.licenseDetails}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe your custom license terms..."
                />
              </div>
            )}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="copyright.watermark"
                  checked={formData.copyright.watermark}
                  onChange={handleChange}
                />
                Add watermark to pattern images
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>Collaboration</h2>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="collaboration.enabled"
                  checked={formData.collaboration.enabled}
                  onChange={handleChange}
                />
                Enable collaboration requests
              </label>
            </div>
            <p className="form-hint">
              When enabled, other users can request to collaborate on this pattern.
            </p>
          </div>

          <div className="form-section">
            <h2>Publishing</h2>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                />
                Publish this pattern (make it visible to others)
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                Feature this pattern (show in featured section)
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Pattern" : "Create Pattern"}
            </button>
            <Link to="/patterns" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatternForm;

