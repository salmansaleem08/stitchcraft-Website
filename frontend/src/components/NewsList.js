import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import YouTubeVideo from "./YouTubeVideo";
import "./NewsList.css";

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", featured: "" });

  useEffect(() => {
    fetchNews();
    fetchVideos();
  }, [filters]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.featured) params.append("featured", filters.featured);

      const response = await api.get(`/news?${params.toString()}`);
      setNews(response.data.data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await api.get(`/videos?category=news&limit=10`);
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="news-list-container">
      <div className="container">
        <div className="page-header">
          <h1>Industry News & Updates</h1>
        </div>

        <div className="filters-section">
          <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
            <option value="">All Categories</option>
            <option value="industry_trends">Industry Trends</option>
            <option value="fashion_news">Fashion News</option>
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="events">Events</option>
            <option value="success_stories">Success Stories</option>
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
                  videoType={video.videoType}
                  localVideoUrl={video.localVideoUrl}
                />
              ))}
            </div>
          </div>
        )}

        <div className="news-grid">
          {news.map((article) => (
            <Link key={article._id} to={`/news/${article._id}`} className="news-card">
              {article.image && <img src={article.image} alt={article.title} />}
              {article.isFeatured && <span className="featured-badge">Featured</span>}
              <div className="news-content">
                <span className="news-category">{article.category.replace("_", " ")}</span>
                <h3>{article.title}</h3>
                <p>{article.content.substring(0, 150)}...</p>
                <div className="news-footer">
                  <span>By {article.author?.name || "Unknown"}</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  <span>{article.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsList;

