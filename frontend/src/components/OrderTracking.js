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

  useEffect(() => {
    fetchOrder();
  }, [id]);

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

  if (error || !order) {
    return (
      <div className="order-tracking-container">
        <div className="error-message">{error || "Order not found"}</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

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

  return (
    <div className="order-tracking-container">
      <div className="container">
        <div className="order-header">
          <div>
            <h1>Order #{order.orderNumber}</h1>
            <p className="order-date">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="order-status-badge">
            <span className={`status ${order.status}`}>
              {order.status.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="order-timeline">
          <h2>Order Timeline</h2>
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
                    <p>{new Date(order.timeline[index].updatedAt).toLocaleDateString()}</p>
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
            <div className="detail-item">
              <span className="detail-label">Base Price:</span>
              <span className="detail-value">PKR {order.basePrice}</span>
            </div>
            {order.fabricCost > 0 && (
              <div className="detail-item">
                <span className="detail-label">Fabric Cost:</span>
                <span className="detail-value">PKR {order.fabricCost}</span>
              </div>
            )}
            {order.additionalCharges > 0 && (
              <div className="detail-item">
                <span className="detail-label">Additional Charges:</span>
                <span className="detail-value">PKR {order.additionalCharges}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="detail-item">
                <span className="detail-label">Discount:</span>
                <span className="detail-value">- PKR {order.discount}</span>
              </div>
            )}
            <div className="detail-item total">
              <span className="detail-label">Total Price:</span>
              <span className="detail-value">PKR {order.totalPrice}</span>
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
    </div>
  );
};

export default OrderTracking;

