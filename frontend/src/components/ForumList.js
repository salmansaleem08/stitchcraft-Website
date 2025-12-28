import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import YouTubeVideo from "./YouTubeVideo";
import "./ForumList.css";

const ForumList = () => {
  const [forums, setForums] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "", sortBy: "createdAt" });

  useEffect(() => {
    fetchForums();
    fetchVideos();
  }, [filters]);

  const fetchForums = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);

      const response = await api.get(`/forums?${params.toString()}`);
      setForums(response.data.data || []);
    } catch (error) {
      console.error("Error fetching forums:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await api.get(`/videos?category=forum&limit=10`);
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  if (loading) {
    return <div className="forum-list-container"><div className="loading-container">Loading...</div></div>;
  }

  return (
    <div className="forum-list-container">
      <div className="container">
        <div className="page-header">
          <h1>Tailor Forums & Discussion Groups</h1>
          <Link to="/forums/new" className="btn btn-primary">New Post</Link>
        </div>

        <div className="filters-section">
          <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="techniques">Techniques</option>
            <option value="business">Business</option>
            <option value="tools">Tools</option>
            <option value="fabric">Fabric</option>
            <option value="design">Design</option>
            <option value="troubleshooting">Troubleshooting</option>
          </select>
          <input
            type="text"
            placeholder="Search forums..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
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

        <div className="forums-list">
          {forums.map((forum) => (
            <div key={forum._id} className="forum-card">
              {forum.isPinned && <span className="pinned-badge">Pinned</span>}
              <div className="forum-header">
                <Link to={`/forums/${forum._id}`} className="forum-title">{forum.title}</Link>
                <span className="forum-category">{forum.category}</span>
              </div>
              <p className="forum-content">{forum.content.substring(0, 200)}...</p>
              <div className="forum-footer">
                <span>By {forum.author?.name || "Unknown"}</span>
                <span>{forum.replies?.length || 0} replies</span>
                <span>{forum.likes?.length || 0} likes</span>
                <span>{forum.views} views</span>
                <span>{new Date(forum.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumList;

