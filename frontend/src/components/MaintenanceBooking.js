import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./MaintenanceBooking.css";

const MaintenanceBooking = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceProvider: "",
    equipment: "",
    equipmentDetails: {
      name: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
    },
    serviceType: "Routine Maintenance",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    location: {
      type: "customer_location",
      address: {
        street: "",
        city: "",
        province: "",
        postalCode: "",
      },
    },
    estimatedCost: "",
  });

  useEffect(() => {
    fetchServices();
    fetchProviders();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("/maintenance");
      setServices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await api.get("/maintenance/providers");
      setProviders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/maintenance", formData);
      alert("Maintenance service booked successfully!");
      setShowBookingForm(false);
      resetForm();
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to book service");
    }
  };

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      equipment: "",
      equipmentDetails: {
        name: "",
        category: "",
        brand: "",
        model: "",
        serialNumber: "",
      },
      serviceType: "Routine Maintenance",
      description: "",
      scheduledDate: "",
      scheduledTime: "",
      location: {
        type: "customer_location",
        address: {
          street: "",
          city: "",
          province: "",
          postalCode: "",
        },
      },
      estimatedCost: "",
    });
  };

  if (loading) {
    return <div className="maintenance-booking-container"><div className="loading-container">Loading...</div></div>;
  }

  return (
    <div className="maintenance-booking-container">
      <div className="container">
        <div className="page-header">
          <h1>Maintenance Service Booking</h1>
          {user && (
            <button onClick={() => setShowBookingForm(true)} className="btn btn-primary">
              Book Service
            </button>
          )}
        </div>

        {showBookingForm && (
          <div className="booking-form-section">
            <h2>Book Maintenance Service</h2>
            <form onSubmit={handleSubmit} className="maintenance-form">
              <div className="form-group">
                <label>Service Provider *</label>
                <select
                  value={formData.serviceProvider}
                  onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                  required
                >
                  <option value="">Select Provider</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.businessName || provider.name}
                      {provider.verificationStatus === "verified" && " (Verified)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Service Type *</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                >
                  <option value="Routine Maintenance">Routine Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="Installation">Installation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  value={formData.equipmentDetails.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipmentDetails: { ...formData.equipmentDetails, name: e.target.value },
                    })
                  }
                  required
                  placeholder="e.g., Industrial Sewing Machine"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.equipmentDetails.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipmentDetails: { ...formData.equipmentDetails, category: e.target.value },
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    <option value="Sewing Machine">Sewing Machine</option>
                    <option value="Embroidery Machine">Embroidery Machine</option>
                    <option value="Cutting Machine">Cutting Machine</option>
                    <option value="Pressing Equipment">Pressing Equipment</option>
                    <option value="Measuring Tools">Measuring Tools</option>
                    <option value="Mannequin">Mannequin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.equipmentDetails.brand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipmentDetails: { ...formData.equipmentDetails, brand: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    value={formData.equipmentDetails.model}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipmentDetails: { ...formData.equipmentDetails, model: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    value={formData.equipmentDetails.serialNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipmentDetails: { ...formData.equipmentDetails, serialNumber: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="5"
                  placeholder="Describe the issue or service needed..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Scheduled Date *</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Scheduled Time</label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Service Location *</label>
                <select
                  value={formData.location.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, type: e.target.value },
                    })
                  }
                  required
                >
                  <option value="customer_location">Customer Location</option>
                  <option value="service_center">Service Center</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.location.type === "customer_location" && (
                <>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      value={formData.location.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            address: { ...formData.location.address, street: e.target.value },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={formData.location.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              address: { ...formData.location.address, city: e.target.value },
                            },
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Province *</label>
                      <input
                        type="text"
                        value={formData.location.address.province}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              address: { ...formData.location.address, province: e.target.value },
                            },
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Estimated Cost (PKR)</label>
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  min="0"
                  placeholder="Leave blank if unknown"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => { setShowBookingForm(false); resetForm(); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Book Service</button>
              </div>
            </form>
          </div>
        )}

        {services.length > 0 && (
          <div className="services-list">
            <h2>My Maintenance Services</h2>
            <div className="services-grid">
              {services.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-header">
                    <h3>{service.serviceType}</h3>
                    <span className={`status-badge status-${service.status}`}>
                      {service.status}
                    </span>
                  </div>
                  <p><strong>Equipment:</strong> {service.equipmentDetails?.name || service.equipment?.name || "N/A"}</p>
                  <p><strong>Scheduled:</strong> {new Date(service.scheduledDate).toLocaleDateString()}</p>
                  {service.scheduledTime && <p><strong>Time:</strong> {service.scheduledTime}</p>}
                  {service.estimatedCost && (
                    <p><strong>Estimated Cost:</strong> PKR {service.estimatedCost.toLocaleString()}</p>
                  )}
                  {service.actualCost && (
                    <p><strong>Actual Cost:</strong> PKR {service.actualCost.toLocaleString()}</p>
                  )}
                  <p><strong>Provider:</strong> {service.serviceProvider?.businessName || service.serviceProvider?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceBooking;

