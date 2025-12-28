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
    videoType: "youtube",
    category: "video_tutorial",
    order: 0,
    thumbnail: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadedVideoData, setUploadedVideoData] = useState(null);

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

  const handleVideoUpload = async (file) => {
    try {
      setUploadingVideo(true);
      setError("");
      const formData = new FormData();
      formData.append("video", file);

      const response = await api.post("/upload/video", formData);

      setUploadedVideoData(response.data.data);
      setUploadingVideo(false);
      return response.data.data;
    } catch (error) {
      setUploadingVideo(false);
      setError(error.response?.data?.message || "Failed to upload video");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      let submitData = { ...formData };

      // If local video, upload file first
      if (formData.videoType === "local") {
        if (videoFile && !uploadedVideoData) {
          const uploadResult = await handleVideoUpload(videoFile);
          submitData.localVideoUrl = uploadResult.url;
          submitData.localVideoFilename = uploadResult.filename;
          submitData.fileSize = uploadResult.fileSize;
        } else if (uploadedVideoData) {
          submitData.localVideoUrl = uploadedVideoData.url;
          submitData.localVideoFilename = uploadedVideoData.filename;
          submitData.fileSize = uploadedVideoData.fileSize;
        }
      }

      if (editingVideo) {
        await api.put(`/videos/${editingVideo._id}`, submitData);
        setSuccess("Video updated successfully");
      } else {
        await api.post("/videos", submitData);
        setSuccess("Video added successfully");
      }

      setShowForm(false);
      setEditingVideo(null);
      setVideoFile(null);
      setUploadedVideoData(null);
      setFormData({
        title: "",
        description: "",
        youtubeUrl: "",
        videoType: "youtube",
        category: "video_tutorial",
        order: 0,
        thumbnail: "",
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
      youtubeUrl: video.youtubeUrl || "",
      videoType: video.videoType || "youtube",
      category: video.category,
      order: video.order || 0,
      thumbnail: video.thumbnail || "",
    });
    setVideoFile(null);
    setUploadedVideoData(null);
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
              videoType: "youtube",
              category: "video_tutorial",
              order: 0,
              thumbnail: "",
            });
            setVideoFile(null);
            setUploadedVideoData(null);
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
                      videoType: "youtube",
                      category: "video_tutorial",
                      order: 0,
                      thumbnail: "",
                    });
                    setVideoFile(null);
                    setUploadedVideoData(null);
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="video-form">
                <div className="form-group">
                  <label>Video Type *</label>
                  <select
                    value={formData.videoType}
                    onChange={(e) => {
                      setFormData({ ...formData, videoType: e.target.value });
                      setVideoFile(null);
                      setUploadedVideoData(null);
                    }}
                    required
                  >
                    <option value="youtube">YouTube Video</option>
                    <option value="local">Upload Local Video</option>
                  </select>
                </div>
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
                {formData.videoType === "youtube" ? (
                  <div className="form-group">
                    <label>YouTube URL *</label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      required={formData.videoType === "youtube"}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <small>Paste the full YouTube URL here</small>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Upload Video File *</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setVideoFile(file);
                            setUploadedVideoData(null);
                          }
                        }}
                        required={formData.videoType === "local" && !uploadedVideoData}
                      />
                      <small>Maximum file size: 500MB. Supported formats: MP4, AVI, MOV, etc.</small>
                      {uploadingVideo && <div className="upload-status">Uploading video...</div>}
                      {uploadedVideoData && (
                        <div className="upload-success">
                          Video uploaded: {uploadedVideoData.fileName} ({(uploadedVideoData.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                      {videoFile && !uploadedVideoData && (
                        <div className="file-info">
                          Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Thumbnail Image (Optional)</label>
                      <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="Thumbnail image URL"
                      />
                      <small>URL to a thumbnail image for the video</small>
                    </div>
                  </>
                )}
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
                        videoType: "youtube",
                        category: "video_tutorial",
                        order: 0,
                        thumbnail: "",
                      });
                      setVideoFile(null);
                      setUploadedVideoData(null);
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
                  <th>Type</th>
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
                      <span className={`video-type-badge ${video.videoType === "youtube" ? "youtube" : "local"}`}>
                        {video.videoType === "youtube" ? "YouTube" : "Local"}
                      </span>
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

