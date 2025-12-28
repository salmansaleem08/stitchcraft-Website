import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./ForumForm.css";

const ForumForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "general", label: "General Discussions" },
    { value: "techniques", label: "Technique Sharing" },
    { value: "business", label: "Business Advice" },
    { value: "troubleshooting", label: "Troubleshooting" },
    { value: "tools", label: "Tools & Equipment" },
    { value: "fabric", label: "Fabric & Materials" },
    { value: "design", label: "Design & Patterns" },
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchForum();
    }
  }, [id]);

  const fetchForum = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/forums/${id}`);
      const forum = response.data.data;
      setFormData({
        title: forum.title,
        content: forum.content,
        category: forum.category,
        tags: forum.tags ? forum.tags.join(", ") : "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load forum post");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      if (isEditMode) {
        await api.put(`/forums/${id}`, submitData);
        navigate(`/forums/${id}`);
      } else {
        const response = await api.post("/forums", submitData);
        navigate(`/forums/${response.data.data._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save forum post");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="forum-form-container">
        <div className="container">
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>You must be logged in to create a forum post.</p>
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && isEditMode) {
    return (
      <div className="forum-form-container">
        <div className="container">
          <div className="loading-container">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-form-container">
      <div className="container">
        <div className="page-header">
          <h1>{isEditMode ? "Edit Forum Post" : "Create New Forum Post"}</h1>
          <Link to="/forums" className="btn btn-secondary">
            Back to Forums
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="forum-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="Enter a descriptive title for your post"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              rows="12"
              placeholder="Write your post content here. Be clear and detailed to help others understand your question or share your knowledge."
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="Separate tags with commas (e.g., stitching, fabric, tips)"
            />
            <small>Add tags to help others find your post</small>
          </div>

          <div className="form-actions">
            <Link to="/forums" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Post"
                : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForumForm;

