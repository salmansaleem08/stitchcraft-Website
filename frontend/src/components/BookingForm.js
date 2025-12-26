import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import MeasurementForm from "./MeasurementForm";
import "./BookingForm.css";

const BookingForm = () => {
  const { id: tailorId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tailor, setTailor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Service Details, 2: Measurements, 3: Review

  const [formData, setFormData] = useState({
    serviceType: "",
    garmentType: "",
    description: "",
    basePrice: "",
    fabricCost: "",
    additionalCharges: "",
    discount: "",
    consultationDate: "",
    estimatedCompletionDate: "",
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
  }, [tailorId]);

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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.serviceType || !formData.garmentType || !formData.basePrice) {
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

  const calculateTotal = () => {
    const base = parseFloat(formData.basePrice) || 0;
    const fabric = parseFloat(formData.fabricCost) || 0;
    const additional = parseFloat(formData.additionalCharges) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return base + fabric + additional - discount;
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
        serviceType: formData.serviceType,
        garmentType: formData.garmentType,
        description: formData.description,
        measurements: measurementId,
        consultationDate: formData.consultationDate || undefined,
        basePrice: parseFloat(formData.basePrice),
        fabricCost: parseFloat(formData.fabricCost) || 0,
        additionalCharges: parseFloat(formData.additionalCharges) || 0,
        discount: parseFloat(formData.discount) || 0,
        estimatedCompletionDate: formData.estimatedCompletionDate || undefined,
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
          <h1>Book Service with {tailor.shopName || tailor.name}</h1>
          <p>Fill in the details to place your order</p>
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="basePrice">Base Price (PKR) *</label>
                  <input
                    type="number"
                    id="basePrice"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fabricCost">Fabric Cost (PKR)</label>
                  <input
                    type="number"
                    id="fabricCost"
                    name="fabricCost"
                    value={formData.fabricCost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="additionalCharges">Additional Charges (PKR)</label>
                  <input
                    type="number"
                    id="additionalCharges"
                    name="additionalCharges"
                    value={formData.additionalCharges}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discount">Discount (PKR)</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

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
                <MeasurementForm
                  garmentType={formData.garmentType}
                  onSave={handleMeasurementSave}
                />
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
                  <span className="review-label">Base Price:</span>
                  <span className="review-value">PKR {formData.basePrice}</span>
                </div>
                {formData.fabricCost && (
                  <div className="review-item">
                    <span className="review-label">Fabric Cost:</span>
                    <span className="review-value">PKR {formData.fabricCost}</span>
                  </div>
                )}
                {formData.additionalCharges && (
                  <div className="review-item">
                    <span className="review-label">Additional Charges:</span>
                    <span className="review-value">PKR {formData.additionalCharges}</span>
                  </div>
                )}
                {formData.discount && (
                  <div className="review-item">
                    <span className="review-label">Discount:</span>
                    <span className="review-value">- PKR {formData.discount}</span>
                  </div>
                )}
                <div className="review-item total">
                  <span className="review-label">Total Price:</span>
                  <span className="review-value">PKR {calculateTotal().toFixed(2)}</span>
                </div>
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

