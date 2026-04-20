import { getFurnitureShadowBounds, getFurnitureSpriteAnchor } from "@/lib/iso/collision";
import type { ProjectionConfig } from "@/lib/iso/isoToScreen";
import { FURNITURE_CATALOG, type FurnitureRecord } from "@/lib/iso/types";

export function getFurnitureSpritePath(type: FurnitureRecord["type"]) {
  return `/sprites/furnitures/${FURNITURE_CATALOG[type].sprite}.png`;
}

export function drawIsoFurniture(
  ctx: CanvasRenderingContext2D,
  furniture: FurnitureRecord,
  projection: ProjectionConfig,
  image: CanvasImageSource | undefined,
  selected = false
) {
  const config = FURNITURE_CATALOG[furniture.type];
  const anchor = getFurnitureSpriteAnchor(furniture, projection);
  const shadow = getFurnitureShadowBounds(furniture, projection);

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(shadow.x, shadow.y, shadow.width / 2, shadow.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (image) {
    const { width, height } = config.drawSize;
    const drawX = anchor.x - width / 2 + config.offset.x;
    const drawY = anchor.y - height + config.offset.y;

    ctx.imageSmoothingEnabled = false;

    if (selected) {
      ctx.save();
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(0,224,255,0.58)";
      ctx.drawImage(image, drawX, drawY, width, height);
      ctx.restore();
    }

    ctx.translate(anchor.x, anchor.y - height / 2 + config.offset.y / 2);
    ctx.rotate((Math.PI / 2) * furniture.rotation * 0.035);
    ctx.translate(-anchor.x, -(anchor.y - height / 2 + config.offset.y / 2));
    ctx.drawImage(image, drawX, drawY, width, height);
  }

  if (selected) {
    ctx.strokeStyle = "rgba(242,242,242,0.95)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      anchor.x - config.drawSize.width / 2 + config.offset.x - 4,
      anchor.y - config.drawSize.height + config.offset.y - 4,
      config.drawSize.width + 8,
      config.drawSize.height + 8
    );
  }

  ctx.restore();
}
