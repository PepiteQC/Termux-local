"use client";

import { useState, useCallback } from "react";
import { getRoomService } from "@/lib/rooms/RoomService";

export interface FurnitureItem {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  rotation: number; // 0-3
}

interface RoomBuilderProps {
  roomId: string;
  isOwner: boolean;
  onFurnitureUpdate?: (furniture: FurnitureItem[]) => void;
}

const FURNITURE_TYPES = [
  { id: "chair", name: "Chair", icon: "🪑" },
  { id: "table", name: "Table", icon: "🛏️" },
  { id: "bed", name: "Bed", icon: "🛏️" },
  { id: "lamp", name: "Lamp", icon: "💡" },
  { id: "door", name: "Door", icon: "🚪" },
  { id: "sofa", name: "Sofa", icon: "🛋️" },
  { id: "plant", name: "Plant", icon: "🌿" },
  { id: "bookcase", name: "Bookcase", icon: "📚" },
];

export function RoomBuilder({ roomId, isOwner, onFurnitureUpdate }: RoomBuilderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);

  const handlePlaceFurniture = useCallback(
    async (type: string, x: number, y: number) => {
      if (!isEditMode || !isOwner) return;

      const newFurniture: FurnitureItem = {
        id: `${type}-${Date.now()}`,
        type,
        x,
        y,
        z: 0,
        rotation: 0,
      };

      try {
        const roomService = getRoomService();
        await roomService.updateRoomFurniture(roomId, newFurniture.id, x, y, 0, 0);

        const updatedFurniture = [...furniture, newFurniture];
        setFurniture(updatedFurniture);
        onFurnitureUpdate?.(updatedFurniture);
      } catch (error) {
        console.error("Failed to place furniture:", error);
      }
    },
    [roomId, isEditMode, isOwner, furniture, onFurnitureUpdate]
  );

  const handleRotateFurniture = useCallback(
    async (furnitureId: string) => {
      const item = furniture.find((f) => f.id === furnitureId);
      if (!item || !isOwner) return;

      const newRotation = ((item.rotation + 1) % 4) as 0 | 1 | 2 | 3;

      try {
        const roomService = getRoomService();
        await roomService.updateRoomFurniture(
          roomId,
          furnitureId,
          item.x,
          item.y,
          item.z,
          newRotation
        );

        const updatedFurniture = furniture.map((f) =>
          f.id === furnitureId ? { ...f, rotation: newRotation } : f
        );
        setFurniture(updatedFurniture);
        onFurnitureUpdate?.(updatedFurniture);
      } catch (error) {
        console.error("Failed to rotate furniture:", error);
      }
    },
    [roomId, furniture, isOwner, onFurnitureUpdate]
  );

  const handleRemoveFurniture = useCallback(
    async (furnitureId: string) => {
      if (!isOwner) return;

      try {
        const roomService = getRoomService();
        await roomService.updateRoomFurniture(roomId, furnitureId, -1, -1, 0, 0);

        const updatedFurniture = furniture.filter((f) => f.id !== furnitureId);
        setFurniture(updatedFurniture);
        onFurnitureUpdate?.(updatedFurniture);
        setSelectedFurniture(null);
      } catch (error) {
        console.error("Failed to remove furniture:", error);
      }
    },
    [roomId, furniture, isOwner, onFurnitureUpdate]
  );

  if (!isOwner) return null;

  return (
    <div className="room-builder-container">
      {/* Edit Mode Toggle */}
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className={`room-builder-toggle ${isEditMode ? "active" : ""}`}
      >
        {isEditMode ? "✓ Edit Mode ON" : "🔨 Edit Room"}
      </button>

      {/* Builder Panel */}
      {isEditMode && (
        <div className="room-builder-panel">
          <div className="builder-panel-header">
            <h3>🔨 Furniture Catalog</h3>
            <button
              onClick={() => setIsEditMode(false)}
              className="builder-close-btn"
            >
              ✕
            </button>
          </div>

          <div className="builder-furniture-grid">
            {FURNITURE_TYPES.map((item) => (
              <div
                key={item.id}
                className="builder-furniture-item"
                title={item.name}
              >
                <div className="builder-item-icon">{item.icon}</div>
                <div className="builder-item-name">{item.name}</div>
                <button
                  onClick={() => handlePlaceFurniture(item.id, 5, 5)}
                  className="builder-item-btn"
                >
                  Place
                </button>
              </div>
            ))}
          </div>

          {/* Selected Furniture Controls */}
          {selectedFurniture && (
            <div className="builder-controls">
              <h4>Selected: {selectedFurniture}</h4>
              <div className="control-buttons">
                <button
                  onClick={() => handleRotateFurniture(selectedFurniture)}
                  className="control-btn"
                >
                  🔄 Rotate
                </button>
                <button
                  onClick={() => handleRemoveFurniture(selectedFurniture)}
                  className="control-btn danger"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
