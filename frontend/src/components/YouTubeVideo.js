import React, { useState } from "react";
import "./YouTubeVideo.css";

const YouTubeVideo = ({ videoId, title, thumbnail, description, videoType, localVideoUrl }) => {
  const [showPlayer, setShowPlayer] = useState(false);

  if (showPlayer) {
    if (videoType === "local" && localVideoUrl) {
      // Construct full URL for local videos
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const BASE_URL = API_BASE.replace("/api", "");
      const fullVideoUrl = localVideoUrl.startsWith("http") ? localVideoUrl : `${BASE_URL}${localVideoUrl}`;
      
      return (
        <div className="youtube-video-embed">
          <video controls width="100%" style={{ maxHeight: "500px" }}>
            <source src={fullVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <div className="youtube-video-embed">
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
  }

  return (
    <div className="youtube-video-card">
      <div className="video-thumbnail-wrapper" onClick={() => setShowPlayer(true)}>
        {thumbnail ? (
          <img src={thumbnail} alt={title} />
        ) : (
          <div className="video-placeholder">Video</div>
        )}
        <div className="play-overlay">
          <div className="play-button">Play</div>
        </div>
        {videoType === "local" && (
          <span className="local-video-badge">Local</span>
        )}
      </div>
      <div className="video-info">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
};

export default YouTubeVideo;

