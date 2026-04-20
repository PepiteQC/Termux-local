import { isoToScreen } from "@/lib/iso/isoToScreen";
import type { ProjectionConfig } from "@/lib/iso/isoToScreen";
import type { AvatarRecord } from "@/lib/iso/types";

export function getAvatarSpritePath() {
  return "/sprites/avatar/avatar-ether.png";
}

export function drawIsoAvatar(
  ctx: CanvasRenderingContext2D,
  avatar: AvatarRecord,
  projection: ProjectionConfig,
  image?: CanvasImageSource
) {
  const anchor = isoToScreen(avatar.x, avatar.y, 0, projection);
  const width = 64;
  const height = 80;
  const drawX = anchor.x - width / 2;
  const drawY = anchor.y - height + 8;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(anchor.x, anchor.y + 4, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.imageSmoothingEnabled = false;

  if (image) {
    ctx.drawImage(image, drawX, drawY, width, height);
  }

  ctx.restore();
}
