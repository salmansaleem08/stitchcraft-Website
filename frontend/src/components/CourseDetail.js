import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import YouTubeVideo from "./YouTubeVideo";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course) {
      fetchVideos();
    }
  }, [course]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
      
      if (user) {
        const enrollment = response.data.data.enrolledUsers?.find(
          (e) => e.user._id === user._id
        );
        if (enrollment) {
          setEnrolled(true);
          setProgress(enrollment.progress || 0);
        }
      }
      setError("");
    } catch (error) {
      setError("Failed to load course");
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      if (course && course.category) {
        const response = await api.get(`/videos?category=${course.category}&limit=10`);
        setVideos(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
      fetchCourse();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to enroll");
    }
  };

  const handleProgressUpdate = async (lessonId, completed) => {
    try {
      await api.put(`/courses/${id}/progress`, { lessonId, completed });
      fetchCourse();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleRate = async () => {
    try {
      await api.post(`/courses/${id}/rate`, { rating, review });
      fetchCourse();
      setRating(0);
      setReview("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit rating");
    }
  };

  const handleIssueCertificate = async () => {
    try {
      await api.post(`/courses/${id}/certificate`);
      alert("Certificate issued successfully!");
      fetchCourse();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to issue certificate");
    }
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-container">
        <div className="error-message">Course not found</div>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <div className="container">
        <div className="course-header-section">
          {course.thumbnail && (
            <div className="course-header-image">
              <img src={course.thumbnail} alt={course.title} />
            </div>
          )}
          <div className="course-header-content">
            <div className="course-badges">
              <span className="badge">{course.category.replace("_", " ")}</span>
              <span className="badge">{course.level}</span>
            </div>
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-info">
              <div className="info-item">
                <strong>Instructor:</strong> {course.instructor?.name || "Unknown"}
              </div>
              <div className="info-item">
                <strong>Duration:</strong> {course.duration} minutes
              </div>
              <div className="info-item">
                <strong>Rating:</strong> {course.averageRating?.toFixed(1) || "0.0"} ({course.totalRatings || 0} ratings)
              </div>
              <div className="info-item">
                <strong>Enrolled:</strong> {course.enrolledUsers?.length || 0} students
              </div>
            </div>
            <div className="course-actions">
              {enrolled ? (
                <div className="enrollment-status">
                  <p>You are enrolled in this course</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    <span className="progress-text">{progress}% Complete</span>
                  </div>
                  {progress === 100 && (
                    <button onClick={handleIssueCertificate} className="btn btn-primary">
                      Get Certificate
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={handleEnroll} className="btn btn-primary btn-large">
                  {course.isFree ? "Enroll for Free" : `Enroll for PKR ${course.price?.toLocaleString() || 0}`}
                </button>
              )}
            </div>
          </div>
        </div>

        {videos.length > 0 && (
          <div className="youtube-videos-section">
            <h2>Related YouTube Videos</h2>
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

        {enrolled && course.content && (
          <div className="course-content-section">
            <h2>Course Content</h2>
            {course.content.map((section, sectionIdx) => (
              <div key={sectionIdx} className="course-section">
                <h3>{section.sectionTitle}</h3>
                {section.lessons?.map((lesson, lessonIdx) => {
                  const isCompleted = course.enrolledUsers
                    ?.find((e) => e.user._id === user?._id)
                    ?.completedLessons?.includes(lesson._id);
                  
                  return (
                    <div key={lessonIdx} className="lesson-item">
                      <div className="lesson-header">
                        <input
                          type="checkbox"
                          checked={isCompleted || false}
                          onChange={(e) => handleProgressUpdate(lesson._id, e.target.checked)}
                        />
                        <span className="lesson-title">{lesson.lessonTitle}</span>
                        <span className="lesson-duration">{lesson.duration} min</span>
                      </div>
                      {lesson.description && (
                        <p className="lesson-description">{lesson.description}</p>
                      )}
                      {lesson.videoUrl && (
                        <div className="lesson-video">
                          <video controls src={lesson.videoUrl}></video>
                        </div>
                      )}
                      {lesson.resources && lesson.resources.length > 0 && (
                        <div className="lesson-resources">
                          <strong>Resources:</strong>
                          {lesson.resources.map((resource, idx) => (
                            <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer">
                              {resource.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div className="course-reviews-section">
          <h2>Reviews</h2>
          {user && enrolled && (
            <div className="review-form">
              <h3>Rate this course</h3>
              <div className="rating-input">
                <label>Rating:</label>
                <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                  <option value="0">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <div className="review-input">
                <label>Review:</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows="4"
                  placeholder="Write your review..."
                ></textarea>
              </div>
              <button onClick={handleRate} className="btn btn-primary">
                Submit Review
              </button>
            </div>
          )}
          <div className="reviews-list">
            {course.ratings && course.ratings.length > 0 ? (
              course.ratings.map((rating, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-header">
                    <strong>{rating.user?.name || "Anonymous"}</strong>
                    <span className="review-rating">{rating.rating}/5</span>
                  </div>
                  {rating.review && <p className="review-content">{rating.review}</p>}
                  <span className="review-date">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p>No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

