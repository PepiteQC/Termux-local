import { ISO_WALL_HEIGHT, ROOM_SIZE } from "@/lib/iso/types";
import { isoToScreen } from "@/lib/iso/isoToScreen";
import type { ProjectionConfig } from "@/lib/iso/isoToScreen";

export function drawIsoWalls(
  ctx: CanvasRenderingContext2D,
  projection: ProjectionConfig,
  width: number
) {
  const leftBase = isoToScreen(0, ROOM_SIZE - 1, 0, projection);
  const topCorner = isoToScreen(0, 0, 0, projection);
  const rightBase = isoToScreen(ROOM_SIZE - 1, 0, 0, projection);

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(topCorner.x, topCorner.y - ISO_WALL_HEIGHT);
  ctx.lineTo(leftBase.x, leftBase.y - ISO_WALL_HEIGHT);
  ctx.lineTo(leftBase.x, leftBase.y);
  ctx.lineTo(topCorner.x, topCorner.y);
  ctx.closePath();
  ctx.fillStyle = "#171b2a";
  ctx.fill();

  const leftGlow = ctx.createLinearGradient(
    topCorner.x,
    topCorner.y - ISO_WALL_HEIGHT,
    leftBase.x,
    leftBase.y
  );
  leftGlow.addColorStop(0, "rgba(0,224,255,0.18)");
  leftGlow.addColorStop(1, "rgba(27,30,42,0.02)");
  ctx.fillStyle = leftGlow;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(topCorner.x, topCorner.y - ISO_WALL_HEIGHT);
  ctx.lineTo(rightBase.x, rightBase.y - ISO_WALL_HEIGHT);
  ctx.lineTo(rightBase.x, rightBase.y);
  ctx.lineTo(topCorner.x, topCorner.y);
  ctx.closePath();
  ctx.fillStyle = "#10131d";
  ctx.fill();

  const rightGlow = ctx.createLinearGradient(
    topCorner.x,
    topCorner.y - ISO_WALL_HEIGHT,
    width,
    topCorner.y
  );
  rightGlow.addColorStop(0, "rgba(74,58,255,0.33)");
  rightGlow.addColorStop(1, "rgba(255,58,242,0.02)");
  ctx.fillStyle = rightGlow;
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.moveTo(topCorner.x, topCorner.y - ISO_WALL_HEIGHT);
  ctx.lineTo(leftBase.x, leftBase.y - ISO_WALL_HEIGHT);
  ctx.moveTo(topCorner.x, topCorner.y - ISO_WALL_HEIGHT);
  ctx.lineTo(rightBase.x, rightBase.y - ISO_WALL_HEIGHT);
  ctx.stroke();

  ctx.restore();
}
