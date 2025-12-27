import React, { useState } from "react";
import api from "../utils/api";
import "./PatternTools.css";

const PatternTools = () => {
  const [activeTool, setActiveTool] = useState("scaling");
  const [scalingResult, setScalingResult] = useState(null);
  const [fabricResult, setFabricResult] = useState(null);
  const [modificationResult, setModificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Scaling calculator state
  const [scalingData, setScalingData] = useState({
    originalSize: "",
    targetSize: "",
    measurements: {
      original: { chest: "", waist: "", hips: "", length: "" },
      target: { chest: "", waist: "", hips: "", length: "" },
    },
  });

  // Fabric estimator state
  const [fabricData, setFabricData] = useState({
    garmentType: "",
    size: "",
    fabricWidth: "",
    patternComplexity: "",
    designDetails: [],
  });

  // Modification tool state
  const [modificationData, setModificationData] = useState({
    patternType: "",
    modificationType: "",
  });

  const handleScalingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/pattern-tools/scale", scalingData);
      setScalingResult(response.data.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to calculate scaling");
    } finally {
      setLoading(false);
    }
  };

  const handleFabricEstimate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/pattern-tools/fabric-estimate", fabricData);
      setFabricResult(response.data.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to estimate fabric");
    } finally {
      setLoading(false);
    }
  };

  const handleModificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/pattern-tools/modify", modificationData);
      setModificationResult(response.data.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  };

  const toggleDesignDetail = (detail) => {
    setFabricData((prev) => ({
      ...prev,
      designDetails: prev.designDetails.includes(detail)
        ? prev.designDetails.filter((d) => d !== detail)
        : [...prev.designDetails, detail],
    }));
  };

  return (
    <div className="pattern-tools">
      <div className="container">
        <div className="tools-header">
          <h1>Pattern Design Tools</h1>
          <p>Use our calculators and estimators to help with your pattern projects</p>
        </div>

        <div className="tools-tabs">
          <button
            onClick={() => setActiveTool("scaling")}
            className={`tab-button ${activeTool === "scaling" ? "active" : ""}`}
          >
            Pattern Scaling Calculator
          </button>
          <button
            onClick={() => setActiveTool("fabric")}
            className={`tab-button ${activeTool === "fabric" ? "active" : ""}`}
          >
            Fabric Requirement Estimator
          </button>
          <button
            onClick={() => setActiveTool("modify")}
            className={`tab-button ${activeTool === "modify" ? "active" : ""}`}
          >
            Design Modification Guide
          </button>
        </div>

        <div className="tool-content">
          {activeTool === "scaling" && (
            <div className="tool-section">
              <h2>Pattern Scaling Calculator</h2>
              <p>Calculate how to scale a pattern from one size to another</p>
              <form onSubmit={handleScalingSubmit} className="tool-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Original Size</label>
                    <select
                      value={scalingData.originalSize}
                      onChange={(e) => setScalingData({ ...scalingData, originalSize: e.target.value })}
                      required
                    >
                      <option value="">Select Size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                      <option value="3XL">3XL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Target Size</label>
                    <select
                      value={scalingData.targetSize}
                      onChange={(e) => setScalingData({ ...scalingData, targetSize: e.target.value })}
                      required
                    >
                      <option value="">Select Size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                      <option value="3XL">3XL</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Calculating..." : "Calculate Scaling"}
                </button>
              </form>

              {scalingResult && (
                <div className="tool-result">
                  <h3>Scaling Results</h3>
                  <div className="result-grid">
                    <div className="result-item">
                      <strong>Average Scale Factor:</strong> {scalingResult.averageScale}x
                    </div>
                    <div className="result-item">
                      <strong>Chest Scale:</strong> {Math.round(scalingResult.scaleFactors.chest * 100)}%
                    </div>
                    <div className="result-item">
                      <strong>Waist Scale:</strong> {Math.round(scalingResult.scaleFactors.waist * 100)}%
                    </div>
                    <div className="result-item">
                      <strong>Hips Scale:</strong> {Math.round(scalingResult.scaleFactors.hips * 100)}%
                    </div>
                    <div className="result-item">
                      <strong>Length Scale:</strong> {Math.round(scalingResult.scaleFactors.length * 100)}%
                    </div>
                  </div>
                  <div className="recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                      {Object.values(scalingResult.recommendations).map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTool === "fabric" && (
            <div className="tool-section">
              <h2>Fabric Requirement Estimator</h2>
              <p>Estimate how much fabric you need for your pattern</p>
              <form onSubmit={handleFabricEstimate} className="tool-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Garment Type</label>
                    <select
                      value={fabricData.garmentType}
                      onChange={(e) => setFabricData({ ...fabricData, garmentType: e.target.value })}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Kurta">Kurta</option>
                      <option value="Shalwar">Shalwar</option>
                      <option value="Dupatta">Dupatta</option>
                      <option value="Saree">Saree</option>
                      <option value="Lehenga">Lehenga</option>
                      <option value="Gown">Gown</option>
                      <option value="Shirt">Shirt</option>
                      <option value="Trouser">Trouser</option>
                      <option value="Jacket">Jacket</option>
                      <option value="Coat">Coat</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Size</label>
                    <select
                      value={fabricData.size}
                      onChange={(e) => setFabricData({ ...fabricData, size: e.target.value })}
                      required
                    >
                      <option value="">Select Size</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fabric Width (meters)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={fabricData.fabricWidth}
                      onChange={(e) => setFabricData({ ...fabricData, fabricWidth: e.target.value })}
                      placeholder="e.g., 1.14"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pattern Complexity</label>
                    <select
                      value={fabricData.patternComplexity}
                      onChange={(e) => setFabricData({ ...fabricData, patternComplexity: e.target.value })}
                    >
                      <option value="">Select Complexity</option>
                      <option value="Simple">Simple</option>
                      <option value="Medium">Medium</option>
                      <option value="Complex">Complex</option>
                      <option value="Very Complex">Very Complex</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Design Details (select all that apply)</label>
                  <div className="checkbox-group">
                    {["pleats", "gathers", "ruffles", "lining"].map((detail) => (
                      <label key={detail} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={fabricData.designDetails.includes(detail)}
                          onChange={() => toggleDesignDetail(detail)}
                        />
                        {detail.charAt(0).toUpperCase() + detail.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Calculating..." : "Estimate Fabric"}
                </button>
              </form>

              {fabricResult && (
                <div className="tool-result">
                  <h3>Fabric Estimates</h3>
                  <div className="result-grid">
                    <div className="result-item">
                      <strong>Base Requirement:</strong> {fabricResult.estimates.base.meters} m ({fabricResult.estimates.base.yards} yds)
                    </div>
                    <div className="result-item">
                      <strong>Adjusted Requirement:</strong> {fabricResult.estimates.adjusted.meters} m ({fabricResult.estimates.adjusted.yards} yds)
                    </div>
                    <div className="result-item highlight">
                      <strong>Recommended Purchase:</strong> {fabricResult.estimates.recommended.meters} m ({fabricResult.estimates.recommended.yards} yds)
                    </div>
                  </div>
                  <div className="notes">
                    <h4>Important Notes:</h4>
                    <ul>
                      {fabricResult.notes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTool === "modify" && (
            <div className="tool-section">
              <h2>Design Modification Guide</h2>
              <p>Get suggestions for modifying patterns</p>
              <form onSubmit={handleModificationSubmit} className="tool-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Pattern Type</label>
                    <select
                      value={modificationData.patternType}
                      onChange={(e) => setModificationData({ ...modificationData, patternType: e.target.value })}
                      required
                    >
                      <option value="">Select Pattern Type</option>
                      <option value="Kurta">Kurta</option>
                      <option value="Shalwar">Shalwar</option>
                      <option value="Trouser">Trouser</option>
                      <option value="Shirt">Shirt</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Modification Type</label>
                    <select
                      value={modificationData.modificationType}
                      onChange={(e) => setModificationData({ ...modificationData, modificationType: e.target.value })}
                      required
                    >
                      <option value="">Select Modification</option>
                      <option value="length">Length</option>
                      <option value="width">Width</option>
                      <option value="sleeves">Sleeves</option>
                      <option value="neckline">Neckline</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Loading..." : "Get Suggestions"}
                </button>
              </form>

              {modificationResult && (
                <div className="tool-result">
                  <h3>Modification Suggestions</h3>
                  <div className="suggestion-box">
                    <p>{modificationResult.suggestion}</p>
                  </div>
                  <div className="tips">
                    <h4>Tips:</h4>
                    <ul>
                      {modificationResult.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternTools;

