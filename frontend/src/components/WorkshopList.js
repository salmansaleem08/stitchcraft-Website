import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import YouTubeVideo from "./YouTubeVideo";
import "./WorkshopList.css";

const WorkshopList = () => {
  const { user } = useContext(AuthContext);
  const [workshops, setWorkshops] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", status: "upcoming" });

  useEffect(() => {
    fetchWorkshops();
    fetchVideos();
  }, [filters]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);

      const response = await api.get(`/workshops?${params.toString()}`);
      setWorkshops(response.data.data || []);
    } catch (error) {
      console.error("Error fetching workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await api.get(`/videos?category=workshop&limit=10`);
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleRegister = async (workshopId) => {
    try {
      await api.post(`/workshops/${workshopId}/register`);
      fetchWorkshops();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="workshop-list-container">
      <div className="container">
        <div className="page-header">
          <h1>Skill Sharing Workshops</h1>
        </div>

        <div className="filters-section">
          <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
            <option value="">All Categories</option>
            <option value="skill_sharing">Skill Sharing</option>
            <option value="technique_demo">Technique Demo</option>
            <option value="business_training">Business Training</option>
            <option value="networking">Networking</option>
            <option value="master_class">Master Class</option>
          </select>
        </div>

        {videos.length > 0 && (
          <div className="youtube-videos-section">
            <h2>Featured YouTube Videos</h2>
            <div className="videos-grid">
              {videos.map((video) => (
                <YouTubeVideo
                  key={video._id}
                  videoId={video.youtubeId}
                  title={video.title}
                  thumbnail={video.thumbnail}
                  description={video.description}
                />
              ))}
            </div>
          </div>
        )}

        <div className="workshops-grid">
          {workshops.map((workshop) => {
            const isRegistered = workshop.registeredUsers?.some(r => r.user._id === user?._id);
            return (
              <div key={workshop._id} className="workshop-card">
                {workshop.thumbnail && <img src={workshop.thumbnail} alt={workshop.title} />}
                <div className="workshop-content">
                  <h3>{workshop.title}</h3>
                  <p>{workshop.description.substring(0, 150)}...</p>
                  <div className="workshop-meta">
                    <span>Date: {new Date(workshop.date).toLocaleDateString()}</span>
                    <span>Duration: {workshop.duration} min</span>
                    <span>Location: {workshop.location.type === "online" ? "Online" : workshop.location.city}</span>
                  </div>
                  <div className="workshop-footer">
                    <span>{workshop.registeredUsers?.length || 0}/{workshop.maxParticipants} registered</span>
                    {workshop.isFree ? <span className="price-free">Free</span> : <span>PKR {workshop.price}</span>}
                  </div>
                  {user && (
                    isRegistered ? (
                      <button className="btn btn-secondary" disabled>Registered</button>
                    ) : (
                      <button onClick={() => handleRegister(workshop._id)} className="btn btn-primary">
                        Register
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkshopList;

