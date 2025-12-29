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
    rentalStartDate: "",
    rentalEndDate: "",
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
    try {
      await api.post(`/equipment/${id}/rent`, rentalData);
      alert("Rental request submitted successfully!");
      setShowRentalForm(false);
      navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit rental request");
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

  const isSupplier = user?.role === "supplier" && user?._id === equipment.supplier._id;

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
              {equipment.isRentable && equipment.rentalPricePerDay && (
                <div className="pricing-card">
                  <h3>Rental</h3>
                  <div className="price-main">
                    PKR {equipment.rentalPricePerDay.toLocaleString()}/day
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

              {equipment.isSellable && equipment.salePrice && (
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
              <Link to={`/suppliers/${equipment.supplier._id}`} className="supplier-link">
                {equipment.supplier?.businessName || equipment.supplier?.name}
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
                    value={rentalData.rentalStartDate}
                    onChange={(e) => setRentalData({ ...rentalData, rentalStartDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End date *</label>
                  <input
                    type="date"
                    value={rentalData.rentalEndDate}
                    onChange={(e) => setRentalData({ ...rentalData, rentalEndDate: e.target.value })}
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
