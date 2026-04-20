import { FURNITURE_CATALOG, type FurnitureKind, type InventoryItem } from "@/lib/iso/types";

type InventoryPanelProps = {
  inventory: InventoryItem[];
  selectedItem: FurnitureKind | null;
  onSelectItem: (item: FurnitureKind) => void;
};

export function InventoryPanel({
  inventory,
  selectedItem,
  onSelectItem
}: InventoryPanelProps) {
  return (
    <section className="glass-panel card" style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <span className="badge mono">Inventaire</span>
        <h3>Reserve EtherCristal</h3>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
          Glissez un objet vers la chambre ou activez-le puis cliquez sur une tuile.
        </p>
      </div>
      <div className="inventory-grid">
        {inventory.map((entry) => (
          <div
            className={`inventory-item ${selectedItem === entry.item ? "active" : ""}`}
            draggable={entry.quantity > 0}
            key={entry.id}
            onClick={() => onSelectItem(entry.item)}
            onDragStart={(event) => {
              event.dataTransfer.setData("application/etherworld-item", entry.item);
              event.dataTransfer.effectAllowed = "copy";
              onSelectItem(entry.item);
            }}
            role="button"
            tabIndex={0}
          >
            <strong>{FURNITURE_CATALOG[entry.item].label}</strong>
            <span className="muted mono">Stock: {entry.quantity}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
