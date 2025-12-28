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
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalData, setRentalData] = useState({
    startDate: "",
    endDate: "",
    rentalPeriod: "daily",
    pickupAddress: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const response = await api.get(`/equipment/${id}`);
      setEquipment(response.data.data);
    } catch (error) {
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
      navigate("/equipment/rentals/all");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit rental request");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!equipment) return <div>Equipment not found</div>;

  return (
    <div className="equipment-detail-container">
      <div className="container">
        <div className="equipment-detail">
          <div className="equipment-images">
            {equipment.images && equipment.images.length > 0 ? (
              <img src={equipment.images[0]} alt={equipment.name} />
            ) : (
              <div className="no-image">No image available</div>
            )}
          </div>

          <div className="equipment-info">
            <div className="equipment-header">
              <h1>{equipment.name}</h1>
              <span className={`condition-badge condition-${equipment.condition.toLowerCase().replace(" ", "-")}`}>
                {equipment.condition}
              </span>
            </div>

            <div className="equipment-meta">
              <p><strong>Category:</strong> {equipment.category}</p>
              {equipment.brand && <p><strong>Brand:</strong> {equipment.brand}</p>}
              {equipment.model && <p><strong>Model:</strong> {equipment.model}</p>}
              {equipment.yearOfManufacture && (
                <p><strong>Year:</strong> {equipment.yearOfManufacture}</p>
              )}
            </div>

            {equipment.description && (
              <div className="equipment-description">
                <h3>Description</h3>
                <p>{equipment.description}</p>
              </div>
            )}

            <div className="equipment-pricing-section">
              {equipment.isAvailableForRental && equipment.rentalPrice && (
                <div className="pricing-card">
                  <h3>Rental</h3>
                  <div className="price-main">
                    PKR {equipment.rentalPrice.toLocaleString()}/{equipment.rentalPeriod || "month"}
                  </div>
                  {user && equipment.owner._id !== user._id && (
                    <button
                      onClick={() => setShowRentalForm(true)}
                      className="btn btn-primary"
                    >
                      Request Rental
                    </button>
                  )}
                </div>
              )}

              {equipment.isAvailableForSale && equipment.salePrice && (
                <div className="pricing-card">
                  <h3>Sale Price</h3>
                  <div className="price-main">PKR {equipment.salePrice.toLocaleString()}</div>
                  {equipment.financingOptions?.available && (
                    <div className="financing-info">
                      <h4>Financing Available</h4>
                      <p>Down Payment: PKR {equipment.financingOptions.downPayment?.toLocaleString()}</p>
                      <p>Monthly: PKR {equipment.financingOptions.monthlyPayment?.toLocaleString()}</p>
                      <p>Tenure: {equipment.financingOptions.tenure} months</p>
                      <p>Interest Rate: {equipment.financingOptions.interestRate}%</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {equipment.upgradeAdvisory && equipment.upgradeAdvisory.recommendedUpgrades?.length > 0 && (
              <div className="upgrade-advisory">
                <h3>Upgrade Recommendations</h3>
                <p className="priority-badge">Priority: {equipment.upgradeAdvisory.priority}</p>
                <ul>
                  {equipment.upgradeAdvisory.recommendedUpgrades.map((upgrade, idx) => (
                    <li key={idx}>{upgrade}</li>
                  ))}
                </ul>
                {equipment.upgradeAdvisory.upgradeBenefits && (
                  <p><strong>Benefits:</strong> {equipment.upgradeAdvisory.upgradeBenefits}</p>
                )}
                {equipment.upgradeAdvisory.estimatedCost && (
                  <p><strong>Estimated Cost:</strong> PKR {equipment.upgradeAdvisory.estimatedCost.toLocaleString()}</p>
                )}
              </div>
            )}

            {equipment.location && (
              <div className="equipment-location">
                <h3>Location</h3>
                <p>
                  {equipment.location.address && `${equipment.location.address}, `}
                  {equipment.location.city}, {equipment.location.province}
                </p>
              </div>
            )}

            <div className="equipment-owner">
              <h3>Owner</h3>
              <Link to={`/suppliers/${equipment.owner._id}`}>
                {equipment.owner.businessName || equipment.owner.name}
              </Link>
              {equipment.owner.qualityRating > 0 && (
                <p>Quality Rating: {equipment.owner.qualityRating.toFixed(1)}/5</p>
              )}
            </div>

            {equipment.maintenanceHistory && equipment.maintenanceHistory.length > 0 && (
              <div className="maintenance-history">
                <h3>Maintenance History</h3>
                <div className="maintenance-list">
                  {equipment.maintenanceHistory.slice(-5).map((maintenance, idx) => (
                    <div key={idx} className="maintenance-item">
                      <p><strong>{maintenance.serviceType}</strong> - {new Date(maintenance.date).toLocaleDateString()}</p>
                      {maintenance.description && <p>{maintenance.description}</p>}
                      {maintenance.cost && <p>Cost: PKR {maintenance.cost.toLocaleString()}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showRentalForm && (
          <div className="modal-overlay" onClick={() => setShowRentalForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Request Equipment Rental</h2>
              <form onSubmit={handleRentalRequest}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={rentalData.startDate}
                    onChange={(e) => setRentalData({ ...rentalData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={rentalData.endDate}
                    onChange={(e) => setRentalData({ ...rentalData, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rental Period *</label>
                  <select
                    value={rentalData.rentalPeriod}
                    onChange={(e) => setRentalData({ ...rentalData, rentalPeriod: e.target.value })}
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pickup Address *</label>
                  <input
                    type="text"
                    placeholder="Street"
                    value={rentalData.pickupAddress.street}
                    onChange={(e) =>
                      setRentalData({
                        ...rentalData,
                        pickupAddress: { ...rentalData.pickupAddress, street: e.target.value },
                      })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={rentalData.pickupAddress.city}
                    onChange={(e) =>
                      setRentalData({
                        ...rentalData,
                        pickupAddress: { ...rentalData.pickupAddress, city: e.target.value },
                      })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Province"
                    value={rentalData.pickupAddress.province}
                    onChange={(e) =>
                      setRentalData({
                        ...rentalData,
                        pickupAddress: { ...rentalData.pickupAddress, province: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowRentalForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Submit Request</button>
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

