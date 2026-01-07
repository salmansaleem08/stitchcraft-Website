import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./VirtualTryOn.css";

const VirtualTryOn = () => {
  const { user } = useContext(AuthContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [cameraActive, setCameraActive] = useState(false);
  const [bodyMeasurements, setBodyMeasurements] = useState({
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",
    shoulder: "",
    armLength: "",
    legLength: "",
  });
  const [selectedGarment, setSelectedGarment] = useState({
    garmentType: "",
    fabric: null,
    pattern: null,
  });
  const [visualization, setVisualization] = useState(null);
  const [fabricOptions, setFabricOptions] = useState([]);
  const [patternOptions, setPatternOptions] = useState([]);

  useEffect(() => {
    if (user) {
      fetchFabrics();
      fetchPatterns();
    }
  }, [user]);

  const fetchFabrics = async () => {
    try {
      const response = await api.get("/fabrics?limit=50");
      setFabricOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching fabrics:", error);
    }
  };

  const fetchPatterns = async () => {
    try {
      const response = await api.get("/patterns?limit=50");
      setPatternOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching patterns:", error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      alert("Camera access denied. Please use manual measurements.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      return imageData;
    }
    return null;
  };

  const createSession = async () => {
    try {
      setLoading(true);
      const response = await api.post("/ar-fitting/sessions", {
        sessionName: `Try-On ${new Date().toLocaleDateString()}`,
        selectedGarment: selectedGarment,
      });
      setSession(response.data.data);
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const updateBodyScan = async () => {
    try {
      setLoading(true);
      const imageData = cameraActive ? captureImage() : null;
      
      await api.put(`/ar-fitting/sessions/${session._id}/scan`, {
        measurements: bodyMeasurements,
        scanImage: imageData,
        scanMethod: cameraActive ? "camera" : "manual",
      });

      const updatedSession = await api.get(`/ar-fitting/sessions/${session._id}`);
      setSession(updatedSession.data.data);
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update body scan");
    } finally {
      setLoading(false);
      stopCamera();
    }
  };

  const simulateDraping = async (fabricId) => {
    try {
      setLoading(true);
      const response = await api.post(`/ar-fitting/sessions/${session._id}/draping`, {
        fabricId: fabricId,
      });
      setVisualization(response.data.data);
      setStep(4);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to simulate draping");
    } finally {
      setLoading(false);
    }
  };

  const calculatePatternFit = async (patternId) => {
    try {
      setLoading(true);
      const response = await api.post(`/ar-fitting/sessions/${session._id}/pattern-fit`, {
        patternId: patternId,
      });
      setVisualization(response.data.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to calculate pattern fit");
    } finally {
      setLoading(false);
    }
  };

  const updateColorVisualization = async (colors) => {
    try {
      await api.put(`/ar-fitting/sessions/${session._id}/visualization`, {
        colors: colors,
      });
      const updatedSession = await api.get(`/ar-fitting/sessions/${session._id}`);
      setSession(updatedSession.data.data);
    } catch (error) {
      console.error("Error updating visualization:", error);
    }
  };

  const saveSession = async () => {
    try {
      await api.put(`/ar-fitting/sessions/${session._id}/save`);
      alert("Session saved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save session");
    }
  };

  if (!user) {
    return (
      <div className="virtual-tryon-container">
        <div className="container">
          <div className="login-prompt">
            <h2>Please log in to use Virtual Try-On</h2>
            <p>Create an account or log in to access AR fitting features</p>
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="virtual-tryon-container">
      <div className="container">
        <div className="page-header">
          <h1>Augmented Reality Virtual Try-On</h1>
          <p>Scan your body, visualize fabrics, and preview your perfect fit</p>
        </div>

        {step === 1 && (
          <div className="tryon-step" data-step="1">
            <h2>Step 1: Select Garment</h2>
            <div className="garment-selection">
              <div className="form-group">
                <label>Garment Type *</label>
                <select
                  value={selectedGarment.garmentType}
                  onChange={(e) =>
                    setSelectedGarment({ ...selectedGarment, garmentType: e.target.value })
                  }
                >
                  <option value="">Select garment type</option>
                  <option value="Shalwar Kameez">Shalwar Kameez</option>
                  <option value="Lehenga">Lehenga</option>
                  <option value="Sherwani">Sherwani</option>
                  <option value="Suit">Suit</option>
                  <option value="Dress">Dress</option>
                  <option value="Kurta">Kurta</option>
                  <option value="Waistcoat">Waistcoat</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fabric (Optional - can select later)</label>
                <select
                  value={selectedGarment.fabric || ""}
                  onChange={(e) =>
                    setSelectedGarment({ ...selectedGarment, fabric: e.target.value || null })
                  }
                >
                  <option value="">Select fabric later</option>
                  {fabricOptions.map((fabric) => (
                    <option key={fabric._id} value={fabric._id}>
                      {fabric.name} - {fabric.fabricType} ({fabric.color})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pattern (Optional - can select later)</label>
                <select
                  value={selectedGarment.pattern || ""}
                  onChange={(e) =>
                    setSelectedGarment({ ...selectedGarment, pattern: e.target.value || null })
                  }
                >
                  <option value="">Select pattern later</option>
                  {patternOptions.map((pattern) => (
                    <option key={pattern._id} value={pattern._id}>
                      {pattern.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={createSession}
                className="btn btn-primary"
                disabled={!selectedGarment.garmentType || loading}
              >
                {loading ? "Creating..." : "Start Try-On Session"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && session && (
          <div className="tryon-step" data-step="2">
            <h2>Step 2: Body Measurement Scanning</h2>
            <div className="scanning-section">
              <div className="camera-section">
                <h3>Camera Scan (Optional)</h3>
                <div className="camera-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={cameraActive ? "camera-video" : "camera-video hidden"}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {!cameraActive && (
                    <div className="camera-placeholder">
                      <p>Camera not active</p>
                      <button onClick={startCamera} className="btn btn-secondary">
                        Start Camera
                      </button>
                    </div>
                  )}
                  {cameraActive && (
                    <button onClick={stopCamera} className="btn btn-secondary">
                      Stop Camera
                    </button>
                  )}
                </div>
                <p className="camera-note">
                  Camera scanning helps estimate measurements. You can also enter measurements manually.
                </p>
              </div>

              <div className="manual-measurements">
                <h3>Manual Measurements (cm)</h3>
                <div className="measurements-grid">
                  {Object.keys(bodyMeasurements).map((key) => (
                    <div key={key} className="form-group">
                      <label>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")} *
                      </label>
                      <input
                        type="number"
                        value={bodyMeasurements[key]}
                        onChange={(e) =>
                          setBodyMeasurements({ ...bodyMeasurements, [key]: e.target.value })
                        }
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button onClick={() => setStep(1)} className="btn btn-secondary">
                  Back
                </button>
                <button
                  onClick={updateBodyScan}
                  className="btn btn-primary"
                  disabled={loading || !bodyMeasurements.height || !bodyMeasurements.waist}
                >
                  {loading ? "Processing..." : "Continue to Visualization"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && session && (
          <div className="tryon-step" data-step="3">
            <h2>Step 3: Fabric & Pattern Selection</h2>
            <div className="selection-section">
              <div className="fabric-selection">
                <h3>Select Fabric for Draping Simulation</h3>
                <div className="fabrics-grid">
                  {fabricOptions.slice(0, 12).map((fabric) => (
                    <div
                      key={fabric._id}
                      className={`fabric-card ${selectedGarment.fabric === fabric._id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedGarment({ ...selectedGarment, fabric: fabric._id });
                        simulateDraping(fabric._id);
                      }}
                    >
                      {fabric.images && fabric.images.length > 0 && (
                        <img src={fabric.images[0]} alt={fabric.name} />
                      )}
                      <div className="fabric-info">
                        <h4>{fabric.name}</h4>
                        <p>{fabric.fabricType} • {fabric.color}</p>
                        <p className="fabric-price">PKR {fabric.pricePerMeter?.toLocaleString()}/m</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pattern-selection">
                <h3>Select Pattern for Fitting Preview</h3>
                <div className="patterns-grid">
                  {patternOptions.slice(0, 8).map((pattern) => (
                    <div
                      key={pattern._id}
                      className={`pattern-card ${selectedGarment.pattern === pattern._id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedGarment({ ...selectedGarment, pattern: pattern._id });
                        calculatePatternFit(pattern._id);
                      }}
                    >
                      {pattern.images && pattern.images.length > 0 && (
                        <img src={pattern.images[0]} alt={pattern.name} />
                      )}
                      <div className="pattern-info">
                        <h4>{pattern.name}</h4>
                        <p>{pattern.description || "Pattern"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(4)} className="btn btn-primary">
                View Visualization
              </button>
            </div>
          </div>
        )}

        {step === 4 && session && visualization && (
          <div className="tryon-step" data-step="4">
            <h2>Step 4: Visualization & Fit Analysis</h2>
            <div className="visualization-section">
              {session.tryOnVisualization?.fabricDraping?.previewImage && (
                <div className="visualization-preview">
                  <h3>Fabric Draping Simulation</h3>
                  <div className="preview-container">
                    <img
                      src={session.tryOnVisualization.fabricDraping.previewImage}
                      alt="Fabric draping preview"
                    />
                    {visualization.draping && (
                      <div className="draping-info">
                        <p><strong>Drape:</strong> {visualization.draping.drape}</p>
                        <p><strong>Flow:</strong> {visualization.draping.flow}</p>
                        <p><strong>Fit Score:</strong> {visualization.draping.fitScore}%</p>
                        {visualization.draping.recommendations && (
                          <div className="recommendations">
                            {visualization.draping.recommendations.map((rec, idx) => (
                              <p key={idx}>{rec}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {session.tryOnVisualization?.patternFitting && (
                <div className="pattern-fitting">
                  <h3>Pattern Fitting Analysis</h3>
                  <div className="fit-analysis">
                    <div className="fit-score">
                      <span className="score-label">Fit Score:</span>
                      <span className="score-value">
                        {session.tryOnVisualization.patternFitting.fitScore}%
                      </span>
                    </div>
                    {session.tryOnVisualization.patternFitting.patternScale !== 1 && (
                      <p className="scale-info">
                        Pattern Scale: {(session.tryOnVisualization.patternFitting.patternScale * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {session.tryOnVisualization?.fitAdjustments && session.tryOnVisualization.fitAdjustments.length > 0 && (
                <div className="fit-adjustments">
                  <h3>Fit Adjustment Suggestions</h3>
                  <div className="adjustments-list">
                    {session.tryOnVisualization.fitAdjustments.map((adj, idx) => (
                      <div key={idx} className={`adjustment-item priority-${adj.priority.toLowerCase()}`}>
                        <div className="adjustment-header">
                          <span className="adjustment-area">{adj.area}</span>
                          <span className={`priority-badge priority-${adj.priority.toLowerCase()}`}>
                            {adj.priority}
                          </span>
                        </div>
                        <p className="adjustment-reason">{adj.reason}</p>
                        {adj.currentMeasurement && (
                          <div className="adjustment-details">
                            <span>Current: {adj.currentMeasurement} cm</span>
                            {adj.suggestedMeasurement && (
                              <span>Suggested: {adj.suggestedMeasurement} cm</span>
                            )}
                            {adj.adjustment !== 0 && (
                              <span className="adjustment-diff">
                                {adj.adjustment > 0 ? "+" : ""}{adj.adjustment} cm
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="color-visualization">
                <h3>Color & Design Visualization</h3>
                <div className="color-picker-section">
                  <div className="form-group">
                    <label>Base Color</label>
                    <input
                      type="color"
                      value={session.tryOnVisualization?.colorVisualization?.baseColor || "#8b4513"}
                      onChange={(e) =>
                        updateColorVisualization({
                          baseColor: e.target.value,
                          accentColors: session.tryOnVisualization?.colorVisualization?.accentColors || [],
                        })
                      }
                    />
                  </div>
                  <p className="color-note">
                    Select colors to visualize how they look on your selected garment
                  </p>
                </div>
              </div>

              <div className="session-actions">
                <button onClick={saveSession} className="btn btn-primary">
                  Save Session
                </button>
                <button onClick={() => { setStep(1); setSession(null); setVisualization(null); }} className="btn btn-secondary">
                  New Try-On
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOn;

