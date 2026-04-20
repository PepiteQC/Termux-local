import { getTilePolygon } from "@/lib/iso/isoToScreen";
import type { ProjectionConfig } from "@/lib/iso/isoToScreen";

export function drawIsoTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  projection: ProjectionConfig,
  highlighted = false
) {
  const polygon = getTilePolygon(x, y, 0, projection);
  const gradient = ctx.createLinearGradient(
    polygon[0].x,
    polygon[0].y,
    polygon[2].x,
    polygon[2].y
  );

  if (highlighted) {
    gradient.addColorStop(0, "rgba(0,224,255,0.95)");
    gradient.addColorStop(1, "rgba(74,58,255,0.45)");
  } else {
    gradient.addColorStop(0, y % 2 === 0 ? "#2d3555" : "#242b47");
    gradient.addColorStop(1, x % 2 === 0 ? "#141925" : "#10141f");
  }

  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  polygon.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = highlighted ? "rgba(242,242,242,0.92)" : "rgba(255,255,255,0.08)";
  ctx.lineWidth = highlighted ? 2 : 1;
  ctx.stroke();
}
