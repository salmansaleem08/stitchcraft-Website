import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./EquipmentForm.css";

const EquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    category: "Sewing Machine",
    brand: "",
    model: "",
    description: "",
    condition: "Good",
    yearOfManufacture: "",
    isAvailableForRental: false,
    rentalPrice: "",
    rentalPeriod: "monthly",
    isAvailableForSale: false,
    salePrice: "",
    location: {
      city: "",
      province: "",
      address: "",
    },
    financingOptions: {
      available: false,
      downPayment: "",
      monthlyPayment: "",
      tenure: "",
      interestRate: "",
      provider: "",
    },
    upgradeAdvisory: {
      recommendedUpgrades: "",
      upgradeBenefits: "",
      estimatedCost: "",
      priority: "Low",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchEquipment();
    }
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/${id}`);
      const eq = response.data.data;
      setFormData({
        name: eq.name || "",
        category: eq.category || "Sewing Machine",
        brand: eq.brand || "",
        model: eq.model || "",
        description: eq.description || "",
        condition: eq.condition || "Good",
        yearOfManufacture: eq.yearOfManufacture?.toString() || "",
        isAvailableForRental: eq.isAvailableForRental || false,
        rentalPrice: eq.rentalPrice?.toString() || "",
        rentalPeriod: eq.rentalPeriod || "monthly",
        isAvailableForSale: eq.isAvailableForSale || false,
        salePrice: eq.salePrice?.toString() || "",
        location: {
          city: eq.location?.city || "",
          province: eq.location?.province || "",
          address: eq.location?.address || "",
        },
        financingOptions: {
          available: eq.financingOptions?.available || false,
          downPayment: eq.financingOptions?.downPayment?.toString() || "",
          monthlyPayment: eq.financingOptions?.monthlyPayment?.toString() || "",
          tenure: eq.financingOptions?.tenure?.toString() || "",
          interestRate: eq.financingOptions?.interestRate?.toString() || "",
          provider: eq.financingOptions?.provider || "",
        },
        upgradeAdvisory: {
          recommendedUpgrades: eq.upgradeAdvisory?.recommendedUpgrades?.join("\n") || "",
          upgradeBenefits: eq.upgradeAdvisory?.upgradeBenefits || "",
          estimatedCost: eq.upgradeAdvisory?.estimatedCost?.toString() || "",
          priority: eq.upgradeAdvisory?.priority || "Low",
        },
      });
    } catch (error) {
      setError("Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      const submitData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        description: formData.description,
        condition: formData.condition,
        yearOfManufacture: formData.yearOfManufacture ? parseInt(formData.yearOfManufacture) : undefined,
        isAvailableForRental: formData.isAvailableForRental,
        rentalPrice: formData.isAvailableForRental && formData.rentalPrice ? parseFloat(formData.rentalPrice) : undefined,
        rentalPeriod: formData.rentalPeriod,
        isAvailableForSale: formData.isAvailableForSale,
        salePrice: formData.isAvailableForSale && formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        location: formData.location,
        financingOptions: formData.financingOptions.available
          ? {
              available: true,
              downPayment: parseFloat(formData.financingOptions.downPayment) || 0,
              monthlyPayment: parseFloat(formData.financingOptions.monthlyPayment) || 0,
              tenure: parseInt(formData.financingOptions.tenure) || 0,
              interestRate: parseFloat(formData.financingOptions.interestRate) || 0,
              provider: formData.financingOptions.provider,
            }
          : { available: false },
        upgradeAdvisory: formData.upgradeAdvisory.recommendedUpgrades
          ? {
              recommendedUpgrades: formData.upgradeAdvisory.recommendedUpgrades.split("\n").filter((u) => u.trim()),
              upgradeBenefits: formData.upgradeAdvisory.upgradeBenefits,
              estimatedCost: formData.upgradeAdvisory.estimatedCost ? parseFloat(formData.upgradeAdvisory.estimatedCost) : undefined,
              priority: formData.upgradeAdvisory.priority,
            }
          : undefined,
      };

      if (isEditMode) {
        await api.put(`/equipment/${id}`, submitData);
        navigate(`/equipment/${id}`);
      } else {
        const response = await api.post("/equipment", submitData);
        navigate(`/equipment/${response.data.data._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save equipment");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="equipment-form-container"><div className="loading-container">Loading...</div></div>;
  }

  return (
    <div className="equipment-form-container">
      <div className="container">
        <div className="page-header">
          <h1>{isEditMode ? "Edit Equipment" : "List New Equipment"}</h1>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Back
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Industrial Sewing Machine"
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="Sewing Machine">Sewing Machine</option>
                  <option value="Embroidery Machine">Embroidery Machine</option>
                  <option value="Cutting Machine">Cutting Machine</option>
                  <option value="Pressing Equipment">Pressing Equipment</option>
                  <option value="Measuring Tools">Measuring Tools</option>
                  <option value="Mannequin">Mannequin</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Brother, Singer"
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Model number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Condition *</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  required
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Repair">Needs Repair</option>
                </select>
              </div>
              <div className="form-group">
                <label>Year of Manufacture</label>
                <input
                  type="number"
                  value={formData.yearOfManufacture}
                  onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="5"
                placeholder="Detailed description of the equipment..."
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h2>Rental Information</h2>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isAvailableForRental}
                  onChange={(e) => setFormData({ ...formData, isAvailableForRental: e.target.checked })}
                />{" "}
                Available for Rental
              </label>
            </div>

            {formData.isAvailableForRental && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rental Price (PKR) *</label>
                    <input
                      type="number"
                      value={formData.rentalPrice}
                      onChange={(e) => setFormData({ ...formData, rentalPrice: e.target.value })}
                      min="0"
                      required={formData.isAvailableForRental}
                    />
                  </div>
                  <div className="form-group">
                    <label>Rental Period *</label>
                    <select
                      value={formData.rentalPeriod}
                      onChange={(e) => setFormData({ ...formData, rentalPeriod: e.target.value })}
                      required={formData.isAvailableForRental}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-section">
            <h2>Sale Information</h2>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isAvailableForSale}
                  onChange={(e) => setFormData({ ...formData, isAvailableForSale: e.target.checked })}
                />{" "}
                Available for Sale
              </label>
            </div>

            {formData.isAvailableForSale && (
              <div className="form-group">
                <label>Sale Price (PKR) *</label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  min="0"
                  required={formData.isAvailableForSale}
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Financing Options</h2>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.financingOptions.available}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      financingOptions: { ...formData.financingOptions, available: e.target.checked },
                    })
                  }
                />{" "}
                Financing Available
              </label>
            </div>

            {formData.financingOptions.available && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Down Payment (PKR)</label>
                    <input
                      type="number"
                      value={formData.financingOptions.downPayment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          financingOptions: { ...formData.financingOptions, downPayment: e.target.value },
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Payment (PKR)</label>
                    <input
                      type="number"
                      value={formData.financingOptions.monthlyPayment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          financingOptions: { ...formData.financingOptions, monthlyPayment: e.target.value },
                        })
                      }
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tenure (months)</label>
                    <input
                      type="number"
                      value={formData.financingOptions.tenure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          financingOptions: { ...formData.financingOptions, tenure: e.target.value },
                        })
                      }
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Interest Rate (%)</label>
                    <input
                      type="number"
                      value={formData.financingOptions.interestRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          financingOptions: { ...formData.financingOptions, interestRate: e.target.value },
                        })
                      }
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Financing Provider</label>
                  <input
                    type="text"
                    value={formData.financingOptions.provider}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        financingOptions: { ...formData.financingOptions, provider: e.target.value },
                      })
                    }
                    placeholder="e.g., Bank Name, Finance Company"
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-section">
            <h2>Upgrade Advisory</h2>
            <div className="form-group">
              <label>Recommended Upgrades (one per line)</label>
              <textarea
                value={formData.upgradeAdvisory.recommendedUpgrades}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    upgradeAdvisory: { ...formData.upgradeAdvisory, recommendedUpgrades: e.target.value },
                  })
                }
                rows="4"
                placeholder="Enter recommended upgrades, one per line..."
              ></textarea>
            </div>
            <div className="form-group">
              <label>Upgrade Benefits</label>
              <textarea
                value={formData.upgradeAdvisory.upgradeBenefits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    upgradeAdvisory: { ...formData.upgradeAdvisory, upgradeBenefits: e.target.value },
                  })
                }
                rows="3"
                placeholder="Describe the benefits of these upgrades..."
              ></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Estimated Cost (PKR)</label>
                <input
                  type="number"
                  value={formData.upgradeAdvisory.estimatedCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      upgradeAdvisory: { ...formData.upgradeAdvisory, estimatedCost: e.target.value },
                    })
                  }
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.upgradeAdvisory.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      upgradeAdvisory: { ...formData.upgradeAdvisory, priority: e.target.value },
                    })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Province *</label>
                <input
                  type="text"
                  value={formData.location.province}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, province: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Equipment" : "List Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;

