import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your fabrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-fabrics-container">
      <div className="container">
        <div className="my-fabrics-header">
          <h1>My Fabrics</h1>
          <Link to="/fabrics/new" className="btn btn-primary">
            Add New Fabric
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {fabrics.length === 0 ? (
          <div className="no-fabrics">
            <p>You haven't added any fabrics yet.</p>
            <Link to="/fabrics/new" className="btn btn-primary">
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
                  <h3>{fabric.name}</h3>
                  <p className="fabric-type">{fabric.fabricType}</p>
                  <p className="fabric-price">
                    PKR {fabric.pricePerMeter?.toLocaleString()}/meter
                  </p>
                  <div className="fabric-actions">
                    <Link
                      to={`/fabrics/${fabric._id}`}
                      className="btn btn-secondary btn-small"
                    >
                      View
                    </Link>
                    <Link
                      to={`/fabrics/${fabric._id}/edit`}
                      className="btn btn-secondary btn-small"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(fabric._id)}
                      className="btn btn-danger btn-small"
                    >
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

