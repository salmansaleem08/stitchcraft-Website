import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import YouTubeVideo from "./YouTubeVideo";
import "./MentorshipProgram.css";

const MentorshipProgram = () => {
  const { user } = useContext(AuthContext);
  const [mentors, setMentors] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({ programType: "one_on_one", goals: [] });

  useEffect(() => {
    fetchMentors();
    fetchVideos();
    if (user) fetchMentorships();
  }, [user]);

  const fetchMentors = async () => {
    try {
      const response = await api.get("/mentorships/mentors");
      setMentors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorships = async () => {
    try {
      const response = await api.get("/mentorships");
      setMentorships(response.data.data || []);
    } catch (error) {
      console.error("Error fetching mentorships:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await api.get(`/videos?category=mentorship&limit=10`);
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleRequestMentorship = async (e) => {
    e.preventDefault();
    try {
      await api.post("/mentorships", {
        mentorId: selectedMentor._id,
        ...requestData,
      });
      setShowRequestForm(false);
      setSelectedMentor(null);
      fetchMentorships();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request mentorship");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mentorship-program-container">
      <div className="container">
        <div className="page-header">
          <h1>Master Tailor Mentorship Programs</h1>
          <p>Get personalized guidance from experienced master tailors</p>
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

        <div className="mentorship-sections">
          <div className="mentors-section">
            <h2>Available Mentors</h2>
            <div className="mentors-grid">
              {mentors.map((mentor) => (
                <div key={mentor._id} className="mentor-card">
                  <div className="mentor-avatar">
                    {mentor.avatar ? <img src={mentor.avatar} alt={mentor.name} /> : <div className="avatar-placeholder">{mentor.name?.charAt(0)}</div>}
                  </div>
                  <h3>{mentor.name}</h3>
                  <p className="mentor-bio">{mentor.bio?.substring(0, 100)}...</p>
                  <div className="mentor-stats">
                    <span>Experience: {mentor.experience} years</span>
                    <span>Rating: {mentor.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  {user && user.role !== "tailor" && (
                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestForm(true);
                      }}
                      className="btn btn-primary"
                    >
                      Request Mentorship
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {user && mentorships.length > 0 && (
            <div className="my-mentorships-section">
              <h2>My Mentorships</h2>
              <div className="mentorships-list">
                {mentorships.map((mentorship) => (
                  <div key={mentorship._id} className="mentorship-card">
                    <div className="mentorship-header">
                      <h3>Mentor: {mentorship.mentor?.name || "Unknown"}</h3>
                      <span className={`status-badge status-${mentorship.status}`}>
                        {mentorship.status}
                      </span>
                    </div>
                    <p>Type: {mentorship.programType}</p>
                    {mentorship.goals && mentorship.goals.length > 0 && (
                      <div className="mentorship-goals">
                        <strong>Goals:</strong>
                        <ul>
                          {mentorship.goals.map((goal, idx) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showRequestForm && selectedMentor && (
          <div className="modal-overlay" onClick={() => setShowRequestForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Request Mentorship from {selectedMentor.name}</h2>
              <form onSubmit={handleRequestMentorship}>
                <div className="form-group">
                  <label>Program Type</label>
                  <select
                    value={requestData.programType}
                    onChange={(e) => setRequestData({...requestData, programType: e.target.value})}
                  >
                    <option value="one_on_one">One-on-One</option>
                    <option value="group">Group</option>
                    <option value="master_class">Master Class</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Goals (one per line)</label>
                  <textarea
                    value={requestData.goals.join("\n")}
                    onChange={(e) => setRequestData({...requestData, goals: e.target.value.split("\n").filter(g => g.trim())})}
                    rows="5"
                    placeholder="Enter your learning goals..."
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowRequestForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Send Request</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipProgram;

