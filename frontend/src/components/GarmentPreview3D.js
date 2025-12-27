import React, { useRef, useEffect, useState } from "react";
import "./GarmentPreview3D.css";

const GarmentPreview3D = ({ pattern, fabric, measurements }) => {
  const canvasRef = useRef(null);
  const [viewAngle, setViewAngle] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 600;

    drawGarment(ctx, canvas.width, canvas.height);
  }, [pattern, fabric, measurements, viewAngle, zoom]);

  const drawGarment = (ctx, width, height) => {
    // Clear canvas
    ctx.fillStyle = "#f5f1eb";
    ctx.fillRect(0, 0, width, height);

    // Draw a simple 2D garment representation
    // This is a simplified preview - in a real app, you'd use a 3D library like Three.js

    const centerX = width / 2;
    const baseY = height - 50;

    // Draw body outline (simplified)
    ctx.strokeStyle = "#8b4513";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Head (circle)
    ctx.arc(centerX, 80, 30, 0, 2 * Math.PI);
    ctx.stroke();

    // Body (rectangle/torso)
    const bodyWidth = measurements?.chest ? (measurements.chest * 0.5) : 80;
    const bodyHeight = measurements?.length ? (measurements.length * 2) : 200;

    // Garment outline based on pattern type
    if (pattern?.designType === "Kurta" || pattern?.designType === "Shirt") {
      drawKurta(ctx, centerX, baseY, bodyWidth, bodyHeight);
    } else if (pattern?.designType === "Shalwar" || pattern?.designType === "Trouser") {
      drawShalwar(ctx, centerX, baseY, bodyWidth, bodyHeight);
    } else {
      drawGenericGarment(ctx, centerX, baseY, bodyWidth, bodyHeight);
    }

    // Add fabric color/texture if provided
    if (fabric?.color) {
      ctx.fillStyle = fabric.color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Add pattern name
    if (pattern?.title) {
      ctx.fillStyle = "#2c1810";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(pattern.title, centerX, height - 20);
    }
  };

  const drawKurta = (ctx, x, y, width, height) => {
    ctx.beginPath();
    // Neckline
    ctx.arc(x, y - height + 40, 15, 0, Math.PI, true);
    // Left side
    ctx.lineTo(x - width / 2, y - height + 40);
    ctx.lineTo(x - width / 2 - 10, y - height / 2);
    ctx.lineTo(x - width / 2, y);
    // Bottom
    ctx.lineTo(x - width / 3, y);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x + width / 3, y);
    // Right side
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width / 2 + 10, y - height / 2);
    ctx.lineTo(x + width / 2, y - height + 40);
    ctx.closePath();
    ctx.stroke();
  };

  const drawShalwar = (ctx, x, y, width, height) => {
    ctx.beginPath();
    // Waist
    ctx.moveTo(x - width / 2, y - height);
    ctx.lineTo(x + width / 2, y - height);
    // Left leg
    ctx.lineTo(x - width / 3, y - height / 2);
    ctx.lineTo(x - width / 4, y);
    // Right leg
    ctx.moveTo(x + width / 2, y - height);
    ctx.lineTo(x + width / 3, y - height / 2);
    ctx.lineTo(x + width / 4, y);
    ctx.stroke();
  };

  const drawGenericGarment = (ctx, x, y, width, height) => {
    ctx.beginPath();
    ctx.rect(x - width / 2, y - height, width, height);
    ctx.stroke();
  };

  const rotateView = (direction) => {
    setViewAngle((prev) => (prev + direction * 45) % 360);
  };

  return (
    <div className="garment-preview-3d">
      <div className="preview-header">
        <h3>3D Garment Preview</h3>
        <div className="preview-controls">
          <button onClick={() => rotateView(-1)} className="control-btn" title="Rotate Left">
            ↶
          </button>
          <span className="angle-display">{viewAngle}°</span>
          <button onClick={() => rotateView(1)} className="control-btn" title="Rotate Right">
            ↷
          </button>
          <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))} className="control-btn" title="Zoom In">
            +
          </button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))} className="control-btn" title="Zoom Out">
            −
          </button>
        </div>
      </div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} className="preview-canvas" />
      </div>
      <div className="preview-info">
        {pattern && (
          <div className="info-item">
            <strong>Pattern:</strong> {pattern.title}
          </div>
        )}
        {fabric && (
          <div className="info-item">
            <strong>Fabric:</strong> {fabric.name} ({fabric.color})
          </div>
        )}
        {measurements && (
          <div className="info-item">
            <strong>Size:</strong> Based on provided measurements
          </div>
        )}
        <p className="preview-note">
          Note: This is a simplified 2D preview. For a full 3D experience, measurements and pattern details are required.
        </p>
      </div>
    </div>
  );
};

export default GarmentPreview3D;

