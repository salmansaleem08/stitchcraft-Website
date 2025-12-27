import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./AdminVerifications.css";

const AdminVerifications = () => {
  const { user } = useContext(AuthContext);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("under_review");
  const [remarksMap, setRemarksMap] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchVerifications();
    }
  }, [user, statusFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const endpoint = statusFilter
        ? `/admin/verifications?status=${statusFilter}`
        : "/admin/verifications";
      const response = await api.get(endpoint);
      setVerifications(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load verifications");
      console.error("Error fetching verifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (supplierId) => {
    if (!window.confirm("Are you sure you want to approve this verification?")) {
      return;
    }

    try {
      setProcessing(true);
      await api.put(`/admin/verifications/${supplierId}/approve`, {
        remarks: remarksMap[supplierId] || "Verification approved by admin",
      });
      setRemarksMap((prev) => {
        const newMap = { ...prev };
        delete newMap[supplierId];
        return newMap;
      });
      await fetchVerifications();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to approve verification");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (supplierId) => {
    if (!window.confirm("Are you sure you want to reject this verification?")) {
      return;
    }

    try {
      setProcessing(true);
      await api.put(`/admin/verifications/${supplierId}/reject`, {
        remarks: remarksMap[supplierId] || "Verification rejected by admin",
      });
      setRemarksMap((prev) => {
        const newMap = { ...prev };
        delete newMap[supplierId];
        return newMap;
      });
      setError("");
      await fetchVerifications();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject verification");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "status-pending",
      under_review: "status-under-review",
      verified: "status-verified",
      rejected: "status-rejected",
    };
    return statusClasses[status] || "status-pending";
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="admin-verifications-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-verifications-container">
      <div className="container">
        <div className="verifications-header">
          <div>
            <h1>Supplier Verifications</h1>
            <p>Review and manage supplier verification requests</p>
          </div>
          <Link to="/admin/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        <div className="filters-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {verifications.length === 0 ? (
          <div className="no-verifications">
            <p>No verifications found with the selected status</p>
          </div>
        ) : (
          <div className="verifications-list">
            {verifications.map((supplier) => (
              <div key={supplier._id} className="verification-card">
                <div className="verification-card-header">
                  <div>
                    <h3>{supplier.businessName || supplier.name}</h3>
                    <p className="supplier-email">{supplier.email}</p>
                    <p className="supplier-date">
                      Submitted: {new Date(supplier.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(supplier.verificationStatus)}`}>
                    {formatStatus(supplier.verificationStatus)}
                  </span>
                </div>

                <div className="verification-documents">
                  <h4>Verification Documents:</h4>
                  {supplier.verificationDocuments && supplier.verificationDocuments.length > 0 ? (
                    <div className="documents-list">
                      {supplier.verificationDocuments.map((doc, idx) => (
                        <div key={idx} className="document-item">
                          <div className="document-info">
                            <span className="document-type">{doc.documentType}</span>
                            <span className="document-date">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-small btn-view"
                          >
                            View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-documents">No documents uploaded</p>
                  )}
                </div>

                {supplier.verificationRemarks && (
                  <div className="verification-remarks">
                    <h4>Admin Remarks:</h4>
                    <p>{supplier.verificationRemarks}</p>
                  </div>
                )}

                {supplier.verificationStatus === "under_review" && (
                  <div className="verification-actions">
                    <div className="remarks-input">
                      <label htmlFor={`remarks-${supplier._id}`}>
                        Remarks (Optional for approval, recommended for rejection):
                      </label>
                      <textarea
                        id={`remarks-${supplier._id}`}
                        value={remarksMap[supplier._id] || ""}
                        onChange={(e) => {
                          setRemarksMap((prev) => ({
                            ...prev,
                            [supplier._id]: e.target.value,
                          }));
                          setError("");
                        }}
                        placeholder="Add remarks or feedback..."
                        rows="3"
                      />
                    </div>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleApprove(supplier._id)}
                        className="btn btn-success"
                        disabled={processing}
                      >
                        {processing ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(supplier._id)}
                        className="btn btn-danger"
                        disabled={processing}
                      >
                        {processing ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerifications;

