import { getFurnitureDefinition } from "./FurnitureRegistry";
import {
  getFurnitureShadowBounds,
  getFurnitureSpriteAnchor,
  getRotatedFootprint
} from "./FurnitureCollision";
import type {
  IsoTile,
  FurniturePlacement,
  FurniturePreviewState,
  FurnitureSelection
} from "./FurnitureTypes";
import { getTilePolygon, isoToScreen, type ProjectionConfig } from "../iso/isoToScreen";
import type { FurnitureParticleEffect, FurnitureVisualState } from "./FurnitureVisuals";

export type AvatarDirection = "north" | "south" | "east" | "west";

export type AvatarSpriteRange = [number, number];

export type AvatarSpriteSheetConfig = {
  sheetPath?: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames?: number;
  fps?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  rows?: number;
  columns?: number;
  animations?: Record<string, { frames: number[]; speed: number }>;
  defaultAnimation?: string;
  directions: Record<
    AvatarDirection,
    {
      idle: AvatarSpriteRange;
      walk: AvatarSpriteRange;
    }
  >;
};

export type AvatarRenderLayer = {
  path: string;
  spriteSheet?: AvatarSpriteSheetConfig;
};

export function getFurnitureDepth(furniture: FurniturePlacement) {
  return furniture.x + furniture.z + furniture.y;
}

export function sortFurnitureForRender(furnitures: FurniturePlacement[]) {
  return [...furnitures].sort((left, right) => getFurnitureDepth(left) - getFurnitureDepth(right));
}

export async function loadFurnitureSprites(
  types: string[]
): Promise<Record<string, HTMLImageElement>> {
  const unique = Array.from(new Set(types));
  const entries = await Promise.all(
    unique.map(
      (type) =>
        new Promise<[string, HTMLImageElement | null]>((resolve) => {
          const image = new Image();
          image.src = `/sprites/furnitures/${type}.png`;
          image.onload = () => resolve([type, image]);
          image.onerror = () => resolve([type, null]);
        })
    )
  );

  return entries.reduce<Record<string, HTMLImageElement>>((acc, [type, image]) => {
    if (image) {
      acc[type] = image;
    }
    return acc;
  }, {});
}

export async function loadAvatarLayerSprites(
  layers: AvatarRenderLayer[]
): Promise<Record<string, HTMLImageElement>> {
  const unique = Array.from(
    new Set(
      layers.flatMap((layer) =>
        [layer.path, layer.spriteSheet?.sheetPath].filter(Boolean) as string[]
      )
    )
  );
  const entries = await Promise.all(
    unique.map(
      (path) =>
        new Promise<[string, HTMLImageElement | null]>((resolve) => {
          const image = new Image();
          image.src = path;
          image.onload = () => resolve([path, image]);
          image.onerror = () => resolve([path, null]);
        })
    )
  );

  return entries.reduce<Record<string, HTMLImageElement>>((acc, [path, image]) => {
    if (image) {
      acc[path] = image;
    }
    return acc;
  }, {});
}

export function drawFloorGrid(
  ctx: CanvasRenderingContext2D,
  projection: ProjectionConfig,
  roomWidth: number,
  roomDepth: number,
  hoveredTile: { x: number; z: number } | null
) {
  for (let z = 0; z < roomDepth; z += 1) {
    for (let x = 0; x < roomWidth; x += 1) {
      const polygon = getTilePolygon(x, 0, z, projection);
      const gradient = ctx.createLinearGradient(
        polygon[0].x,
        polygon[0].y,
        polygon[2].x,
        polygon[2].y
      );
      const isHovered = hoveredTile?.x === x && hoveredTile?.z === z;

      if (isHovered) {
        gradient.addColorStop(0, "rgba(0, 224, 255, 0.8)");
        gradient.addColorStop(1, "rgba(74, 58, 255, 0.28)");
      } else {
        gradient.addColorStop(0, z % 2 === 0 ? "#2b3450" : "#222a42");
        gradient.addColorStop(1, x % 2 === 0 ? "#131924" : "#0e131c");
      }

      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = isHovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.08)";
      ctx.lineWidth = isHovered ? 1.8 : 1;
      ctx.stroke();
    }
  }
}

export function drawFurniturePreview(
  ctx: CanvasRenderingContext2D,
  preview: FurniturePreviewState | null,
  projection: ProjectionConfig
) {
  if (!preview) {
    return;
  }

  const definition = getFurnitureDefinition(preview.type);
  const footprint = getRotatedFootprint(definition, preview.rotation);

  for (let dx = 0; dx < footprint.width; dx += 1) {
    for (let dz = 0; dz < footprint.depth; dz += 1) {
      const polygon = getTilePolygon(preview.tile.x + dx, preview.tile.y, preview.tile.z + dz, projection);
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = preview.valid ? "rgba(55, 225, 163, 0.25)" : "rgba(255, 87, 120, 0.28)";
      ctx.strokeStyle = preview.valid ? "rgba(185,255,230,0.92)" : "rgba(255,216,223,0.92)";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
  }
}

export function drawFurnitureItem(
  ctx: CanvasRenderingContext2D,
  furniture: FurniturePlacement,
  projection: ProjectionConfig,
  images: Record<string, HTMLImageElement>,
  selection: FurnitureSelection,
  options?: {
    visualState?: FurnitureVisualState;
    tick?: number;
  }
) {
  const definition = getFurnitureDefinition(furniture.type);
  const anchor = getFurnitureSpriteAnchor(furniture, projection);
  const shadow = getFurnitureShadowBounds(furniture, projection);
  const image = images[furniture.type];
  const isSelected = selection.id === furniture.id;
  const isHovered = selection.hoveredId === furniture.id;
  const visualState = options?.visualState ?? "idle";

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(shadow.x, shadow.y, shadow.width / 2, shadow.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (image) {
    const drawX = anchor.x - definition.drawWidth / 2;
    const drawY = anchor.y - definition.drawHeight;
    ctx.imageSmoothingEnabled = false;

    if (definition.glow && (isHovered || isSelected || visualState === "active" || visualState === "use")) {
      ctx.save();
      ctx.shadowBlur = visualState === "use" || isSelected ? 24 : 14;
      ctx.shadowColor = definition.glow;
      ctx.drawImage(image, drawX, drawY, definition.drawWidth, definition.drawHeight);
      ctx.restore();
    }

    if (visualState === "open") {
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.translate(0, -2);
      ctx.drawImage(image, drawX, drawY, definition.drawWidth, definition.drawHeight);
      ctx.restore();
    }

    if (visualState === "use") {
      const pulse = 1 + (((options?.tick ?? 0) % 30) / 300);
      const width = definition.drawWidth * pulse;
      const height = definition.drawHeight * pulse;
      ctx.drawImage(
        image,
        anchor.x - width / 2,
        anchor.y - height,
        width,
        height
      );
    } else {
      ctx.drawImage(image, drawX, drawY, definition.drawWidth, definition.drawHeight);
    }
  } else {
    ctx.fillStyle = "#7e8fd1";
    ctx.fillRect(anchor.x - 18, anchor.y - 36, 36, 36);
  }

  if (isHovered || isSelected) {
    ctx.strokeStyle = isSelected ? "rgba(255,255,255,0.96)" : "rgba(0,224,255,0.9)";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.strokeRect(
      anchor.x - definition.drawWidth / 2 - 3,
      anchor.y - definition.drawHeight - 3,
      definition.drawWidth + 6,
      definition.drawHeight + 6
    );
  }

  ctx.restore();
}

export function drawFurnitureParticles(
  ctx: CanvasRenderingContext2D,
  furniture: FurniturePlacement,
  projection: ProjectionConfig,
  effect: FurnitureParticleEffect,
  tick: number
) {
  if (!effect) {
    return;
  }

  const anchor = getFurnitureSpriteAnchor(furniture, projection);
  const particles = 4;
  const palette =
    effect === "warm-glow"
      ? ["rgba(255, 227, 138, 0.55)", "rgba(255, 246, 214, 0.35)"]
      : effect === "ether-sparkles"
        ? ["rgba(111, 233, 255, 0.7)", "rgba(190, 245, 255, 0.4)"]
        : effect === "neon-pulse"
          ? ["rgba(255, 102, 163, 0.6)", "rgba(255, 180, 217, 0.35)"]
          : ["rgba(190, 205, 255, 0.45)", "rgba(255,255,255,0.28)"];

  ctx.save();

  for (let index = 0; index < particles; index += 1) {
    const phase = tick / 12 + index * 1.7;
    const offsetX = Math.sin(phase) * (10 + index * 2);
    const offsetY = Math.cos(phase * 1.3) * (6 + index);
    const radius = 2 + ((tick + index * 7) % 10) * 0.12;
    const color = palette[index % palette.length];

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(anchor.x + offsetX, anchor.y - 34 + offsetY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawAvatarPlaceholder(
  ctx: CanvasRenderingContext2D,
  projection: ProjectionConfig,
  roomWidth: number,
  roomDepth: number
) {
  const anchor = isoToScreen(roomWidth - 1.25, 0, roomDepth - 1.25, projection);

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(anchor.x, anchor.y + 5, 16, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9ad8ff";
  ctx.fillRect(anchor.x - 14, anchor.y - 52, 28, 42);
  ctx.fillStyle = "#f5e8ff";
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y - 60, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawAvatarSprite(
  ctx: CanvasRenderingContext2D,
  projection: ProjectionConfig,
  tile: IsoTile,
  layers: AvatarRenderLayer[],
  images: Record<string, HTMLImageElement>,
  highlight = false,
  options?: {
    direction?: AvatarDirection;
    walking?: boolean;
    tick?: number;
  }
) {
  const anchor = isoToScreen(tile.x + 0.5, tile.y, tile.z + 0.5, projection);
  const direction = options?.direction ?? "south";
  const tick = options?.tick ?? 0;
  const walking = Boolean(options?.walking);
  const bob = walking ? Math.sin(tick * 0.8) * 3 : 0;
  const sway = direction === "east" ? 2 : direction === "west" ? -2 : 0;
  const baseSpriteSheet = layers.find((layer) => layer.spriteSheet)?.spriteSheet;
  const baseScale = baseSpriteSheet?.scale ?? 1.75;
  const drawWidth = baseSpriteSheet ? baseSpriteSheet.frameWidth * baseScale : 84;
  const drawHeight = baseSpriteSheet ? baseSpriteSheet.frameHeight * baseScale : 112;
  const scale = walking ? 1 + Math.abs(Math.cos(tick * 0.8)) * 0.03 : 1;
  const scaledWidth = drawWidth * scale;
  const scaledHeight = drawHeight * scale;
  const mirrored = direction === "west";
  const facingAlpha = direction === "north" ? 0.92 : 1;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(anchor.x + sway * 0.4, anchor.y + 7, walking ? 18 : 16, walking ? 8 : 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.imageSmoothingEnabled = false;
  let drewLayer = false;

  layers.forEach((layer) => {
    const spriteSheetImage = layer.spriteSheet?.sheetPath
      ? images[layer.spriteSheet.sheetPath]
      : undefined;
    const image = spriteSheetImage ?? images[layer.path];
    if (!image) {
      return;
    }
    drewLayer = true;
    const layerScale = layer.spriteSheet?.scale ?? baseScale;
    const layerWidth = (layer.spriteSheet?.frameWidth ?? (baseSpriteSheet?.frameWidth ?? 48)) * layerScale * scale;
    const layerHeight = (layer.spriteSheet?.frameHeight ?? (baseSpriteSheet?.frameHeight ?? 64)) * layerScale * scale;
    const drawX =
      anchor.x -
      layerWidth / 2 +
      sway +
      (layer.spriteSheet?.offsetX ?? baseSpriteSheet?.offsetX ?? 0);
    const drawY =
      anchor.y -
      layerHeight +
      6 -
      bob +
      (layer.spriteSheet?.offsetY ?? baseSpriteSheet?.offsetY ?? 0);
    ctx.save();
    ctx.globalAlpha = facingAlpha;
    if (layer.spriteSheet && spriteSheetImage) {
      const frame = getAvatarFrameIndex(layer.spriteSheet, direction, walking, tick);
      const columns = layer.spriteSheet.columns ?? Math.max(1, Math.floor(image.width / layer.spriteSheet.frameWidth));
      const sourceX = (frame % columns) * layer.spriteSheet.frameWidth;
      const sourceY = Math.floor(frame / columns) * layer.spriteSheet.frameHeight;

      if (mirrored) {
        ctx.translate(drawX + scaledWidth / 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          layer.spriteSheet.frameWidth,
          layer.spriteSheet.frameHeight,
          -layerWidth / 2,
          drawY,
          layerWidth,
          layerHeight
        );
      } else {
        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          layer.spriteSheet.frameWidth,
          layer.spriteSheet.frameHeight,
          drawX,
          drawY,
          layerWidth,
          layerHeight
        );
      }
    } else if (mirrored) {
      ctx.translate(drawX + layerWidth / 2, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(image, -layerWidth / 2, drawY, layerWidth, layerHeight);
    } else {
      ctx.drawImage(image, drawX, drawY, layerWidth, layerHeight);
    }
    ctx.restore();
  });

  if (highlight) {
    ctx.strokeStyle = "rgba(79, 195, 247, 0.9)";
    ctx.lineWidth = 2;
    const outlineX =
      anchor.x - scaledWidth / 2 + sway + (baseSpriteSheet?.offsetX ?? 0);
    const outlineY =
      anchor.y - scaledHeight + 6 - bob + (baseSpriteSheet?.offsetY ?? 0);
    ctx.strokeRect(outlineX - 3, outlineY - 3, scaledWidth + 6, scaledHeight + 6);
  }

  if (walking) {
    ctx.fillStyle = "rgba(79, 195, 247, 0.18)";
    const outlineX =
      anchor.x - scaledWidth / 2 + sway + (baseSpriteSheet?.offsetX ?? 0);
    const outlineY =
      anchor.y - scaledHeight + 6 - bob + (baseSpriteSheet?.offsetY ?? 0);
    ctx.fillRect(outlineX + 10, outlineY + scaledHeight - 20, scaledWidth - 20, 6);
  }

  ctx.restore();

  if (!drewLayer) {
    drawAvatarPlaceholder(ctx, projection, tile.x + 1, tile.z + 1);
  }
}

function getAvatarFrameIndex(
  config: AvatarSpriteSheetConfig,
  direction: AvatarDirection,
  walking: boolean,
  tick: number
) {
  const animationKey = `${direction}_${walking ? "walk" : "idle"}`;
  const explicitAnimation = config.animations?.[animationKey];
  if (explicitAnimation) {
    const speed = explicitAnimation.speed || config.fps || 8;
    const divisor = Math.max(1, Math.round(12 / speed));
    return explicitAnimation.frames[Math.floor(tick / divisor) % explicitAnimation.frames.length] ?? explicitAnimation.frames[0] ?? 0;
  }

  const directionFrames = config.directions[direction];
  const [start, end] = walking ? directionFrames.walk : directionFrames.idle;
  const count = Math.max(1, end - start + 1);
  const fps = config.fps ?? 8;
  return start + (Math.floor(tick / Math.max(1, Math.round(10 / fps))) % count);
}
