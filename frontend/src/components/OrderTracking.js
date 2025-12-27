import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./OrderTracking.css";

const OrderTracking = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  // Status update
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Messaging
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Review
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    quality: 5,
    communication: 5,
    valueForMoney: 5,
    photos: [],
  });
  const [reviewPhotoFiles, setReviewPhotoFiles] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  // Pricing update (for tailors)
  const [showPricingUpdate, setShowPricingUpdate] = useState(false);
  const [pricingUpdate, setPricingUpdate] = useState({
    fabricCost: 0,
    additionalCharges: 0,
    discount: 0,
  });
  const [updatingPricing, setUpdatingPricing] = useState(false);

  useEffect(() => {
    fetchOrder();
    if (user && order?.status === "completed" && user.role === "customer") {
      checkExistingReview();
    }
  }, [id]);

  useEffect(() => {
    if (order) {
      setPricingUpdate({
        fabricCost: order.fabricCost || 0,
        additionalCharges: order.additionalCharges || 0,
        discount: order.discount || 0,
      });
    }
  }, [order]);

  useEffect(() => {
    if (order?.status === "completed" && user?.role === "customer" && !existingReview) {
      checkExistingReview();
    }
  }, [order, user]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load order details");
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReview = async () => {
    try {
      const response = await api.get(`/reviews/order/${id}`);
      setExistingReview(response.data.data);
    } catch (error) {
      // Review doesn't exist yet
      setExistingReview(null);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) {
      setError("Please select a status");
      return;
    }

    setUpdatingStatus(true);
    setError("");
    setSuccess("");

    try {
      await api.put(`/orders/${id}/status`, {
        status: newStatus,
        notes: statusNotes,
      });
      setSuccess("Order status updated successfully");
      setNewStatus("");
      setStatusNotes("");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError("Please enter a message");
      return;
    }

    setSendingMessage(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/orders/${id}/messages`, {
        message: newMessage,
      });
      setSuccess("Message sent successfully");
      setNewMessage("");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/reviews", {
        tailor: order.tailor._id,
        order: order._id,
        ...reviewData,
      });
      setSuccess("Review submitted successfully");
      setShowReviewForm(false);
      checkExistingReview();
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRequestRevision = async () => {
    const description = prompt("Please describe what needs to be revised:");
    if (!description) return;

    try {
      await api.post(`/orders/${id}/revisions`, { description });
      setSuccess("Revision request submitted");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to request revision");
    }
  };

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    setUpdatingPricing(true);
    setError("");
    setSuccess("");

    try {
      const newTotal =
        order.basePrice * (order.quantity || 1) +
        parseFloat(pricingUpdate.fabricCost) +
        parseFloat(pricingUpdate.additionalCharges) -
        parseFloat(pricingUpdate.discount);

      await api.put(`/orders/${id}`, {
        fabricCost: parseFloat(pricingUpdate.fabricCost),
        additionalCharges: parseFloat(pricingUpdate.additionalCharges),
        discount: parseFloat(pricingUpdate.discount),
        totalPrice: newTotal,
      });
      setSuccess("Pricing updated successfully");
      setShowPricingUpdate(false);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update pricing");
    } finally {
      setUpdatingPricing(false);
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="order-tracking-container">
        <div className="error-message">{error}</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const statusSteps = [
    { key: "pending", label: "Order Placed" },
    { key: "consultation_scheduled", label: "Consultation Scheduled" },
    { key: "consultation_completed", label: "Consultation Completed" },
    { key: "fabric_selected", label: "Fabric Selected" },
    { key: "in_progress", label: "In Progress" },
    { key: "quality_check", label: "Quality Check" },
    { key: "completed", label: "Completed" },
  ];

  const getStatusIndex = (status) => {
    return statusSteps.findIndex((step) => step.key === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);
  const isTailor = user?.role === "tailor" && user?._id === order.tailor._id;
  const isCustomer = user?.role === "customer" && user?._id === order.customer._id;

  const nextStatusOptions = {
    pending: ["consultation_scheduled", "cancelled"],
    consultation_scheduled: ["consultation_completed", "cancelled"],
    consultation_completed: ["fabric_selected", "cancelled"],
    fabric_selected: ["in_progress", "cancelled"],
    in_progress: ["quality_check", "revision_requested"],
    revision_requested: ["in_progress"],
    quality_check: ["completed", "revision_requested"],
  };

  return (
    <div className="order-tracking-container">
      <div className="container">
        <Link to="/orders" className="back-link">
          ← Back to Orders
        </Link>

        <div className="order-header">
          <div>
            <h1>Order #{order.orderNumber}</h1>
            <p className="order-date">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="order-header-actions">
            <div className="order-status-badge">
              <span className={`status ${order.status}`}>
                {order.status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
            <div className="design-tools-links">
              <Link
                to={`/orders/${order._id}/mood-board`}
                className="btn btn-secondary btn-sm"
              >
                Mood Board
              </Link>
              {order.designReference && order.designReference.length > 0 && (
                <Link
                  to={`/orders/${order._id}/annotate`}
                  className="btn btn-secondary btn-sm"
                >
                  Annotate Design
                </Link>
              )}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {isTailor && order.status !== "completed" && order.status !== "cancelled" && (
          <>
            <div className="status-update-section">
              <h3>Update Order Status</h3>
              <form onSubmit={handleStatusUpdate} className="status-form">
                <div className="form-group">
                  <label htmlFor="newStatus">New Status</label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="">Select status</option>
                    {nextStatusOptions[order.status]?.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="statusNotes">Notes (Optional)</label>
                  <textarea
                    id="statusNotes"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows="3"
                    placeholder="Add any notes about this status update..."
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
                  {updatingStatus ? "Updating..." : "Update Status"}
                </button>
              </form>
            </div>

            <div className="status-update-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Update Pricing</h3>
                <button
                  onClick={() => setShowPricingUpdate(!showPricingUpdate)}
                  className="btn btn-secondary"
                >
                  {showPricingUpdate ? "Cancel" : "Edit Pricing"}
                </button>
              </div>
              {showPricingUpdate && (
                <form onSubmit={handleUpdatePricing} className="status-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fabricCost">Fabric Cost (PKR)</label>
                      <input
                        type="number"
                        id="fabricCost"
                        value={pricingUpdate.fabricCost}
                        onChange={(e) =>
                          setPricingUpdate({
                            ...pricingUpdate,
                            fabricCost: e.target.value,
                          })
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="additionalCharges">Additional Charges (PKR)</label>
                      <input
                        type="number"
                        id="additionalCharges"
                        value={pricingUpdate.additionalCharges}
                        onChange={(e) =>
                          setPricingUpdate({
                            ...pricingUpdate,
                            additionalCharges: e.target.value,
                          })
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="discount">Discount (PKR)</label>
                    <input
                      type="number"
                      id="discount"
                      value={pricingUpdate.discount}
                      onChange={(e) =>
                        setPricingUpdate({
                          ...pricingUpdate,
                          discount: e.target.value,
                        })
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="pricing-preview">
                    <strong>New Total: PKR{" "}
                      {(
                        order.basePrice * (order.quantity || 1) +
                        parseFloat(pricingUpdate.fabricCost || 0) +
                        parseFloat(pricingUpdate.additionalCharges || 0) -
                        parseFloat(pricingUpdate.discount || 0)
                      ).toLocaleString()}
                    </strong>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={updatingPricing}>
                    {updatingPricing ? "Updating..." : "Update Pricing"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {isCustomer && 
          (order.status === "in_progress" || order.status === "quality_check") && (
          <div className="status-update-section">
            <h3>Request Revision</h3>
            <p>If you need changes to your order, you can request a revision</p>
            <button onClick={handleRequestRevision} className="btn btn-secondary">
              Request Revision
            </button>
          </div>
        )}

        {isCustomer &&
          order.status === "completed" &&
          !existingReview &&
          !showReviewForm && (
            <div className="review-prompt">
              <h3>How was your experience?</h3>
              <p>Please leave a review to help other customers</p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="btn btn-primary"
              >
                Write Review
              </button>
            </div>
          )}

        {showReviewForm && (
          <div className="review-form-section">
            <h3>Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Overall Rating *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.rating ? "active" : ""}`}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Quality Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.quality ? "active" : ""}`}
                      onClick={() => setReviewData({ ...reviewData, quality: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Communication Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.communication ? "active" : ""}`}
                      onClick={() =>
                        setReviewData({ ...reviewData, communication: star })
                      }
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Value for Money Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.valueForMoney ? "active" : ""}`}
                      onClick={() =>
                        setReviewData({ ...reviewData, valueForMoney: star })
                      }
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  rows="4"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        )}

        {existingReview && (
          <div className="existing-review-section">
            <h3>Your Review</h3>
            <div className="review-display">
              <div className="review-rating">
                <span className="stars">
                  {"★".repeat(existingReview.rating)}
                  {"☆".repeat(5 - existingReview.rating)}
                </span>
                <span className="rating-value">{existingReview.rating}/5</span>
              </div>
              {existingReview.comment && <p>{existingReview.comment}</p>}
            </div>
          </div>
        )}

        <div className="order-tabs">
          <button
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            Messages ({order.messages?.length || 0})
          </button>
        </div>

        {activeTab === "details" && (
          <div className="tab-content">
            <div className="order-timeline">
              <h3>Order Timeline</h3>
              <div className="timeline">
                {statusSteps.map((step, index) => (
                  <div
                    key={step.key}
                    className={`timeline-step ${
                      index <= currentStatusIndex ? "completed" : ""
                    } ${index === currentStatusIndex ? "current" : ""}`}
                  >
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>{step.label}</h4>
                      {index <= currentStatusIndex && order.timeline[index] && (
                        <p>
                          {new Date(order.timeline[index].updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-details-grid">
              <div className="order-section">
                <h3>Service Details</h3>
                <div className="detail-item">
                  <span className="detail-label">Service Type:</span>
                  <span className="detail-value">{order.serviceType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Garment Type:</span>
                  <span className="detail-value">{order.garmentType}</span>
                </div>
                {order.description && (
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{order.description}</span>
                  </div>
                )}
              </div>

              <div className="order-section">
                <h3>Pricing</h3>
                {order.quantity > 1 && (
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{order.quantity}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Base Price {order.quantity > 1 ? `(per item)` : ""}:</span>
                  <span className="detail-value">PKR {order.basePrice?.toLocaleString() || order.basePrice}</span>
                </div>
                {order.quantity > 1 && (
                  <div className="detail-item">
                    <span className="detail-label">Subtotal:</span>
                    <span className="detail-value">PKR {((order.basePrice || 0) * (order.quantity || 1)).toLocaleString()}</span>
                  </div>
                )}
                {order.fabricCost > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Fabric Cost:</span>
                    <span className="detail-value">PKR {order.fabricCost.toLocaleString()}</span>
                  </div>
                )}
                {order.additionalCharges > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Additional Charges:</span>
                    <span className="detail-value">PKR {order.additionalCharges.toLocaleString()}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Discount:</span>
                    <span className="detail-value">- PKR {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-item total">
                  <span className="detail-label">Total Price:</span>
                  <span className="detail-value">PKR {order.totalPrice?.toLocaleString() || order.totalPrice}</span>
                </div>
              </div>

              <div className="order-section">
                <h3>
                  {user?.role === "customer" ? "Tailor Information" : "Customer Information"}
                </h3>
                {user?.role === "customer" ? (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{order.tailor.name}</span>
                    </div>
                    {order.tailor.shopName && (
                      <div className="detail-item">
                        <span className="detail-label">Shop:</span>
                        <span className="detail-value">{order.tailor.shopName}</span>
                      </div>
                    )}
                    {order.tailor.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{order.tailor.phone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{order.customer.name}</span>
                    </div>
                    {order.customer.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{order.customer.phone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {order.estimatedCompletionDate && (
              <div className="order-section">
                <h3>Estimated Completion</h3>
                <p>{new Date(order.estimatedCompletionDate).toLocaleDateString()}</p>
              </div>
            )}

            {order.revisions && order.revisions.length > 0 && (
              <div className="order-section">
                <h3>Revisions ({order.revisions.length})</h3>
                {order.revisions.map((revision, idx) => (
                  <div key={idx} className="revision-item">
                    <div className="revision-header">
                      <span>Revision #{revision.revisionNumber}</span>
                      <span className={`revision-status ${revision.status}`}>
                        {revision.status}
                      </span>
                    </div>
                    {revision.description && <p>{revision.description}</p>}
                    <p className="revision-date">
                      Requested: {new Date(revision.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="tab-content">
            <div className="messages-section">
              <h3>Messages</h3>
              <div className="messages-list">
                {order.messages && order.messages.length > 0 ? (
                  order.messages.map((msg, idx) => {
                    // Compare IDs as strings to ensure proper comparison
                    const isSender = msg.sender._id?.toString() === user?._id?.toString();
                    return (
                      <div
                        key={idx}
                        className={`message ${isSender ? "sent" : "received"}`}
                      >
                        <div className="message-header">
                          <span className="message-sender">
                            {isSender ? "You" : msg.sender.name}
                          </span>
                          <span className="message-time">
                            {new Date(msg.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="message-content">{msg.message}</div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="message-attachments">
                            {msg.attachments.map((att, attIdx) => (
                              <a
                                key={attIdx}
                                href={att}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="attachment-link"
                              >
                                Attachment {attIdx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-messages">No messages yet</p>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="message-form">
                <div className="form-group">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows="3"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={sendingMessage}>
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
