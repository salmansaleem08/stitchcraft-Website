import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
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

  return (
    <div className="order-dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1>{user?.role === "customer" ? "My orders" : "Order management"}</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {(user?.role === "customer" || user?.role === "supplier") && (
          <div className="order-tabs">
            {user?.role === "customer" && (
              <>
                <button
                  className={`tab-btn ${activeTab === "tailor" ? "active" : ""}`}
                  onClick={() => setActiveTab("tailor")}
                >
                  Tailor orders ({orders.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "supply" ? "active" : ""}`}
                  onClick={() => setActiveTab("supply")}
                >
                  Supply orders ({supplyOrders.length})
                </button>
              </>
            )}
            {user?.role === "supplier" && (
              <>
                <button
                  className={`tab-btn ${activeTab === "supply" ? "active" : ""}`}
                  onClick={() => setActiveTab("supply")}
                >
                  Supply orders ({supplyOrders.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "bulk" ? "active" : ""}`}
                  onClick={() => setActiveTab("bulk")}
                >
                  Bulk orders ({bulkOrders.length})
                </button>
              </>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {activeTab === "tailor" && (
          <>
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No tailor orders found</p>
                {user?.role === "customer" && (
                  <Link to="/tailors" className="btn btn-primary">
                    Find a tailor
                  </Link>
                )}
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order.orderNumber}</h3>
                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="order-detail-row">
                        <span className="detail-label">Garment:</span>
                        <span className="detail-value">{order.garmentType}</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="detail-label">Service:</span>
                        <span className="detail-value">{order.serviceType}</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value">PKR {order.totalPrice?.toLocaleString() || 0}</span>
                      </div>
                      {user?.role === "customer" ? (
                        <div className="order-detail-row">
                          <span className="detail-label">Tailor:</span>
                          <span className="detail-value">
                            {order.tailor?.shopName || order.tailor?.name}
                          </span>
                        </div>
                      ) : (
                        <div className="order-detail-row">
                          <span className="detail-label">Customer:</span>
                          <span className="detail-value">{order.customer?.name}</span>
                        </div>
                      )}
                      {order.estimatedCompletionDate && (
                        <div className="order-detail-row">
                          <span className="detail-label">Due:</span>
                          <span className="detail-value">
                            {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
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
                <p>No supply orders found</p>
                {user?.role === "customer" && (
                  <Link to="/supplies" className="btn btn-primary">
                    Browse supplies
                  </Link>
                )}
              </div>
            ) : (
              <div className="orders-list">
                {supplyOrders.map((order) => (
                  <Link key={order._id} to={`/supply-orders/${order._id}`} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Supply Order #{order.orderNumber || order._id.slice(-8)}</h3>
                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                        {user?.role === "supplier" && (
                          <p className="order-customer">Customer: {order.customer?.name}</p>
                        )}
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="order-detail-row">
                        <span className="detail-label">Items:</span>
                        <span className="detail-value">{order.items?.length || 0} item(s)</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value">PKR {order.finalPrice?.toLocaleString() || 0}</span>
                      </div>
                      {user?.role === "customer" && (
                        <div className="order-detail-row">
                          <span className="detail-label">Supplier:</span>
                          <span className="detail-value">
                            {order.supplier?.businessName || order.supplier?.name}
                          </span>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="order-detail-row">
                          <span className="detail-label">Tracking:</span>
                          <span className="detail-value">{order.trackingNumber}</span>
                        </div>
                      )}
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
                <p>No bulk orders found</p>
              </div>
            ) : (
              <div className="orders-list">
                {bulkOrders.map((order) => (
                  <Link key={order._id} to={`/bulk-orders/${order._id}`} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Bulk Order #{order.orderNumber || order._id.slice(-8)}</h3>
                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="order-customer">Customer: {order.customer?.name}</p>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="order-detail-row">
                        <span className="detail-label">Items:</span>
                        <span className="detail-value">{order.items?.length || 0} fabric(s)</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value">PKR {order.totalPrice?.toLocaleString() || 0}</span>
                      </div>
                      {order.trackingNumber && (
                        <div className="order-detail-row">
                          <span className="detail-label">Tracking:</span>
                          <span className="detail-value">{order.trackingNumber}</span>
                        </div>
                      )}
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
