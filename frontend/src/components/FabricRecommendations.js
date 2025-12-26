import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./FabricRecommendations.css";

const FabricRecommendations = ({ fabricId, tailorId, pattern, occasion, season }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, [fabricId, tailorId, pattern, occasion, season]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      let endpoint = "";

      if (fabricId) {
        endpoint = `/fabrics/recommendations/similar/${fabricId}`;
      } else if (tailorId) {
        endpoint = `/fabrics/recommendations/tailor/${tailorId}`;
      } else if (pattern || occasion || season) {
        const params = new URLSearchParams();
        if (pattern) params.append("pattern", pattern);
        if (occasion) params.append("occasion", occasion);
        if (season) params.append("season", season);
        endpoint = `/fabrics/recommendations/pattern?${params.toString()}`;
      } else {
        endpoint = `/fabrics/recommendations/season`;
      }

      const response = await api.get(endpoint);
      setRecommendations(response.data.data || []);
      setError("");
    } catch (error) {
      setError("Failed to load recommendations");
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fabric-recommendations">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  const getTitle = () => {
    if (fabricId) return "Similar Fabrics";
    if (tailorId) return "Recommended for Your Style";
    if (pattern || occasion || season) return "Recommended Fabrics";
    return "Season-Appropriate Fabrics";
  };

  return (
    <div className="fabric-recommendations">
      <h2>{getTitle()}</h2>
      <div className="recommendations-grid">
        {recommendations.map((fabric) => (
          <Link
            key={fabric._id}
            to={`/fabrics/${fabric._id}`}
            className="recommendation-card"
          >
            <div className="recommendation-image">
              {fabric.images && fabric.images.length > 0 ? (
                <img src={fabric.images[0]} alt={fabric.name} />
              ) : (
                <div className="image-placeholder">
                  {fabric.name.charAt(0).toUpperCase()}
                </div>
              )}
              {fabric.supplier?.verificationStatus === "verified" && (
                <span className="verified-badge">Verified</span>
              )}
            </div>
            <div className="recommendation-info">
              <h3>{fabric.name}</h3>
              <p className="recommendation-supplier">
                {fabric.supplier?.businessName || fabric.supplier?.name}
              </p>
              <div className="recommendation-details">
                <span className="fabric-type">{fabric.fabricType}</span>
                <span className="fabric-color">{fabric.color}</span>
              </div>
              <div className="recommendation-price">
                PKR {fabric.pricePerMeter?.toLocaleString()}/meter
              </div>
              {fabric.rating > 0 && (
                <div className="recommendation-rating">
                  {"★".repeat(Math.floor(fabric.rating))}
                  {"☆".repeat(5 - Math.floor(fabric.rating))} {fabric.rating.toFixed(1)}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FabricRecommendations;

