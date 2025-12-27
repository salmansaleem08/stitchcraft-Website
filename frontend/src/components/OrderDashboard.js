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
        // Suppliers see their supply and bulk orders
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
        // Customers see their tailor and supply orders
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
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
                  Tailor Orders ({orders.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "supply" ? "active" : ""}`}
                  onClick={() => setActiveTab("supply")}
                >
                  Supply Orders ({supplyOrders.length})
                </button>
              </>
            )}
            {user?.role === "supplier" && (
              <>
                <button
                  className={`tab-btn ${activeTab === "supply" ? "active" : ""}`}
                  onClick={() => setActiveTab("supply")}
                >
                  Supply Orders ({supplyOrders.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "bulk" ? "active" : ""}`}
                  onClick={() => setActiveTab("bulk")}
                >
                  Bulk Orders ({bulkOrders.length})
                </button>
              </>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {activeTab === "tailor" && (
          <>
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>No tailor orders found</p>
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
          </>
        )}

        {activeTab === "supply" && (
          <>
            {supplyOrders.length === 0 ? (
              <div className="no-orders">
                <p>No supply orders found</p>
                {user?.role === "customer" && (
                  <Link to="/supplies" className="btn btn-primary">
                    Browse Supplies
                  </Link>
                )}
              </div>
            ) : (
              <div className="orders-list">
                {supplyOrders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <h3>Supply Order #{order.orderNumber || order._id.slice(-8)}</h3>
                        <p className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {user?.role === "supplier" && (
                          <p className="customer-name">Customer: {order.customer?.name}</p>
                        )}
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="order-card-body">
                      <div className="order-info">
                        <div className="info-item">
                          <span className="info-label">Items:</span>
                          <span className="info-value">{order.items?.length || 0} item(s)</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Total Price:</span>
                          <span className="info-value">PKR {order.finalPrice?.toLocaleString() || 0}</span>
                        </div>
                        {user?.role === "customer" ? (
                          <div className="info-item">
                            <span className="info-label">Supplier:</span>
                            <span className="info-value">
                              {order.supplier?.businessName || order.supplier?.name}
                            </span>
                          </div>
                        ) : null}
                        {order.trackingNumber && (
                          <div className="info-item">
                            <span className="info-label">Tracking:</span>
                            <span className="info-value">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="order-card-actions">
                      <Link to={`/supply-orders/${order._id}`} className="btn btn-primary">
                        {user?.role === "supplier" ? "View & Update Status" : "View Details"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "bulk" && (
          <>
            {bulkOrders.length === 0 ? (
              <div className="no-orders">
                <p>No bulk orders found</p>
              </div>
            ) : (
              <div className="orders-list">
                {bulkOrders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <h3>Bulk Order #{order.orderNumber || order._id.slice(-8)}</h3>
                        <p className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="customer-name">Customer: {order.customer?.name}</p>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="order-card-body">
                      <div className="order-info">
                        <div className="info-item">
                          <span className="info-label">Items:</span>
                          <span className="info-value">{order.items?.length || 0} fabric(s)</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Total Price:</span>
                          <span className="info-value">PKR {order.totalPrice?.toLocaleString() || 0}</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="info-item">
                            <span className="info-label">Tracking:</span>
                            <span className="info-value">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="order-card-actions">
                      <Link to={`/bulk-orders/${order._id}`} className="btn btn-primary">
                        View & Update Status
                      </Link>
                    </div>
                  </div>
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

