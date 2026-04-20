import { getIsoZIndex, getTileTint, roomToScreen, TILE_HEIGHT, TILE_WIDTH } from "@/lib/iso/renderer";

type TileProps = {
  x: number;
  y: number;
  onClick: () => void;
  onDropItem: (type: string) => void;
  highlighted?: boolean;
};

export function Tile({ x, y, onClick, onDropItem, highlighted = false }: TileProps) {
  const position = roomToScreen(x, y);

  return (
    <button
      aria-label={`Tile ${x}, ${y}`}
      onClick={onClick}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData("application/etherworld-item");

        if (type) {
          onDropItem(type);
        }
      }}
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        width: TILE_WIDTH,
        height: TILE_HEIGHT,
        transform: "translate(-50%, 0)",
        clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
        border: highlighted ? "1px solid rgba(126, 253, 249, 0.86)" : "1px solid rgba(255,255,255,0.05)",
        background: highlighted
          ? "linear-gradient(135deg, rgba(126, 253, 249, 0.32), rgba(177, 109, 255, 0.42))"
          : getTileTint(x, y),
        boxShadow: highlighted ? "0 0 28px rgba(126, 253, 249, 0.22)" : "inset 0 -10px 18px rgba(0,0,0,0.25)",
        cursor: "pointer",
        zIndex: getIsoZIndex(x, y)
      }}
      type="button"
    />
  );
}
