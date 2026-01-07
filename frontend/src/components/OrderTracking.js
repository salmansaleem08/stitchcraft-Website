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
  const [messageAttachments, setMessageAttachments] = useState([]);
  const [messageAttachmentFiles, setMessageAttachmentFiles] = useState([]);

  // Consultation
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [consultationData, setConsultationData] = useState({
    consultationDate: "",
    consultationType: "video",
    consultationLink: "",
    consultationDuration: 30,
    notes: "",
  });

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

  // Payment Schedule
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    milestone: "deposit",
    amount: "",
    dueDate: "",
    paymentMethod: "",
    transactionId: "",
  });
  const [markingPaymentPaid, setMarkingPaymentPaid] = useState(false);

  // Delivery
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveryAddress: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
      specialInstructions: "",
    },
    deliveryMethod: "pickup",
    estimatedDeliveryDate: "",
    deliveryTrackingNumber: "",
    deliveryProvider: "",
  });
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  // Disputes
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeData, setDisputeData] = useState({
    reason: "",
    description: "",
    attachments: [],
  });
  const [disputeAttachmentFiles, setDisputeAttachmentFiles] = useState([]);
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [resolvingDispute, setResolvingDispute] = useState(false);
  const [disputeResolution, setDisputeResolution] = useState("");

  // Alterations
  const [showAlterationForm, setShowAlterationForm] = useState(false);
  const [alterationData, setAlterationData] = useState({
    description: "",
    urgency: "medium",
  });
  const [submittingAlteration, setSubmittingAlteration] = useState(false);
  const [updatingAlteration, setUpdatingAlteration] = useState(false);
  const [alterationUpdate, setAlterationUpdate] = useState({
    status: "",
    estimatedCost: "",
    estimatedTime: "",
  });

  // Refunds
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundData, setRefundData] = useState({
    reason: "",
    description: "",
    requestedAmount: "",
  });
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundStatus, setRefundStatus] = useState("");
  const [refundTransactionId, setRefundTransactionId] = useState("");

  // Emergency Contact
  const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);
  const [emergencyContactData, setEmergencyContactData] = useState({
    name: "",
    phone: "",
    relationship: "",
    availableHours: "",
  });
  const [updatingEmergencyContact, setUpdatingEmergencyContact] = useState(false);

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
    if (!newMessage.trim() && messageAttachmentFiles.length === 0) {
      setError("Please enter a message or attach a file");
      return;
    }

    setSendingMessage(true);
    setError("");
    setSuccess("");

    try {
      let attachments = [];
      if (messageAttachmentFiles.length > 0) {
        const formData = new FormData();
        messageAttachmentFiles.forEach((file) => {
          formData.append("images", file);
        });
        const response = await api.post("/upload/images", formData);
        attachments = response.data.data.map((url, idx) => ({
          type: messageAttachmentFiles[idx].type.startsWith("image/") ? "image" : "document",
          url: `http://localhost:5000${url}`,
          name: messageAttachmentFiles[idx].name,
          size: messageAttachmentFiles[idx].size,
        }));
      }

      await api.post(`/orders/${id}/messages`, {
        message: newMessage,
        attachments: attachments,
      });
      setSuccess("Message sent successfully");
      setNewMessage("");
      setMessageAttachmentFiles([]);
      setMessageAttachments([]);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + messageAttachmentFiles.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    setMessageAttachmentFiles([...messageAttachmentFiles, ...files]);
    setMessageAttachments([...messageAttachments, ...files.map(f => ({ name: f.name, size: f.size }))]);
  };

  const removeMessageAttachment = (index) => {
    setMessageAttachmentFiles(messageAttachmentFiles.filter((_, i) => i !== index));
    setMessageAttachments(messageAttachments.filter((_, i) => i !== index));
  };

  const handleScheduleConsultation = async (e) => {
    e.preventDefault();
    if (!consultationData.consultationDate) {
      setError("Please select a consultation date and time");
      return;
    }

    try {
      await api.post(`/orders/${id}/consultation`, consultationData);
      setSuccess("Consultation scheduled successfully");
      setShowConsultationForm(false);
      setConsultationData({
        consultationDate: "",
        consultationType: "video",
        consultationLink: "",
        consultationDuration: 30,
        notes: "",
      });
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to schedule consultation");
    }
  };

  const handleUpdateConsultationStatus = async (status) => {
    try {
      await api.put(`/orders/${id}/consultation/status`, { status });
      setSuccess(`Consultation marked as ${status}`);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update consultation status");
    }
  };

  const handleRescheduleConsultation = async (e) => {
    e.preventDefault();
    if (!consultationData.consultationDate) {
      setError("Please select a new consultation date and time");
      return;
    }

    try {
      await api.put(`/orders/${id}/consultation/reschedule`, {
        consultationDate: consultationData.consultationDate,
        consultationLink: consultationData.consultationLink,
        notes: consultationData.notes,
      });
      setSuccess("Consultation rescheduled successfully");
      setShowConsultationForm(false);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reschedule consultation");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setError("");
    setSuccess("");

    try {
      let imageUrls = [];
      if (reviewPhotoFiles.length > 0) {
        const formData = new FormData();
        reviewPhotoFiles.forEach((file) => {
          formData.append("images", file);
        });
        const response = await api.post("/upload/images", formData);
        imageUrls = response.data.data.map((url) => `http://localhost:5000${url}`);
      }

      await api.post("/reviews", {
        tailor: order.tailor._id,
        order: order._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        quality: reviewData.quality,
        communication: reviewData.communication,
        valueForMoney: reviewData.valueForMoney,
        photos: imageUrls,
      });
      setSuccess("Review submitted successfully");
      setShowReviewForm(false);
      setReviewData({
        rating: 5,
        comment: "",
        quality: 5,
        communication: 5,
        valueForMoney: 5,
        photos: [],
      });
      setReviewPhotoFiles([]);
      checkExistingReview();
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionData, setRevisionData] = useState({
    description: "",
    images: [],
  });
  const [revisionImageFiles, setRevisionImageFiles] = useState([]);

  const handleRequestRevision = async (e) => {
    e?.preventDefault();
    
    if (!revisionData.description.trim()) {
      setError("Please provide a description for the revision");
      return;
    }

    try {
      let imageUrls = [];
      if (revisionImageFiles.length > 0) {
        const formData = new FormData();
        revisionImageFiles.forEach((file) => {
          formData.append("images", file);
        });
        const response = await api.post("/upload/images", formData);
        imageUrls = response.data.data.map((url) => `http://localhost:5000${url}`);
      }

      await api.post(`/orders/${id}/revisions`, {
        description: revisionData.description,
        images: imageUrls,
      });
      setSuccess("Revision request submitted");
      setShowRevisionForm(false);
      setRevisionData({ description: "", images: [] });
      setRevisionImageFiles([]);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to request revision");
    }
  };

  const handleRevisionImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + revisionImageFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setRevisionImageFiles([...revisionImageFiles, ...files]);
  };

  const removeRevisionImage = (index) => {
    setRevisionImageFiles(revisionImageFiles.filter((_, i) => i !== index));
  };

  const handleApproveRevision = async (revisionId) => {
    try {
      await api.put(`/orders/${id}/revisions/${revisionId}/approve`);
      setSuccess("Revision approved");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to approve revision");
    }
  };

  const handleRejectRevision = async (revisionId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await api.put(`/orders/${id}/revisions/${revisionId}/reject`, {
        rejectionReason: reason,
      });
      setSuccess("Revision rejected");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject revision");
    }
  };

  const handleStartRevision = async (revisionId) => {
    try {
      await api.put(`/orders/${id}/revisions/${revisionId}/in-progress`);
      setSuccess("Revision started");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to start revision");
    }
  };

  // Payment handlers
  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/orders/${id}/payments`, paymentData);
      setSuccess("Payment milestone added successfully");
      setShowPaymentForm(false);
      setPaymentData({
        milestone: "deposit",
        amount: "",
        dueDate: "",
        paymentMethod: "",
        transactionId: "",
      });
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add payment milestone");
    }
  };

  const handleMarkPaymentPaid = async (paymentId) => {
    const transactionId = prompt("Enter transaction ID (optional):");
    setMarkingPaymentPaid(true);
    try {
      await api.put(`/orders/${id}/payments/${paymentId}/paid`, {
        transactionId: transactionId || undefined,
      });
      setSuccess("Payment marked as paid");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to mark payment as paid");
    } finally {
      setMarkingPaymentPaid(false);
    }
  };

  // Delivery handlers
  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    setUpdatingDelivery(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/orders/${id}/delivery`, deliveryData);
      setSuccess("Delivery information updated successfully");
      setShowDeliveryForm(false);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update delivery information");
    } finally {
      setUpdatingDelivery(false);
    }
  };

  // Dispute handlers
  const handleDisputeAttachmentChange = (e) => {
    setDisputeAttachmentFiles(Array.from(e.target.files));
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    setSubmittingDispute(true);
    setError("");
    setSuccess("");
    try {
      let attachments = [];
      if (disputeAttachmentFiles.length > 0) {
        const formData = new FormData();
        disputeAttachmentFiles.forEach((file) => {
          formData.append("images", file);
        });
        const response = await api.post("/upload/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        attachments = response.data.fileUrls || [];
      }
      await api.post(`/orders/${id}/disputes`, {
        ...disputeData,
        attachments,
      });
      setSuccess("Dispute raised successfully");
      setShowDisputeForm(false);
      setDisputeData({ reason: "", description: "", attachments: [] });
      setDisputeAttachmentFiles([]);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to raise dispute");
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleResolveDispute = async (disputeId, status) => {
    if (!disputeResolution.trim()) {
      setError("Please enter a resolution");
      return;
    }
    setResolvingDispute(true);
    try {
      await api.put(`/orders/${id}/disputes/${disputeId}/resolve`, {
        status,
        resolution: disputeResolution,
      });
      setSuccess(`Dispute ${status} successfully`);
      setDisputeResolution("");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resolve dispute");
    } finally {
      setResolvingDispute(false);
    }
  };

  // Alteration handlers
  const handleRequestAlteration = async (e) => {
    e.preventDefault();
    setSubmittingAlteration(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/orders/${id}/alterations`, alterationData);
      setSuccess("Alteration request submitted successfully");
      setShowAlterationForm(false);
      setAlterationData({ description: "", urgency: "medium" });
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to request alteration");
    } finally {
      setSubmittingAlteration(false);
    }
  };

  const handleUpdateAlterationStatus = async (alterationId, statusOverride) => {
    setUpdatingAlteration(true);
    try {
      const status = statusOverride || alterationUpdate.status;
      await api.put(`/orders/${id}/alterations/${alterationId}`, {
        status,
        estimatedCost: alterationUpdate.estimatedCost || undefined,
        estimatedTime: alterationUpdate.estimatedTime || undefined,
      });
      setSuccess("Alteration status updated successfully");
      setAlterationUpdate({ status: "", estimatedCost: "", estimatedTime: "" });
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update alteration status");
    } finally {
      setUpdatingAlteration(false);
    }
  };

  // Refund handlers
  const handleRequestRefund = async (e) => {
    e.preventDefault();
    setSubmittingRefund(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/orders/${id}/refunds`, {
        ...refundData,
        requestedAmount: parseFloat(refundData.requestedAmount),
      });
      setSuccess("Refund request submitted successfully");
      setShowRefundForm(false);
      setRefundData({ reason: "", description: "", requestedAmount: "" });
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to request refund");
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleProcessRefund = async (refundId) => {
    if (!refundStatus) {
      setError("Please select a status");
      return;
    }
    setProcessingRefund(true);
    try {
      await api.put(`/orders/${id}/refunds/${refundId}/process`, {
        status: refundStatus,
        transactionId: refundTransactionId || undefined,
      });
      setSuccess(`Refund ${refundStatus} successfully`);
      setRefundStatus("");
      setRefundTransactionId("");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to process refund");
    } finally {
      setProcessingRefund(false);
    }
  };

  // Emergency contact handlers
  const handleUpdateEmergencyContact = async (e) => {
    e.preventDefault();
    setUpdatingEmergencyContact(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/orders/${id}/emergency-contact`, emergencyContactData);
      setSuccess("Emergency contact updated successfully");
      setShowEmergencyContactForm(false);
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update emergency contact");
    } finally {
      setUpdatingEmergencyContact(false);
    }
  };

  const handleCompleteRevision = async (revisionId) => {
    const notes = prompt("Add any notes about the completed revision (optional):");
    
    try {
      await api.put(`/orders/${id}/revisions/${revisionId}/complete`, {
        notes: notes || "",
      });
      setSuccess("Revision marked as completed");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to complete revision");
    }
  };

  const handleCustomerApproveRevision = async (revisionId) => {
    try {
      await api.put(`/orders/${id}/revisions/${revisionId}/customer-approve`);
      setSuccess("Revision approved");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to approve revision");
    }
  };

  const handleCustomerRejectRevision = async (revisionId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await api.put(`/orders/${id}/revisions/${revisionId}/customer-reject`, {
        rejectionReason: reason,
      });
      setSuccess("Revision rejected. New revision request created.");
      fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject revision");
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
          <div className="order-info-section">
            <p className="order-date-small">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <h1 className="order-id-header">Order #{order.orderNumber}</h1>
            <p className="order-subtitle">
              Track your order progress, communicate with your tailor, and manage delivery details.
            </p>
          </div>
          <div className="order-header-actions">
            <div className="design-tools-buttons">
              {order.measurements && (
                <Link
                  to="/virtual-tryon"
                  className="design-tool-btn"
                  target="_blank"
                >
                  Virtual Try-On
                </Link>
              )}
              <Link
                to={`/orders/${order._id}/mood-board`}
                className="design-tool-btn"
              >
                Mood Board
              </Link>
            </div>
            <div className="order-status-display">
              <span className="status-label">Status:</span>
              <span className={`status ${order.status}`}>
                {order.status.replace(/_/g, " ").toUpperCase()}
              </span>
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
            {!showRevisionForm ? (
              <button
                onClick={() => setShowRevisionForm(true)}
                className="btn btn-secondary"
              >
                Request Revision
              </button>
            ) : (
              <form onSubmit={handleRequestRevision} className="revision-form">
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={revisionData.description}
                    onChange={(e) =>
                      setRevisionData({ ...revisionData, description: e.target.value })
                    }
                    rows="4"
                    placeholder="Describe what needs to be revised..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Upload Images (Optional, max 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleRevisionImageChange}
                    className="file-input"
                  />
                  {revisionImageFiles.length > 0 && (
                    <div className="revision-images-preview">
                      {revisionImageFiles.map((file, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx + 1}`}
                            className="preview-image"
                          />
                          <button
                            type="button"
                            onClick={() => removeRevisionImage(idx)}
                            className="remove-image-btn"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Submit Revision Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevisionForm(false);
                      setRevisionData({ description: "", images: [] });
                      setRevisionImageFiles([]);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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

              <div className="form-group">
                <label htmlFor="reviewPhotos">Photos (optional)</label>
                <div className="image-upload-container">
                  <div className="upload-area" onClick={() => document.getElementById('reviewPhotos').click()}>
                    <div className="upload-icon">📸</div>
                    <div className="upload-text">
                      <strong>Click to upload photos</strong>
                      <br />
                      <span className="upload-subtitle">or drag and drop images here</span>
                    </div>
                    <button type="button" className="btn btn-secondary upload-btn" onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('reviewPhotos').click();
                    }}>
                      Choose Files
                    </button>
                  </div>
                  <input
                    type="file"
                    id="reviewPhotos"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      // Limit to 5 images
                      if (files.length > 5) {
                        alert("You can upload maximum 5 images");
                        return;
                      }
                      setReviewPhotoFiles(files);
                    }}
                    className="file-input-hidden"
                    style={{ display: 'none' }}
                  />
                  <small className="file-help">Upload up to 5 images (max 10MB each)</small>
                </div>

                {reviewPhotoFiles.length > 0 && (
                  <div className="image-preview">
                    <h4>Selected Photos ({reviewPhotoFiles.length}/5)</h4>
                    <div className="preview-grid">
                      {reviewPhotoFiles.map((file, idx) => (
                        <div key={idx} className="preview-item">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx + 1}`}
                            className="preview-image"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = reviewPhotoFiles.filter((_, i) => i !== idx);
                              setReviewPhotoFiles(newFiles);
                            }}
                            className="remove-image"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              {existingReview.photos && existingReview.photos.length > 0 && (
                <div className="review-images">
                  <h4>Your Photos:</h4>
                  <div className="images-grid">
                    {existingReview.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${photo}`}
                        alt={`Review photo ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
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
          <button
            className={`tab-btn ${activeTab === "consultation" ? "active" : ""}`}
            onClick={() => setActiveTab("consultation")}
          >
            Consultation
          </button>
          <button
            className={`tab-btn ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payments ({order.paymentSchedule?.length || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === "delivery" ? "active" : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            Delivery
          </button>
          <button
            className={`tab-btn ${activeTab === "disputes" ? "active" : ""}`}
            onClick={() => setActiveTab("disputes")}
          >
            Disputes {order.disputes && order.disputes.length > 0 && `(${order.disputes.length})`}
          </button>
          <button
            className={`tab-btn ${activeTab === "alterations" ? "active" : ""}`}
            onClick={() => setActiveTab("alterations")}
          >
            Alterations {order.alterationRequests && order.alterationRequests.length > 0 && `(${order.alterationRequests.length})`}
          </button>
          <button
            className={`tab-btn ${activeTab === "refunds" ? "active" : ""}`}
            onClick={() => setActiveTab("refunds")}
          >
            Refunds {order.refundRequests && order.refundRequests.length > 0 && `(${order.refundRequests.length})`}
          </button>
          <button
            className={`tab-btn ${activeTab === "emergency" ? "active" : ""}`}
            onClick={() => setActiveTab("emergency")}
          >
            Emergency Contact
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
                <h3>Revision History ({order.revisions.length})</h3>
                <div className="revisions-timeline">
                  {order.revisions.map((revision, idx) => (
                    <div key={idx} className="revision-item">
                      <div className="revision-header">
                        <div>
                          <span className="revision-number">
                            Revision #{revision.revisionNumber}
                          </span>
                          <span className={`revision-status ${revision.status}`}>
                            {revision.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <span className="revision-date">
                          {new Date(revision.requestedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {revision.description && (
                        <div className="revision-description">
                          <strong>Request:</strong> {revision.description}
                        </div>
                      )}

                      {revision.images && revision.images.length > 0 && (
                        <div className="revision-images">
                          <strong>Images:</strong>
                          <div className="images-grid">
                            {revision.images.map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img}
                                alt={`Revision ${revision.revisionNumber} image ${imgIdx + 1}`}
                                className="revision-image"
                                onClick={() => window.open(img, "_blank")}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {revision.notes && (
                        <div className="revision-notes">
                          <strong>Tailor Notes:</strong> {revision.notes}
                        </div>
                      )}

                      {revision.rejectionReason && (
                        <div className="rejection-reason">
                          <strong>Rejection Reason:</strong> {revision.rejectionReason}
                        </div>
                      )}

                      {revision.customerRejectionReason && (
                        <div className="rejection-reason">
                          <strong>Customer Feedback:</strong> {revision.customerRejectionReason}
                        </div>
                      )}

                      {revision.completedAt && (
                        <div className="revision-timeline">
                          <span>Completed: {new Date(revision.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Tailor Actions */}
                      {isTailor && revision.status === "pending" && (
                        <div className="revision-actions">
                          <button
                            onClick={() => handleApproveRevision(revision._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRevision(revision._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {isTailor && revision.status === "approved" && (
                        <div className="revision-actions">
                          <button
                            onClick={() => handleStartRevision(revision._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Start Revision
                          </button>
                        </div>
                      )}

                      {isTailor && revision.status === "in_progress" && (
                        <div className="revision-actions">
                          <button
                            onClick={() => handleCompleteRevision(revision._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Mark as Completed
                          </button>
                        </div>
                      )}

                      {/* Customer Actions */}
                      {isCustomer && revision.status === "completed" && (
                        <div className="revision-actions">
                          <button
                            onClick={() => handleCustomerApproveRevision(revision._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Approve Revision
                          </button>
                          <button
                            onClick={() => handleCustomerRejectRevision(revision._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Request Changes
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  />
                </div>
                {messageAttachments.length > 0 && (
                  <div className="attachment-preview-list">
                    {messageAttachments.map((att, idx) => (
                      <div key={idx} className="attachment-preview-item">
                        <span className="attachment-name">{att.name}</span>
                        {att.size && (
                          <span className="attachment-size">
                            ({(att.size / 1024).toFixed(1)} KB)
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMessageAttachment(idx)}
                          className="remove-attachment-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="message-form-actions">
                  <label className="file-attachment-btn">
                    <input
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx"
                      multiple
                      onChange={handleMessageAttachmentChange}
                      className="file-input-hidden"
                    />
                    <span className="attachment-icon">📎</span>
                    <span className="attachment-label">Attach Files</span>
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={sendingMessage}>
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "consultation" && (
          <div className="tab-content">
            <div className="consultation-section">
              <h3>Consultation Details</h3>
              
              {order.consultationDate ? (
                <div className="consultation-info">
                  <div className="consultation-details-card">
                    <div className="detail-row">
                      <span className="detail-label">Date & Time:</span>
                      <span className="detail-value">
                        {new Date(order.consultationDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">
                        {order.consultationType?.replace(/_/g, " ").toUpperCase() || "In Person"}
                      </span>
                    </div>
                    {order.consultationDuration && (
                      <div className="detail-row">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{order.consultationDuration} minutes</span>
                      </div>
                    )}
                    {order.consultationLink && (
                      <div className="detail-row">
                        <span className="detail-label">Video Link:</span>
                        <a
                          href={order.consultationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="consultation-link"
                        >
                          Join Consultation
                        </a>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`consultation-status ${order.consultationStatus}`}>
                        {order.consultationStatus?.replace(/_/g, " ").toUpperCase() || "PENDING"}
                      </span>
                    </div>
                    {order.consultationNotes && (
                      <div className="consultation-notes">
                        <strong>Notes:</strong>
                        <p>{order.consultationNotes}</p>
                      </div>
                    )}

                    <div className="consultation-actions">
                      {order.consultationStatus === "scheduled" && (
                        <>
                          <button
                            onClick={() => handleUpdateConsultationStatus("completed")}
                            className="btn btn-primary btn-sm"
                          >
                            Mark as Completed
                          </button>
                          <button
                            onClick={() => {
                              setConsultationData({
                                consultationDate: new Date(order.consultationDate).toISOString().slice(0, 16),
                                consultationType: order.consultationType || "video",
                                consultationLink: order.consultationLink || "",
                                consultationDuration: order.consultationDuration || 30,
                                notes: order.consultationNotes || "",
                              });
                              setShowConsultationForm(true);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleUpdateConsultationStatus("cancelled")}
                            className="btn btn-danger btn-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {order.consultationStatus === "rescheduled" && (
                        <>
                          <button
                            onClick={() => handleUpdateConsultationStatus("scheduled")}
                            className="btn btn-primary btn-sm"
                          >
                            Confirm Reschedule
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-consultation">
                  <p>No consultation scheduled yet.</p>
                  <button
                    onClick={() => setShowConsultationForm(true)}
                    className="btn btn-primary"
                  >
                    Schedule Consultation
                  </button>
                </div>
              )}

              {showConsultationForm && (
                <div className="consultation-form-section">
                  <h4>{order.consultationDate ? "Reschedule Consultation" : "Schedule Consultation"}</h4>
                  <form
                    onSubmit={order.consultationDate ? handleRescheduleConsultation : handleScheduleConsultation}
                    className="consultation-form"
                  >
                    <div className="form-group">
                      <label>Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={consultationData.consultationDate}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            consultationDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Consultation Type *</label>
                      <select
                        value={consultationData.consultationType}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            consultationType: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="video">Video Call</option>
                        <option value="in_person">In Person</option>
                        <option value="phone">Phone Call</option>
                      </select>
                    </div>
                    {consultationData.consultationType === "video" && (
                      <div className="form-group">
                        <label>Video Call Link (Zoom, Google Meet, etc.)</label>
                        <input
                          type="url"
                          value={consultationData.consultationLink}
                          onChange={(e) =>
                            setConsultationData({
                              ...consultationData,
                              consultationLink: e.target.value,
                            })
                          }
                          placeholder="https://zoom.us/j/..."
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={consultationData.consultationDuration}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            consultationDuration: Number(e.target.value),
                          })
                        }
                        min="15"
                        max="120"
                        step="15"
                      />
                    </div>
                    <div className="form-group">
                      <label>Notes (Optional)</label>
                      <textarea
                        value={consultationData.notes}
                        onChange={(e) =>
                          setConsultationData({
                            ...consultationData,
                            notes: e.target.value,
                          })
                        }
                        rows="3"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {order.consultationDate ? "Reschedule" : "Schedule"} Consultation
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowConsultationForm(false);
                          setConsultationData({
                            consultationDate: "",
                            consultationType: "video",
                            consultationLink: "",
                            consultationDuration: 30,
                            notes: "",
                          });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="tab-content">
            <div className="payments-section">
              <div className="section-header">
                <h3>Payment Schedule</h3>
                {(user?.role === "customer" || user?.role === "tailor") && (
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="btn btn-primary"
                  >
                    Add Payment Milestone
                  </button>
                )}
              </div>

              {order.paymentSchedule && order.paymentSchedule.length > 0 ? (
                <div className="payment-list">
                  {order.paymentSchedule.map((payment, index) => (
                    <div key={index} className="payment-item">
                      <div className="payment-header">
                        <h4>{payment.milestone.replace("_", " ").toUpperCase()}</h4>
                        <span className={`payment-status ${payment.paid ? "paid" : "pending"}`}>
                          {payment.paid ? "Paid" : "Pending"}
                        </span>
                      </div>
                      <div className="payment-details">
                        <p><strong>Amount:</strong> PKR {payment.amount.toLocaleString()}</p>
                        {payment.dueDate && (
                          <p><strong>Due Date:</strong> {new Date(payment.dueDate).toLocaleDateString()}</p>
                        )}
                        {payment.paid && payment.paidAt && (
                          <p><strong>Paid On:</strong> {new Date(payment.paidAt).toLocaleDateString()}</p>
                        )}
                        {payment.paymentMethod && (
                          <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
                        )}
                        {payment.transactionId && (
                          <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
                        )}
                      </div>
                      {!payment.paid && (user?.role === "customer" || user?.role === "tailor") && (
                        <button
                          onClick={() => handleMarkPaymentPaid(payment._id)}
                          className="btn btn-primary"
                          disabled={markingPaymentPaid}
                        >
                          {markingPaymentPaid ? "Marking..." : "Mark as Paid"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No payment milestones added yet.</p>
              )}

              <div className="payment-summary">
                <p><strong>Total Price:</strong> PKR {order.totalPrice?.toLocaleString() || 0}</p>
                <p><strong>Total Paid:</strong> PKR {(order.totalPaid || 0).toLocaleString()}</p>
                <p><strong>Remaining:</strong> PKR {((order.totalPrice || 0) - (order.totalPaid || 0)).toLocaleString()}</p>
              </div>

              {showPaymentForm && (
                <div className="payment-form-section">
                  <h4>Add Payment Milestone</h4>
                  <form onSubmit={handleAddPayment} className="payment-form">
                    <div className="form-group">
                      <label>Milestone *</label>
                      <select
                        value={paymentData.milestone}
                        onChange={(e) => setPaymentData({ ...paymentData, milestone: e.target.value })}
                        required
                      >
                        <option value="deposit">Deposit</option>
                        <option value="fabric_payment">Fabric Payment</option>
                        <option value="progress_payment">Progress Payment</option>
                        <option value="final_payment">Final Payment</option>
                        <option value="delivery_payment">Delivery Payment</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount (PKR) *</label>
                      <input
                        type="number"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={paymentData.dueDate}
                        onChange={(e) => setPaymentData({ ...paymentData, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <input
                        type="text"
                        value={paymentData.paymentMethod}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                        placeholder="e.g., Bank Transfer, Cash, etc."
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Add Payment</button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPaymentForm(false);
                          setPaymentData({
                            milestone: "deposit",
                            amount: "",
                            dueDate: "",
                            paymentMethod: "",
                            transactionId: "",
                          });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="tab-content">
            <div className="delivery-section">
              <div className="section-header">
                <h3>Delivery Information</h3>
                {(user?.role === "customer" || user?.role === "tailor") && (
                  <button
                    onClick={() => {
                      if (order.deliveryAddress) {
                        setDeliveryData({
                          deliveryAddress: order.deliveryAddress,
                          deliveryMethod: order.deliveryMethod || "pickup",
                          estimatedDeliveryDate: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : "",
                          deliveryTrackingNumber: order.deliveryTrackingNumber || "",
                          deliveryProvider: order.deliveryProvider || "",
                        });
                      }
                      setShowDeliveryForm(true);
                    }}
                    className="btn btn-primary"
                  >
                    {order.deliveryAddress ? "Update Delivery" : "Set Delivery"}
                  </button>
                )}
              </div>

              {order.deliveryAddress ? (
                <div className="delivery-info">
                  <h4>Delivery Address</h4>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.province}</p>
                  <p>Postal Code: {order.deliveryAddress.postalCode}</p>
                  {order.deliveryAddress.phone && <p>Phone: {order.deliveryAddress.phone}</p>}
                  {order.deliveryAddress.specialInstructions && (
                    <p><strong>Special Instructions:</strong> {order.deliveryAddress.specialInstructions}</p>
                  )}
                  <p><strong>Delivery Method:</strong> {order.deliveryMethod?.replace("_", " ").toUpperCase() || "Pickup"}</p>
                  {order.estimatedDeliveryDate && (
                    <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                  )}
                  {order.deliveryTrackingNumber && (
                    <p><strong>Tracking Number:</strong> {order.deliveryTrackingNumber}</p>
                  )}
                  {order.deliveryProvider && (
                    <p><strong>Delivery Provider:</strong> {order.deliveryProvider}</p>
                  )}
                </div>
              ) : (
                <p>No delivery information set yet.</p>
              )}

              {showDeliveryForm && (
                <div className="delivery-form-section">
                  <h4>{order.deliveryAddress ? "Update Delivery Information" : "Set Delivery Information"}</h4>
                  <form onSubmit={handleUpdateDelivery} className="delivery-form">
                    <div className="form-group">
                      <label>Delivery Method *</label>
                      <select
                        value={deliveryData.deliveryMethod}
                        onChange={(e) => setDeliveryData({ ...deliveryData, deliveryMethod: e.target.value })}
                        required
                      >
                        <option value="pickup">Pickup</option>
                        <option value="home_delivery">Home Delivery</option>
                        <option value="courier">Courier</option>
                      </select>
                    </div>
                    {deliveryData.deliveryMethod !== "pickup" && (
                      <>
                        <div className="form-group">
                          <label>Street Address *</label>
                          <input
                            type="text"
                            value={deliveryData.deliveryAddress.street}
                            onChange={(e) => setDeliveryData({
                              ...deliveryData,
                              deliveryAddress: { ...deliveryData.deliveryAddress, street: e.target.value }
                            })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>City *</label>
                          <input
                            type="text"
                            value={deliveryData.deliveryAddress.city}
                            onChange={(e) => setDeliveryData({
                              ...deliveryData,
                              deliveryAddress: { ...deliveryData.deliveryAddress, city: e.target.value }
                            })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Province *</label>
                          <input
                            type="text"
                            value={deliveryData.deliveryAddress.province}
                            onChange={(e) => setDeliveryData({
                              ...deliveryData,
                              deliveryAddress: { ...deliveryData.deliveryAddress, province: e.target.value }
                            })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Postal Code</label>
                          <input
                            type="text"
                            value={deliveryData.deliveryAddress.postalCode}
                            onChange={(e) => setDeliveryData({
                              ...deliveryData,
                              deliveryAddress: { ...deliveryData.deliveryAddress, postalCode: e.target.value }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone *</label>
                          <input
                            type="tel"
                            value={deliveryData.deliveryAddress.phone}
                            onChange={(e) => setDeliveryData({
                              ...deliveryData,
                              deliveryAddress: { ...deliveryData.deliveryAddress, phone: e.target.value }
                            })}
                            required
                          />
                        </div>
                      </>
                    )}
                    <div className="form-group">
                      <label>Estimated Delivery Date</label>
                      <input
                        type="date"
                        value={deliveryData.estimatedDeliveryDate}
                        onChange={(e) => setDeliveryData({ ...deliveryData, estimatedDeliveryDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tracking Number</label>
                      <input
                        type="text"
                        value={deliveryData.deliveryTrackingNumber}
                        onChange={(e) => setDeliveryData({ ...deliveryData, deliveryTrackingNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Delivery Provider</label>
                      <input
                        type="text"
                        value={deliveryData.deliveryProvider}
                        onChange={(e) => setDeliveryData({ ...deliveryData, deliveryProvider: e.target.value })}
                        placeholder="e.g., TCS, Leopards, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Special Instructions</label>
                      <textarea
                        value={deliveryData.deliveryAddress.specialInstructions}
                        onChange={(e) => setDeliveryData({
                          ...deliveryData,
                          deliveryAddress: { ...deliveryData.deliveryAddress, specialInstructions: e.target.value }
                        })}
                        rows="3"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={updatingDelivery}>
                        {updatingDelivery ? "Updating..." : "Update Delivery"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeliveryForm(false);
                          setDeliveryData({
                            deliveryAddress: {
                              street: "",
                              city: "",
                              province: "",
                              postalCode: "",
                              phone: "",
                              specialInstructions: "",
                            },
                            deliveryMethod: "pickup",
                            estimatedDeliveryDate: "",
                            deliveryTrackingNumber: "",
                            deliveryProvider: "",
                          });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="tab-content">
            <div className="disputes-section">
              <div className="section-header">
                <h3>Disputes</h3>
                {(user?.role === "customer" || user?.role === "tailor") && (
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    className="btn btn-primary"
                  >
                    Raise Dispute
                  </button>
                )}
              </div>

              {order.disputes && order.disputes.length > 0 ? (
                <div className="disputes-list">
                  {order.disputes.map((dispute) => (
                    <div key={dispute._id} className="dispute-item">
                      <div className="dispute-header">
                        <h4>Dispute #{dispute._id.toString().slice(-6)}</h4>
                        <span className={`dispute-status ${dispute.status}`}>
                          {dispute.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="dispute-details">
                        <p><strong>Reason:</strong> {dispute.reason.replace("_", " ").toUpperCase()}</p>
                        <p><strong>Description:</strong> {dispute.description}</p>
                        <p><strong>Raised On:</strong> {new Date(dispute.createdAt).toLocaleDateString()}</p>
                        {dispute.resolution && (
                          <p><strong>Resolution:</strong> {dispute.resolution}</p>
                        )}
                        {dispute.resolvedAt && (
                          <p><strong>Resolved On:</strong> {new Date(dispute.resolvedAt).toLocaleDateString()}</p>
                        )}
                        {dispute.attachments && dispute.attachments.length > 0 && (
                          <div className="dispute-attachments">
                            <strong>Attachments:</strong>
                            {dispute.attachments.map((att, idx) => (
                              <a key={idx} href={att} target="_blank" rel="noopener noreferrer">
                                Attachment {idx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      {dispute.status === "open" && (
                        <div className="dispute-actions">
                          {(user?.role === "admin" || 
                            (user?._id !== dispute.raisedBy && (user?.role === "customer" || user?.role === "tailor"))) && (
                            <div className="resolve-dispute-form">
                              <textarea
                                placeholder="Enter resolution..."
                                value={disputeResolution}
                                onChange={(e) => setDisputeResolution(e.target.value)}
                                rows="3"
                              />
                              <div className="resolve-actions">
                                <button
                                  onClick={() => handleResolveDispute(dispute._id, "resolved")}
                                  className="btn btn-primary"
                                  disabled={resolvingDispute || !disputeResolution}
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleResolveDispute(dispute._id, "rejected")}
                                  className="btn btn-secondary"
                                  disabled={resolvingDispute || !disputeResolution}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No disputes raised yet.</p>
              )}

              {showDisputeForm && (
                <div className="dispute-form-section">
                  <h4>Raise a Dispute</h4>
                  <form onSubmit={handleRaiseDispute} className="dispute-form">
                    <div className="form-group">
                      <label>Reason *</label>
                      <select
                        value={disputeData.reason}
                        onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="quality_issue">Quality Issue</option>
                        <option value="delivery_delay">Delivery Delay</option>
                        <option value="wrong_item">Wrong Item</option>
                        <option value="damage">Damage</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={disputeData.description}
                        onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                        required
                        rows="5"
                        placeholder="Please describe the issue in detail..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Attachments (Optional)</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleDisputeAttachmentChange}
                      />
                      {disputeAttachmentFiles.length > 0 && (
                        <div className="attachment-preview">
                          {disputeAttachmentFiles.map((file, idx) => (
                            <span key={idx}>{file.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={submittingDispute}>
                        {submittingDispute ? "Submitting..." : "Raise Dispute"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisputeForm(false);
                          setDisputeData({ reason: "", description: "", attachments: [] });
                          setDisputeAttachmentFiles([]);
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "alterations" && (
          <div className="tab-content">
            <div className="alterations-section">
              <div className="section-header">
                <h3>Alteration Requests</h3>
                {user?.role === "customer" && (
                  <button
                    onClick={() => setShowAlterationForm(true)}
                    className="btn btn-primary"
                  >
                    Request Alteration
                  </button>
                )}
              </div>

              {order.alterationRequests && order.alterationRequests.length > 0 ? (
                <div className="alterations-list">
                  {order.alterationRequests.map((alteration) => (
                    <div key={alteration._id} className="alteration-item">
                      <div className="alteration-header">
                        <h4>Alteration Request #{alteration._id.toString().slice(-6)}</h4>
                        <span className={`alteration-status ${alteration.status}`}>
                          {alteration.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className={`urgency-badge ${alteration.urgency}`}>
                          {alteration.urgency.toUpperCase()}
                        </span>
                      </div>
                      <div className="alteration-details">
                        <p><strong>Description:</strong> {alteration.description}</p>
                        <p><strong>Requested On:</strong> {new Date(alteration.createdAt).toLocaleDateString()}</p>
                        {alteration.estimatedCost && (
                          <p><strong>Estimated Cost:</strong> PKR {alteration.estimatedCost.toLocaleString()}</p>
                        )}
                        {alteration.estimatedTime && (
                          <p><strong>Estimated Time:</strong> {alteration.estimatedTime} days</p>
                        )}
                        {alteration.completedAt && (
                          <p><strong>Completed On:</strong> {new Date(alteration.completedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                      {user?.role === "tailor" && alteration.status === "pending" && (
                        <div className="alteration-actions">
                          <div className="alteration-update-form">
                            <div className="form-group">
                              <label>Status *</label>
                              <select
                                value={alterationUpdate.status}
                                onChange={(e) => setAlterationUpdate({ ...alterationUpdate, status: e.target.value })}
                              >
                                <option value="">Select status</option>
                                <option value="approved">Approve</option>
                                <option value="rejected">Reject</option>
                              </select>
                            </div>
                            {alterationUpdate.status === "approved" && (
                              <>
                                <div className="form-group">
                                  <label>Estimated Cost (PKR)</label>
                                  <input
                                    type="number"
                                    value={alterationUpdate.estimatedCost}
                                    onChange={(e) => setAlterationUpdate({ ...alterationUpdate, estimatedCost: e.target.value })}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Estimated Time (days)</label>
                                  <input
                                    type="number"
                                    value={alterationUpdate.estimatedTime}
                                    onChange={(e) => setAlterationUpdate({ ...alterationUpdate, estimatedTime: e.target.value })}
                                    min="1"
                                  />
                                </div>
                              </>
                            )}
                            <button
                              onClick={() => handleUpdateAlterationStatus(alteration._id)}
                              className="btn btn-primary"
                              disabled={updatingAlteration || !alterationUpdate.status}
                            >
                              {updatingAlteration ? "Updating..." : "Update Status"}
                            </button>
                          </div>
                        </div>
                      )}
                      {user?.role === "tailor" && alteration.status === "approved" && (
                        <button
                          onClick={() => handleUpdateAlterationStatus(alteration._id, "in_progress")}
                          className="btn btn-primary"
                          disabled={updatingAlteration}
                        >
                          Mark as In Progress
                        </button>
                      )}
                      {user?.role === "tailor" && alteration.status === "in_progress" && (
                        <button
                          onClick={() => handleUpdateAlterationStatus(alteration._id, "completed")}
                          className="btn btn-primary"
                          disabled={updatingAlteration}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No alteration requests yet.</p>
              )}

              {showAlterationForm && (
                <div className="alteration-form-section">
                  <h4>Request Alteration</h4>
                  <form onSubmit={handleRequestAlteration} className="alteration-form">
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={alterationData.description}
                        onChange={(e) => setAlterationData({ ...alterationData, description: e.target.value })}
                        required
                        rows="5"
                        placeholder="Describe the alteration you need..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Urgency</label>
                      <select
                        value={alterationData.urgency}
                        onChange={(e) => setAlterationData({ ...alterationData, urgency: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={submittingAlteration}>
                        {submittingAlteration ? "Submitting..." : "Request Alteration"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAlterationForm(false);
                          setAlterationData({ description: "", urgency: "medium" });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "refunds" && (
          <div className="tab-content">
            <div className="refunds-section">
              <div className="section-header">
                <h3>Refund Requests</h3>
                {user?.role === "customer" && (
                  <button
                    onClick={() => {
                      setRefundData({
                        reason: "",
                        description: "",
                        requestedAmount: (order.totalPrice - (order.totalPaid || 0)).toString(),
                      });
                      setShowRefundForm(true);
                    }}
                    className="btn btn-primary"
                  >
                    Request Refund
                  </button>
                )}
              </div>

              {order.refundRequests && order.refundRequests.length > 0 ? (
                <div className="refunds-list">
                  {order.refundRequests.map((refund) => (
                    <div key={refund._id} className="refund-item">
                      <div className="refund-header">
                        <h4>Refund Request #{refund._id.toString().slice(-6)}</h4>
                        <span className={`refund-status ${refund.status}`}>
                          {refund.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="refund-details">
                        <p><strong>Reason:</strong> {refund.reason.replace("_", " ").toUpperCase()}</p>
                        <p><strong>Description:</strong> {refund.description}</p>
                        <p><strong>Requested Amount:</strong> PKR {refund.requestedAmount.toLocaleString()}</p>
                        <p><strong>Requested On:</strong> {new Date(refund.createdAt).toLocaleDateString()}</p>
                        {refund.processedAt && (
                          <p><strong>Processed On:</strong> {new Date(refund.processedAt).toLocaleDateString()}</p>
                        )}
                        {refund.transactionId && (
                          <p><strong>Transaction ID:</strong> {refund.transactionId}</p>
                        )}
                      </div>
                      {user?.role === "tailor" && refund.status === "pending" && (
                        <div className="refund-actions">
                          <div className="refund-process-form">
                            <div className="form-group">
                              <label>Status *</label>
                              <select
                                value={refundStatus}
                                onChange={(e) => setRefundStatus(e.target.value)}
                              >
                                <option value="">Select status</option>
                                <option value="approved">Approve</option>
                                <option value="rejected">Reject</option>
                              </select>
                            </div>
                            {refundStatus === "approved" && (
                              <div className="form-group">
                                <label>Transaction ID</label>
                                <input
                                  type="text"
                                  value={refundTransactionId}
                                  onChange={(e) => setRefundTransactionId(e.target.value)}
                                  placeholder="Enter refund transaction ID"
                                />
                              </div>
                            )}
                            <button
                              onClick={() => handleProcessRefund(refund._id)}
                              className="btn btn-primary"
                              disabled={processingRefund || !refundStatus}
                            >
                              {processingRefund ? "Processing..." : "Process Refund"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No refund requests yet.</p>
              )}

              {showRefundForm && (
                <div className="refund-form-section">
                  <h4>Request Refund</h4>
                  <form onSubmit={handleRequestRefund} className="refund-form">
                    <div className="form-group">
                      <label>Reason *</label>
                      <select
                        value={refundData.reason}
                        onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="defective">Defective</option>
                        <option value="wrong_item">Wrong Item</option>
                        <option value="not_as_described">Not as Described</option>
                        <option value="customer_change_mind">Change of Mind</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={refundData.description}
                        onChange={(e) => setRefundData({ ...refundData, description: e.target.value })}
                        required
                        rows="5"
                        placeholder="Please describe why you need a refund..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Requested Amount (PKR) *</label>
                      <input
                        type="number"
                        value={refundData.requestedAmount}
                        onChange={(e) => setRefundData({ ...refundData, requestedAmount: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={submittingRefund}>
                        {submittingRefund ? "Submitting..." : "Request Refund"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRefundForm(false);
                          setRefundData({ reason: "", description: "", requestedAmount: "" });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "emergency" && (
          <div className="tab-content">
            <div className="emergency-section">
              <div className="section-header">
                <h3>Emergency Contact</h3>
                {(user?.role === "customer" || user?.role === "tailor") && (
                  <button
                    onClick={() => {
                      if (order.emergencyContact) {
                        setEmergencyContactData({
                          name: order.emergencyContact.name || "",
                          phone: order.emergencyContact.phone || "",
                          relationship: order.emergencyContact.relationship || "",
                          availableHours: order.emergencyContact.availableHours || "",
                        });
                      }
                      setShowEmergencyContactForm(true);
                    }}
                    className="btn btn-primary"
                  >
                    {order.emergencyContact ? "Update Contact" : "Add Contact"}
                  </button>
                )}
              </div>

              {order.emergencyContact ? (
                <div className="emergency-contact-info">
                  <p><strong>Name:</strong> {order.emergencyContact.name}</p>
                  <p><strong>Phone:</strong> {order.emergencyContact.phone}</p>
                  {order.emergencyContact.relationship && (
                    <p><strong>Relationship:</strong> {order.emergencyContact.relationship}</p>
                  )}
                  {order.emergencyContact.availableHours && (
                    <p><strong>Available Hours:</strong> {order.emergencyContact.availableHours}</p>
                  )}
                </div>
              ) : (
                <p>No emergency contact set yet.</p>
              )}

              {showEmergencyContactForm && (
                <div className="emergency-contact-form-section">
                  <h4>{order.emergencyContact ? "Update Emergency Contact" : "Add Emergency Contact"}</h4>
                  <form onSubmit={handleUpdateEmergencyContact} className="emergency-contact-form">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={emergencyContactData.name}
                        onChange={(e) => setEmergencyContactData({ ...emergencyContactData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        value={emergencyContactData.phone}
                        onChange={(e) => setEmergencyContactData({ ...emergencyContactData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Relationship</label>
                      <input
                        type="text"
                        value={emergencyContactData.relationship}
                        onChange={(e) => setEmergencyContactData({ ...emergencyContactData, relationship: e.target.value })}
                        placeholder="e.g., Spouse, Parent, Friend, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Available Hours</label>
                      <input
                        type="text"
                        value={emergencyContactData.availableHours}
                        onChange={(e) => setEmergencyContactData({ ...emergencyContactData, availableHours: e.target.value })}
                        placeholder="e.g., 9 AM - 5 PM, Monday to Friday"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={updatingEmergencyContact}>
                        {updatingEmergencyContact ? "Updating..." : "Save Contact"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmergencyContactForm(false);
                          setEmergencyContactData({ name: "", phone: "", relationship: "", availableHours: "" });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
