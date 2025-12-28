import React, { useState, useEffect } from "react";
import api from "../utils/api";
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
    return <div className="admin-news-container"><div className="loading-container">Loading...</div></div>;
  }

  return (
    <div className="admin-news-container">
      <div className="container">
        <div className="page-header">
          <h1>Industry News Management</h1>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add New Article
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showForm && (
          <div className="news-form-section">
            <h2>{editingNews ? "Edit News Article" : "Create New News Article"}</h2>
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
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNews ? "Update Article" : "Create Article"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="news-table">
          <h2>All News Articles</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Published</th>
                <th>Featured</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((article) => (
                <tr key={article._id}>
                  <td>{article.title}</td>
                  <td>{article.category.replace("_", " ")}</td>
                  <td>
                    {article.isPublished ? (
                      <span className="status-badge status-published">Published</span>
                    ) : (
                      <span className="status-badge status-draft">Draft</span>
                    )}
                  </td>
                  <td>
                    {article.isFeatured ? (
                      <span className="featured-badge">Featured</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>{article.views || 0}</td>
                  <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(article)} className="btn btn-small btn-secondary">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="btn btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsManagement;

