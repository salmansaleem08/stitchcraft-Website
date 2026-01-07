import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./EquipmentDetail.css";

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalData, setRentalData] = useState({
    startDate: "",
    endDate: "",
    deliveryAddress: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
    notes: "",
  });

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/${id}`);
      setEquipment(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load equipment details");
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRentalRequest = async (e) => {
    e.preventDefault();

    // Validate dates
    if (!rentalData.startDate || !rentalData.endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const startDate = new Date(rentalData.startDate);
    const endDate = new Date(rentalData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      alert("Start date cannot be in the past");
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after start date");
      return;
    }

    // Validate delivery address
    if (!rentalData.deliveryAddress.street || !rentalData.deliveryAddress.city) {
      alert("Please provide delivery address (street and city are required)");
      return;
    }

    try {
      // Prepare data for backend
      const submitData = {
        startDate: rentalData.startDate,
        endDate: rentalData.endDate,
        pickupAddress: rentalData.deliveryAddress, // Backend expects pickupAddress
        rentalPeriod: "daily", // Default to daily
        notes: rentalData.notes,
      };

      console.log("Submitting rental data:", submitData);
      console.log("Start date valid:", !!rentalData.startDate && !isNaN(new Date(rentalData.startDate).getTime()));
      console.log("End date valid:", !!rentalData.endDate && !isNaN(new Date(rentalData.endDate).getTime()));

      await api.post(`/equipment/${id}/rent`, submitData);
      alert("Rental request submitted successfully!");
      setShowRentalForm(false);
      setRentalData({
        startDate: "",
        endDate: "",
        deliveryAddress: {
          street: "",
          city: "",
          province: "",
          postalCode: "",
        },
        notes: "",
      });
      navigate("/orders");
    } catch (error) {
      console.error("Rental request error:", error);
      alert(error.response?.data?.message || "Failed to submit rental request");
    }
  };

  const handlePurchaseRequest = async () => {
    if (!equipment.saleStock || equipment.saleStock <= 0) {
      alert("This equipment is currently out of stock.");
      return;
    }

    try {
      const response = await api.post(`/equipment/${id}/buy`);
      alert("Purchase request submitted successfully! You will be contacted soon.");
      // Refresh equipment data to update stock
      fetchEquipment();
    } catch (error) {
      console.error("Error submitting purchase request:", error);
      alert(error.response?.data?.message || "Failed to submit purchase request. Please try again.");
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setRentalData((prev) => ({
      ...prev,
      deliveryAddress: {
        ...prev.deliveryAddress,
        [name]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="equipment-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="equipment-detail-container">
        <div className="container">
          <div className="error-message">{error || "Equipment not found"}</div>
          <Link to="/equipment" className="btn btn-secondary">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isSupplier = user?.role === "supplier" && user?._id === equipment.owner._id;

  return (
    <div className="equipment-detail-container">
      <div className="container">
        <Link to="/equipment" className="back-link">
          ← Back
        </Link>

        <div className="equipment-detail-layout">
          <div className="equipment-images">
            {equipment.images && equipment.images.length > 0 ? (
              <div className="main-image">
                <img src={equipment.images[0]} alt={equipment.name} />
              </div>
            ) : (
              <div className="image-placeholder">No image available</div>
            )}
            {equipment.images && equipment.images.length > 1 && (
              <div className="image-thumbnails">
                {equipment.images.map((image, idx) => (
                  <img key={idx} src={image} alt={`${equipment.name} ${idx + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="equipment-info">
            <div className="equipment-header">
              <h1>{equipment.name}</h1>
              {isSupplier && (
                <Link to={`/equipment/${equipment._id}/edit`} className="btn btn-secondary btn-small">
                  Edit
                </Link>
              )}
            </div>

            <div className="equipment-meta">
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{equipment.category}</span>
              </div>
              {equipment.brand && (
                <div className="meta-item">
                  <span className="meta-label">Brand</span>
                  <span className="meta-value">{equipment.brand}</span>
                </div>
              )}
              {equipment.model && (
                <div className="meta-item">
                  <span className="meta-label">Model</span>
                  <span className="meta-value">{equipment.model}</span>
                </div>
              )}
            </div>

            {equipment.description && (
              <div className="description-section">
                <h3>Description</h3>
                <p>{equipment.description}</p>
              </div>
            )}

            <div className="pricing-section">
              {equipment.isAvailableForRental && equipment.rentalPrice && (
                <div className="pricing-card">
                  <h3>Rental</h3>
                  <div className="price-main">
                    PKR {equipment.rentalPrice.toLocaleString()}/day
                  </div>
                  {equipment.minRentalDays && (
                    <p className="rental-info">Minimum rental: {equipment.minRentalDays} days</p>
                  )}
                  {equipment.rentalStock !== undefined && (
                    <p className="stock-info">
                      Available: {equipment.rentalStock} unit{equipment.rentalStock !== 1 ? "s" : ""}
                    </p>
                  )}
                  {user && user.role !== "supplier" && (
                    <button
                      onClick={() => setShowRentalForm(true)}
                      className="btn btn-primary"
                    >
                      Request rental
                    </button>
                  )}
                </div>
              )}

              {equipment.isAvailableForSale && equipment.salePrice && (
                <div className="pricing-card">
                  <h3>Sale price</h3>
                  <div className="price-main">
                    PKR {equipment.salePrice.toLocaleString()}
                  </div>
                  {equipment.saleStock !== undefined && (
                    <p className="stock-info">
                      In stock: {equipment.saleStock} unit{equipment.saleStock !== 1 ? "s" : ""}
                    </p>
                  )}
                  {equipment.financingOptions?.enabled && (
                    <div className="financing-info">
                      <h4>Financing available</h4>
                      <p>Down payment: {equipment.financingOptions.downPaymentPercentage}%</p>
                      <p>Monthly: PKR {equipment.financingOptions.monthlyPaymentEstimate?.toLocaleString()}</p>
                      <p>Tenure: {equipment.financingOptions.tenureMonths} months</p>
                    </div>
                  )}
                  {user && user.role !== "supplier" && (
                    <div className="action-buttons">
                      <button
                        onClick={() => handlePurchaseRequest()}
                        className="btn btn-primary"
                        disabled={!equipment.saleStock || equipment.saleStock <= 0}
                      >
                        {equipment.saleStock && equipment.saleStock > 0 ? "Buy Now" : "Out of Stock"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {equipment.upgradeAdvisory?.recommendedUpgrade && (
              <div className="upgrade-section">
                <h3>Upgrade recommendations</h3>
                <p className="upgrade-text">{equipment.upgradeAdvisory.recommendedUpgrade}</p>
                {equipment.upgradeAdvisory.benefits && equipment.upgradeAdvisory.benefits.length > 0 && (
                  <ul className="upgrade-benefits">
                    {equipment.upgradeAdvisory.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                )}
                {equipment.upgradeAdvisory.estimatedCost && (
                  <p className="upgrade-cost">
                    Estimated cost: PKR {equipment.upgradeAdvisory.estimatedCost.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="supplier-section">
              <h3>Supplier</h3>
              <Link to={`/suppliers/${equipment.owner._id}`} className="supplier-link">
                {equipment.owner?.businessName || equipment.owner?.name}
              </Link>
            </div>
          </div>
        </div>

        {showRentalForm && (
          <div className="modal-overlay" onClick={() => setShowRentalForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Request equipment rental</h2>
              <form onSubmit={handleRentalRequest}>
                <div className="form-group">
                  <label>Start date *</label>
                  <input
                    type="date"
                    value={rentalData.startDate}
                    onChange={(e) => setRentalData({ ...rentalData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End date *</label>
                  <input
                    type="date"
                    value={rentalData.endDate}
                    onChange={(e) => setRentalData({ ...rentalData, endDate: e.target.value })}
                    min={rentalData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Delivery address *</label>
                  <input
                    type="text"
                    name="street"
                    placeholder="Street"
                    value={rentalData.deliveryAddress.street}
                    onChange={handleAddressChange}
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={rentalData.deliveryAddress.city}
                    onChange={handleAddressChange}
                    required
                  />
                  <input
                    type="text"
                    name="province"
                    placeholder="Province"
                    value={rentalData.deliveryAddress.province}
                    onChange={handleAddressChange}
                    required
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal code"
                    value={rentalData.deliveryAddress.postalCode}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={rentalData.notes}
                    onChange={(e) => setRentalData({ ...rentalData, notes: e.target.value })}
                    rows="3"
                    placeholder="Any special instructions..."
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowRentalForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Submit request</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetail;
