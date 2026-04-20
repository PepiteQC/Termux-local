"use client";

import { getFurnitureDefinition } from "../lib/furniture/FurnitureRegistry";
import type { FurniturePreviewState } from "../lib/furniture/FurnitureTypes";

type FurniturePreviewProps = {
  preview: FurniturePreviewState | null;
};

export function FurniturePreview({ preview }: FurniturePreviewProps) {
  if (!preview) {
    return (
      <div className="furniture-preview-card glass-panel">
        <span className="badge mono">Preview</span>
        <strong>Aucun meuble selectionne</strong>
        <span className="muted">Choisis un meuble pour activer le build mode.</span>
      </div>
    );
  }

  const definition = getFurnitureDefinition(preview.type);

  return (
    <div className="furniture-preview-card glass-panel">
      <span className="badge mono">Preview</span>
      <strong>{definition.label}</strong>
      <span className="muted">
        Tile {preview.tile.x},{preview.tile.z} | Rotation {preview.rotation * 90}deg
      </span>
      <span className={preview.valid ? "preview-valid" : "preview-invalid"}>
        {preview.valid ? "Placement valide" : preview.reason ?? "Placement invalide"}
      </span>
    </div>
  );
}
