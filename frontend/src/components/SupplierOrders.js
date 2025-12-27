import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplierOrders.css";

const SupplierOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("supplies");

  useEffect(() => {
    if (user && user.role === "supplier") {
      fetchOrders();
    }
  }, [user, statusFilter, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : "";

      if (activeTab === "supplies") {
        const response = await api.get(`/supply-orders${params}`);
        setOrders(response.data.data);
        setBulkOrders([]);
      } else {
        const response = await api.get(`/bulk-orders${params}`);
        setBulkOrders(response.data.data);
        setOrders([]);
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
      booked: "status-booked",
      processing: "status-processing",
      shipped: "status-shipped",
      on_way: "status-on-way",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return statusClasses[status] || "status-pending";
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTotalRevenue = () => {
    const allOrders = [...orders, ...bulkOrders];
    return allOrders
      .filter((o) => o.status === "delivered")
      .reduce((sum, order) => sum + (order.finalPrice || order.totalPrice || 0), 0);
  };

  const getPendingOrders = () => {
    return [...orders, ...bulkOrders].filter(
      (o) => ["pending", "confirmed", "booked"].includes(o.status)
    ).length;
  };

  if (loading) {
    return (
      <div className="supplier-orders-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  const currentOrders = activeTab === "supplies" ? orders : bulkOrders;

  return (
    <div className="supplier-orders-container">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="orders-stats">
            <div className="stat-box">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">PKR {getTotalRevenue().toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Pending Orders</span>
              <span className="stat-value">{getPendingOrders()}</span>
            </div>
          </div>
        </div>

        <div className="orders-tabs">
          <button
            className={`tab-btn ${activeTab === "supplies" ? "active" : ""}`}
            onClick={() => setActiveTab("supplies")}
          >
            Supply Orders ({orders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "fabrics" ? "active" : ""}`}
            onClick={() => setActiveTab("fabrics")}
          >
            Bulk Orders ({bulkOrders.length})
          </button>
        </div>

        <div className="filters-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="booked">Booked</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="on_way">On Way</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {currentOrders.length === 0 ? (
          <div className="no-orders">
            <p>No {activeTab === "supplies" ? "supply" : "bulk"} orders found</p>
          </div>
        ) : (
          <div className="orders-list">
            {currentOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h3>
                      Order #{order.orderNumber || order._id.slice(-8)}
                    </h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="customer-name">
                      Customer: {order.customer?.name || "Unknown"}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-items">
                    <h4>Items:</h4>
                    {activeTab === "supplies" ? (
                      <ul>
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.supply?.name || "Supply"} - Qty: {item.quantity}{" "}
                            {item.unit} - PKR {item.subtotal?.toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul>
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.fabric?.name || "Fabric"} - Qty: {item.quantity} meters -
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="order-totals">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>PKR {order.totalPrice?.toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="total-row">
                        <span>Discount:</span>
                        <span>- PKR {order.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="total-row final">
                      <span>Total:</span>
                      <span>PKR {order.finalPrice?.toLocaleString()}</span>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="shipping-info">
                      <h4>Shipping Address:</h4>
                      <p>
                        {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                        {order.shippingAddress.province}
                      </p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                  )}
                </div>

                <div className="order-card-actions">
                  <Link
                    to={
                      activeTab === "supplies"
                        ? `/supply-orders/${order._id}`
                        : `/bulk-orders/${order._id}`
                    }
                    className="btn btn-primary"
                  >
                    View & Update Status
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

export default SupplierOrders;

