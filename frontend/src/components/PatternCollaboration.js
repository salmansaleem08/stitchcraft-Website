import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import "./PatternCollaboration.css";

const PatternCollaboration = () => {
  const { id } = useParams();
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState("");

  useEffect(() => {
    fetchPattern();
  }, [id]);

  const fetchPattern = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patterns/${id}`);
      setPattern(response.data.data.pattern);
      setError("");
    } catch (error) {
      setError("Failed to load pattern");
      console.error("Error fetching pattern:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, status, role = "Viewer") => {
    try {
      setProcessing(requestId);
      await api.put(`/patterns/${id}/collaborate/${requestId}`, { status, role });
      await fetchPattern();
      alert(`Collaboration request ${status} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to process request");
    } finally {
      setProcessing("");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !pattern) {
    return (
      <div className="container">
        <div className="error-message">{error || "Pattern not found"}</div>
        <Link to="/patterns" className="btn btn-primary">
          Back to Patterns
        </Link>
      </div>
    );
  }

  const pendingRequests = pattern.collaboration?.requests?.filter((r) => r.status === "pending") || [];
  const collaborators = pattern.collaboration?.collaborators || [];

  return (
    <div className="pattern-collaboration">
      <div className="container">
        <div className="collaboration-header">
          <Link to={`/patterns/${id}`} className="back-link">
            ← Back to Pattern
          </Link>
          <h1>Collaboration Management</h1>
          <h2>{pattern.title}</h2>
        </div>

        <div className="collaboration-content">
          <div className="collaboration-section">
            <h3>Pending Collaboration Requests ({pendingRequests.length})</h3>
            {pendingRequests.length === 0 ? (
              <p className="no-requests">No pending collaboration requests</p>
            ) : (
              <div className="requests-list">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="request-card">
                    <div className="request-info">
                      <div className="requester-details">
                        <strong>{request.user?.name || "Unknown User"}</strong>
                        <span className="requester-email">{request.user?.email}</span>
                      </div>
                      {request.message && (
                        <div className="request-message">
                          <strong>Message:</strong>
                          <p>{request.message}</p>
                        </div>
                      )}
                      <div className="request-date">
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="request-actions">
                      <select
                        id={`role-${request._id}`}
                        className="role-select"
                        defaultValue="Viewer"
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Editor">Editor</option>
                        <option value="Co-Designer">Co-Designer</option>
                      </select>
                      <button
                        onClick={() =>
                          handleRequestResponse(
                            request._id,
                            "approved",
                            document.getElementById(`role-${request._id}`).value
                          )
                        }
                        className="btn btn-primary btn-small"
                        disabled={processing === request._id}
                      >
                        {processing === request._id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleRequestResponse(request._id, "rejected")}
                        className="btn btn-secondary btn-small"
                        disabled={processing === request._id}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="collaboration-section">
            <h3>Current Collaborators ({collaborators.length})</h3>
            {collaborators.length === 0 ? (
              <p className="no-collaborators">No collaborators yet</p>
            ) : (
              <div className="collaborators-list">
                {collaborators.map((collab, index) => (
                  <div key={index} className="collaborator-card">
                    <div className="collaborator-info">
                      <strong>{collab.user?.name || "Unknown User"}</strong>
                      <span className="collaborator-email">{collab.user?.email}</span>
                      <span className="collaborator-role">Role: {collab.role}</span>
                    </div>
                    <div className="collaborator-date">
                      Added: {new Date(collab.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternCollaboration;

