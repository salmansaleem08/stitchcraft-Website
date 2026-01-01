import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { FaPlus, FaEye, FaEdit, FaTrash, FaBox } from "react-icons/fa";
import "./MyFabrics.css";

const MyFabrics = () => {
  const { user } = useContext(AuthContext);
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      return;
    }
    fetchMyFabrics();
  }, [user]);

  const fetchMyFabrics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/fabrics/me/list");
      setFabrics(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load your fabrics");
      console.error("Error fetching fabrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fabricId) => {
    if (!window.confirm("Are you sure you want to delete this fabric?")) {
      return;
    }

    try {
      await api.delete(`/fabrics/${fabricId}`);
      setFabrics(fabrics.filter((f) => f._id !== fabricId));
    } catch (error) {
      setError("Failed to delete fabric");
      console.error("Error deleting fabric:", error);
    }
  };

  if (loading) {
    return (
      <div className="my-fabrics-container">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your fabrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-fabrics-container">
      <div className="container">
        <div className="my-fabrics-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>My Fabrics</h1>
              <p className="dashboard-subtitle">
                Manage all your fabric listings. View, edit, or delete your fabrics and track their performance.
              </p>
            </div>
            <Link to="/fabrics/new" className="btn-primary-header">
              <FaPlus className="btn-icon" />
              Add New Fabric
            </Link>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {fabrics.length === 0 ? (
          <div className="no-fabrics">
            <FaBox className="empty-icon" />
            <p>You haven't added any fabrics yet.</p>
            <Link to="/fabrics/new" className="btn-primary-header">
              <FaPlus className="btn-icon" />
              Add Your First Fabric
            </Link>
          </div>
        ) : (
          <div className="fabrics-grid">
            {fabrics.map((fabric) => (
              <div key={fabric._id} className="fabric-card">
                <div className="fabric-image">
                  {fabric.images && fabric.images.length > 0 ? (
                    <img src={fabric.images[0]} alt={fabric.name} />
                  ) : (
                    <div className="fabric-placeholder">
                      {fabric.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!fabric.isActive && (
                    <span className="inactive-badge">Inactive</span>
                  )}
                  {fabric.isFeatured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>
                <div className="fabric-info">
                  <div className="fabric-header">
                    <h3>{fabric.name}</h3>
                    {fabric.stockQuantity !== undefined && (
                      <span className={`stock-badge ${fabric.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {fabric.stockQuantity > 0 ? `${fabric.stockQuantity} m` : 'Out of Stock'}
                      </span>
                    )}
                  </div>
                  <p className="fabric-type">{fabric.fabricType || 'Fabric'}</p>
                  {fabric.color && (
                    <p className="fabric-color">
                      <span className="color-dot" style={{ backgroundColor: fabric.color || '#666' }}></span>
                      {fabric.color}
                    </p>
                  )}
                  <div className="fabric-price-section">
                    <span className="fabric-price">
                      PKR {fabric.pricePerMeter?.toLocaleString() || '0'}
                    </span>
                    <span className="fabric-unit">/meter</span>
                  </div>
                  <div className="fabric-actions">
                    <Link
                      to={`/fabrics/${fabric._id}`}
                      className="action-btn view-btn"
                    >
                      <FaEye className="btn-icon" />
                      View
                    </Link>
                    <Link
                      to={`/fabrics/${fabric._id}/edit`}
                      className="action-btn edit-btn"
                    >
                      <FaEdit className="btn-icon" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(fabric._id)}
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
        )}
      </div>
    </div>
  );
};

export default MyFabrics;

