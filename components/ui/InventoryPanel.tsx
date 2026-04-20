"use client";

import { FURNITURE_CATALOG, type FurnitureKind, type InventoryItem } from "@/lib/iso/types";

type InventoryPanelProps = {
  inventory: InventoryItem[];
  selectedItem: FurnitureKind | null;
  onSelectItem: (item: FurnitureKind | null) => void;
  onDragStart: (item: FurnitureKind, point: { x: number; y: number }) => void;
};

export function InventoryPanel({
  inventory,
  selectedItem,
  onSelectItem,
  onDragStart
}: InventoryPanelProps) {
  return (
    <section className="glass-panel mobile-card inventory-panel">
      <div className="panel-heading">
        <span className="badge mono">Inventaire tactile</span>
        <h3>Reserve EtherCristal</h3>
      </div>
      <div className="inventory-scroll">
        {inventory.map((entry) => (
          <button
            className={`inventory-chip ${selectedItem === entry.item ? "active" : ""}`}
            key={entry.id}
            onClick={() => onSelectItem(selectedItem === entry.item ? null : entry.item)}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              if (!touch || entry.quantity <= 0) {
                return;
              }

              onSelectItem(entry.item);
              onDragStart(entry.item, { x: touch.clientX, y: touch.clientY });
            }}
            type="button"
          >
            <span>{FURNITURE_CATALOG[entry.item].label}</span>
            <strong className="mono">x{entry.quantity}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
