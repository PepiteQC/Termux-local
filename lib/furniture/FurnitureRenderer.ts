import { getFurnitureDefinition, getFurnitureSpritePath } from "./FurnitureRegistry";
import {
  getFurnitureShadowBounds,
  getFurnitureSpriteAnchor,
  getRotatedFootprint
} from "./FurnitureCollision";
import type {
  IsoTile,
  FurniturePlacement,
  FurniturePreviewState,
  FurnitureSelection,
  FurnitureType
} from "./FurnitureTypes";
import { getTilePolygon, isoToScreen, type ProjectionConfig } from "../iso/isoToScreen";
import type { FurnitureParticleEffect, FurnitureVisualState } from "./FurnitureVisuals";

export type RoomTheme = {
  id: string;
  floorEven: string;
  floorOdd: string;
  floorAccent: string;
  floorHighlight: string;
  hoverA: string;
  hoverB: string;
  gridLine: string;
  wallLeft: string;
  wallRight: string;
  wallTop: string;
  baseboard: string;
  backgroundTop: string;
  backgroundMid: string;
  backgroundBottom: string;
  ambient: string;
};

export const ROOM_THEMES: Record<string, RoomTheme> = {
  "weed-shop": {
    id: "weed-shop",
    floorEven: "#2a1d14",
    floorOdd: "#3a2618",
    floorAccent: "#1f140c",
    floorHighlight: "#7dff9a",
    hoverA: "rgba(95, 255, 142, 0.85)",
    hoverB: "rgba(255, 214, 120, 0.3)",
    gridLine: "rgba(255, 227, 170, 0.08)",
    wallLeft: "#1a2a1a",
    wallRight: "#223822",
    wallTop: "#2d4a2d",
    baseboard: "#4a1f18",
    backgroundTop: "#0b1f10",
    backgroundMid: "#07140a",
    backgroundBottom: "#040a06",
    ambient: "rgba(95, 255, 142, 0.12)"
  },
  "skyline-club": {
    id: "skyline-club",
    floorEven: "#1e1a32",
    floorOdd: "#2a2446",
    floorAccent: "#14101f",
    floorHighlight: "#ff6ac9",
    hoverA: "rgba(255, 106, 201, 0.9)",
    hoverB: "rgba(79, 195, 247, 0.3)",
    gridLine: "rgba(255, 180, 255, 0.08)",
    wallLeft: "#1a1533",
    wallRight: "#221a3f",
    wallTop: "#2e2452",
    baseboard: "#3a1a55",
    backgroundTop: "#10081a",
    backgroundMid: "#080412",
    backgroundBottom: "#03020a",
    ambient: "rgba(255, 106, 201, 0.1)"
  },
  "garden-boutique": {
    id: "garden-boutique",
    floorEven: "#1e2e22",
    floorOdd: "#28402e",
    floorAccent: "#141d17",
    floorHighlight: "#9cf0b8",
    hoverA: "rgba(156, 240, 184, 0.9)",
    hoverB: "rgba(220, 255, 210, 0.3)",
    gridLine: "rgba(220, 255, 220, 0.08)",
    wallLeft: "#1b2a1e",
    wallRight: "#243825",
    wallTop: "#2e4a32",
    baseboard: "#3a2a1c",
    backgroundTop: "#0b1a12",
    backgroundMid: "#061008",
    backgroundBottom: "#020604",
    ambient: "rgba(156, 240, 184, 0.1)"
  }
};

export const DEFAULT_THEME: RoomTheme = {
  id: "default",
  floorEven: "#2b3450",
  floorOdd: "#222a42",
  floorAccent: "#131924",
  floorHighlight: "#6feaff",
  hoverA: "rgba(0, 224, 255, 0.8)",
  hoverB: "rgba(74, 58, 255, 0.28)",
  gridLine: "rgba(255, 255, 255, 0.08)",
  wallLeft: "#1c2340",
  wallRight: "#242c4c",
  wallTop: "#2c3558",
  baseboard: "#111624",
  backgroundTop: "#121521",
  backgroundMid: "#0d1118",
  backgroundBottom: "#06080d",
  ambient: "rgba(111, 233, 255, 0.1)"
};

export function getRoomTheme(roomId: string): RoomTheme {
  return ROOM_THEMES[roomId] ?? DEFAULT_THEME;
}

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
          image.src = getFurnitureSpritePath(type as FurnitureType);
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
  layerPaths: string[]
): Promise<Record<string, HTMLImageElement>> {
  const unique = Array.from(new Set(layerPaths.filter(Boolean)));
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

export function drawRoomBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: RoomTheme
) {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, theme.backgroundTop);
  background.addColorStop(0.55, theme.backgroundMid);
  background.addColorStop(1, theme.backgroundBottom);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const ambient = ctx.createRadialGradient(width / 2, height * 0.2, 40, width / 2, height * 0.2, Math.max(width, height) * 0.7);
  ambient.addColorStop(0, theme.ambient);
  ambient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ambient;
  ctx.fillRect(0, 0, width, height);
}

export function drawRoomWalls(
  ctx: CanvasRenderingContext2D,
  projection: ProjectionConfig,
  roomWidth: number,
  roomDepth: number,
  theme: RoomTheme,
  wallHeight = 4.2
) {
  // Back-left wall (along x axis at z=0)
  const tl = isoToScreen(0, wallHeight, 0, projection);
  const tr = isoToScreen(roomWidth, wallHeight, 0, projection);
  const br = isoToScreen(roomWidth, 0, 0, projection);
  const bl = isoToScreen(0, 0, 0, projection);

  const gradLeft = ctx.createLinearGradient(tl.x, tl.y, bl.x, bl.y);
  gradLeft.addColorStop(0, theme.wallTop);
  gradLeft.addColorStop(1, theme.wallLeft);
  ctx.fillStyle = gradLeft;
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Back-right wall (along z axis at x=0)
  const tlr = isoToScreen(0, wallHeight, 0, projection);
  const trr = isoToScreen(0, wallHeight, roomDepth, projection);
  const brr = isoToScreen(0, 0, roomDepth, projection);
  const blr = isoToScreen(0, 0, 0, projection);

  const gradRight = ctx.createLinearGradient(tlr.x, tlr.y, blr.x, blr.y);
  gradRight.addColorStop(0, theme.wallTop);
  gradRight.addColorStop(1, theme.wallRight);
  ctx.fillStyle = gradRight;
  ctx.beginPath();
  ctx.moveTo(tlr.x, tlr.y);
  ctx.lineTo(trr.x, trr.y);
  ctx.lineTo(brr.x, brr.y);
  ctx.lineTo(blr.x, blr.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Baseboards
  ctx.fillStyle = theme.baseboard;
  const baseHeight = 0.25;
  const bbL1 = isoToScreen(0, baseHeight, 0, projection);
  const bbL2 = isoToScreen(roomWidth, baseHeight, 0, projection);
  const bbL3 = isoToScreen(roomWidth, 0, 0, projection);
  const bbL4 = isoToScreen(0, 0, 0, projection);
  ctx.beginPath();
  ctx.moveTo(bbL1.x, bbL1.y);
  ctx.lineTo(bbL2.x, bbL2.y);
  ctx.lineTo(bbL3.x, bbL3.y);
  ctx.lineTo(bbL4.x, bbL4.y);
  ctx.closePath();
  ctx.fill();

  const bbR1 = isoToScreen(0, baseHeight, 0, projection);
  const bbR2 = isoToScreen(0, baseHeight, roomDepth, projection);
  const bbR3 = isoToScreen(0, 0, roomDepth, projection);
  const bbR4 = isoToScreen(0, 0, 0, projection);
  ctx.beginPath();
  ctx.moveTo(bbR1.x, bbR1.y);
  ctx.lineTo(bbR2.x, bbR2.y);
  ctx.lineTo(bbR3.x, bbR3.y);
  ctx.lineTo(bbR4.x, bbR4.y);
  ctx.closePath();
  ctx.fill();

  // Wall seam
  const seamTop = isoToScreen(0, wallHeight, 0, projection);
  const seamBottom = isoToScreen(0, 0, 0, projection);
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(seamTop.x, seamTop.y);
  ctx.lineTo(seamBottom.x, seamBottom.y);
  ctx.stroke();
}

export function drawFloorGrid(
  ctx: CanvasRenderingContext2D,
  projection: ProjectionConfig,
  roomWidth: number,
  roomDepth: number,
  hoveredTile: { x: number; z: number } | null,
  theme: RoomTheme = DEFAULT_THEME
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
        gradient.addColorStop(0, theme.hoverA);
        gradient.addColorStop(1, theme.hoverB);
      } else {
        const even = (x + z) % 2 === 0;
        gradient.addColorStop(0, even ? theme.floorEven : theme.floorOdd);
        gradient.addColorStop(1, theme.floorAccent);
      }

      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = isHovered ? "rgba(255,255,255,0.92)" : theme.gridLine;
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
  if (!definition.walkable) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, shadow.width / 2, shadow.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

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
    ctx.strokeStyle = isSelected ? "rgba(255,255,255,0.96)" : "rgba(95,255,142,0.9)";
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
          : effect === "kush-smoke"
            ? ["rgba(160, 230, 170, 0.5)", "rgba(230, 255, 230, 0.28)"]
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
  layerPaths: string[],
  images: Record<string, HTMLImageElement>,
  highlight = false
) {
  const anchor = isoToScreen(tile.x + 0.5, tile.y, tile.z + 0.5, projection);
  const drawWidth = 84;
  const drawHeight = 112;
  const drawX = anchor.x - drawWidth / 2;
  const drawY = anchor.y - drawHeight + 6;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(anchor.x, anchor.y + 7, 16, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.imageSmoothingEnabled = false;
  let drewLayer = false;

  layerPaths.forEach((path) => {
    const image = images[path];
    if (!image) {
      return;
    }
    drewLayer = true;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  });

  if (highlight) {
    ctx.strokeStyle = "rgba(95, 255, 142, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX - 3, drawY - 3, drawWidth + 6, drawHeight + 6);
  }

  ctx.restore();

  if (!drewLayer) {
    drawAvatarPlaceholder(ctx, projection, tile.x + 1, tile.z + 1);
  }
}
