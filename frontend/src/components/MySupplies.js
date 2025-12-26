import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./MySupplies.css";

const MySupplies = () => {
  const { user } = useContext(AuthContext);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      return;
    }
    fetchMySupplies();
  }, [user]);

  const fetchMySupplies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/supplies/me/list");
      setSupplies(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load your supplies");
      console.error("Error fetching supplies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplyId) => {
    if (!window.confirm("Are you sure you want to delete this supply?")) {
      return;
    }

    try {
      await api.delete(`/supplies/${supplyId}`);
      setSupplies(supplies.filter((s) => s._id !== supplyId));
    } catch (error) {
      setError("Failed to delete supply");
      console.error("Error deleting supply:", error);
    }
  };

  if (loading) {
    return (
      <div className="my-supplies-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your supplies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-supplies-container">
      <div className="container">
        <div className="my-supplies-header">
          <h1>My Supplies</h1>
          <Link to="/supplies/new" className="btn btn-primary">
            Add New Supply
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {supplies.length === 0 ? (
          <div className="no-supplies">
            <p>You haven't added any supplies yet.</p>
            <Link to="/supplies/new" className="btn btn-primary">
              Add Your First Supply
            </Link>
          </div>
        ) : (
          <div className="supplies-grid">
            {supplies.map((supply) => (
              <div key={supply._id} className="supply-card">
                <div className="supply-image">
                  {supply.images && supply.images.length > 0 ? (
                    <img src={supply.images[0]} alt={supply.name} />
                  ) : (
                    <div className="supply-placeholder">
                      {supply.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!supply.isActive && (
                    <span className="inactive-badge">Inactive</span>
                  )}
                  {supply.isFeatured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>
                <div className="supply-info">
                  <h3>{supply.name}</h3>
                  <p className="supply-category">{supply.category}</p>
                  {supply.brand && <p className="supply-brand">Brand: {supply.brand}</p>}
                  <p className="supply-price">
                    PKR {supply.price?.toLocaleString()}/{supply.unit || "piece"}
                  </p>
                  <div className="supply-actions">
                    <Link
                      to={`/supplies/${supply._id}`}
                      className="btn btn-secondary btn-small"
                    >
                      View
                    </Link>
                    <Link
                      to={`/supplies/${supply._id}/edit`}
                      className="btn btn-secondary btn-small"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(supply._id)}
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

export default MySupplies;

