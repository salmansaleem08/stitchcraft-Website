import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./ForumDetail.css";

const ForumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleMarkAsSolution = async (replyId) => {
    try {
      await api.put(`/forums/${id}/replies/${replyId}/solution`);
      fetchForum();
    } catch (error) {
      console.error("Error marking as solution:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/forums/${id}`);
        navigate("/forums");
      } catch (error) {
        console.error("Error deleting forum:", error);
      }
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      general: "General Discussions",
      techniques: "Technique Sharing",
      business: "Business Advice",
      troubleshooting: "Troubleshooting",
      tools: "Tools & Equipment",
      fabric: "Fabric & Materials",
      design: "Design & Patterns",
    };
    return categories[category] || category;
  };

  if (loading) return <div>Loading...</div>;
  if (!forum) return <div>Forum not found</div>;

  return (
    <div className="forum-detail-container">
      <div className="container">
        <div className="forum-post">
          <div className="post-header">
            <h1>{forum.title}</h1>
            <div className="post-header-right">
              <span className="category-badge">{getCategoryLabel(forum.category)}</span>
              {user && (user._id === forum.author?._id || user.role === "admin") && (
                <div className="post-actions-header">
                  <Link to={`/forums/${id}/edit`} className="btn btn-small btn-secondary">
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="btn btn-small btn-danger">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="post-author">
            By {forum.author?.name || "Unknown"} • {new Date(forum.createdAt).toLocaleDateString()}
            {forum.isResolved && <span className="resolved-badge">Resolved</span>}
          </div>
          <div className="post-content">{forum.content}</div>
          {forum.tags && forum.tags.length > 0 && (
            <div className="post-tags">
              {forum.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          )}
          <div className="post-actions">
            <button onClick={handleLike} className="btn btn-secondary">
              Like ({forum.likes?.length || 0})
            </button>
            <span className="post-stats">
              {forum.views} views • {forum.replies?.length || 0} replies
            </span>
          </div>
        </div>

        <div className="replies-section">
          <h2>Replies ({forum.replies?.length || 0})</h2>
          {forum.replies?.map((reply, idx) => (
            <div key={idx} className={`reply-item ${reply.isSolution ? "solution" : ""}`}>
              {reply.isSolution && (
                <div className="solution-badge">Accepted Solution</div>
              )}
              <div className="reply-header">
                <div className="reply-author">{reply.author?.name || "Unknown"}</div>
                <div className="reply-date">{new Date(reply.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="reply-content">{reply.content}</div>
              <div className="reply-actions">
                {user && forum.author?._id === user._id && !forum.isResolved && !reply.isSolution && (
                  <button
                    onClick={() => handleMarkAsSolution(reply._id)}
                    className="btn btn-small btn-primary"
                  >
                    Mark as Solution
                  </button>
                )}
                {reply.likes && reply.likes.length > 0 && (
                  <span className="reply-likes">{reply.likes.length} likes</span>
                )}
              </div>
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

