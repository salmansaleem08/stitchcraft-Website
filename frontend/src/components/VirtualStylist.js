import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import "./VirtualStylist.css";

const VirtualStylist = () => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [formData, setFormData] = useState({
    bodyMeasurements: {
      height: "",
      weight: "",
      bust: "",
      waist: "",
      hips: "",
      shoulder: "",
    },
    occasion: "",
    culturalContext: "Pakistani",
    preferences: {
      colors: [],
      patterns: [],
      fabricTypes: [],
      styles: [],
      avoidColors: [],
      avoidPatterns: [],
    },
    includeTrends: true,
  });

  const occasions = ["Casual", "Formal", "Wedding", "Party", "Office", "Traditional", "Festive", "Everyday"];
  const culturalContexts = ["Pakistani", "Western", "Fusion", "International"];
  const fabricTypes = ["Cotton", "Silk", "Linen", "Wool", "Chiffon", "Georgette", "Velvet", "Denim"];
  const patterns = ["Solid", "Striped", "Floral", "Geometric", "Embroidered", "Printed", "Paisley"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("measurement.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        bodyMeasurements: {
          ...formData.bodyMeasurements,
          [field]: value ? parseFloat(value) : "",
        },
      });
    } else if (name.startsWith("preference.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (category, value) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [category]: formData.preferences[category].includes(value)
          ? formData.preferences[category].filter((item) => item !== value)
          : [...formData.preferences[category], value],
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/ai-design-assistant/recommendations", {
        bodyMeasurements: formData.bodyMeasurements,
        occasion: formData.occasion,
        culturalContext: formData.culturalContext,
        preferences: formData.preferences,
        includeTrends: formData.includeTrends,
      });

      setRecommendations(response.data.data);
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.bodyMeasurements.height && formData.bodyMeasurements.waist;
    }
    if (step === 2) {
      return formData.occasion;
    }
    return false;
  };

  return (
    <div className="virtual-stylist-container">
      <div className="container">
        <div className="page-header">
          <div className="header-text">
            <h1>AI-Powered Virtual Stylist</h1>
            <p className="dashboard-subtitle">
              Get personalized style recommendations based on your body type, occasion, and preferences. Discover the perfect fabrics, patterns, and styles tailored just for you.
            </p>
          </div>
        </div>

        {!user && (
          <div className="login-prompt">
            <p>Please log in to use the Virtual Stylist and save your recommendations.</p>
            <Link to="/login" className="btn-primary-header">
              Login
            </Link>
          </div>
        )}

        {step === 1 && (
          <div className="stylist-form-section">
            {/* Progress Indicator */}
            <div className="progress-indicator">
              <div className={`progress-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
                <div className="step-number">
                  {step > 1 ? <FaCheck /> : '1'}
                </div>
                <span className="step-label">Measurements</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
                <div className="step-number">
                  {step > 2 ? <FaCheck /> : '2'}
                </div>
                <span className="step-label">Preferences</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <span className="step-label">Results</span>
              </div>
            </div>
            <div className="form-header">
              <h2>Step 1: Body Measurements</h2>
              <p className="section-description">
                Enter your measurements for accurate body type analysis and personalized recommendations
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="form-column">
                <div className="form-group creative-input">
                  <label>Height (cm) *</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="measurement.height"
                      value={formData.bodyMeasurements.height}
                      onChange={handleInputChange}
                      required
                      min="100"
                      max="250"
                      placeholder="Enter height"
                    />
                    <span className="input-unit">cm</span>
                  </div>
                </div>
                <div className="form-group creative-input">
                  <label>Weight (kg)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="measurement.weight"
                      value={formData.bodyMeasurements.weight}
                      onChange={handleInputChange}
                      min="30"
                      max="200"
                      placeholder="Enter weight"
                    />
                    <span className="input-unit">kg</span>
                  </div>
                </div>
                <div className="form-group creative-input">
                  <label>Bust (cm) *</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="measurement.bust"
                      value={formData.bodyMeasurements.bust}
                      onChange={handleInputChange}
                      required
                      min="60"
                      max="150"
                      placeholder="Enter bust"
                    />
                    <span className="input-unit">cm</span>
                  </div>
                </div>
                <div className="form-group creative-input">
                  <label>Waist (cm) *</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="measurement.waist"
                      value={formData.bodyMeasurements.waist}
                      onChange={handleInputChange}
                      required
                      min="50"
                      max="150"
                      placeholder="Enter waist"
                    />
                    <span className="input-unit">cm</span>
                  </div>
                </div>
                <div className="form-group creative-input">
                  <label>Hips (cm) *</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="measurement.hips"
                      value={formData.bodyMeasurements.hips}
                      onChange={handleInputChange}
                      required
                      min="60"
                      max="150"
                      placeholder="Enter hips"
                    />
                    <span className="input-unit">cm</span>
                  </div>
                </div>
                <div className="form-group creative-input">
                  <label>Shoulder (cm)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="measurement.shoulder"
                      value={formData.bodyMeasurements.shoulder}
                      onChange={handleInputChange}
                      min="30"
                      max="60"
                      placeholder="Enter shoulder"
                    />
                    <span className="input-unit">cm</span>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary-header" disabled={!isStepValid()}>
                    Next: Select Occasion
                    <FaArrowRight className="btn-icon" />
                  </button>
                </div>
              </form>
          </div>
        )}

        {step === 2 && (
          <div className="stylist-form-section">
            {/* Progress Indicator */}
            <div className="progress-indicator">
              <div className={`progress-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
                <div className="step-number">
                  {step > 1 ? <FaCheck /> : '1'}
                </div>
                <span className="step-label">Measurements</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
                <div className="step-number">
                  {step > 2 ? <FaCheck /> : '2'}
                </div>
                <span className="step-label">Preferences</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <span className="step-label">Results</span>
              </div>
            </div>
            <div className="form-header">
              <h2>Step 2: Occasion & Preferences</h2>
              <p className="section-description">
                Tell us about your occasion and style preferences to get the perfect recommendations
              </p>
            </div>
            <form onSubmit={handleSubmit} className="form-column">
                <div className="form-group creative-select">
                  <label>Occasion *</label>
                  <div className="select-wrapper">
                    <select
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleInputChange}
                      required
                      className="styled-select"
                    >
                      <option value="">Select an occasion</option>
                      {occasions.map((occ) => (
                        <option key={occ} value={occ}>
                          {occ}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group creative-select">
                  <label>Cultural Context</label>
                  <div className="select-wrapper">
                    <select
                      name="culturalContext"
                      value={formData.culturalContext}
                      onChange={handleInputChange}
                      className="styled-select"
                    >
                      {culturalContexts.map((ctx) => (
                        <option key={ctx} value={ctx}>
                          {ctx}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="preferences-section">
                  <h3>Fabric Preferences</h3>
                  <div className="checkbox-grid">
                    {fabricTypes.map((fabric) => (
                      <label key={fabric} className={`checkbox-label ${formData.preferences.fabricTypes.includes(fabric) ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.preferences.fabricTypes.includes(fabric)}
                          onChange={() => handleCheckboxChange("fabricTypes", fabric)}
                        />
                        <span>{fabric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="preferences-section">
                  <h3>Pattern Preferences</h3>
                  <div className="checkbox-grid">
                    {patterns.map((pattern) => (
                      <label key={pattern} className={`checkbox-label ${formData.preferences.patterns.includes(pattern) ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.preferences.patterns.includes(pattern)}
                          onChange={() => handleCheckboxChange("patterns", pattern)}
                        />
                        <span>{pattern}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-simple-label">
                    <input
                      type="checkbox"
                      checked={formData.includeTrends}
                      onChange={(e) => setFormData({ ...formData, includeTrends: e.target.checked })}
                    />
                    <span>Include current fashion trends</span>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary-header">
                    Back
                  </button>
                  <button type="submit" className="btn-primary-header" disabled={loading || !isStepValid()}>
                    {loading ? "Analyzing..." : "Get Recommendations"}
                    {!loading && <FaArrowRight className="btn-icon" />}
                  </button>
                </div>
              </form>
          </div>
        )}

        {step === 3 && recommendations && (
          <div className="recommendations-section">
            <div className="recommendations-header">
              <h2>Your Personalized Style Recommendations</h2>
              <button onClick={() => { setStep(1); setRecommendations(null); }} className="btn-secondary-header">
                New Analysis
              </button>
            </div>

            <div className="body-type-analysis">
              <h3>Body Type Analysis</h3>
              <div className="body-type-card">
                <div className="body-type-header">
                  <span className="body-type-name">{recommendations.bodyType}</span>
                  <span className="body-type-score">Compatible</span>
                </div>
                <p className="body-type-description">{recommendations.bodyTypeAnalysis.description}</p>
              </div>
            </div>

            <div className="recommendations-list">
              {recommendations.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-card">
                  <div className="recommendation-header">
                    <h3>{rec.garmentType}</h3>
                    <div className="recommendation-meta">
                      <span className={`cultural-badge ${rec.culturalAppropriate ? "appropriate" : "warning"}`}>
                        {rec.culturalAppropriate ? "Culturally Appropriate" : "Review Needed"}
                      </span>
                      <span className="compatibility-score">
                        Compatibility: {rec.compatibilityScore}%
                      </span>
                    </div>
                  </div>

                  {rec.trendRelevance.isTrending && (
                    <div className="trend-indicator">
                      <span className="trend-badge">Trending</span>
                      <span className="trend-info">
                        {rec.trendRelevance.trendCategory} • {rec.trendRelevance.season}
                      </span>
                    </div>
                  )}

                  <div className="fabric-recommendations">
                    <h4>Recommended Fabrics</h4>
                    <div className="fabrics-grid">
                      {rec.fabricRecommendations.map((fabric, fIdx) => (
                        <div key={fIdx} className="fabric-card">
                          {fabric.images && fabric.images.length > 0 && (
                            <img src={fabric.images[0]} alt={fabric.fabricType} />
                          )}
                          <div className="fabric-info">
                            <p className="fabric-type">{fabric.fabricType}</p>
                            <p className="fabric-color">{fabric.color} • {fabric.pattern}</p>
                            <p className="fabric-price">PKR {fabric.pricePerMeter?.toLocaleString()}/meter</p>
                            <p className="fabric-reason">{fabric.reason}</p>
                            {fabric.warnings && fabric.warnings.length > 0 && (
                              <p className="fabric-warning">{fabric.warnings[0]}</p>
                            )}
                            <Link
                              to={`/fabrics/${fabric.fabricId}`}
                              className="btn-view-fabric"
                            >
                              View Fabric
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="styling-tips">
                    <h4>Styling Tips</h4>
                    <ul>
                      {rec.stylingTips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {rec.accessories && rec.accessories.length > 0 && (
                    <div className="accessories">
                      <h4>Recommended Accessories</h4>
                      <div className="accessories-list">
                        {rec.accessories.map((acc, aIdx) => (
                          <span key={aIdx} className="accessory-tag">{acc}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.culturalNotes && (
                    <div className="cultural-notes">
                      <h4>Cultural Notes</h4>
                      <p>{rec.culturalNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualStylist;

