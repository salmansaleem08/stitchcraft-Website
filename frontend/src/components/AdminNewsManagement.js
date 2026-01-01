import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  FaNewspaper,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaStar,
  FaTag,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import "./AdminNewsManagement.css";

const AdminNewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "industry_trends",
    image: "",
    tags: "",
    isPublished: false,
    isFeatured: false,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/news?limit=100");
      setNews(response.data.data || []);
      setError("");
    } catch (error) {
      setError("Failed to load news");
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      const submitData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        image: formData.image,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        publishedAt: formData.isPublished ? new Date() : undefined,
      };

      if (editingNews) {
        await api.put(`/news/${editingNews._id}`, submitData);
        setSuccess("News article updated successfully");
      } else {
        await api.post("/news", submitData);
        setSuccess("News article created successfully");
      }

      setShowForm(false);
      setEditingNews(null);
      resetForm();
      fetchNews();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save news article");
    }
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      image: article.image || "",
      tags: article.tags ? article.tags.join(", ") : "",
      isPublished: article.isPublished,
      isFeatured: article.isFeatured,
    });
    setEditingNews(article);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      try {
        await api.delete(`/news/${id}`);
        setSuccess("News article deleted successfully");
        fetchNews();
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete news article");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "industry_trends",
      image: "",
      tags: "",
      isPublished: false,
      isFeatured: false,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNews(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="admin-news-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading news articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-news-container">
      <div className="container">
        <div className="page-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Industry News Management</h1>
              <p className="dashboard-subtitle">
                Create and manage industry news articles. Share trends, updates, and insights with the tailoring community.
              </p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary-header">
              <FaPlus className="btn-icon" />
              Add New Article
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showForm && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingNews ? "Edit News Article" : "Create New News Article"}</h2>
                <button className="modal-close" onClick={handleCancel}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="news-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="News article title"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="industry_trends">Industry Trends</option>
                    <option value="fashion_news">Fashion News</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="events">Events</option>
                    <option value="success_stories">Success Stories</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="12"
                  placeholder="Write the news article content here..."
                ></textarea>
              </div>

              <div className="form-group">
                <label>Featured Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="fashion, tailoring, business"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />{" "}
                  Publish Immediately
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />{" "}
                  Feature this article
                </label>
              </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancel} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingNews ? "Update Article" : "Create Article"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="news-list">
          {news.length > 0 ? (
            <div className="news-grid">
              {news.map((article) => (
                <div key={article._id} className="news-card">
                  <div className="news-card-header">
                    {article.image ? (
                      <img src={article.image} alt={article.title} className="news-image" />
                    ) : (
                      <div className="news-image-placeholder">
                        <FaNewspaper className="placeholder-icon" />
                      </div>
                    )}
                    <div className="news-status-overlay">
                      {article.isPublished ? (
                        <span className="status-badge status-published">
                          <FaCheckCircle className="badge-icon" />
                          Published
                        </span>
                      ) : (
                        <span className="status-badge status-draft">
                          <FaClock className="badge-icon" />
                          Draft
                        </span>
                      )}
                      {article.isFeatured && (
                        <span className="featured-badge">
                          <FaStar className="badge-icon" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="news-card-body">
                    <div className="news-title-section">
                      <h3>{article.title}</h3>
                      {article.content && (
                        <p className="news-excerpt">{article.content.substring(0, 150)}...</p>
                      )}
                    </div>
                    <div className="news-meta">
                      <div className="meta-item">
                        <FaTag className="meta-icon" />
                        <span className="category-badge">
                          {article.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="news-tags">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag-item">
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="tag-item">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="news-details">
                      <div className="detail-item">
                        <FaEye className="detail-icon" />
                        <span>{article.views || 0} views</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>
                          {new Date(article.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="news-actions">
                      <button
                        onClick={() => handleEdit(article)}
                        className="action-btn edit-btn"
                      >
                        <FaEdit className="btn-icon" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article._id)}
                        className="action-btn delete-btn"
                      >
                        <FaTrash className="btn-icon" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-news">
              <FaNewspaper className="empty-icon" />
              <p>No news articles found. Create your first article to get started.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary-header">
                <FaPlus className="btn-icon" />
                Create Your First Article
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNewsManagement;

