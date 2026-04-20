"use client";

import { TouchButton } from "./ui/TouchButton";
import { FURNITURE_ORDER, getFurnitureDefinition } from "../lib/furniture/FurnitureRegistry";
import type { FurniturePlacement, FurnitureType } from "../lib/furniture/FurnitureTypes";

type FurnitureControlsProps = {
  buildMode: boolean;
  selectedType: FurnitureType | null;
  selectedFurniture: FurniturePlacement | null;
  syncState: string;
  onToggleBuildMode: () => void;
  onSelectType: (type: FurnitureType | null) => void;
  onRotatePreview: () => void;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
};

export function FurnitureControls({
  buildMode,
  selectedType,
  selectedFurniture,
  syncState,
  onToggleBuildMode,
  onSelectType,
  onRotatePreview,
  onRotateSelected,
  onDeleteSelected
}: FurnitureControlsProps) {
  return (
    <>
      <section className="mobile-toolbar glass-panel mobile-card">
        <div className="touch-grid">
          <TouchButton onClick={onToggleBuildMode} variant={buildMode ? "primary" : "secondary"}>
            {buildMode ? "Quitter build" : "Mode build"}
          </TouchButton>
          <TouchButton disabled={!selectedType} onClick={onRotatePreview}>
            Rotation preview
          </TouchButton>
          <TouchButton disabled={!selectedFurniture} onClick={onRotateSelected}>
            Rotation meuble
          </TouchButton>
        </div>
        <div className="touch-grid">
          <TouchButton disabled={!selectedFurniture} onClick={onDeleteSelected} variant="danger">
            Supprimer
          </TouchButton>
          <div className="stat-pill">Selection {selectedFurniture?.type ?? selectedType ?? "aucune"}</div>
          <div className="stat-pill">Sync {syncState}</div>
        </div>
      </section>

      <section className="glass-panel mobile-card inventory-panel">
        <div className="panel-heading">
          <span className="badge mono">Catalogue</span>
          <h3>Meubles EtherWorld</h3>
        </div>
        <div className="inventory-scroll">
          {FURNITURE_ORDER.map((type) => {
            const definition = getFurnitureDefinition(type);

            return (
              <button
                className={`inventory-chip ${selectedType === type ? "active" : ""}`}
                key={type}
                onClick={() => onSelectType(selectedType === type ? null : type)}
                type="button"
              >
                <span>{definition.label}</span>
                <strong className="mono">
                  {definition.width}x{definition.depth}
                </strong>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
