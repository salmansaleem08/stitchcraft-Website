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

  const handleCustomMeasurementAdd = () => {
    const name = prompt("Enter measurement name:");
    if (name) {
      setCustomMeasurements({
        ...customMeasurements,
        [name]: 0,
      });
    }
  };

  const handleCustomMeasurementChange = (name, value) => {
    setCustomMeasurements({
      ...customMeasurements,
      [name]: parseFloat(value) || 0,
    });
  };

  const handleAddAdjustment = () => {
    const area = prompt("Enter area (e.g., chest, waist):");
    const adjustment = prompt("Enter adjustment (e.g., +2cm, -1cm):");
    const reason = prompt("Enter reason:");
    if (area && adjustment) {
      setSizeAdjustments([
        ...sizeAdjustments,
        { area, adjustment, reason: reason || "" },
      ]);
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

      <button
        type="button"
        onClick={handleCustomMeasurementAdd}
        className="btn btn-secondary"
      >
        Add Custom Measurement
      </button>

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

      <button
        type="button"
        onClick={handleAddAdjustment}
        className="btn btn-secondary"
      >
        Add Size Adjustment
      </button>

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

