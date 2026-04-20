import { FURNITURE_CATALOG, type FurnitureRecord } from "@/lib/iso/types";
import { getIsoZIndex, getFurnitureFootprint, roomToScreen, TILE_HEIGHT, TILE_WIDTH } from "@/lib/iso/renderer";

type FurnitureProps = {
  furniture: FurnitureRecord;
  selected?: boolean;
  onSelect: () => void;
};

export function Furniture({ furniture, selected = false, onSelect }: FurnitureProps) {
  const config = FURNITURE_CATALOG[furniture.type];
  const footprint = getFurnitureFootprint(furniture);
  const origin = roomToScreen(furniture.x, furniture.y, furniture.z);
  const width = ((footprint.width + footprint.depth) * TILE_WIDTH) / 2;
  const spriteHeight = config.drawSize.height;
  const spriteWidth = config.drawSize.width;

  return (
    <button
      aria-label={config.label}
      onClick={onSelect}
      style={{
        position: "absolute",
        left: origin.left,
        top: origin.top - spriteHeight,
        width: Math.max(width, spriteWidth),
        height: spriteHeight + footprint.depth * TILE_HEIGHT,
        transform: "translate(-50%, 0)",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        zIndex: getIsoZIndex(furniture.x, furniture.y, furniture.z, 4)
      }}
      type="button"
    >
        <img
          alt={config.label}
          draggable={false}
          src={`/sprites/furnitures/${config.sprite}.png`}
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            width: spriteWidth,
            height: spriteHeight,
            transform: "translateX(-50%)",
            imageRendering: "pixelated",
            filter: selected ? "drop-shadow(0 0 16px rgba(0,224,255,0.65))" : "none",
            pointerEvents: "none"
          }}
        />
        <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width,
          height: footprint.depth * TILE_HEIGHT,
          transform: "translateX(-50%)",
          clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)"
          }}
        />
      {selected ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid rgba(0,224,255,0.85)",
            borderRadius: 16
          }}
        />
      ) : null}
    </button>
  );
}
