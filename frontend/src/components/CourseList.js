import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import YouTubeVideo from "./YouTubeVideo";
import "./CourseList.css";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    search: "",
    isFree: "",
    sortBy: "createdAt",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
    fetchVideos();
  }, [filters, page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.level) params.append("level", filters.level);
      if (filters.search) params.append("search", filters.search);
      if (filters.isFree) params.append("isFree", filters.isFree);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      params.append("page", page);
      params.append("limit", "12");

      const response = await api.get(`/courses?${params.toString()}`);
      setCourses(response.data.data || []);
      setTotalPages(response.data.pages || 1);
      setError("");
    } catch (error) {
      setError("Failed to load courses");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      // Map course categories to video categories
      const categoryMap = {
        video_tutorial: "video_tutorial",
        traditional_technique: "traditional_technique",
        modern_fashion: "modern_fashion",
        business_management: "business_management",
        certification: "certification",
      };
      const videoCategory = filters.category ? categoryMap[filters.category] || "video_tutorial" : "video_tutorial";
      const response = await api.get(`/videos?category=${videoCategory}&limit=10`);
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  if (loading) {
    return (
      <div className="course-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="container">
        <div className="page-header">
          <h1>Learning Management System</h1>
          <p>Enhance your tailoring skills with comprehensive courses</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filters-section">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="video_tutorial">Video Tutorials</option>
              <option value="traditional_technique">Traditional Techniques</option>
              <option value="modern_fashion">Modern Fashion</option>
              <option value="business_management">Business Management</option>
              <option value="certification">Certification</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Level</label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange("level", e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price</label>
            <select
              value={filters.isFree}
              onChange={(e) => handleFilterChange("isFree", e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="true">Free Only</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="createdAt">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
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

        <div className="courses-section">
          <h2>Courses</h2>
          <div className="courses-grid">
            {courses.length > 0 ? (
              courses.map((course) => (
              <div key={course._id} className="course-card">
                {course.thumbnail && (
                  <div className="course-thumbnail">
                    <img src={course.thumbnail} alt={course.title} />
                  </div>
                )}
                <div className="course-content">
                  <div className="course-header">
                    <span className="course-category">{course.category.replace("_", " ")}</span>
                    <span className="course-level">{course.level}</span>
                  </div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description.substring(0, 120)}...</p>
                  <div className="course-meta">
                    <span className="course-instructor">
                      By {course.instructor?.name || "Unknown"}
                    </span>
                    <span className="course-duration">{course.duration} min</span>
                  </div>
                  <div className="course-footer">
                    <div className="course-rating">
                      <span className="rating-value">{course.averageRating?.toFixed(1) || "0.0"}</span>
                      <span className="rating-count">({course.totalRatings || 0})</span>
                    </div>
                    <div className="course-price">
                      {course.isFree ? (
                        <span className="price-free">Free</span>
                      ) : (
                        <span className="price-paid">PKR {course.price?.toLocaleString() || 0}</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/courses/${course._id}`} className="btn btn-primary btn-block">
                    View Course
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-courses">
              <p>No courses found</p>
            </div>
          )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;

