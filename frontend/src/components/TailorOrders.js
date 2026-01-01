import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  FaSearch, FaFilter, FaSort, FaCheckCircle, FaTimesCircle, 
  FaClock, FaSpinner, FaExclamationTriangle, FaCalendarAlt,
  FaEye, FaEdit
} from "react-icons/fa";
import "./TailorOrders.css";

const TailorOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "kanban"

  useEffect(() => {
    if (user && user.role === "tailor") {
      fetchOrders();
    }
  }, [user, statusFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      // Note: Backend doesn't support sort parameter yet, will sort client-side
      
      const queryString = params.length > 0 ? `?${params.join("&")}` : "";
      const response = await api.get(`/orders${queryString}`);
      setOrders(response.data.data || []);
      setError("");
    } catch (error) {
      setError("Failed to load orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus || !selectedOrder) return;

    setUpdatingStatus(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        notes: statusNotes,
      });
      setSuccess("Order status updated successfully");
      setShowStatusUpdate(false);
      setNewStatus("");
      setStatusNotes("");
      setSelectedOrder(null);
      fetchOrders();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
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

  const filteredOrders = orders
    .filter((order) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.garmentType?.toLowerCase().includes(searchLower) ||
        order.serviceType?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-high":
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        case "price-low":
          return (a.totalPrice || 0) - (b.totalPrice || 0);
        default:
          return 0;
      }
    });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    revision_requested: orders.filter((o) => o.status === "revision_requested").length,
    quality_check: orders.filter((o) => o.status === "quality_check").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="tailor-orders-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tailor-orders-container">
      <div className="container">
        <div className="page-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Order Management</h1>
              <p className="dashboard-subtitle">
                Efficiently manage, track, and update all your tailoring orders. Monitor order status, 
                communicate with customers, and ensure timely delivery of quality garments.
              </p>
            </div>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                Grid View
              </button>
              <button
                className={`view-btn ${viewMode === "kanban" ? "active" : ""}`}
                onClick={() => setViewMode("kanban")}
              >
                Queue View
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="orders-filters">
          <div className="filter-group">
            <label>
              <FaSearch className="filter-icon" />
              Search Orders
            </label>
            <div className="input-wrapper">
              <FaSearch className="input-icon" />
              <input
                type="text"
                placeholder="Search by order number, customer, or garment type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>
              <FaFilter className="filter-icon" />
              Filter by Status
            </label>
            <div className="select-wrapper">
              <FaFilter className="input-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Orders ({statusCounts.all})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
                <option value="revision_requested">Revision Requested ({statusCounts.revision_requested})</option>
                <option value="quality_check">Quality Check ({statusCounts.quality_check})</option>
                <option value="completed">Completed ({statusCounts.completed})</option>
                <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>
              <FaSort className="filter-icon" />
              Sort By
            </label>
            <div className="select-wrapper">
              <FaSort className="input-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {viewMode === "kanban" ? (
          <div className="kanban-board">
            <div className="kanban-column">
              <div className="kanban-column-header">
                <h3>Pending ({orders.filter((o) => o.status === "pending" || o.status === "consultation_scheduled").length})</h3>
              </div>
              <div className="kanban-column-content">
                {filteredOrders
                  .filter((o) => o.status === "pending" || o.status === "consultation_scheduled")
                  .map((order) => (
                    <div key={order._id} className="kanban-card">
                      <div className="kanban-card-header">
                        <span className="kanban-order-number">#{order.orderNumber || order._id.toString().slice(-6)}</span>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="kanban-card-body">
                        <p className="kanban-customer">{order.customer?.name || "N/A"}</p>
                        <p className="kanban-garment">{order.garmentType}</p>
                        <p className="kanban-price">PKR {order.totalPrice?.toLocaleString() || 0}</p>
                        {order.estimatedCompletionDate && (
                          <p className="kanban-date">
                            Due: {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="kanban-card-actions">
                        <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                          View
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setShowStatusUpdate(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="kanban-column">
              <div className="kanban-column-header">
                <h3>In Progress ({orders.filter((o) => o.status === "in_progress" || o.status === "fabric_selected" || o.status === "consultation_completed").length})</h3>
              </div>
              <div className="kanban-column-content">
                {filteredOrders
                  .filter((o) => o.status === "in_progress" || o.status === "fabric_selected" || o.status === "consultation_completed")
                  .map((order) => (
                    <div key={order._id} className="kanban-card">
                      <div className="kanban-card-header">
                        <span className="kanban-order-number">#{order.orderNumber || order._id.toString().slice(-6)}</span>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="kanban-card-body">
                        <p className="kanban-customer">{order.customer?.name || "N/A"}</p>
                        <p className="kanban-garment">{order.garmentType}</p>
                        <p className="kanban-price">PKR {order.totalPrice?.toLocaleString() || 0}</p>
                        {order.estimatedCompletionDate && (
                          <p className="kanban-date">
                            Due: {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="kanban-card-actions">
                        <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                          View
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setShowStatusUpdate(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="kanban-column">
              <div className="kanban-column-header">
                <h3>Review ({orders.filter((o) => o.status === "revision_requested" || o.status === "quality_check").length})</h3>
              </div>
              <div className="kanban-column-content">
                {filteredOrders
                  .filter((o) => o.status === "revision_requested" || o.status === "quality_check")
                  .map((order) => (
                    <div key={order._id} className="kanban-card">
                      <div className="kanban-card-header">
                        <span className="kanban-order-number">#{order.orderNumber || order._id.toString().slice(-6)}</span>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="kanban-card-body">
                        <p className="kanban-customer">{order.customer?.name || "N/A"}</p>
                        <p className="kanban-garment">{order.garmentType}</p>
                        <p className="kanban-price">PKR {order.totalPrice?.toLocaleString() || 0}</p>
                        {order.estimatedCompletionDate && (
                          <p className="kanban-date">
                            Due: {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="kanban-card-actions">
                        <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                          View
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setShowStatusUpdate(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="kanban-column">
              <div className="kanban-column-header">
                <h3>Completed ({orders.filter((o) => o.status === "completed").length})</h3>
              </div>
              <div className="kanban-column-content">
                {filteredOrders
                  .filter((o) => o.status === "completed")
                  .map((order) => (
                    <div key={order._id} className="kanban-card">
                      <div className="kanban-card-header">
                        <span className="kanban-order-number">#{order.orderNumber || order._id.toString().slice(-6)}</span>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="kanban-card-body">
                        <p className="kanban-customer">{order.customer?.name || "N/A"}</p>
                        <p className="kanban-garment">{order.garmentType}</p>
                        <p className="kanban-price">PKR {order.totalPrice?.toLocaleString() || 0}</p>
                        <p className="kanban-date">
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="kanban-card-actions">
                        <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="orders-grid">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const getStatusIcon = (status) => {
                if (status === "completed") return <FaCheckCircle className="status-icon status-icon-success" />;
                if (status === "cancelled") return <FaTimesCircle className="status-icon status-icon-danger" />;
                if (status === "in_progress" || status === "fabric_selected") return <FaSpinner className="status-icon status-icon-warning" />;
                if (status === "revision_requested" || status === "quality_check") return <FaExclamationTriangle className="status-icon status-icon-warning" />;
                return <FaClock className="status-icon status-icon-info" />;
              };

              return (
                <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id">#{order.orderNumber || order._id}</div>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-service">{order.garmentType || "Garment"}</div>
                    {order.customer?.name && (
                      <div className="order-customer">{order.customer.name}</div>
                    )}
                  </div>
                  <div className="order-card-footer">
                    <div className="order-amount">PKR {order.totalPrice?.toLocaleString() || 0}</div>
                    <div className="order-date">
                      <FaCalendarAlt className="date-icon" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="no-orders">
              <p>No orders found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="btn btn-secondary"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {showStatusUpdate && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowStatusUpdate(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Order Status</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowStatusUpdate(false);
                    setSelectedOrder(null);
                    setNewStatus("");
                    setStatusNotes("");
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleStatusUpdate} className="status-update-form">
                <div className="form-group">
                  <label>Order Number</label>
                  <input
                    type="text"
                    value={selectedOrder.orderNumber || selectedOrder._id.toString().slice(-6)}
                    disabled
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Current Status</label>
                  <input
                    type="text"
                    value={formatStatus(selectedOrder.status)}
                    disabled
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>New Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="form-input"
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="consultation_scheduled">Consultation Scheduled</option>
                    <option value="consultation_completed">Consultation Completed</option>
                    <option value="fabric_selected">Fabric Selected</option>
                    <option value="in_progress">In Progress</option>
                    <option value="revision_requested">Revision Requested</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows="4"
                    className="form-input"
                    placeholder="Add any notes about this status update..."
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusUpdate(false);
                      setSelectedOrder(null);
                      setNewStatus("");
                      setStatusNotes("");
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updatingStatus || !newStatus}
                  >
                    {updatingStatus ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorOrders;

