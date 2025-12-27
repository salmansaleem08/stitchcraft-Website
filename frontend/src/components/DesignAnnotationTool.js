import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./DesignAnnotationTool.css";

const DesignAnnotationTool = () => {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const canvasRef = useRef(null);
  const [annotations, setAnnotations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tool, setTool] = useState("text");
  const [drawing, setDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [color, setColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(14);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchAnnotations();
  }, [orderId]);

  useEffect(() => {
    if (annotations && annotations.imageUrl && canvasRef.current) {
      drawCanvas();
    }
  }, [annotations, imageLoaded]);

  const fetchAnnotations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/design-annotations/order/${orderId}`);
      setAnnotations(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load annotations");
      console.error("Error fetching annotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !annotations) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    if (annotations.imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setImageLoaded(true);
        drawAnnotations();
      };
      img.src = annotations.imageUrl;
    } else {
      drawAnnotations();
    }
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas || !annotations) return;

    const ctx = canvas.getContext("2d");

    annotations.annotations.forEach((annotation) => {
      ctx.strokeStyle = annotation.content.color || "#000000";
      ctx.fillStyle = annotation.content.color || "#000000";
      ctx.lineWidth = annotation.content.strokeWidth || 2;
      ctx.font = `${annotation.content.fontSize || 14}px Arial`;

      switch (annotation.type) {
        case "text":
          ctx.fillText(
            annotation.content.text || "",
            annotation.position.x,
            annotation.position.y
          );
          break;
        case "arrow":
          if (annotation.points.length >= 2) {
            const start = annotation.points[0];
            const end = annotation.points[annotation.points.length - 1];
            drawArrow(ctx, start.x, start.y, end.x, end.y);
          }
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(
            annotation.position.x,
            annotation.position.y,
            annotation.size.width / 2,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          break;
        case "rectangle":
          ctx.strokeRect(
            annotation.position.x,
            annotation.position.y,
            annotation.size.width,
            annotation.size.height
          );
          break;
        case "line":
          if (annotation.points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            for (let i = 1; i < annotation.points.length; i++) {
              ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
            }
            ctx.stroke();
          }
          break;
        case "highlight":
          ctx.globalAlpha = 0.3;
          ctx.fillRect(
            annotation.position.x,
            annotation.position.y,
            annotation.size.width,
            annotation.size.height
          );
          ctx.globalAlpha = 1.0;
          break;
      }
    });
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle + Math.PI / 6),
      toY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setDrawing(true);

    if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        addAnnotation({
          type: "text",
          content: { text, color, fontSize },
          position: pos,
          size: { width: 0, height: 0 },
          points: [],
        });
      }
    } else {
      setCurrentAnnotation({
        type: tool,
        content: { color, strokeWidth },
        position: pos,
        size: { width: 0, height: 0 },
        points: [pos],
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing || !currentAnnotation) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;

    if (tool === "line" || tool === "arrow") {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, pos],
      });
    } else if (tool === "circle" || tool === "rectangle" || tool === "highlight") {
      const width = Math.abs(pos.x - currentAnnotation.position.x);
      const height = Math.abs(pos.y - currentAnnotation.position.y);
      setCurrentAnnotation({
        ...currentAnnotation,
        size: { width, height },
      });
    }

    drawCanvas();
    if (currentAnnotation) {
      drawTempAnnotation(currentAnnotation);
    }
  };

  const handleMouseUp = () => {
    if (drawing && currentAnnotation) {
      addAnnotation(currentAnnotation);
      setCurrentAnnotation(null);
    }
    setDrawing(false);
  };

  const drawTempAnnotation = (annotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = annotation.content.color || "#000000";
    ctx.fillStyle = annotation.content.color || "#000000";
    ctx.lineWidth = annotation.content.strokeWidth || 2;

    switch (annotation.type) {
      case "circle":
        ctx.beginPath();
        ctx.arc(
          annotation.position.x,
          annotation.position.y,
          annotation.size.width / 2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        break;
      case "rectangle":
      case "highlight":
        if (annotation.type === "highlight") {
          ctx.globalAlpha = 0.3;
        }
        ctx.fillRect(
          annotation.position.x,
          annotation.position.y,
          annotation.size.width,
          annotation.size.height
        );
        ctx.globalAlpha = 1.0;
        break;
      case "line":
      case "arrow":
        if (annotation.points.length >= 2) {
          if (annotation.type === "arrow") {
            const start = annotation.points[0];
            const end = annotation.points[annotation.points.length - 1];
            drawArrow(ctx, start.x, start.y, end.x, end.y);
          } else {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            for (let i = 1; i < annotation.points.length; i++) {
              ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
            }
            ctx.stroke();
          }
        }
        break;
    }
  };

  const addAnnotation = async (annotationData) => {
    try {
      const response = await api.post(
        `/design-annotations/order/${orderId}/annotations`,
        annotationData
      );
      setAnnotations({
        ...annotations,
        annotations: [...annotations.annotations, response.data.data],
      });
      drawCanvas();
    } catch (error) {
      setError("Failed to add annotation");
      console.error("Error adding annotation:", error);
    }
  };

  const handleDeleteAnnotation = async (annotationId) => {
    try {
      await api.delete(
        `/design-annotations/order/${orderId}/annotations/${annotationId}`
      );
      setAnnotations({
        ...annotations,
        annotations: annotations.annotations.filter(
          (ann) => ann._id !== annotationId
        ),
      });
      drawCanvas();
    } catch (error) {
      setError("Failed to delete annotation");
      console.error("Error deleting annotation:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("images", file);
      const response = await api.post("/upload/images", formData);
      const imageUrl = `http://localhost:5000${response.data.data[0]}`;

      await api.put(`/design-annotations/order/${orderId}/image`, { imageUrl });
      setAnnotations({ ...annotations, imageUrl });
      drawCanvas();
    } catch (error) {
      setError("Failed to upload image");
      console.error("Error uploading image:", error);
    }
  };

  if (loading) {
    return (
      <div className="annotation-tool-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading annotation tool...</p>
        </div>
      </div>
    );
  }

  if (error && !annotations) {
    return (
      <div className="annotation-tool-container">
        <div className="error-message">{error}</div>
        <Link to={`/orders/${orderId}`} className="btn btn-primary">
          Back to Order
        </Link>
      </div>
    );
  }

  return (
    <div className="annotation-tool-container">
      <div className="container">
        <div className="annotation-header">
          <div>
            <h1>Design Annotation Tool</h1>
            <Link to={`/orders/${orderId}`} className="back-link">
              ← Back to Order
            </Link>
          </div>
          <div className="annotation-actions">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="btn btn-secondary">
              Upload Image
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="annotation-toolbar">
          <div className="tool-group">
            <label>Tool:</label>
            <select value={tool} onChange={(e) => setTool(e.target.value)}>
              <option value="text">Text</option>
              <option value="arrow">Arrow</option>
              <option value="circle">Circle</option>
              <option value="rectangle">Rectangle</option>
              <option value="line">Line</option>
              <option value="highlight">Highlight</option>
            </select>
          </div>
          <div className="tool-group">
            <label>Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          {tool === "text" && (
            <div className="tool-group">
              <label>Font Size:</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="8"
                max="72"
              />
            </div>
          )}
          {(tool === "line" || tool === "arrow" || tool === "rectangle" || tool === "circle") && (
            <div className="tool-group">
              <label>Stroke Width:</label>
              <input
                type="number"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                min="1"
                max="10"
              />
            </div>
          )}
        </div>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="annotation-canvas"
          />
        </div>

        {annotations && annotations.annotations.length > 0 && (
          <div className="annotations-list">
            <h3>Annotations ({annotations.annotations.length})</h3>
            <div className="annotations-grid">
              {annotations.annotations.map((annotation) => (
                <div key={annotation._id} className="annotation-item">
                  <span className="annotation-type">{annotation.type}</span>
                  {annotation.content.text && (
                    <span className="annotation-text">{annotation.content.text}</span>
                  )}
                  <button
                    onClick={() => handleDeleteAnnotation(annotation._id)}
                    className="delete-annotation-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignAnnotationTool;

