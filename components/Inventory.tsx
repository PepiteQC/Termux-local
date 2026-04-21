'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { FURNITURE_REGISTRY } from '@/lib/furniture/FurnitureRegistry';
import { clsx } from 'clsx';

export function Inventory() {
  const { inventory, addFurniture, room, setDraggingFurniture } = useGameStore();
  const furniture = inventory.filter((item) => item.type === 'furniture');

  const handleDragStart = (itemId: string, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('furnitureItemId', itemId);
  };

  const handlePlaceFurniture = (itemId: string) => {
    const emptySpot = room.furniture.find((f) => f.x === 0 && f.y === 0);
    const newX = emptySpot ? 1 : 0;
    const newY = emptySpot ? 0 : 1;

    addFurniture({
      id: `f${Date.now()}`,
      type: itemId,
      x: newX,
      y: newY,
      z: 0,
      rotation: 0,
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-96 flex flex-col">
      <h2 className="text-sm font-bold text-yellow-400 mb-3 uppercase tracking-wider">
        Inventaire
      </h2>

      <div className="flex-1 overflow-y-auto pr-2">
        {furniture.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-8">Aucun meuble</p>
        ) : (
          <div className="space-y-2">
            {furniture.map((item) => {
              const def = FURNITURE_REGISTRY[item.itemId];
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(item.itemId, e)}
                  className="p-2 bg-gray-700 rounded border border-gray-600 hover:border-gray-500 cursor-move transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-gray-200">
                        {def?.label || item.itemId}
                      </div>
                      <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                    </div>
                    <button
                      onClick={() => handlePlaceFurniture(item.itemId)}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    >
                      Place
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
