import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./SampleOrderForm.css";

const SampleOrderForm = () => {
  const { fabricId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fabric, setFabric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    quantity: 1,
    unit: "meter",
    shippingAddress: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Pakistan",
    },
    notes: "",
  });

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/");
      return;
    }

    if (user.address) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          street: user.address.street || "",
          city: user.address.city || "",
          province: user.address.province || "",
          postalCode: user.address.postalCode || "",
          country: user.address.country || "Pakistan",
        },
      }));
    }

    fetchFabric();
  }, [fabricId, user]);

  const fetchFabric = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/fabrics/${fabricId}`);
      setFabric(response.data.data);
      setFormData((prev) => ({
        ...prev,
        unit: response.data.data.unit || "meter",
      }));
      setError("");
    } catch (error) {
      setError("Failed to load fabric details");
      console.error("Error fetching fabric:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name.startsWith("shippingAddress.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "number" ? parseInt(value) : value,
      });
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation
    if (!formData.shippingAddress.street || !formData.shippingAddress.city || !formData.shippingAddress.province) {
      setError("Please fill in all required address fields");
      setSubmitting(false);
      return;
    }

    if (formData.quantity < 1 || formData.quantity > 5) {
      setError("Sample quantity must be between 1 and 5 meters/yards");
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/sample-orders", {
        fabric: fabricId,
        ...formData,
      });
      navigate(`/sample-orders/${response.data.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place sample order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sample-order-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading fabric details...</p>
        </div>
      </div>
    );
  }

  if (!fabric) {
    return (
      <div className="sample-order-form-container">
        <div className="error-message">Fabric not found</div>
        <Link to="/fabrics" className="btn btn-primary">
          Back to Fabrics
        </Link>
      </div>
    );
  }

  const totalPrice = (fabric.pricePerMeter || 0) * formData.quantity;

  return (
    <div className="sample-order-form-container">
      <div className="container">
        <Link to={`/fabrics/${fabricId}`} className="back-link">
          ← Back to Fabric
        </Link>

        <div className="form-header">
          <h1>Order Sample</h1>
          <p>Request a sample of {fabric.name}</p>
        </div>

        <div className="sample-order-content">
          <div className="fabric-summary">
            <h2>Fabric Details</h2>
            {fabric.images && fabric.images.length > 0 && (
              <div className="fabric-image">
                <img src={fabric.images[0]} alt={fabric.name} />
              </div>
            )}
            <div className="fabric-info">
              <h3>{fabric.name}</h3>
              <p><strong>Type:</strong> {fabric.fabricType}</p>
              <p><strong>Color:</strong> {fabric.color}</p>
              <p><strong>Price:</strong> PKR {fabric.pricePerMeter?.toLocaleString()} per {fabric.unit || "meter"}</p>
              {fabric.careInstructions && (
                <div className="care-instructions">
                  <h4>Care Instructions</h4>
                  <p>{fabric.careInstructions}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="sample-order-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-section">
              <h2>Sample Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    required
                  />
                  <small>Maximum 5 {formData.unit}s for sample orders</small>
                </div>

                <div className="form-group">
                  <label htmlFor="unit">Unit</label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    <option value="meter">Meter</option>
                    <option value="yard">Yard</option>
                  </select>
                </div>
              </div>

              <div className="price-summary">
                <div className="price-item">
                  <span>Price per {formData.unit}:</span>
                  <span>PKR {fabric.pricePerMeter?.toLocaleString()}</span>
                </div>
                <div className="price-item">
                  <span>Quantity:</span>
                  <span>{formData.quantity} {formData.unit}s</span>
                </div>
                <div className="price-item total">
                  <span>Total:</span>
                  <span>PKR {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Shipping Address</h2>

              <div className="form-group">
                <label htmlFor="shippingAddress.street">Street Address *</label>
                <input
                  type="text"
                  id="shippingAddress.street"
                  name="shippingAddress.street"
                  value={formData.shippingAddress.street}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shippingAddress.city">City *</label>
                  <input
                    type="text"
                    id="shippingAddress.city"
                    name="shippingAddress.city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shippingAddress.province">Province *</label>
                  <input
                    type="text"
                    id="shippingAddress.province"
                    name="shippingAddress.province"
                    value={formData.shippingAddress.province}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shippingAddress.postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="shippingAddress.postalCode"
                    name="shippingAddress.postalCode"
                    value={formData.shippingAddress.postalCode}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shippingAddress.country">Country</label>
                  <input
                    type="text"
                    id="shippingAddress.country"
                    name="shippingAddress.country"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Additional Notes</h2>
              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any special instructions or requests..."
                />
              </div>
            </div>

            <div className="form-actions">
              <Link to={`/fabrics/${fabricId}`} className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Placing Order..." : "Place Sample Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SampleOrderForm;

