import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import "./PatternDesigner.css";

const PatternDesigner = () => {
  const canvasRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen, line, rectangle, circle, eraser
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [startPos, setStartPos] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishData, setPublishData] = useState({
    title: "",
    description: "",
    category: "",
    designType: "",
    price: "",
    isFree: false,
  });
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;

    // Set initial white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryIndex(historyIndex - 1);
      };
      img.src = history[historyIndex - 1];
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const pos = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (tool === "pen" || tool === "eraser") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getCoordinates(e);

    if (tool === "pen") {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth * 2;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getCoordinates(e);

    if (tool === "line" && startPos) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "rectangle" && startPos) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else if (tool === "circle" && startPos) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setIsDrawing(false);
    saveState();
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `pattern-design-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handlePublish = async () => {
    if (!user) {
      alert("Please login to publish patterns");
      navigate("/login");
      return;
    }

    // Validation
    if (!publishData.title || !publishData.description || !publishData.category || !publishData.designType) {
      alert("Please fill in all required fields");
      return;
    }

    if (!publishData.isFree && !publishData.price) {
      alert("Please set a price or mark as free");
      return;
    }

    try {
      setPublishing(true);
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL("image/png");

      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], `pattern-${Date.now()}.png`, { type: "image/png" });

      // Upload image
      const imageFormData = new FormData();
      imageFormData.append("images", file);

      const imageResponse = await api.post("/upload/images", imageFormData);
      const imageUrl = `http://localhost:5000${imageResponse.data.data[0]}`;

      // Create pattern with the design
      const patternData = {
        ...publishData,
        price: publishData.isFree ? 0 : Number(publishData.price),
        images: [
          {
            url: imageUrl,
            caption: "Designed with Pattern Designer",
            isPrimary: true,
          },
        ],
        patternFile: {
          url: imageUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
        isPublished: true,
        difficulty: "Intermediate",
        measurements: {
          sizes: [],
          customSizing: true,
        },
        copyright: {
          owner: user.name,
          license: "All Rights Reserved",
          watermark: true,
        },
        collaboration: {
          enabled: false,
        },
      };

      await api.post("/patterns", patternData);
      alert("Pattern published successfully!");
      navigate("/patterns");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to publish pattern");
      console.error("Error publishing pattern:", error);
    } finally {
      setPublishing(false);
      setShowPublishModal(false);
    }
  };

  return (
    <div className="pattern-designer">
      <div className="container">
        <div className="designer-header">
          <h1>Pattern Designer</h1>
          <p>Draw and design your pattern on the canvas</p>
        </div>

        <div className="designer-toolbar">
          <div className="tool-group">
            <label>Tool:</label>
            <div className="tool-buttons">
              <button
                className={`tool-btn ${tool === "pen" ? "active" : ""}`}
                onClick={() => setTool("pen")}
                title="Pen"
              >
                Pen
              </button>
              <button
                className={`tool-btn ${tool === "line" ? "active" : ""}`}
                onClick={() => setTool("line")}
                title="Line"
              >
                Line
              </button>
              <button
                className={`tool-btn ${tool === "rectangle" ? "active" : ""}`}
                onClick={() => setTool("rectangle")}
                title="Rectangle"
              >
                Rect
              </button>
              <button
                className={`tool-btn ${tool === "circle" ? "active" : ""}`}
                onClick={() => setTool("circle")}
                title="Circle"
              >
                Circle
              </button>
              <button
                className={`tool-btn ${tool === "eraser" ? "active" : ""}`}
                onClick={() => setTool("eraser")}
                title="Eraser"
              >
                Erase
              </button>
            </div>
          </div>

          <div className="tool-group">
            <label>Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
            />
          </div>

          <div className="tool-group">
            <label>Line Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="line-width-slider"
            />
            <span className="line-width-value">{lineWidth}px</span>
          </div>

          <div className="tool-group">
            <button onClick={undo} className="btn btn-secondary" disabled={historyIndex <= 0}>
              Undo
            </button>
            <button onClick={clear} className="btn btn-secondary">
              Clear
            </button>
            <button onClick={download} className="btn btn-secondary">
              Download
            </button>
            {user && (
              <button onClick={() => setShowPublishModal(true)} className="btn btn-primary">
                Publish Pattern
              </button>
            )}
          </div>
        </div>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="design-canvas"
          />
        </div>

        <div className="designer-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Select a tool from the toolbar</li>
            <li>Choose a color and line width</li>
            <li>Click and drag on the canvas to draw</li>
            <li>Use Undo to revert changes</li>
            <li>Click Download to save your design</li>
            <li>Click Publish Pattern to create a pattern from your design</li>
          </ul>
        </div>

        {showPublishModal && (
          <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Publish Pattern</h3>
              <div className="publish-form">
                <div className="form-group">
                  <label>
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={publishData.title}
                    onChange={(e) => setPublishData({ ...publishData, title: e.target.value })}
                    placeholder="Pattern title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    value={publishData.description}
                    onChange={(e) => setPublishData({ ...publishData, description: e.target.value })}
                    placeholder="Describe your pattern..."
                    rows="3"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Category <span className="required">*</span>
                    </label>
                    <select
                      value={publishData.category}
                      onChange={(e) => setPublishData({ ...publishData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Traditional Pakistani">Traditional Pakistani</option>
                      <option value="Modern Fashion">Modern Fashion</option>
                      <option value="Western">Western</option>
                      <option value="Fusion">Fusion</option>
                      <option value="Bridal">Bridal</option>
                      <option value="Casual">Casual</option>
                      <option value="Formal">Formal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Design Type <span className="required">*</span>
                    </label>
                    <select
                      value={publishData.designType}
                      onChange={(e) => setPublishData({ ...publishData, designType: e.target.value })}
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
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={publishData.isFree}
                      onChange={(e) => setPublishData({ ...publishData, isFree: e.target.checked })}
                    />
                    This pattern is free
                  </label>
                </div>
                {!publishData.isFree && (
                  <div className="form-group">
                    <label>
                      Price (PKR) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={publishData.price}
                      onChange={(e) => setPublishData({ ...publishData, price: e.target.value })}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required={!publishData.isFree}
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button onClick={handlePublish} className="btn btn-primary" disabled={publishing}>
                  {publishing ? "Publishing..." : "Publish"}
                </button>
                <button onClick={() => setShowPublishModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternDesigner;

