import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import "./MoodBoard.css";

const MoodBoard = () => {
  const { id, orderId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [moodBoard, setMoodBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    type: "image",
    content: {},
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (id) {
      fetchMoodBoard();
    } else if (orderId) {
      // Check if user can create mood boards (only tailors and suppliers)
      if (user?.role === "tailor" || user?.role === "supplier") {
        createMoodBoardForOrder();
      } else {
        // Customers cannot create mood boards, redirect to orders page
        navigate("/orders");
      }
    }
  }, [id, orderId, user]);

  const fetchMoodBoard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mood-boards/${id}`);
      setMoodBoard(response.data.data);
      setError("");
    } catch (error) {
      setError("Failed to load mood board");
      console.error("Error fetching mood board:", error);
    } finally {
      setLoading(false);
    }
  };

  const createMoodBoardForOrder = async () => {
    try {
      setLoading(true);
      const response = await api.post("/mood-boards", {
        title: `Design Board for Order`,
        order: orderId,
      });
      navigate(`/mood-boards/${response.data.data._id}`);
    } catch (error) {
      setError("Failed to create mood board");
      console.error("Error creating mood board:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/mood-boards/${id}`, {
        title: moodBoard.title,
        description: moodBoard.description,
        items: moodBoard.items,
        tags: moodBoard.tags,
      });
      setEditing(false);
      setError("");
    } catch (error) {
      setError("Failed to save mood board");
      console.error("Error saving mood board:", error);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await api.post(`/mood-boards/${id}/items`, newItem);
      setMoodBoard({
        ...moodBoard,
        items: [...moodBoard.items, response.data.data],
      });
      setShowAddItem(false);
      setNewItem({
        type: "image",
        content: {},
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
      });
    } catch (error) {
      setError("Failed to add item");
      console.error("Error adding item:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/mood-boards/${id}/items/${itemId}`);
      setMoodBoard({
        ...moodBoard,
        items: moodBoard.items.filter((item) => item._id !== itemId),
      });
    } catch (error) {
      setError("Failed to remove item");
      console.error("Error removing item:", error);
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDrag = (e) => {
    if (!draggedItem) return;
    const boardRect = document.querySelector(".mood-board-canvas")?.getBoundingClientRect();
    if (!boardRect) return;

    const x = e.clientX - boardRect.left - dragOffset.x;
    const y = e.clientY - boardRect.top - dragOffset.y;

    setMoodBoard({
      ...moodBoard,
      items: moodBoard.items.map((item) =>
        item._id === draggedItem._id
          ? { ...item, position: { x: Math.max(0, x), y: Math.max(0, y) } }
          : item
      ),
    });
  };

  const handleDragEnd = () => {
    if (draggedItem) {
      handleSave();
      setDraggedItem(null);
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
      
      setNewItem({
        ...newItem,
        content: { ...newItem.content, imageUrl },
      });
    } catch (error) {
      setError("Failed to upload image");
      console.error("Error uploading image:", error);
    }
  };

  if (loading) {
    return (
      <div className="mood-board-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading mood board...</p>
        </div>
      </div>
    );
  }

  if (error && !moodBoard) {
    return (
      <div className="mood-board-container">
        <div className="error-message">{error}</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!moodBoard) return null;

  return (
    <div className="mood-board-container">
      <div className="container">
        <div className="mood-board-header">
          <div>
            {editing ? (
              <input
                type="text"
                value={moodBoard.title}
                onChange={(e) =>
                  setMoodBoard({ ...moodBoard, title: e.target.value })
                }
                className="title-input"
              />
            ) : (
              <h1>{moodBoard.title}</h1>
            )}
            {moodBoard.description && (
              <p className="mood-board-description">{moodBoard.description}</p>
            )}
          </div>
          <div className="mood-board-actions">
            {editing ? (
              <>
                <button onClick={handleSave} className="btn btn-primary">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    fetchMoodBoard();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="btn btn-primary"
                >
                  Add Item
                </button>
              </>
            )}
            {moodBoard.order && (
              <Link
                to={`/orders/${moodBoard.order._id || moodBoard.order}`}
                className="btn btn-secondary"
              >
                View Order
              </Link>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div
          className="mood-board-canvas"
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {moodBoard.items.map((item) => (
            <div
              key={item._id}
              className="mood-board-item"
              style={{
                left: `${item.position.x}px`,
                top: `${item.position.y}px`,
                width: `${item.size.width}px`,
                height: `${item.size.height}px`,
              }}
              onMouseDown={(e) => handleDragStart(e, item)}
            >
              {item.type === "image" && item.content.imageUrl && (
                <img
                  src={item.content.imageUrl}
                  alt="Mood board item"
                  className="item-image"
                />
              )}
              {item.type === "fabric" && item.content.fabricId && (
                <div className="fabric-swatch-item">
                  {item.content.fabricId.images?.[0] && (
                    <img
                      src={item.content.fabricId.images[0]}
                      alt={item.content.fabricId.name}
                      className="swatch-image"
                    />
                  )}
                  <div className="swatch-info">
                    <h4>{item.content.fabricId.name}</h4>
                    <p>{item.content.fabricId.fabricType}</p>
                  </div>
                </div>
              )}
              {item.type === "color" && item.content.colorCode && (
                <div
                  className="color-swatch"
                  style={{ backgroundColor: item.content.colorCode }}
                >
                  <span className="color-name">{item.content.colorName}</span>
                </div>
              )}
              {item.type === "note" && item.content.text && (
                <div className="note-item">
                  <p>{item.content.text}</p>
                </div>
              )}
              {editing && (
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className="remove-item-btn"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {showAddItem && (
          <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Item to Mood Board</h3>
              <div className="form-group">
                <label>Item Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) =>
                    setNewItem({ ...newItem, type: e.target.value, content: {} })
                  }
                >
                  <option value="image">Image</option>
                  <option value="fabric">Fabric Swatch</option>
                  <option value="color">Color</option>
                  <option value="note">Note</option>
                </select>
              </div>

              {newItem.type === "image" && (
                <div className="form-group">
                  <label>Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {newItem.content.imageUrl && (
                    <img
                      src={newItem.content.imageUrl}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                </div>
              )}

              {newItem.type === "color" && (
                <>
                  <div className="form-group">
                    <label>Color Code</label>
                    <input
                      type="color"
                      value={newItem.content.colorCode || "#000000"}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          content: {
                            ...newItem.content,
                            colorCode: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Color Name</label>
                    <input
                      type="text"
                      value={newItem.content.colorName || ""}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          content: {
                            ...newItem.content,
                            colorName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </>
              )}

              {newItem.type === "note" && (
                <div className="form-group">
                  <label>Note Text</label>
                  <textarea
                    value={newItem.content.text || ""}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        content: {
                          ...newItem.content,
                          text: e.target.value,
                        },
                      })
                    }
                    rows="4"
                  />
                </div>
              )}

              <div className="modal-actions">
                <button onClick={handleAddItem} className="btn btn-primary">
                  Add
                </button>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="btn btn-secondary"
                >
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

export default MoodBoard;

