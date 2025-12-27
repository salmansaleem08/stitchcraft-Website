import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SupplyOrderForm.css";

const SupplyOrderForm = () => {
  const { supplierId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [supplies, setSupplies] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Pakistan",
    phone: "",
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/");
      return;
    }
    fetchSupplierAndSupplies();
  }, [supplierId, user]);

  const fetchSupplierAndSupplies = async () => {
    try {
      setLoading(true);
      const [supplierRes, suppliesRes] = await Promise.all([
        api.get(`/suppliers/${supplierId}`),
        api.get(`/supplies?supplier=${supplierId}&isActive=true`),
      ]);
      setSupplier(supplierRes.data.data);
      setSupplies(suppliesRes.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load supplier or supplies");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (supply) => {
    const existingItem = cart.find((item) => item.supply._id === supply._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.supply._id === supply._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          supply: supply,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (supplyId) => {
    setCart(cart.filter((item) => item.supply._id !== supplyId));
  };

  const updateQuantity = (supplyId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(supplyId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.supply._id === supplyId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const calculateSubtotal = (item) => {
    return item.supply.price * item.quantity;
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (cart.length === 0) {
      setError("Please add at least one supply to your order");
      setSubmitting(false);
      return;
    }

    // Validate shipping address
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.province ||
      !shippingAddress.postalCode ||
      !shippingAddress.phone
    ) {
      setError("Please fill in all shipping address fields");
      setSubmitting(false);
      return;
    }

    try {
      const orderData = {
        supplier: supplierId,
        items: cart.map((item) => ({
          supply: item.supply._id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress,
        notes: notes,
      };

      const response = await api.post("/supply-orders", orderData);
      navigate(`/orders/${response.data.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="supply-order-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="supply-order-form-container">
        <div className="error-message">Supplier not found</div>
        <Link to="/supplies" className="btn btn-primary">
          Back to Supplies
        </Link>
      </div>
    );
  }

  return (
    <div className="supply-order-form-container">
      <div className="container">
        <Link to={`/suppliers/${supplierId}`} className="back-link">
          ← Back to Supplier
        </Link>

        <div className="order-header">
          <h1>Order Supplies from {supplier.businessName || supplier.name}</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="order-content">
          <div className="order-main">
            <div className="supplies-section">
              <h2>Available Supplies</h2>
              {supplies.length === 0 ? (
                <p>No active supplies available from this supplier.</p>
              ) : (
                <div className="supplies-grid">
                  {supplies.map((supply) => (
                    <div key={supply._id} className="supply-card">
                      {supply.images && supply.images.length > 0 && (
                        <img src={supply.images[0]} alt={supply.name} />
                      )}
                      <div className="supply-info">
                        <h3>{supply.name}</h3>
                        <p className="supply-category">{supply.category}</p>
                        {supply.brand && <p className="supply-brand">{supply.brand}</p>}
                        <p className="supply-price">
                          PKR {supply.price?.toLocaleString()}/{supply.unit || "piece"}
                        </p>
                        {supply.stockQuantity !== undefined && (
                          <p className="supply-stock">
                            {supply.stockQuantity > 0
                              ? `In Stock: ${supply.stockQuantity} ${supply.unit || "pieces"}`
                              : "Out of Stock"}
                          </p>
                        )}
                        {supply.minimumOrderQuantity > 1 && (
                          <p className="min-order">
                            Min Order: {supply.minimumOrderQuantity} {supply.unit || "pieces"}
                          </p>
                        )}
                        <button
                          onClick={() => addToCart(supply)}
                          disabled={supply.stockQuantity === 0}
                          className="btn btn-primary btn-small"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="order-sidebar">
            <div className="cart-section">
              <h2>Order Summary</h2>
              {cart.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.supply._id} className="cart-item">
                        <div className="cart-item-info">
                          <h4>{item.supply.name}</h4>
                          <p className="cart-item-price">
                            PKR {item.supply.price?.toLocaleString()}/{item.supply.unit || "piece"}
                          </p>
                        </div>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button
                              onClick={() => updateQuantity(item.supply._id, item.quantity - 1)}
                              className="btn-quantity"
                            >
                              -
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.supply._id, item.quantity + 1)}
                              disabled={item.quantity >= (item.supply.stockQuantity || 0)}
                              className="btn-quantity"
                            >
                              +
                            </button>
                          </div>
                          <p className="cart-item-subtotal">
                            PKR {calculateSubtotal(item).toLocaleString()}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.supply._id)}
                            className="btn-remove"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-total">
                    <div className="total-row">
                      <span>Total:</span>
                      <span className="total-amount">PKR {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="shipping-form">
              <h2>Shipping Details</h2>

              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="province">Province *</label>
                  <input
                    type="text"
                    id="province"
                    value={shippingAddress.province}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, province: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Order Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Any special instructions..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting || cart.length === 0}
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyOrderForm;

