import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./AdminVideoManagement.css";

const AdminVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    category: "video_tutorial",
    order: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchVideos();
  }, [categoryFilter]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = categoryFilter ? `?category=${categoryFilter}` : "";
      const response = await api.get(`/videos/admin/all${params}`);
      setVideos(response.data.data || []);
      setError("");
    } catch (error) {
      setError("Failed to load videos");
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      if (editingVideo) {
        await api.put(`/videos/${editingVideo._id}`, formData);
        setSuccess("Video updated successfully");
      } else {
        await api.post("/videos", formData);
        setSuccess("Video added successfully");
      }

      setShowForm(false);
      setEditingVideo(null);
      setFormData({
        title: "",
        description: "",
        youtubeUrl: "",
        category: "video_tutorial",
        order: 0,
      });
      fetchVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save video");
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      youtubeUrl: video.youtubeUrl,
      category: video.category,
      order: video.order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      await api.delete(`/videos/${videoId}`);
      setSuccess("Video deleted successfully");
      fetchVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete video");
    }
  };

  const handleToggleActive = async (video) => {
    try {
      await api.put(`/videos/${video._id}`, { isActive: !video.isActive });
      fetchVideos();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update video");
    }
  };

  const categories = [
    { value: "", label: "All Categories" },
    { value: "video_tutorial", label: "Video Tutorials" },
    { value: "traditional_technique", label: "Traditional Techniques" },
    { value: "modern_fashion", label: "Modern Fashion" },
    { value: "business_management", label: "Business Management" },
    { value: "certification", label: "Certification" },
    { value: "forum", label: "Forum" },
    { value: "workshop", label: "Workshop" },
    { value: "news", label: "News" },
    { value: "mentorship", label: "Mentorship" },
  ];

  if (loading) {
    return (
      <div className="admin-video-management-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-video-management-container">
      <div className="container">
        <div className="page-header">
          <h1>Video Management</h1>
          <p>Manage YouTube videos for the Learning Portal</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add New Video
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="filters-section">
          <div className="filter-group">
            <label>Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => {
            setShowForm(false);
            setEditingVideo(null);
            setFormData({
              title: "",
              description: "",
              youtubeUrl: "",
              category: "video_tutorial",
              order: 0,
            });
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingVideo ? "Edit Video" : "Add New Video"}</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVideo(null);
                    setFormData({
                      title: "",
                      description: "",
                      youtubeUrl: "",
                      category: "video_tutorial",
                      order: 0,
                    });
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="video-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Video title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    placeholder="Video description"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>YouTube URL *</label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <small>Paste the full YouTube URL here</small>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.filter(c => c.value).map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                  <small>Lower numbers appear first</small>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingVideo(null);
                      setFormData({
                        title: "",
                        description: "",
                        youtubeUrl: "",
                        category: "video_tutorial",
                        order: 0,
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingVideo ? "Update Video" : "Add Video"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="videos-list">
          {videos.length > 0 ? (
            <table className="videos-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Order</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video._id}>
                    <td>
                      {video.thumbnail && (
                        <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                      )}
                    </td>
                    <td>
                      <div className="video-title-cell">
                        <strong>{video.title}</strong>
                        {video.description && (
                          <small>{video.description.substring(0, 50)}...</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {categories.find(c => c.value === video.category)?.label || video.category}
                      </span>
                    </td>
                    <td>{video.order}</td>
                    <td>{video.views || 0}</td>
                    <td>
                      <span className={`status-badge ${video.isActive ? "active" : "inactive"}`}>
                        {video.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(video)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(video)}
                          className="btn btn-secondary btn-sm"
                        >
                          {video.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-videos">
              <p>No videos found. Add your first video to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVideoManagement;

