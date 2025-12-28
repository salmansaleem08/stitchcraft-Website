import React, { useState } from "react";
import "./YouTubeVideo.css";

const YouTubeVideo = ({ videoId, title, thumbnail, description }) => {
  const [showPlayer, setShowPlayer] = useState(false);

  if (showPlayer) {
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

  return (
    <div className="youtube-video-card">
      <div className="video-thumbnail-wrapper" onClick={() => setShowPlayer(true)}>
        <img src={thumbnail} alt={title} />
        <div className="play-overlay">
          <div className="play-button">Play</div>
        </div>
      </div>
      <div className="video-info">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
};

export default YouTubeVideo;

