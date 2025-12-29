import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import MeasurementForm from "./MeasurementForm";
import { getDefaultPricing } from "../utils/pricingDefaults";
import "./BookingForm.css";

const BookingForm = () => {
  const { id: tailorId } = useParams();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get("package");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tailor, setTailor] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Service Details, 2: Measurements, 3: Review

  const [formData, setFormData] = useState({
    serviceType: "",
    garmentType: "",
    description: "",
    quantity: 1,
    consultationDate: "",
    estimatedCompletionDate: "",
  });

  const [calculatedPricing, setCalculatedPricing] = useState({
    basePrice: 0,
    fabricCost: 0,
    additionalCharges: 0,
    discount: 0,
    totalPrice: 0,
  });

  const [measurements, setMeasurements] = useState(null);
  const [useExistingMeasurements, setUseExistingMeasurements] = useState(false);
  const [existingMeasurements, setExistingMeasurements] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/");
      return;
    }
    fetchTailor();
    fetchMeasurementHistory();
    if (packageId) {
      fetchPackage();
    }
  }, [tailorId, packageId]);

  const fetchTailor = async () => {
    try {
      const response = await api.get(`/tailors/${tailorId}`);
      setTailor(response.data.data.tailor);
    } catch (error) {
      setError("Failed to load tailor information");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackage = async () => {
    try {
      const response = await api.get(`/pricing/packages/single/${packageId}`);
      const pkg = response.data.data;
      setSelectedPackage(pkg);
      // Pre-fill form with package data
      if (pkg.garments && pkg.garments.length > 0) {
        setFormData({
          ...formData,
          serviceType: "premium", // Default for packages
          garmentType: pkg.garments[0].garmentType,
          quantity: pkg.garments.reduce((sum, g) => sum + g.quantity, 0),
        });
      }
      setCalculatedPricing({
        basePrice: pkg.packagePrice / (pkg.garments?.reduce((sum, g) => sum + g.quantity, 0) || 1),
        quantity: pkg.garments?.reduce((sum, g) => sum + g.quantity, 0) || 1,
        subtotal: pkg.packagePrice,
        discount: pkg.discount || 0,
        discountPercentage: pkg.discountPercentage || 0,
        totalPrice: pkg.packagePrice,
      });
    } catch (error) {
      console.error("Error fetching package:", error);
      setError("Failed to load package information");
    }
  };

  const fetchMeasurementHistory = async () => {
    try {
      const response = await api.get(`/measurements?tailor=${tailorId}`);
      setExistingMeasurements(response.data.data);
    } catch (error) {
      console.error("Error fetching measurement history:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    // Recalculate pricing when service type or garment type changes
    if (name === "serviceType" || name === "garmentType" || name === "quantity") {
      calculatePricing(updatedFormData);
    }
  };

  const calculatePricing = (data) => {
    if (!data.serviceType || !data.garmentType) {
      setCalculatedPricing({
        basePrice: 0,
        fabricCost: 0,
        additionalCharges: 0,
        discount: 0,
        totalPrice: 0,
      });
      return;
    }

    const basePrice = getDefaultPricing(data.serviceType, data.garmentType);
    const quantity = parseInt(data.quantity) || 1;
    const subtotal = basePrice * quantity;

    // Apply discount for multiple garments (2+ garments get 10% discount, 3+ get 15%, 4+ get 20%)
    let discountPercentage = 0;
    if (quantity >= 4) {
      discountPercentage = 20;
    } else if (quantity >= 3) {
      discountPercentage = 15;
    } else if (quantity >= 2) {
      discountPercentage = 10;
    }

    const discount = (subtotal * discountPercentage) / 100;
    const totalPrice = subtotal - discount;

    setCalculatedPricing({
      basePrice: basePrice,
      quantity: quantity,
      subtotal: subtotal,
      discount: discount,
      discountPercentage: discountPercentage,
      totalPrice: totalPrice,
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.serviceType || !formData.garmentType) {
        setError("Please fill in all required fields");
        return;
      }
    }
    setStep(step + 1);
    setError("");
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  const handleMeasurementSave = (measurementData) => {
    setMeasurements(measurementData);
  };

  const handleSelectExistingMeasurement = (measurement) => {
    setMeasurements(measurement);
    setUseExistingMeasurements(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let measurementId = null;

      // Save measurements if new ones were created
      if (measurements && !useExistingMeasurements) {
        const measurementResponse = await api.post("/measurements", {
          tailor: tailorId,
          garmentType: formData.garmentType,
          measurements: measurements.measurements,
          recommendedSize: measurements.recommendedSize,
          sizeAdjustments: measurements.sizeAdjustments,
          notes: measurements.notes,
        });
        measurementId = measurementResponse.data.data._id;
      } else if (useExistingMeasurements && measurements) {
        measurementId = measurements._id;
      }

      // Create order
      const orderData = {
        tailor: tailorId,
        serviceType: formData.serviceType || "premium",
        garmentType: formData.garmentType,
        description: selectedPackage 
          ? `Package: ${selectedPackage.name}. ${formData.description || ""}`
          : formData.description,
        measurements: measurementId,
        consultationDate: formData.consultationDate || undefined,
        basePrice: calculatedPricing.basePrice,
        quantity: formData.quantity || 1,
        fabricCost: selectedPackage?.fabricIncluded ? (selectedPackage.fabricDetails?.cost || 0) : 0,
        additionalCharges: 0, // Will be set by tailor
        discount: calculatedPricing.discount || 0,
        totalPrice: calculatedPricing.totalPrice,
        estimatedCompletionDate: formData.estimatedCompletionDate || undefined,
        package: selectedPackage?._id || undefined,
      };

      const response = await api.post("/orders", orderData);
      navigate(`/orders/${response.data.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!tailor) {
    return (
      <div className="booking-form-container">
        <div className="error-message">Tailor not found</div>
      </div>
    );
  }

  const garmentTypes = [
    "Shalwar Kameez",
    "Sherwani",
    "Lehenga",
    "Suit",
    "Dress",
    "Pants/Trousers",
    "Kurta",
    "Other",
  ];

  return (
    <div className="booking-form-container">
      <div className="container">
        <div className="booking-header">
          <h1>
            {selectedPackage 
              ? `Order Package: ${selectedPackage.name}`
              : `Book Service with ${tailor.shopName || tailor.name}`
            }
          </h1>
          <p>
            {selectedPackage 
              ? "Review package details and complete your order"
              : "Fill in the details to place your order"
            }
          </p>
          {selectedPackage && (
            <div className="package-info-banner">
              <h3>{selectedPackage.name}</h3>
              <p className="package-price-banner">PKR {selectedPackage.packagePrice.toLocaleString()}</p>
              {selectedPackage.description && <p>{selectedPackage.description}</p>}
            </div>
          )}
        </div>

        <div className="booking-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Service Details</span>
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">Measurements</span>
          </div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span className="step-number">3</span>
            <span className="step-label">Review & Submit</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          {step === 1 && (
            <div className="form-step">
              <h2>Service Details</h2>

              <div className="form-group">
                <label htmlFor="serviceType">Service Type *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select service type</option>
                  <option value="basic">Basic Stitching</option>
                  <option value="premium">Premium Stitching</option>
                  <option value="luxury">Luxury Tier</option>
                  <option value="bulk">Bulk Order</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="garmentType">Garment Type *</label>
                <select
                  id="garmentType"
                  name="garmentType"
                  value={formData.garmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select garment type</option>
                  {garmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <small>Discount applied: 2+ items (10%), 3+ items (15%), 4+ items (20%)</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe what you need (design preferences, special requirements, etc.)"
                />
              </div>

              {formData.serviceType && formData.garmentType && (
                <div className="pricing-preview">
                  <h3>Pricing Preview</h3>
                  <div className="pricing-details">
                    <div className="pricing-row">
                      <span>Base Price (per item):</span>
                      <span>PKR {calculatedPricing.basePrice.toLocaleString()}</span>
                    </div>
                    {calculatedPricing.quantity > 1 && (
                      <>
                        <div className="pricing-row">
                          <span>Quantity:</span>
                          <span>{calculatedPricing.quantity}</span>
                        </div>
                        <div className="pricing-row">
                          <span>Subtotal:</span>
                          <span>PKR {calculatedPricing.subtotal?.toLocaleString() || 0}</span>
                        </div>
                        <div className="pricing-row discount">
                          <span>Discount ({calculatedPricing.discountPercentage}%):</span>
                          <span>- PKR {calculatedPricing.discount.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="pricing-row total">
                      <span>Total Price:</span>
                      <span>PKR {calculatedPricing.totalPrice.toLocaleString()}</span>
                    </div>
                    <small className="pricing-note">
                      Note: Final pricing may be adjusted by the tailor. Fabric cost and additional charges will be added separately.
                    </small>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="consultationDate">Consultation Date</label>
                  <input
                    type="datetime-local"
                    id="consultationDate"
                    name="consultationDate"
                    value={formData.consultationDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedCompletionDate">Estimated Completion Date</label>
                  <input
                    type="date"
                    id="estimatedCompletionDate"
                    name="estimatedCompletionDate"
                    value={formData.estimatedCompletionDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleNext} className="btn btn-primary">
                  Next: Measurements
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Measurements</h2>

              {existingMeasurements.length > 0 && (
                <div className="existing-measurements">
                  <h3>Use Existing Measurements</h3>
                  <div className="measurements-list">
                    {existingMeasurements.map((measurement) => (
                      <div
                        key={measurement._id}
                        className="measurement-card"
                        onClick={() => handleSelectExistingMeasurement(measurement)}
                      >
                        <h4>{measurement.garmentType}</h4>
                        <p>
                          Saved: {new Date(measurement.createdAt).toLocaleDateString()}
                        </p>
                        {measurement.recommendedSize && (
                          <p>Recommended Size: {measurement.recommendedSize}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseExistingMeasurements(false)}
                    className="btn btn-secondary"
                  >
                    Create New Measurements
                  </button>
                </div>
              )}

              {!useExistingMeasurements && (
                <>
                  <div className="virtual-tryon-link-section">
                    <p className="virtual-tryon-text">
                      Want to see how it fits? Use our Virtual Try-On to visualize your measurements.
                    </p>
                    <Link
                      to="/virtual-tryon"
                      className="btn btn-secondary"
                      target="_blank"
                    >
                      Open Virtual Try-On
                    </Link>
                  </div>
                  <MeasurementForm
                    garmentType={formData.garmentType}
                    onSave={handleMeasurementSave}
                  />
                </>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleBack} className="btn btn-secondary">
                  Back
                </button>
                <button type="button" onClick={handleNext} className="btn btn-primary">
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2>Review & Submit</h2>

              <div className="review-section">
                <h3>Service Details</h3>
                <div className="review-item">
                  <span className="review-label">Service Type:</span>
                  <span className="review-value">{formData.serviceType}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Garment Type:</span>
                  <span className="review-value">{formData.garmentType}</span>
                </div>
                {formData.description && (
                  <div className="review-item">
                    <span className="review-label">Description:</span>
                    <span className="review-value">{formData.description}</span>
                  </div>
                )}
              </div>

              <div className="review-section">
                <h3>Pricing</h3>
                <div className="review-item">
                  <span className="review-label">Base Price (per item):</span>
                  <span className="review-value">PKR {calculatedPricing.basePrice.toLocaleString()}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Quantity:</span>
                  <span className="review-value">{formData.quantity || 1}</span>
                </div>
                {calculatedPricing.quantity > 1 && (
                  <>
                    <div className="review-item">
                      <span className="review-label">Subtotal:</span>
                      <span className="review-value">PKR {calculatedPricing.subtotal?.toLocaleString() || 0}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Discount ({calculatedPricing.discountPercentage}%):</span>
                      <span className="review-value">- PKR {calculatedPricing.discount.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="review-item total">
                  <span className="review-label">Total Price:</span>
                  <span className="review-value">PKR {calculatedPricing.totalPrice.toLocaleString()}</span>
                </div>
                <small className="pricing-note">
                  Note: Final pricing may be adjusted by the tailor. Fabric cost and additional charges will be added separately.
                </small>
              </div>

              {measurements && (
                <div className="review-section">
                  <h3>Measurements</h3>
                  <p>
                    {useExistingMeasurements
                      ? `Using existing measurements for ${measurements.garmentType}`
                      : "New measurements will be saved"}
                  </p>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleBack} className="btn btn-secondary">
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Order"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

