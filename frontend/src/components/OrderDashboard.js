import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./OrderDashboard.css";

const OrderDashboard = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await api.get(`/orders${params}`);
      setOrders(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "status-pending",
      consultation_scheduled: "status-scheduled",
      consultation_completed: "status-scheduled",
      fabric_selected: "status-progress",
      in_progress: "status-progress",
      revision_requested: "status-revision",
      quality_check: "status-progress",
      completed: "status-completed",
      cancelled: "status-cancelled",
    };
    return statusClasses[status] || "status-pending";
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="order-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1>
            {user?.role === "customer" ? "My Orders" : "Order Management"}
          </h1>
          <div className="filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="consultation_scheduled">Consultation Scheduled</option>
              <option value="fabric_selected">Fabric Selected</option>
              <option value="in_progress">In Progress</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="quality_check">Quality Check</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found</p>
            {user?.role === "customer" && (
              <Link to="/tailors" className="btn btn-primary">
                Find a Tailor
              </Link>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h3>Order #{order.orderNumber}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-info">
                    <div className="info-item">
                      <span className="info-label">Garment:</span>
                      <span className="info-value">{order.garmentType}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Service:</span>
                      <span className="info-value">{order.serviceType}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total Price:</span>
                      <span className="info-value">PKR {order.totalPrice}</span>
                    </div>
                    {user?.role === "customer" ? (
                      <div className="info-item">
                        <span className="info-label">Tailor:</span>
                        <span className="info-value">
                          {order.tailor?.shopName || order.tailor?.name}
                        </span>
                      </div>
                    ) : (
                      <div className="info-item">
                        <span className="info-label">Customer:</span>
                        <span className="info-value">{order.customer?.name}</span>
                      </div>
                    )}
                  </div>

                  {order.estimatedCompletionDate && (
                    <div className="completion-date">
                      <span>Estimated Completion: </span>
                      <span>
                        {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-card-actions">
                  <Link to={`/orders/${order._id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;

