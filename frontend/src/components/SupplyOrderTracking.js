import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplyOrderTracking.css";

const SupplyOrderTracking = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    trackingNumber: "",
    note: "",
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/supply-orders/${id}`);
      setOrder(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load order details");
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.put(`/supply-orders/${id}/status`, statusUpdate);
      await fetchOrder();
      setStatusUpdate({ status: "", trackingNumber: "", note: "" });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await api.post(`/supply-orders/${id}/cancel`);
      await fetchOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      processing: "status-processing",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return statusClasses[status] || "status-pending";
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="supply-order-tracking-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="supply-order-tracking-container">
        <div className="error-message">{error}</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="supply-order-tracking-container">
        <div className="error-message">Order not found</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCustomer = user?.role === "customer" && user?._id === order.customer._id;
  const isSupplier = user?.role === "supplier" && user?._id === order.supplier._id;

  return (
    <div className="supply-order-tracking-container">
      <div className="container">
        <Link to="/orders" className="back-link">
          ← Back to Orders
        </Link>

        <div className="order-header">
          <div>
            <h1>Supply Order #{order._id.slice(-8)}</h1>
            <p className="order-date">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`status-badge-large ${getStatusBadgeClass(order.status)}`}>
            {formatStatus(order.status)}
          </span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="order-content">
          <div className="order-main">
            <div className="order-section">
              <h2>Order Items</h2>
              <div className="items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="item-image">
                      {item.supply?.images && item.supply.images.length > 0 ? (
                        <img src={item.supply.images[0]} alt={item.supply.name} />
                      ) : (
                        <div className="item-placeholder">
                          {item.supply?.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                      )}
                    </div>
                    <div className="item-details">
                      <h3>{item.supply?.name || "Supply"}</h3>
                      <p className="item-category">{item.supply?.category}</p>
                      <div className="item-quantity-price">
                        <span>Quantity: {item.quantity} {item.unit}</span>
                        <span>Price: PKR {item.price?.toLocaleString()}/{item.unit}</span>
                        <span className="item-subtotal">
                          Subtotal: PKR {item.subtotal?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-section">
              <h2>Shipping Address</h2>
              <div className="shipping-address">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {order.notes && (
              <div className="order-section">
                <h2>Order Notes</h2>
                <p>{order.notes}</p>
              </div>
            )}

            <div className="order-section">
              <h2>Order Timeline</h2>
              <div className="timeline">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-status">{formatStatus(event.status)}</span>
                        <span className="timeline-date">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.note && <p className="timeline-note">{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-sidebar">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>PKR {order.totalPrice?.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="summary-row">
                  <span>Discount:</span>
                  <span>- PKR {order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total:</span>
                <span>PKR {order.finalPrice?.toLocaleString()}</span>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="tracking-info">
                <h3>Tracking Number</h3>
                <p className="tracking-number">{order.trackingNumber}</p>
              </div>
            )}

            {isSupplier && order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="status-update-form">
                <h3>Update Order Status</h3>
                <form onSubmit={handleStatusUpdate}>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      value={statusUpdate.status}
                      onChange={(e) =>
                        setStatusUpdate({ ...statusUpdate, status: e.target.value })
                      }
                      required
                    >
                      <option value="">Select status</option>
                      {order.status === "pending" && (
                        <option value="confirmed">Confirmed</option>
                      )}
                      {order.status === "confirmed" && (
                        <option value="processing">Processing</option>
                      )}
                      {order.status === "processing" && (
                        <option value="shipped">Shipped</option>
                      )}
                      {order.status === "shipped" && (
                        <option value="delivered">Delivered</option>
                      )}
                    </select>
                  </div>

                  {statusUpdate.status === "shipped" && (
                    <div className="form-group">
                      <label htmlFor="trackingNumber">Tracking Number</label>
                      <input
                        type="text"
                        id="trackingNumber"
                        value={statusUpdate.trackingNumber}
                        onChange={(e) =>
                          setStatusUpdate({ ...statusUpdate, trackingNumber: e.target.value })
                        }
                        placeholder="Enter tracking number"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="note">Note (Optional)</label>
                    <textarea
                      id="note"
                      value={statusUpdate.note}
                      onChange={(e) =>
                        setStatusUpdate({ ...statusUpdate, note: e.target.value })
                      }
                      rows="3"
                      placeholder="Add a note..."
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={updating}>
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </form>
              </div>
            )}

            {isCustomer && ["pending", "confirmed"].includes(order.status) && (
              <div className="cancel-order">
                <button onClick={handleCancel} className="btn btn-danger btn-block">
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyOrderTracking;

