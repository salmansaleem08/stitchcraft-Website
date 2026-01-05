import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  FaMinus, FaPlus, FaTrash
} from "react-icons/fa";
import "./Cart.css";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/");
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load cart");
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      setUpdating(true);
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(true);
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }

    try {
      await api.delete("/cart");
      await fetchCart();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to clear cart");
    }
  };

  const itemsBySupplier = {};
  if (cart && cart.items) {
    cart.items.forEach((item) => {
      const supplierId = item.supplier._id || item.supplier;
      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = {
          supplier: item.supplier,
          items: [],
          total: 0,
        };
      }
      const itemTotal = item.price * item.quantity;
      itemsBySupplier[supplierId].items.push(item);
      itemsBySupplier[supplierId].total += itemTotal;
    });
  }

  const grandTotal = Object.values(itemsBySupplier).reduce(
    (sum, group) => sum + group.total,
    0
  );

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="container">
        <div className="page-header">
          <div className="header-content-wrapper">
            <div className="header-text">
              <h1>Shopping Cart</h1>
              <p className="dashboard-subtitle">
                Review your selected items, update quantities, and proceed to checkout. Items are grouped by supplier for easy management.
              </p>
            </div>
            {cart && cart.items.length > 0 && (
              <button onClick={clearCart} className="btn-clear-cart">
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!cart || cart.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <p>Your cart is empty</p>
            <p className="empty-subtitle">Start adding items to your cart to continue shopping</p>
            <div className="empty-cart-actions">
              <Link to="/supplies" className="btn btn-primary">
                Browse Supplies
              </Link>
              <Link to="/fabrics" className="btn btn-secondary">
                Browse Fabrics
              </Link>
            </div>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-section">
              {Object.entries(itemsBySupplier).map(([supplierId, group]) => (
                <div key={supplierId} className="supplier-group">
                  <div className="supplier-header">
                    <div className="supplier-header-left">
                      <div className="supplier-avatar">
                        {(group.supplier?.businessName || group.supplier?.name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2>{group.supplier?.businessName || group.supplier?.name || "Supplier"}</h2>
                        <p className="supplier-item-count">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <Link to={`/suppliers/${supplierId}`} className="supplier-link">
                      View Supplier
                    </Link>
                  </div>

                  <div className="items-list">
                    {group.items.map((item) => (
                      <div key={item._id} className="cart-item">
                        <div className="item-image">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img src={item.product.images[0]} alt={item.product.name} />
                          ) : (
                            <div className="item-placeholder">
                              {item.product?.name?.charAt(0).toUpperCase() || "P"}
                            </div>
                          )}
                        </div>

                        <div className="item-main">
                          <div className="item-info">
                            <div className={`item-type-badge ${item.productType === "fabric" ? "badge-fabric" : "badge-supply"}`}>
                              {item.productType === "fabric" ? "Fabric" : "Supply"}
                            </div>
                            <h3>
                              <Link
                                to={
                                  item.productType === "fabric"
                                    ? `/fabrics/${item.product._id}`
                                    : `/supplies/${item.product._id}`
                                }
                              >
                                {item.product?.name || "Product"}
                              </Link>
                            </h3>
                            <p className="item-meta">
                              {item.product?.fabricType && `${item.product.fabricType}`}
                              {item.product?.category && ` • ${item.product.category}`}
                            </p>
                            <p className="item-price">
                              <span className="currency">PKR</span> {item.price?.toLocaleString()}/{item.unit}
                            </p>
                          </div>

                          <div className="item-controls">
                            <div className="quantity-control">
                              <label>Quantity</label>
                              <div className="quantity-buttons">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="quantity-btn"
                                  disabled={updating}
                                >
                                  <FaMinus />
                                </button>
                                <span className="quantity-value">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="quantity-btn"
                                  disabled={updating}
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>

                            <div className="item-subtotal">
                              <span className="subtotal-label">Subtotal</span>
                              <span className="subtotal-value">
                                PKR {(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>

                            <button
                              onClick={() => removeItem(item._id)}
                              className="btn-remove"
                              disabled={updating}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="supplier-footer">
                    <div className="supplier-total">
                      <span className="total-label">Subtotal</span>
                      <span className="total-amount">
                        <span className="currency">PKR</span> {group.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-content">
                <div className="summary-row">
                  <span className="summary-label">Items</span>
                  <span className="summary-value">{cart.items.length}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Suppliers</span>
                  <span className="summary-value">{Object.keys(itemsBySupplier).length}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row summary-total">
                  <span className="summary-label">Total</span>
                  <span className="summary-value"><span className="currency">PKR</span> {grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="summary-actions">
                <Link to="/checkout" className="btn btn-primary btn-block">
                  Checkout All
                </Link>
                <Link to="/supplies" className="btn btn-secondary btn-block">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
