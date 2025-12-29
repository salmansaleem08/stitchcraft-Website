import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./Checkout.css";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get("supplier");

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
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
    fetchCart();
  }, [user, supplierId]);

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

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.province || !shippingAddress.phone) {
      setError("Please fill in all required address fields");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError("Cart is empty");
      return;
    }

    try {
      setPlacingOrder(true);
      const response = await api.post("/checkout", {
        shippingAddress,
        notes,
        supplierId: supplierId || null,
      });

      alert("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredItems = supplierId
    ? cart?.items.filter((item) => {
        const itemSupplierId = item.supplier._id || item.supplier;
        return itemSupplierId.toString() === supplierId;
      })
    : cart?.items || [];

  const itemsBySupplier = {};
  filteredItems.forEach((item) => {
    const sid = item.supplier._id || item.supplier;
    if (!itemsBySupplier[sid]) {
      itemsBySupplier[sid] = {
        supplier: item.supplier,
        items: [],
        total: 0,
      };
    }
    const itemTotal = item.price * item.quantity;
    itemsBySupplier[sid].items.push(item);
    itemsBySupplier[sid].total += itemTotal;
  });

  const grandTotal = Object.values(itemsBySupplier).reduce(
    (sum, group) => sum + group.total,
    0
  );

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!cart || filteredItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="container">
          <div className="empty-state">
            <p>No items to checkout</p>
            <button onClick={() => navigate("/cart")} className="btn btn-primary">
              Go to cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <button onClick={() => navigate("/cart")} className="btn btn-text">
            Back to cart
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="checkout-layout">
          <div className="checkout-form">
            <form onSubmit={handlePlaceOrder}>
              <div className="form-section">
                <h2>Shipping address</h2>

                <div className="form-group">
                  <label htmlFor="street">Street address *</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    required
                    placeholder="House/Shop number, Street name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="province">Province *</label>
                    <input
                      type="text"
                      id="province"
                      name="province"
                      value={shippingAddress.province}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="postalCode">Postal code *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      required
                      placeholder="e.g., +92 300 1234567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    placeholder="Pakistan"
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>Order notes</h2>
                <div className="form-group">
                  <label htmlFor="notes">Additional instructions (optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={placingOrder}
                >
                  {placingOrder ? "Placing order..." : "Place order"}
                </button>
              </div>
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Order summary</h2>

            {Object.entries(itemsBySupplier).map(([supplierId, group]) => (
              <div key={supplierId} className="supplier-summary">
                <h3>{group.supplier?.businessName || group.supplier?.name || "Supplier"}</h3>
                <div className="items-summary">
                  {group.items.map((item) => (
                    <div key={item._id} className="summary-item">
                      <div className="item-name">
                        {item.product?.name || "Product"}
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                      <div className="item-price">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="supplier-subtotal">
                  <span>Subtotal</span>
                  <span>PKR {group.total.toLocaleString()}</span>
                </div>
              </div>
            ))}

            <div className="order-total">
              <span>Total</span>
              <span>PKR {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
