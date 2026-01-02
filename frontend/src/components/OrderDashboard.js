import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  FaCheckCircle, FaTimesCircle, 
  FaClock, FaSpinner, FaCalendarAlt,
  FaTruck, FaBox, FaFilter, FaShoppingBag
} from "react-icons/fa";
import "./OrderDashboard.css";

const OrderDashboard = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [supplyOrders, setSupplyOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState(user?.role === "supplier" ? "supply" : "tailor");

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : "";
      
      if (user?.role === "supplier") {
        if (activeTab === "supply") {
          const response = await api.get(`/supply-orders${params}`);
          setSupplyOrders(response.data.data);
          setBulkOrders([]);
          setOrders([]);
        } else if (activeTab === "bulk") {
          const response = await api.get(`/bulk-orders${params}`);
          setBulkOrders(response.data.data);
          setSupplyOrders([]);
          setOrders([]);
        }
      } else {
        if (activeTab === "tailor") {
          const response = await api.get(`/orders${params}`);
          setOrders(response.data.data);
          setSupplyOrders([]);
        } else if (activeTab === "supply") {
          const response = await api.get(`/supply-orders${params}`);
          setSupplyOrders(response.data.data);
          setOrders([]);
        }
      }
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
      confirmed: "status-confirmed",
      approved: "status-confirmed",
      booked: "status-booked",
      consultation_scheduled: "status-scheduled",
      consultation_completed: "status-scheduled",
      fabric_selected: "status-progress",
      in_progress: "status-progress",
      processing: "status-processing",
      revision_requested: "status-revision",
      quality_check: "status-progress",
      shipped: "status-shipped",
      on_way: "status-on-way",
      delivered: "status-delivered",
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
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: <FaClock />,
      confirmed: <FaCheckCircle />,
      approved: <FaCheckCircle />,
      booked: <FaCheckCircle />,
      consultation_scheduled: <FaCalendarAlt />,
      consultation_completed: <FaCalendarAlt />,
      fabric_selected: <FaSpinner />,
      in_progress: <FaSpinner />,
      processing: <FaSpinner />,
      revision_requested: <FaClock />,
      quality_check: <FaSpinner />,
      shipped: <FaTruck />,
      on_way: <FaTruck />,
      delivered: <FaCheckCircle />,
      completed: <FaCheckCircle />,
      cancelled: <FaTimesCircle />,
    };
    return statusIcons[status] || <FaClock />;
  };

  return (
    <div className="order-dashboard-container">
      <div className="container">
        <div className="page-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>{user?.role === "customer" ? "My Orders" : "Order Management"}</h1>
              <p className="dashboard-subtitle">
                {user?.role === "customer" 
                  ? "Track and manage all your tailor and supply orders in one place. Monitor order status, view details, and stay updated on your purchases."
                  : "Efficiently manage, track, and update all your orders. Monitor order status, track shipments, and ensure timely delivery to customers."}
              </p>
            </div>
          </div>
        </div>

        {(user?.role === "customer" || user?.role === "supplier") && (
          <div className="order-tabs">
            {user?.role === "customer" && (
              <>
                <button
                  className={`tab-btn ${activeTab === "tailor" ? "active" : ""}`}
                  onClick={() => setActiveTab("tailor")}
                >
                  <FaShoppingBag className="tab-icon" />
                  Tailor Orders
                </button>
                <button
                  className={`tab-btn ${activeTab === "supply" ? "active" : ""}`}
                  onClick={() => setActiveTab("supply")}
                >
                  <FaBox className="tab-icon" />
                  Supply Orders
                </button>
              </>
            )}
            {user?.role === "supplier" && (
              <>
                <button
                  className={`tab-btn ${activeTab === "supply" ? "active" : ""}`}
                  onClick={() => setActiveTab("supply")}
                >
                  <FaBox className="tab-icon" />
                  Supply Orders
                </button>
                <button
                  className={`tab-btn ${activeTab === "bulk" ? "active" : ""}`}
                  onClick={() => setActiveTab("bulk")}
                >
                  <FaBox className="tab-icon" />
                  Bulk Orders
                </button>
              </>
            )}
          </div>
        )}

        <div className="filters-section">
          <div className="filter-badge-group">
            <button
              className={`filter-badge ${statusFilter === "" ? "active" : ""}`}
              onClick={() => setStatusFilter("")}
            >
              <FaFilter className="filter-icon" />
              All Status
            </button>
            <button
              className={`filter-badge ${statusFilter === "pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`filter-badge ${statusFilter === "confirmed" ? "active" : ""}`}
              onClick={() => setStatusFilter("confirmed")}
            >
              Confirmed
            </button>
            <button
              className={`filter-badge ${statusFilter === "processing" ? "active" : ""}`}
              onClick={() => setStatusFilter("processing")}
            >
              Processing
            </button>
            <button
              className={`filter-badge ${statusFilter === "shipped" ? "active" : ""}`}
              onClick={() => setStatusFilter("shipped")}
            >
              Shipped
            </button>
            <button
              className={`filter-badge ${statusFilter === "delivered" ? "active" : ""}`}
              onClick={() => setStatusFilter("delivered")}
            >
              Delivered
            </button>
            <button
              className={`filter-badge ${statusFilter === "completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </button>
            <button
              className={`filter-badge ${statusFilter === "cancelled" ? "active" : ""}`}
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === "tailor" && (
          <>
            {orders.length === 0 ? (
              <div className="empty-state">
                <FaShoppingBag className="empty-icon" />
                <p>No tailor orders found</p>
                {user?.role === "customer" && (
                  <Link to="/tailors" className="btn btn-primary">
                    Find a tailor
                  </Link>
                )}
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => (
                  <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id">#{order.orderNumber || order._id.slice(-8)}</div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <div className="order-service">{order.garmentType || "Garment"}</div>
                      {order.serviceType && (
                        <div className="order-service-type">{order.serviceType}</div>
                      )}
                      {user?.role === "customer" && order.tailor && (
                        <div className="order-customer">
                          <span className="order-label">Tailor:</span> {order.tailor?.shopName || order.tailor?.name}
                        </div>
                      )}
                      {user?.role !== "customer" && order.customer && (
                        <div className="order-customer">
                          <span className="order-label">Customer:</span> {order.customer?.name}
                        </div>
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
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "supply" && (
          <>
            {supplyOrders.length === 0 ? (
              <div className="empty-state">
                <FaBox className="empty-icon" />
                <p>No supply orders found</p>
                {user?.role === "customer" && (
                  <Link to="/supplies" className="btn btn-primary">
                    Browse supplies
                  </Link>
                )}
              </div>
            ) : (
              <div className="orders-grid">
                {supplyOrders.map((order) => (
                  <Link key={order._id} to={`/supply-orders/${order._id}`} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id">Supply #{order.orderNumber || order._id.slice(-8)}</div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <div className="order-service">{order.items?.length || 0} Item(s)</div>
                      {user?.role === "customer" && order.supplier && (
                        <div className="order-customer">
                          <span className="order-label">Supplier:</span> {order.supplier?.businessName || order.supplier?.name}
                        </div>
                      )}
                      {user?.role === "supplier" && order.customer && (
                        <div className="order-customer">
                          <span className="order-label">Customer:</span> {order.customer?.name}
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="order-tracking">
                          <FaTruck className="tracking-icon" />
                          <span>{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                    <div className="order-card-footer">
                      <div className="order-amount">PKR {order.finalPrice?.toLocaleString() || 0}</div>
                      <div className="order-date">
                        <FaCalendarAlt className="date-icon" />
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "bulk" && (
          <>
            {bulkOrders.length === 0 ? (
              <div className="empty-state">
                <FaBox className="empty-icon" />
                <p>No bulk orders found</p>
              </div>
            ) : (
              <div className="orders-grid">
                {bulkOrders.map((order) => (
                  <Link key={order._id} to={`/bulk-orders/${order._id}`} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id">Bulk #{order.orderNumber || order._id.slice(-8)}</div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <div className="order-service">{order.items?.length || 0} Fabric(s)</div>
                      {order.customer && (
                        <div className="order-customer">
                          <span className="order-label">Customer:</span> {order.customer?.name}
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="order-tracking">
                          <FaTruck className="tracking-icon" />
                          <span>{order.trackingNumber}</span>
                        </div>
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
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;
