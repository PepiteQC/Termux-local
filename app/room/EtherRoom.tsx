"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RoomUIPanel } from "@/components/RoomUIPanel";
import { ETHERWORLD_ROOM } from "../../lib/room/sampleRoom";
import {
  buildBlockedSet,
  getTileAtPoint,
  isoToScreen,
  tilePolygon,
} from "../../lib/room/map";
import { findPath, getDirection } from "../../lib/room/pathfinding";
import type {
  AvatarState,
  Point,
  RoomDefinition,
  RoomFurniture,
  Tile,
} from "../../lib/room/types";

function shadeColor(hex: string, amount: number) {
  const clean = hex.replace("#", "");
  const num = Number.parseInt(clean, 16);

  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));

  return `rgb(${r}, ${g}, ${b})`;
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: Point[],
  fill: string,
  stroke?: string,
  lineWidth = 1,
) {
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  polygon.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawPixelBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  border = "#000000",
) {
  ctx.fillStyle = border;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 1, Math.max(0, w - 2), Math.max(0, h - 2));
}

function drawWalls(ctx: CanvasRenderingContext2D, room: RoomDefinition, origin: Point) {
  const backLeft = isoToScreen(room, 0, 0, 0, origin);
  const backRight = isoToScreen(room, room.width, 0, 0, origin);
  const leftBottom = isoToScreen(room, 0, room.height, 0, origin);

  const backWall = [
    { x: backLeft.x, y: backLeft.y - room.wallHeight },
    { x: backRight.x, y: backRight.y - room.wallHeight },
    backRight,
    backLeft,
  ];

  const leftWall = [
    { x: backLeft.x, y: backLeft.y - room.wallHeight },
    backLeft,
    leftBottom,
    { x: leftBottom.x, y: leftBottom.y - room.wallHeight },
  ];

  drawPolygon(ctx, backWall, "#dccb95", "#9f8d61", 2);
  drawPolygon(ctx, leftWall, "#b98f5d", "#7c5d34", 2);

  const stripeCount = 7;
  for (let i = 0; i < stripeCount; i += 1) {
    const t = i / stripeCount;
    const x1 = backLeft.x + (backRight.x - backLeft.x) * t;
    const y1 = backLeft.y - room.wallHeight + (backRight.y - backLeft.y) * t;
    const x2 = x1;
    const y2 = y1 + room.wallHeight;

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const leftStripeCount = 6;
  for (let i = 0; i < leftStripeCount; i += 1) {
    const t = i / leftStripeCount;
    const x1 = backLeft.x + (leftBottom.x - backLeft.x) * t;
    const y1 = backLeft.y - room.wallHeight + (leftBottom.y - backLeft.y) * t;
    const x2 = x1;
    const y2 = y1 + room.wallHeight;

    ctx.strokeStyle = "rgba(0,0,0,0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.fillStyle = "#efe3b4";
  ctx.fillRect(backLeft.x - 2, backLeft.y - room.wallHeight + 8, 4, room.wallHeight - 8);

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(backLeft.x, backLeft.y - room.wallHeight);
  ctx.lineTo(backRight.x, backRight.y - room.wallHeight);
  ctx.lineTo(backRight.x, backRight.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(backLeft.x, backLeft.y - room.wallHeight);
  ctx.lineTo(leftBottom.x, leftBottom.y - room.wallHeight);
  ctx.lineTo(leftBottom.x, leftBottom.y);
  ctx.stroke();

  const trimBack = [
    { x: backLeft.x, y: backLeft.y - 2 },
    { x: backRight.x, y: backRight.y - 2 },
    { x: backRight.x, y: backRight.y + 10 },
    { x: backLeft.x, y: backLeft.y + 10 },
  ];
  drawPolygon(ctx, trimBack, "#c4a86c", "#8e723c", 1);

  const trimLeft = [
    { x: backLeft.x, y: backLeft.y - 2 },
    { x: leftBottom.x, y: leftBottom.y - 2 },
    { x: leftBottom.x, y: leftBottom.y + 10 },
    { x: backLeft.x, y: backLeft.y + 10 },
  ];
  drawPolygon(ctx, trimLeft, "#a87e49", "#75572f", 1);
}

function drawFloorTile(
  ctx: CanvasRenderingContext2D,
  room: RoomDefinition,
  x: number,
  y: number,
  origin: Point,
  hovered: boolean,
  pathTile: boolean,
) {
  const poly = tilePolygon(room, x, y, origin);

  const checker = (x + y) % 2 === 0;
  const topColor = hovered
    ? "#dff8ff"
    : pathTile
      ? "#fff0be"
      : checker
        ? "#f1ede4"
        : "#e7e2d8";

  const borderColor = hovered ? "#61d4ff" : pathTile ? "#cc9c39" : "#9e9a92";

  if (x === room.width - 1) {
    const rightFace = [
      poly[1],
      poly[2],
      { x: poly[2].x, y: poly[2].y + room.floorDrop },
      { x: poly[1].x, y: poly[1].y + room.floorDrop },
    ];
    drawPolygon(ctx, rightFace, "#bdbcb7", "#8c8b86", 1);
  }

  if (y === room.height - 1) {
    const frontFace = [
      poly[2],
      poly[3],
      { x: poly[3].x, y: poly[3].y + room.floorDrop },
      { x: poly[2].x, y: poly[2].y + room.floorDrop },
    ];
    drawPolygon(ctx, frontFace, "#d1d0ca", "#9a9892", 1);
  }

  drawPolygon(ctx, poly, topColor, borderColor, hovered || pathTile ? 2 : 1);

  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  ctx.lineTo(poly[2].x, poly[2].y);
  ctx.moveTo(poly[1].x, poly[1].y);
  ctx.lineTo(poly[3].x, poly[3].y);
  ctx.strokeStyle = hovered ? "rgba(97,212,255,0.24)" : "rgba(0,0,0,0.04)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const centerX = (poly[0].x + poly[2].x) / 2;
  const centerY = (poly[0].y + poly[2].y) / 2;

  ctx.fillStyle = hovered
    ? "rgba(97,212,255,0.10)"
    : pathTile
      ? "rgba(204,156,57,0.10)"
      : "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 6);
  ctx.lineTo(centerX + 8, centerY);
  ctx.lineTo(centerX, centerY + 6);
  ctx.lineTo(centerX - 8, centerY);
  ctx.closePath();
  ctx.fill();
}

function drawFurnitureTopFaces(
  ctx: CanvasRenderingContext2D,
  item: RoomFurniture,
  topA: Point,
  topB: Point,
  topC: Point,
  topD: Point,
  botB: Point,
  botC: Point,
  botD: Point,
) {
  drawPolygon(ctx, [topB, topC, botC, botB], shadeColor(item.color, -18), shadeColor(item.color, -50), 1);
  drawPolygon(ctx, [topD, topC, botC, botD], shadeColor(item.color, -34), shadeColor(item.color, -58), 1);
  drawPolygon(ctx, [topA, topB, topC, topD], item.color, shadeColor(item.color, -42), 1.5);
}

function drawFurnitureDecor(
  ctx: CanvasRenderingContext2D,
  room: RoomDefinition,
  item: RoomFurniture,
  elevation: number,
  origin: Point,
) {
  const center = isoToScreen(room, item.x + item.w / 2, item.y + item.d / 2, elevation, origin);

  if (item.kind === "screen") {
    drawPixelBorder(ctx, center.x - 20, center.y - 28, 40, 28, "#162130", "#09111a");
    ctx.fillStyle = item.accent ?? "#59d7ff";
    ctx.fillRect(center.x - 14, center.y - 22, 28, 16);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(center.x - 10, center.y - 20, 8, 2);
    ctx.fillRect(center.x - 10, center.y - 16, 14, 2);
    return;
  }

  if (item.kind === "lamp") {
    ctx.strokeStyle = "#6f5d3d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y + 14);
    ctx.lineTo(center.x, center.y - 28);
    ctx.stroke();

    ctx.fillStyle = item.accent ?? "#fff1a8";
    ctx.beginPath();
    ctx.arc(center.x, center.y - 35, 12, 0, Math.PI * 2);
    ctx.fill();

    const glow = ctx.createRadialGradient(center.x, center.y - 35, 2, center.x, center.y - 35, 44);
    glow.addColorStop(0, "rgba(255,244,175,0.35)");
    glow.addColorStop(1, "rgba(255,244,175,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center.x, center.y - 35, 44, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (item.kind === "plant") {
    drawPixelBorder(ctx, center.x - 10, center.y + 1, 20, 14, "#5c3d2a", "#2d1d14");
    ctx.fillStyle = item.accent ?? "#59a16e";
    ctx.beginPath();
    ctx.arc(center.x, center.y - 10, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6ccc86";
    ctx.beginPath();
    ctx.arc(center.x - 7, center.y - 15, 7, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (item.kind === "table") {
    drawPixelBorder(ctx, center.x - 10, center.y - 10, 20, 10, "#d5b18b", "#845e3b");
    return;
  }

  if (item.kind === "sofa") {
    drawPixelBorder(ctx, center.x - 20, center.y - 14, 40, 14, item.accent ?? "#8c69b1", "#3b254e");
    drawPixelBorder(ctx, center.x - 22, center.y - 4, 44, 8, "#5e3d7a", "#2a1837");
    return;
  }

  if (item.kind === "bed") {
    drawPixelBorder(ctx, center.x - 20, center.y - 14, 40, 10, item.accent ?? "#cc5d78", "#5f2231");
    drawPixelBorder(ctx, center.x - 20, center.y - 2, 40, 12, "#f1e8e2", "#a08f87");
  }
}

function drawFurniture(
  ctx: CanvasRenderingContext2D,
  room: RoomDefinition,
  item: RoomFurniture,
  origin: Point,
) {
  if (item.h === 0) {
    const rugTop = [
      isoToScreen(room, item.x, item.y, 1, origin),
      isoToScreen(room, item.x + item.w, item.y, 1, origin),
      isoToScreen(room, item.x + item.w, item.y + item.d, 1, origin),
      isoToScreen(room, item.x, item.y + item.d, 1, origin),
    ];
    drawPolygon(ctx, rugTop, item.color, shadeColor(item.color, -32), 1);

    const center = isoToScreen(room, item.x + item.w / 2, item.y + item.d / 2, 1, origin);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(center.x - 18, center.y);
    ctx.lineTo(center.x, center.y - 8);
    ctx.lineTo(center.x + 18, center.y);
    ctx.lineTo(center.x, center.y + 8);
    ctx.closePath();
    ctx.stroke();
    return;
  }

  const elevation = item.h * room.stepHeight;

  const topA = isoToScreen(room, item.x, item.y, elevation, origin);
  const topB = isoToScreen(room, item.x + item.w, item.y, elevation, origin);
  const topC = isoToScreen(room, item.x + item.w, item.y + item.d, elevation, origin);
  const topD = isoToScreen(room, item.x, item.y + item.d, elevation, origin);

  const botA = isoToScreen(room, item.x, item.y, 0, origin);
  const botB = isoToScreen(room, item.x + item.w, item.y, 0, origin);
  const botC = isoToScreen(room, item.x + item.w, item.y + item.d, 0, origin);
  const botD = isoToScreen(room, item.x, item.y + item.d, 0, origin);

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(
    (botC.x + botD.x) / 2,
    botC.y + 6,
    20 + item.w * 10,
    8 + item.d * 4,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  drawFurnitureTopFaces(ctx, item, topA, topB, topC, topD, botB, botC, botD);
  drawFurnitureDecor(ctx, room, item, elevation, origin);

  if (item.kind === "desk") {
    const center = isoToScreen(room, item.x + 1, item.y + 0.5, elevation, origin);
    drawPixelBorder(ctx, center.x - 18, center.y - 10, 36, 10, "#b88f65", "#5d4028");
  }

  ctx.restore();
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  room: RoomDefinition,
  avatar: AvatarState,
  origin: Point,
  tick: number,
) {
  const anchor = isoToScreen(room, avatar.renderX + 0.5, avatar.renderY + 0.5, 0, origin);
  const bob = avatar.walking ? Math.sin(tick * 0.014) * 2 : 0;

  const px = Math.round(anchor.x - 15);
  const py = Math.round(anchor.y - 72 + bob);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(anchor.x, anchor.y + 4, 15, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const armShift = avatar.walking ? (Math.sin(tick * 0.014) > 0 ? 2 : -2) : 0;
  const lookShift = avatar.direction === "SE" ? 2 : avatar.direction === "NW" ? -2 : 0;

  drawPixelBorder(ctx, px + 5, py + 54, 8, 7, "#2e2320", "#140f0d");
  drawPixelBorder(ctx, px + 16, py + 54, 8, 7, "#2e2320", "#140f0d");

  drawPixelBorder(ctx, px + 6, py + 40, 7, 15, "#5c4f72", "#31293d");
  drawPixelBorder(ctx, px + 16, py + 40, 7, 15, "#5c4f72", "#31293d");

  drawPixelBorder(ctx, px + 3, py + 19, 23, 24, "#a42631", "#5a1119");
  drawPixelBorder(ctx, px + 6, py + 14, 17, 11, "#b83745", "#671924");

  drawPixelBorder(ctx, px + 0, py + 22 + armShift, 6, 14, "#8f1721", "#4e0b12");
  drawPixelBorder(ctx, px + 24, py + 22 - armShift, 6, 14, "#8f1721", "#4e0b12");

  drawPixelBorder(ctx, px + 9 + lookShift, py + 4, 13, 13, "#d6a67a", "#78593f");
  drawPixelBorder(ctx, px + 8 + lookShift, py + 13, 15, 7, "#bfbfc1", "#6c6c72");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px + 12 + lookShift, py + 9, 2, 2);
  ctx.fillRect(px + 18 + lookShift, py + 9, 2, 2);

  ctx.fillStyle = "#f0c94c";
  ctx.fillRect(px + 9, py + 29, 13, 2);
  ctx.fillRect(px + 11, py + 32, 9, 2);

  drawPixelBorder(ctx, px + 7, py - 2, 17, 8, "#7f0f18", "#47080d");
  drawPixelBorder(ctx, px + 5, py + 1, 21, 4, "#9e1220", "#540a11");

  ctx.restore();
}

type Panel = 'wardrobe' | 'shop' | 'inventory' | null;

export default function EtherRoom() {
  const room = ETHERWORLD_ROOM;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const avatarRef = useRef<AvatarState>({
    gridX: room.startTile.x,
    gridY: room.startTile.y,
    renderX: room.startTile.x,
    renderY: room.startTile.y,
    direction: "SE",
    walking: false,
  });

  const pathRef = useRef<Tile[]>([]);
  const hoverRef = useRef<Tile | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 760 });
  const [hoverTile, setHoverTile] = useState<Tile | null>(null);
  const [avatarTile, setAvatarTile] = useState<Tile>(room.startTile);
  const [status, setStatus] = useState("Clique une case libre pour marcher.");
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [outfit, setOutfit] = useState({
    hair: 'hair-short-black',
    shirt: 'shirt-tshirt-white',
    jacket: 'jacket-none',
    pants: 'pants-jeans-blue',
    shoes: 'shoes-sneakers-black',
  });

  const [inventory, setInventory] = useState([
    { id: 'inv-chair-1', type: 'furniture' as const, itemId: 'chair-nebula', quantity: 3 },
    { id: 'inv-rug-1', type: 'furniture' as const, itemId: 'rug-gray-large', quantity: 1 },
    { id: 'inv-desk-1', type: 'furniture' as const, itemId: 'desk-l-modern', quantity: 1 },
    { id: 'inv-plant-1', type: 'furniture' as const, itemId: 'plant-tall-modern', quantity: 2 },
    { id: 'inv-shirt-1', type: 'clothing' as const, itemId: 'shirt-polo-blue', quantity: 1 },
    { id: 'inv-shoes-1', type: 'clothing' as const, itemId: 'shoes-heels-red', quantity: 1 },
  ]);

  const handleOutfitChange = (part: string, value: string) => {
    setOutfit((prev) => ({ ...prev, [part]: value }));
    setStatus(`Updated ${part} to ${value}`);
  };

  const handleBuyItem = (itemId: string, price: number) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.itemId === itemId);
      if (existing) {
        return prev.map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: `inv-${itemId}-${Date.now()}`,
          type: 'furniture' as const,
          itemId,
          quantity: 1,
        },
      ];
    });
    setStatus(`Bought ${itemId} for ${price}$`);
  };

  const handlePlaceFurniture = (itemId: string) => {
    setStatus(`Placing ${itemId}...`);
  };

  const blocked = useMemo(() => buildBlockedSet(room.furnitures), [room.furnitures]);

  const origin = useMemo<Point>(
    () => ({
      x: Math.floor(canvasSize.width / 2),
      y: 158,
    }),
    [canvasSize.width],
  );

  useEffect(() => {
    const updateSize = () => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;

      setCanvasSize({
        width: Math.max(920, Math.floor(rect.width)),
        height: Math.max(620, Math.min(840, Math.floor(window.innerHeight * 0.8))),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvasSize.width * dpr);
    canvas.height = Math.floor(canvasSize.height * dpr);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let last = performance.now();
    let raf = 0;

    const render = (time: number) => {
      const dt = Math.min(0.04, (time - last) / 1000);
      last = time;
      frame += 1;

      const avatar = avatarRef.current;
      const next = pathRef.current[0];

      if (next) {
        const dx = next.x - avatar.renderX;
        const dy = next.y - avatar.renderY;
        const dist = Math.hypot(dx, dy);

        avatar.direction = getDirection(dx, dy);
        avatar.walking = true;

        if (dist <= room.moveSpeed * dt) {
          avatar.renderX = next.x;
          avatar.renderY = next.y;
          avatar.gridX = next.x;
          avatar.gridY = next.y;
          pathRef.current.shift();
          setAvatarTile({ x: next.x, y: next.y });

          if (pathRef.current.length === 0) {
            avatar.walking = false;
            setStatus(`Arrivé sur la case ${next.x}, ${next.y}.`);
          }
        } else {
          avatar.renderX += (dx / dist) * room.moveSpeed * dt;
          avatar.renderY += (dy / dist) * room.moveSpeed * dt;
        }
      } else {
        avatar.walking = false;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      const bg = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
      bg.addColorStop(0, "#352f42");
      bg.addColorStop(0.38, "#1b1922");
      bg.addColorStop(1, "#0d0d13");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      const upperGlow = ctx.createRadialGradient(
        canvasSize.width * 0.52,
        120,
        40,
        canvasSize.width * 0.52,
        120,
        420,
      );
      upperGlow.addColorStop(0, "rgba(255,224,147,0.18)");
      upperGlow.addColorStop(1, "rgba(255,224,147,0)");
      ctx.fillStyle = upperGlow;
      ctx.fillRect(0, 0, canvasSize.width, 340);

      drawWalls(ctx, room, origin);

      const pathKeys = new Set(pathRef.current.map((tile) => `${tile.x}:${tile.y}`));

      for (let depth = 0; depth <= room.width + room.height; depth += 1) {
        for (let x = 0; x < room.width; x += 1) {
          const y = depth - x;
          if (y < 0 || y >= room.height) continue;

          const hovered = hoverRef.current?.x === x && hoverRef.current?.y === y;
          const inPath = pathKeys.has(`${x}:${y}`);
          drawFloorTile(ctx, room, x, y, origin, hovered, inPath);
        }
      }

      const renderables: Array<{
        depth: number;
        type: "furniture" | "avatar";
        item?: RoomFurniture;
      }> = [
        ...room.furnitures.map((item) => ({
          depth: item.x + item.y + item.w + item.d,
          type: "furniture" as const,
          item,
        })),
        {
          depth: avatar.renderX + avatar.renderY + 1.2,
          type: "avatar" as const,
        },
      ].sort((a, b) => a.depth - b.depth);

      for (const entry of renderables) {
        if (entry.type === "furniture" && entry.item) {
          drawFurniture(ctx, room, entry.item, origin);
        } else {
          drawAvatar(ctx, room, avatar, origin, frame);
        }
      }

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(24, canvasSize.height - 66, 360, 42);

      ctx.fillStyle = "#f3f0ff";
      ctx.font = "600 14px system-ui, sans-serif";
      ctx.fillText(`Avatar: ${avatarTile.x}, ${avatarTile.y}`, 38, canvasSize.height - 40);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => cancelAnimationFrame(raf);
  }, [avatarTile.x, avatarTile.y, blocked, canvasSize.height, canvasSize.width, origin, room]);

  const getLocalPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const updateHover = (clientX: number, clientY: number) => {
    const point = getLocalPoint(clientX, clientY);
    if (!point) return;

    const tile = getTileAtPoint(room, point, origin);
    hoverRef.current = tile;
    setHoverTile(tile);
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const point = getLocalPoint(clientX, clientY);
    if (!point) return;

    const tile = getTileAtPoint(room, point, origin);
    if (!tile) return;

    hoverRef.current = tile;
    setHoverTile(tile);

    if (blocked.has(`${tile.x}:${tile.y}`)) {
      setStatus(`Case ${tile.x}, ${tile.y} bloquée.`);
      return;
    }

    const avatar = avatarRef.current;
    const path = findPath(room, { x: avatar.gridX, y: avatar.gridY }, tile, blocked);

    if (path.length === 0 && (tile.x !== avatar.gridX || tile.y !== avatar.gridY)) {
      setStatus(`Aucun chemin vers ${tile.x}, ${tile.y}.`);
      return;
    }

    pathRef.current = path;
    setStatus(`Déplacement vers ${tile.x}, ${tile.y}...`);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #352f42 0%, #191822 42%, #0d0d13 100%)",
        color: "#f8f5ff",
        padding: 18,
      }}
    >
      <section
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          display: "grid",
          gap: 14,
        }}
      >
        <header
          style={{
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.22)",
            padding: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  opacity: 0.72,
                  marginBottom: 6,
                }}
              >
                EtherWorld / Room build 2
              </div>
              <h1 style={{ margin: 0, fontSize: 32 }}>{room.title}</h1>
              <p style={{ margin: "8px 0 0", opacity: 0.78 }}>
                Version améliorée : murs plus crédibles, sol moins plat, meubles plus lisibles, avatar mieux intégré.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                `Room ${room.width}x${room.height}`,
                `Avatar ${avatarTile.x},${avatarTile.y}`,
                hoverTile ? `Hover ${hoverTile.x},${hoverTile.y}` : "Hover —",
                `${room.furnitures.length} meubles`,
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {status}
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 14,
            alignItems: "start",
          }}
        >
          <div
            ref={wrapRef}
            style={{
              position: "relative",
              borderRadius: 28,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              boxShadow: "0 22px 58px rgba(0,0,0,0.26)",
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerMove={(event) => updateHover(event.clientX, event.clientY)}
              onPointerLeave={() => {
                hoverRef.current = null;
                setHoverTile(null);
              }}
              onPointerDown={(event) => handlePointerDown(event.clientX, event.clientY)}
              style={{
                display: "block",
                width: "100%",
                height: canvasSize.height,
                cursor: "pointer",
                touchAction: "none",
              }}
            />
          </div>

          <RoomUIPanel
            outfit={outfit}
            onOutfitChange={handleOutfitChange}
            inventory={inventory}
            onBuyItem={handleBuyItem}
            onPlaceFurniture={handlePlaceFurniture}
            status={status}
          />
        </div>
      </section>
    </main>
  );
}
