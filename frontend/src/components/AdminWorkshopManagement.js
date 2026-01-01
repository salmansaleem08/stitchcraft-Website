import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaTag,
  FaClock,
  FaVideo,
  FaBuilding,
} from "react-icons/fa";
import "./AdminWorkshopManagement.css";

const AdminWorkshopManagement = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "skill_sharing",
    date: "",
    time: "",
    duration: "",
    locationType: "in_person",
    address: "",
    city: "",
    province: "",
    onlineLink: "",
    maxParticipants: "",
    price: "",
    isFree: true,
    thumbnail: "",
    tags: "",
    status: "upcoming",
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await api.get("/workshops?limit=100");
      setWorkshops(response.data.data || []);
      setError("");
    } catch (error) {
      setError("Failed to load workshops");
      console.error("Error fetching workshops:", error);
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
        description: formData.description,
        category: formData.category,
        date: new Date(`${formData.date}T${formData.time}`),
        duration: parseInt(formData.duration),
        location: {
          type: formData.locationType,
          address: formData.locationType === "in_person" ? formData.address : undefined,
          city: formData.locationType === "in_person" ? formData.city : undefined,
          province: formData.locationType === "in_person" ? formData.province : undefined,
          onlineLink: formData.locationType === "online" ? formData.onlineLink : undefined,
        },
        maxParticipants: parseInt(formData.maxParticipants),
        price: formData.isFree ? 0 : parseFloat(formData.price),
        isFree: formData.isFree,
        thumbnail: formData.thumbnail,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        status: formData.status,
      };

      if (editingWorkshop) {
        await api.put(`/workshops/${editingWorkshop._id}`, submitData);
        setSuccess("Workshop updated successfully");
      } else {
        await api.post("/workshops", submitData);
        setSuccess("Workshop created successfully");
      }

      setShowForm(false);
      setEditingWorkshop(null);
      resetForm();
      fetchWorkshops();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save workshop");
    }
  };

  const handleEdit = (workshop) => {
    const workshopDate = new Date(workshop.date);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      category: workshop.category,
      date: workshopDate.toISOString().split("T")[0],
      time: workshopDate.toTimeString().slice(0, 5),
      duration: workshop.duration.toString(),
      locationType: workshop.location?.type || "in_person",
      address: workshop.location?.address || "",
      city: workshop.location?.city || "",
      province: workshop.location?.province || "",
      onlineLink: workshop.location?.onlineLink || "",
      maxParticipants: workshop.maxParticipants.toString(),
      price: workshop.price.toString(),
      isFree: workshop.isFree,
      thumbnail: workshop.thumbnail || "",
      tags: workshop.tags ? workshop.tags.join(", ") : "",
      status: workshop.status,
    });
    setEditingWorkshop(workshop);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this workshop?")) {
      try {
        await api.delete(`/workshops/${id}`);
        setSuccess("Workshop deleted successfully");
        fetchWorkshops();
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete workshop");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "skill_sharing",
      date: "",
      time: "",
      duration: "",
      locationType: "in_person",
      address: "",
      city: "",
      province: "",
      onlineLink: "",
      maxParticipants: "",
      price: "",
      isFree: true,
      thumbnail: "",
      tags: "",
      status: "upcoming",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWorkshop(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="admin-workshop-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-workshop-container">
      <div className="container">
        <div className="page-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Workshop Management</h1>
              <p className="dashboard-subtitle">
                Create and manage skill sharing workshops. Organize in-person and online events for the tailoring community.
              </p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary-header">
              <FaPlus className="btn-icon" />
              Add New Workshop
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showForm && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingWorkshop ? "Edit Workshop" : "Create New Workshop"}</h2>
                <button className="modal-close" onClick={handleCancel}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="workshop-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Workshop title"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="skill_sharing">Skill Sharing</option>
                    <option value="technique_demo">Technique Demo</option>
                    <option value="business_training">Business Training</option>
                    <option value="networking">Networking</option>
                    <option value="master_class">Master Class</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="5"
                  placeholder="Detailed workshop description"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location Type *</label>
                <select
                  value={formData.locationType}
                  onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                  required
                >
                  <option value="in_person">In Person</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {formData.locationType === "in_person" ? (
                <>
                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      placeholder="Street address"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group">
                      <label>Province *</label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        required
                        placeholder="Province"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Online Link *</label>
                  <input
                    type="url"
                    value={formData.onlineLink}
                    onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
                    required
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Max Participants *</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  />{" "}
                  Free Workshop
                </label>
              </div>

              {!formData.isFree && (
                <div className="form-group">
                  <label>Price (PKR) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Thumbnail Image URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tailoring, techniques, business"
                />
              </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancel} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingWorkshop ? "Update Workshop" : "Create Workshop"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="workshops-list">
          {workshops.length > 0 ? (
            <div className="workshops-grid">
              {workshops.map((workshop) => (
                <div key={workshop._id} className="workshop-card">
                  <div className="workshop-card-header">
                    {workshop.thumbnail ? (
                      <img src={workshop.thumbnail} alt={workshop.title} className="workshop-thumbnail" />
                    ) : (
                      <div className="workshop-thumbnail-placeholder">
                        <FaChalkboardTeacher className="placeholder-icon" />
                      </div>
                    )}
                    <div className="workshop-status-overlay">
                      <span className={`status-badge status-${workshop.status}`}>
                        {workshop.status}
                      </span>
                    </div>
                  </div>
                  <div className="workshop-card-body">
                    <div className="workshop-title-section">
                      <h3>{workshop.title}</h3>
                      {workshop.description && (
                        <p className="workshop-description">{workshop.description.substring(0, 100)}...</p>
                      )}
                    </div>
                    <div className="workshop-meta">
                      <div className="meta-item">
                        <FaTag className="meta-icon" />
                        <span className="category-badge">
                          {workshop.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div className="workshop-details">
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>
                          {new Date(workshop.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })} at {new Date(workshop.date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <span>{workshop.duration} minutes</span>
                      </div>
                      <div className="detail-item">
                        {workshop.location?.type === "online" ? (
                          <>
                            <FaVideo className="detail-icon" />
                            <span>Online</span>
                          </>
                        ) : (
                          <>
                            <FaMapMarkerAlt className="detail-icon" />
                            <span>
                              {workshop.location?.city || ""}, {workshop.location?.province || ""}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="detail-item">
                        <FaUsers className="detail-icon" />
                        <span>
                          {workshop.registeredUsers?.length || 0}/{workshop.maxParticipants} participants
                        </span>
                      </div>
                      {!workshop.isFree && (
                        <div className="detail-item">
                          <FaDollarSign className="detail-icon" />
                          <span>PKR {workshop.price?.toLocaleString() || 0}</span>
                        </div>
                      )}
                    </div>
                    <div className="workshop-actions">
                      <button
                        onClick={() => handleEdit(workshop)}
                        className="action-btn edit-btn"
                      >
                        <FaEdit className="btn-icon" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(workshop._id)}
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
            <div className="no-workshops">
              <FaChalkboardTeacher className="empty-icon" />
              <p>No workshops found. Create your first workshop to get started.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary-header">
                <FaPlus className="btn-icon" />
                Create Your First Workshop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWorkshopManagement;

