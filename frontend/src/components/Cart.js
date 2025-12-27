import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
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

  // Group items by supplier
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
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {cart && cart.items.length > 0 && (
            <button onClick={clearCart} className="btn btn-secondary">
              Clear Cart
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {!cart || cart.items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/supplies" className="btn btn-primary">
              Browse Supplies
            </Link>
            <Link to="/fabrics" className="btn btn-primary">
              Browse Fabrics
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              {Object.entries(itemsBySupplier).map(([supplierId, group]) => (
                <div key={supplierId} className="supplier-group">
                  <div className="supplier-header">
                    <h2>
                      {group.supplier?.businessName || group.supplier?.name || "Supplier"}
                    </h2>
                    <Link
                      to={`/suppliers/${supplierId}`}
                      className="supplier-link"
                    >
                      View Supplier
                    </Link>
                  </div>

                  <div className="items-list">
                    {group.items.map((item) => (
                      <div key={item._id} className="cart-item">
                        <div className="item-image">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                            />
                          ) : (
                            <div className="item-placeholder">
                              {item.product?.name?.charAt(0).toUpperCase() || "P"}
                            </div>
                          )}
                        </div>

                        <div className="item-details">
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
                          <p className="item-type">
                            {item.productType === "fabric" ? "Fabric" : "Supply"}
                            {item.product?.fabricType && ` - ${item.product.fabricType}`}
                            {item.product?.category && ` - ${item.product.category}`}
                          </p>
                          <p className="item-price">
                            PKR {item.price?.toLocaleString()}/{item.unit}
                          </p>
                        </div>

                        <div className="item-quantity">
                          <label>Quantity:</label>
                          <div className="quantity-controls">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="btn-quantity"
                              disabled={updating}
                            >
                              -
                            </button>
                            <span className="quantity-value">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="btn-quantity"
                              disabled={updating}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="item-subtotal">
                          <span className="subtotal-label">Subtotal:</span>
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
                    ))}
                  </div>

                  <div className="supplier-total">
                    <span>Subtotal for this supplier:</span>
                    <span className="total-amount">PKR {group.total.toLocaleString()}</span>
                  </div>

                  <Link
                    to={`/checkout?supplier=${supplierId}`}
                    className="btn btn-primary btn-checkout"
                  >
                    Checkout from {group.supplier?.businessName || group.supplier?.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Total Items:</span>
                <span>{cart.items.length}</span>
              </div>
              <div className="summary-row">
                <span>Suppliers:</span>
                <span>{Object.keys(itemsBySupplier).length}</span>
              </div>
              <div className="summary-row total">
                <span>Grand Total:</span>
                <span>PKR {grandTotal.toLocaleString()}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-block">
                Checkout All
              </Link>
              <Link to="/supplies" className="btn btn-secondary btn-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

