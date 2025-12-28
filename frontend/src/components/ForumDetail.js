import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./ForumDetail.css";

const ForumDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchForum();
  }, [id]);

  const fetchForum = async () => {
    try {
      const response = await api.get(`/forums/${id}`);
      setForum(response.data.data);
    } catch (error) {
      console.error("Error fetching forum:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/forums/${id}/reply`, { content: replyContent });
      setReplyContent("");
      fetchForum();
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleLike = async () => {
    try {
      await api.post(`/forums/${id}/like`);
      fetchForum();
    } catch (error) {
      console.error("Error liking:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!forum) return <div>Forum not found</div>;

  return (
    <div className="forum-detail-container">
      <div className="container">
        <div className="forum-post">
          <div className="post-header">
            <h1>{forum.title}</h1>
            <span className="category-badge">{forum.category}</span>
          </div>
          <div className="post-author">
            By {forum.author?.name || "Unknown"} • {new Date(forum.createdAt).toLocaleDateString()}
          </div>
          <div className="post-content">{forum.content}</div>
          <div className="post-actions">
            <button onClick={handleLike} className="btn btn-secondary">
              Like ({forum.likes?.length || 0})
            </button>
          </div>
        </div>

        <div className="replies-section">
          <h2>Replies ({forum.replies?.length || 0})</h2>
          {forum.replies?.map((reply, idx) => (
            <div key={idx} className={`reply-item ${reply.isSolution ? "solution" : ""}`}>
              <div className="reply-author">{reply.author?.name || "Unknown"}</div>
              <div className="reply-content">{reply.content}</div>
              <div className="reply-date">{new Date(reply.createdAt).toLocaleDateString()}</div>
            </div>
          ))}

          {user && (
            <form onSubmit={handleReply} className="reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows="4"
                required
              ></textarea>
              <button type="submit" className="btn btn-primary">Post Reply</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;

