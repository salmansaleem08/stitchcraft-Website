import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./MeasurementForm.css";

const MeasurementForm = ({ garmentType, onSave, initialData = null }) => {
  const [template, setTemplate] = useState(null);
  const [measurements, setMeasurements] = useState({});
  const [customMeasurements, setCustomMeasurements] = useState({});
  const [recommendedSize, setRecommendedSize] = useState("");
  const [sizeAdjustments, setSizeAdjustments] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (garmentType) {
      fetchTemplate();
    }
    if (initialData) {
      setMeasurements(initialData.measurements || {});
      setRecommendedSize(initialData.recommendedSize || "");
      setSizeAdjustments(initialData.sizeAdjustments || []);
      setNotes(initialData.notes || "");
    }
  }, [garmentType, initialData]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const templateKey = garmentType.toLowerCase().replace(/\s+/g, "_");
      const response = await api.get(`/measurements/templates?garmentType=${templateKey}`);
      if (response.data.data) {
        setTemplate(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurements({
      ...measurements,
      [field]: parseFloat(value) || 0,
    });
  };

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCustomName, setNewCustomName] = useState("");

  const handleCustomMeasurementAdd = () => {
    if (newCustomName.trim()) {
      setCustomMeasurements({
        ...customMeasurements,
        [newCustomName.trim()]: 0,
      });
      setNewCustomName("");
      setShowCustomInput(false);
    }
  };

  const handleCustomMeasurementChange = (name, value) => {
    setCustomMeasurements({
      ...customMeasurements,
      [name]: parseFloat(value) || 0,
    });
  };

  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState({
    area: "",
    adjustment: "",
    reason: "",
  });

  const handleAddAdjustment = () => {
    if (newAdjustment.area && newAdjustment.adjustment) {
      setSizeAdjustments([
        ...sizeAdjustments,
        { ...newAdjustment },
      ]);
      setNewAdjustment({ area: "", adjustment: "", reason: "" });
      setShowAdjustmentForm(false);
    }
  };

  const handleSave = () => {
    const allMeasurements = {
      ...measurements,
      custom: customMeasurements,
    };

    onSave({
      measurements: allMeasurements,
      recommendedSize,
      sizeAdjustments,
      notes,
    });
  };

  if (loading) {
    return <div className="loading-container">Loading template...</div>;
  }

  const measurementFields = template?.measurements || [
    "chest",
    "waist",
    "hips",
    "shoulder",
    "sleeveLength",
    "bicep",
    "neck",
    "fullLength",
    "backLength",
  ];

  return (
    <div className="measurement-form">
      <h3>Enter Measurements (in cm)</h3>

      <div className="measurements-grid">
        {measurementFields.map((field) => (
          <div key={field} className="measurement-input-group">
            <label htmlFor={field}>
              {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="number"
              id={field}
              value={measurements[field] || ""}
              onChange={(e) => handleMeasurementChange(field, e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
            />
            <span className="unit">cm</span>
          </div>
        ))}
      </div>

      {Object.keys(customMeasurements).length > 0 && (
        <div className="custom-measurements">
          <h4>Custom Measurements</h4>
          <div className="measurements-grid">
            {Object.entries(customMeasurements).map(([name, value]) => (
              <div key={name} className="measurement-input-group">
                <label>{name}</label>
                <input
                  type="number"
                  value={value || ""}
                  onChange={(e) => handleCustomMeasurementChange(name, e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="unit">cm</span>
                <button
                  type="button"
                  onClick={() => {
                    const newCustom = { ...customMeasurements };
                    delete newCustom[name];
                    setCustomMeasurements(newCustom);
                  }}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="custom-measurement-add">
        {!showCustomInput ? (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="btn btn-secondary"
          >
            Add Custom Measurement
          </button>
        ) : (
          <div className="custom-input-group">
            <input
              type="text"
              placeholder="Measurement name (e.g., armhole, cuff)"
              value={newCustomName}
              onChange={(e) => setNewCustomName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCustomMeasurementAdd()}
              className="custom-name-input"
              autoFocus
            />
            <button
              type="button"
              onClick={handleCustomMeasurementAdd}
              className="btn btn-primary btn-small"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setNewCustomName("");
              }}
              className="btn btn-text btn-small"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="recommendedSize">Recommended Size</label>
        <input
          type="text"
          id="recommendedSize"
          value={recommendedSize}
          onChange={(e) => setRecommendedSize(e.target.value)}
          placeholder="e.g., Medium, Large, 38"
        />
      </div>

      {sizeAdjustments.length > 0 && (
        <div className="size-adjustments">
          <h4>Size Adjustments</h4>
          {sizeAdjustments.map((adj, idx) => (
            <div key={idx} className="adjustment-item">
              <span>
                <strong>{adj.area}:</strong> {adj.adjustment}
              </span>
              {adj.reason && <span className="reason">({adj.reason})</span>}
              <button
                type="button"
                onClick={() => {
                  setSizeAdjustments(sizeAdjustments.filter((_, i) => i !== idx));
                }}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="adjustment-add-section">
        {!showAdjustmentForm ? (
          <button
            type="button"
            onClick={() => setShowAdjustmentForm(true)}
            className="btn btn-secondary"
          >
            Add Size Adjustment
          </button>
        ) : (
          <div className="adjustment-form">
            <div className="form-group">
              <label>Area</label>
              <input
                type="text"
                placeholder="e.g., chest, waist"
                value={newAdjustment.area}
                onChange={(e) =>
                  setNewAdjustment({ ...newAdjustment, area: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Adjustment</label>
              <input
                type="text"
                placeholder="e.g., +2cm, -1cm"
                value={newAdjustment.adjustment}
                onChange={(e) =>
                  setNewAdjustment({ ...newAdjustment, adjustment: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <input
                type="text"
                placeholder="Why this adjustment?"
                value={newAdjustment.reason}
                onChange={(e) =>
                  setNewAdjustment({ ...newAdjustment, reason: e.target.value })
                }
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={handleAddAdjustment}
                className="btn btn-primary"
              >
                Add Adjustment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdjustmentForm(false);
                  setNewAdjustment({ area: "", adjustment: "", reason: "" });
                }}
                className="btn btn-text"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="3"
          placeholder="Any additional notes about measurements..."
        />
      </div>

      <button type="button" onClick={handleSave} className="btn btn-primary">
        Save Measurements
      </button>
    </div>
  );
};

export default MeasurementForm;

