import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./BulkOrderForm.css";

const BulkOrderForm = () => {
  const { supplierId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Pakistan",
  });

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/");
      return;
    }

    if (user.address) {
      setShippingAddress({
        street: user.address.street || "",
        city: user.address.city || "",
        province: user.address.province || "",
        postalCode: user.address.postalCode || "",
        country: user.address.country || "Pakistan",
      });
    }

    fetchSupplierAndFabrics();
  }, [supplierId, user]);

  const fetchSupplierAndFabrics = async () => {
    try {
      setLoading(true);
      const [supplierRes, fabricsRes] = await Promise.all([
        api.get(`/suppliers/${supplierId}`),
        api.get(`/fabrics?supplier=${supplierId}&isActive=true`),
      ]);
      setSupplier(supplierRes.data.data);
      setFabrics(fabricsRes.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load supplier information");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (fabric) => {
    const existingItem = cart.find((item) => item.fabric._id === fabric._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.fabric._id === fabric._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          fabric,
          quantity: 1,
          unit: fabric.unit || "meter",
        },
      ]);
    }
  };

  const updateCartItem = (fabricId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(fabricId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.fabric._id === fabricId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (fabricId) => {
    setCart(cart.filter((item) => item.fabric._id !== fabricId));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalQuantity = 0;

    cart.forEach((item) => {
      const itemSubtotal = item.fabric.pricePerMeter * item.quantity;
      subtotal += itemSubtotal;
      totalQuantity += item.quantity;
    });

    // Calculate bulk discount based on supplier's settings
    let bulkDiscount = 0;
    let bulkDiscountPercentage = 0;

    if (supplier && supplier.bulkDiscountEnabled && supplier.bulkDiscountTiers) {
      const sortedTiers = [...supplier.bulkDiscountTiers].sort(
        (a, b) => b.minQuantity - a.minQuantity
      );

      for (const tier of sortedTiers) {
        if (totalQuantity >= tier.minQuantity) {
          bulkDiscountPercentage = tier.discountPercentage;
          bulkDiscount = (subtotal * bulkDiscountPercentage) / 100;
          break;
        }
      }
    }

    const shippingCost = 0; // Can be calculated later
    const totalPrice = subtotal - bulkDiscount + shippingCost;

    return {
      subtotal,
      bulkDiscount,
      bulkDiscountPercentage,
      shippingCost,
      totalPrice,
      totalQuantity,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (cart.length === 0) {
      setError("Please add at least one fabric to your order");
      setSubmitting(false);
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.province) {
      setError("Please fill in all required address fields");
      setSubmitting(false);
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        fabric: item.fabric._id,
        quantity: item.quantity,
        unit: item.unit,
      }));

      const response = await api.post("/bulk-orders", {
        items: orderItems,
        shippingAddress,
      });

      navigate(`/bulk-orders/${response.data.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place bulk order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bulk-order-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="bulk-order-form-container">
        <div className="error-message">Supplier not found</div>
        <Link to="/suppliers" className="btn btn-primary">
          Back to Suppliers
        </Link>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="bulk-order-form-container">
      <div className="container">
        <Link to={`/suppliers/${supplierId}`} className="back-link">
          ← Back to Supplier
        </Link>

        <div className="form-header">
          <h1>Bulk Order from {supplier.businessName || supplier.name}</h1>
          <p>Order multiple fabrics and save with bulk discounts</p>
        </div>

        <div className="bulk-order-content">
          <div className="fabrics-section">
            <h2>Available Fabrics</h2>
            {fabrics.length === 0 ? (
              <p className="no-fabrics">No fabrics available from this supplier</p>
            ) : (
              <div className="fabrics-grid">
                {fabrics.map((fabric) => (
                  <div key={fabric._id} className="fabric-card">
                    {fabric.images && fabric.images.length > 0 && (
                      <div className="fabric-image">
                        <img src={fabric.images[0]} alt={fabric.name} />
                      </div>
                    )}
                    <div className="fabric-info">
                      <h3>{fabric.name}</h3>
                      <p className="fabric-type">{fabric.fabricType} - {fabric.color}</p>
                      <p className="fabric-price">
                        PKR {fabric.pricePerMeter?.toLocaleString()}/meter
                      </p>
                      {fabric.stockQuantity > 0 ? (
                        <p className="fabric-stock">
                          Stock: {fabric.stockQuantity} {fabric.unit || "meters"}
                        </p>
                      ) : (
                        <p className="fabric-stock out-of-stock">Out of Stock</p>
                      )}
                      <button
                        onClick={() => addToCart(fabric)}
                        className="btn btn-primary btn-small"
                        disabled={fabric.stockQuantity === 0}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="order-section">
            <div className="cart-section">
              <h2>Order Cart</h2>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty. Add fabrics to get started.</p>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.fabric._id} className="cart-item">
                      <div className="item-details">
                        <h4>{item.fabric.name}</h4>
                        <p className="item-specs">
                          {item.fabric.fabricType} - {item.fabric.color}
                        </p>
                        <p className="item-price">
                          PKR {item.fabric.pricePerMeter?.toLocaleString()}/{item.unit}
                        </p>
                      </div>
                      <div className="item-controls">
                        <div className="quantity-control">
                          <label>Quantity:</label>
                          <input
                            type="number"
                            min="1"
                            max={item.fabric.stockQuantity}
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItem(item.fabric._id, parseInt(e.target.value) || 1)
                            }
                          />
                          <span className="unit">{item.unit}</span>
                        </div>
                        <div className="item-subtotal">
                          PKR {(item.fabric.pricePerMeter * item.quantity).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.fabric._id)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>PKR {totals.subtotal.toLocaleString()}</span>
                  </div>
                  {totals.bulkDiscount > 0 && (
                    <div className="summary-row discount">
                      <span>Bulk Discount ({totals.bulkDiscountPercentage}%):</span>
                      <span>- PKR {totals.bulkDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>PKR {totals.shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>PKR {totals.totalPrice.toLocaleString()}</span>
                  </div>
                  {totals.bulkDiscountPercentage > 0 && (
                    <p className="discount-note">
                      You saved {totals.bulkDiscountPercentage}% with bulk discount!
                    </p>
                  )}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleSubmit} className="shipping-form">
                <h2>Shipping Address</h2>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleShippingChange}
                    required
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
                      onChange={handleShippingChange}
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
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleShippingChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleShippingChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? "Placing Order..." : "Place Bulk Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderForm;

