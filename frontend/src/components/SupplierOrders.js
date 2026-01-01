import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  FaCheckCircle, FaTimesCircle, 
  FaClock, FaSpinner, FaCalendarAlt,
  FaTruck
} from "react-icons/fa";
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
        <div className="page-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Order Management</h1>
              <p className="dashboard-subtitle">
                Efficiently manage, track, and update all your supply and bulk orders. Monitor order status, 
                track shipments, and ensure timely delivery to customers.
              </p>
            </div>
            <div className="view-toggle">
              <button
                className={`view-btn ${activeTab === "supplies" ? "active" : ""}`}
                onClick={() => setActiveTab("supplies")}
              >
                Supply Orders
              </button>
              <button
                className={`view-btn ${activeTab === "fabrics" ? "active" : ""}`}
                onClick={() => setActiveTab("fabrics")}
              >
                Bulk Orders
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="orders-filters">
          <div className="filter-badge-group">
            <button
              className={`filter-badge ${statusFilter === "" ? "active" : ""}`}
              onClick={() => setStatusFilter("")}
            >
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
              className={`filter-badge ${statusFilter === "booked" ? "active" : ""}`}
              onClick={() => setStatusFilter("booked")}
            >
              Booked
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
              className={`filter-badge ${statusFilter === "on_way" ? "active" : ""}`}
              onClick={() => setStatusFilter("on_way")}
            >
              On Way
            </button>
            <button
              className={`filter-badge ${statusFilter === "delivered" ? "active" : ""}`}
              onClick={() => setStatusFilter("delivered")}
            >
              Delivered
            </button>
            <button
              className={`filter-badge ${statusFilter === "cancelled" ? "active" : ""}`}
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled
            </button>
          </div>
        </div>

        {currentOrders.length === 0 ? (
          <div className="no-orders">
            <p>No {activeTab === "supplies" ? "supply" : "bulk"} orders found</p>
          </div>
        ) : (
          <div className="orders-grid">
            {currentOrders.map((order) => {
              const getStatusIcon = (status) => {
                if (status === "delivered") return <FaCheckCircle className="status-icon status-icon-success" />;
                if (status === "cancelled") return <FaTimesCircle className="status-icon status-icon-danger" />;
                if (status === "shipped" || status === "on_way") return <FaTruck className="status-icon status-icon-info" />;
                if (status === "processing" || status === "confirmed" || status === "booked") return <FaSpinner className="status-icon status-icon-warning" />;
                return <FaClock className="status-icon status-icon-info" />;
              };

              return (
                <Link
                  key={order._id}
                  to={
                    activeTab === "supplies"
                      ? `/supply-orders/${order._id}`
                      : `/bulk-orders/${order._id}`
                  }
                  className="order-card"
                >
                  <div className="order-card-header">
                    <div className="order-id">#{order.orderNumber || order._id}</div>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-service">
                      {activeTab === "supplies" 
                        ? (order.items?.[0]?.supply?.name || "Supply Order")
                        : (order.items?.[0]?.fabric?.name || "Bulk Order")
                      }
                    </div>
                    {order.customer?.name && (
                      <div className="order-customer">{order.customer.name}</div>
                    )}
                  </div>
                  <div className="order-card-footer">
                    <div className="order-amount">PKR {(order.finalPrice || order.totalPrice || 0).toLocaleString()}</div>
                    <div className="order-date">
                      <FaCalendarAlt className="date-icon" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;

