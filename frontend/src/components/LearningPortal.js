import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import YouTubeVideo from "./YouTubeVideo";
import "./LearningPortal.css";

const LearningPortal = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [videos, setVideos] = useState({});

  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      const categoryMap = {
        courses: "video_tutorial",
        forums: "forum",
        workshops: "workshop",
        news: "news",
        mentorship: "mentorship",
      };
      const category = categoryMap[activeTab] || "video_tutorial";
      const response = await api.get(`/videos?category=${category}&limit=10`);
      setVideos({ ...videos, [activeTab]: response.data.data || [] });
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  return (
    <div className="learning-portal-container">
      <div className="container">
        <div className="portal-header">
          <div className="header-text">
            <h1>Skill Development Portal</h1>
            <p className="dashboard-subtitle">
              Enhance your tailoring skills with courses, workshops, and community support. Learn from experts and grow your expertise.
            </p>
          </div>
        </div>

        <div className="portal-tabs">
          <button
            className={`view-btn ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
          <button
            className={`view-btn ${activeTab === "forums" ? "active" : ""}`}
            onClick={() => setActiveTab("forums")}
          >
            Forums
          </button>
          <button
            className={`view-btn ${activeTab === "workshops" ? "active" : ""}`}
            onClick={() => setActiveTab("workshops")}
          >
            Workshops
          </button>
          <button
            className={`view-btn ${activeTab === "news" ? "active" : ""}`}
            onClick={() => setActiveTab("news")}
          >
            Industry News
          </button>
          <button
            className={`view-btn ${activeTab === "mentorship" ? "active" : ""}`}
            onClick={() => setActiveTab("mentorship")}
          >
            Mentorship
          </button>
        </div>

        <div className="portal-content">
          {activeTab === "courses" && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Learning Management System</h2>
                <Link to="/courses" className="btn-primary-header">
                  Browse All Courses
                </Link>
              </div>
              {videos.courses && videos.courses.length > 0 && (
                <div className="youtube-videos-section">
                  <h3>Featured YouTube Videos</h3>
                  <div className="videos-grid">
                    {videos.courses.map((video) => (
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
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Video Tutorials</h3>
                  <p>Learn from basic to advanced techniques through comprehensive video courses</p>
                  <Link to="/courses?category=video_tutorial" className="feature-link">
                    Explore Tutorials
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Traditional Techniques</h3>
                  <p>Preserve and learn traditional Pakistani tailoring methods and craftsmanship</p>
                  <Link to="/courses?category=traditional_technique" className="feature-link">
                    Learn Traditions
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Modern Fashion Trends</h3>
                  <p>Stay updated with contemporary fashion trends and modern tailoring approaches</p>
                  <Link to="/courses?category=modern_fashion" className="feature-link">
                    Modern Trends
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Business Management</h3>
                  <p>Learn essential business skills to grow your tailoring enterprise</p>
                  <Link to="/courses?category=business_management" className="feature-link">
                    Business Courses
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Certification Programs</h3>
                  <p>Earn recognized certifications to validate your skills and expertise</p>
                  <Link to="/courses?category=certification" className="feature-link">
                    Get Certified
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "forums" && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Tailor Forums & Discussion Groups</h2>
                <Link to="/forums" className="btn-primary-header">
                  View All Forums
                </Link>
              </div>
              {videos.forums && videos.forums.length > 0 && (
                <div className="youtube-videos-section">
                  <h3>Featured YouTube Videos</h3>
                  <div className="videos-grid">
                    {videos.forums.map((video) => (
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
              <div className="features-grid">
                <div className="feature-card">
                  <h3>General Discussions</h3>
                  <p>Connect with fellow tailors and share experiences</p>
                  <Link to="/forums?category=general" className="feature-link">
                    Join Discussion
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Technique Sharing</h3>
                  <p>Learn and share advanced tailoring techniques</p>
                  <Link to="/forums?category=techniques" className="feature-link">
                    Share Techniques
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Business Advice</h3>
                  <p>Get advice on running and growing your tailoring business</p>
                  <Link to="/forums?category=business" className="feature-link">
                    Business Forum
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Troubleshooting</h3>
                  <p>Get help with technical issues and challenges</p>
                  <Link to="/forums?category=troubleshooting" className="feature-link">
                    Get Help
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workshops" && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Skill Sharing Workshops</h2>
                <Link to="/workshops" className="btn-primary-header">
                  Browse Workshops
                </Link>
              </div>
              {videos.workshops && videos.workshops.length > 0 && (
                <div className="youtube-videos-section">
                  <h3>Featured YouTube Videos</h3>
                  <div className="videos-grid">
                    {videos.workshops.map((video) => (
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
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Skill Sharing</h3>
                  <p>Participate in hands-on workshops to learn new skills</p>
                  <Link to="/workshops?category=skill_sharing" className="feature-link">
                    View Workshops
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Technique Demos</h3>
                  <p>Watch live demonstrations of advanced techniques</p>
                  <Link to="/workshops?category=technique_demo" className="feature-link">
                    Watch Demos
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Master Classes</h3>
                  <p>Learn from master tailors in exclusive classes</p>
                  <Link to="/workshops?category=master_class" className="feature-link">
                    Master Classes
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Networking Events</h3>
                  <p>Connect with industry professionals and peers</p>
                  <Link to="/workshops?category=networking" className="feature-link">
                    Networking
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "news" && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Industry News & Updates</h2>
                <Link to="/news" className="btn-primary-header">
                  Read All News
                </Link>
              </div>
              {videos.news && videos.news.length > 0 && (
                <div className="youtube-videos-section">
                  <h3>Featured YouTube Videos</h3>
                  <div className="videos-grid">
                    {videos.news.map((video) => (
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
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Industry Trends</h3>
                  <p>Stay informed about the latest trends in tailoring and fashion</p>
                  <Link to="/news?category=industry_trends" className="feature-link">
                    View Trends
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Fashion News</h3>
                  <p>Latest updates from the fashion and tailoring industry</p>
                  <Link to="/news?category=fashion_news" className="feature-link">
                    Fashion News
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Technology Updates</h3>
                  <p>Learn about new tools and technologies in tailoring</p>
                  <Link to="/news?category=technology" className="feature-link">
                    Tech News
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Success Stories</h3>
                  <p>Inspiring stories from successful tailors and businesses</p>
                  <Link to="/news?category=success_stories" className="feature-link">
                    Read Stories
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mentorship" && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Master Tailor Mentorship Programs</h2>
                <Link to="/mentorships" className="btn-primary-header">
                  Find a Mentor
                </Link>
              </div>
              {videos.mentorship && videos.mentorship.length > 0 && (
                <div className="youtube-videos-section">
                  <h3>Featured YouTube Videos</h3>
                  <div className="videos-grid">
                    {videos.mentorship.map((video) => (
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
              <div className="features-grid">
                <div className="feature-card">
                  <h3>One-on-One Mentorship</h3>
                  <p>Get personalized guidance from experienced master tailors</p>
                  <Link to="/mentorships" className="feature-link">
                    Find Mentor
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Group Mentorship</h3>
                  <p>Learn alongside peers in group mentorship programs</p>
                  <Link to="/mentorships" className="feature-link">
                    Join Group
                  </Link>
                </div>
                <div className="feature-card">
                  <h3>Master Classes</h3>
                  <p>Attend exclusive classes led by master tailors</p>
                  <Link to="/mentorships" className="feature-link">
                    Master Classes
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPortal;

