"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { drawIsoAvatar, getAvatarSpritePath } from "@/components/iso/IsoAvatar";
import { drawIsoFurniture, getFurnitureSpritePath } from "@/components/iso/IsoFurniture";
import { drawIsoTile } from "@/components/iso/IsoTile";
import { drawIsoWalls } from "@/components/iso/IsoWall";
import { getFurnitureHitPolygon, pointInPolygon } from "@/lib/iso/collision";
import { getIsoDepth } from "@/lib/iso/isoToScreen";
import type { ProjectionConfig } from "@/lib/iso/isoToScreen";
import { clampTilePoint, screenToIso } from "@/lib/iso/screenToIso";
import {
  DOUBLE_TAP_DELAY,
  LONG_PRESS_DELAY,
  TOUCH_SLOP,
  getDistance,
  getTouchPoint
} from "@/lib/iso/touchHandlers";
import {
  ROOM_SIZE,
  type AvatarRecord,
  type DragState,
  type FurnitureRecord,
  type RoomRecord,
  type ScreenPoint
} from "@/lib/iso/types";

type IsoRendererProps = {
  room: RoomRecord;
  avatar: AvatarRecord;
  furnitures: FurnitureRecord[];
  selectedFurnitureId: string | null;
  dragState: DragState;
  onTileTap: (tile: { x: number; y: number }) => void;
  onTileDoubleTap: (tile: { x: number; y: number }) => void;
  onFurnitureTap: (id: string) => void;
  onFurnitureLongPress: (id: string) => void;
  onHoverTileChange: (tile: { x: number; y: number } | null) => void;
  onCanvasMetrics: (metrics: {
    rect: DOMRect;
    originX: number;
    originY: number;
    width: number;
    height: number;
  }) => void;
};

export function IsoRenderer({
  room,
  avatar,
  furnitures,
  selectedFurnitureId,
  dragState,
  onTileTap,
  onTileDoubleTap,
  onFurnitureTap,
  onFurnitureLongPress,
  onHoverTileChange,
  onCanvasMetrics
}: IsoRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<ScreenPoint | null>(null);
  const lastTapRef = useRef<{ target: string; at: number } | null>(null);
  const longPressRef = useRef<number | null>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const sortedFurnitures = useMemo(
    () =>
      [...furnitures].sort(
        (left, right) => getIsoDepth(left.x, left.y, left.z) - getIsoDepth(right.x, right.y, right.z)
      ),
    [furnitures]
  );

  const projection: ProjectionConfig = useMemo(
    () => ({
      originX: canvasSize.width / 2,
      originY: 188
    }),
    [canvasSize.width]
  );

  useEffect(() => {
    const nextImages: Record<string, HTMLImageElement> = {};
    const spritePaths = [
      getAvatarSpritePath(),
      ...sortedFurnitures.map((item) => getFurnitureSpritePath(item.type))
    ];
    const uniquePaths = Array.from(new Set(spritePaths));
    let cancelled = false;

    Promise.all(
      uniquePaths.map(
        (spritePath) =>
          new Promise<void>((resolve) => {
            const image = new Image();
            image.src = spritePath;
            image.onload = () => {
              nextImages[spritePath] = image;
              resolve();
            };
            image.onerror = () => resolve();
          })
      )
    ).then(() => {
      if (!cancelled) {
        setImages(nextImages);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sortedFurnitures]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const updateSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setCanvasSize({
        width: rect.width,
        height: Math.max(560, Math.min(window.innerHeight * 0.62, 760))
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvasSize.width * dpr);
    canvas.height = Math.floor(canvasSize.height * dpr);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const background = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
    background.addColorStop(0, "#C8B896");
    background.addColorStop(0.45, "#A09070");
    background.addColorStop(1, "#8B7D6B");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    drawIsoWalls(ctx, projection, canvasSize.width);

    for (let y = 0; y < ROOM_SIZE; y += 1) {
      for (let x = 0; x < ROOM_SIZE; x += 1) {
        const hoveredTile = dragState ? clampTilePoint(screenToIso(dragState.pointer, projection)) : null;
        drawIsoTile(ctx, x, y, projection, hoveredTile?.x === x && hoveredTile?.y === y);
      }
    }

    sortedFurnitures.forEach((item) => {
      drawIsoFurniture(
        ctx,
        item,
        projection,
        images[getFurnitureSpritePath(item.type)],
        selectedFurnitureId === item.id
      );
    });

    drawIsoAvatar(ctx, avatar, projection, images[getAvatarSpritePath()]);

    if (dragState) {
      const sprite = images[getFurnitureSpritePath(dragState.item)];
      if (sprite) {
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, dragState.pointer.x - 36, dragState.pointer.y - 68, 72, 72);
        ctx.restore();
      }
    }

    const rect = canvas.getBoundingClientRect();
    onCanvasMetrics({
      rect,
      originX: projection.originX,
      originY: projection.originY,
      width: canvasSize.width,
      height: canvasSize.height
    });
  }, [
    avatar,
    canvasSize.height,
    canvasSize.width,
    dragState,
    images,
    onCanvasMetrics,
    projection,
    room.settings.ambience,
    selectedFurnitureId,
    sortedFurnitures
  ]);

  const pickFurniture = (point: ScreenPoint) =>
    [...sortedFurnitures]
      .reverse()
      .find((item) => pointInPolygon(point, getFurnitureHitPolygon(item, projection))) ?? null;

  const clearLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onTouchEnd={(event) => {
        clearLongPress();
        const rect = event.currentTarget.getBoundingClientRect();
        const point = getTouchPoint(event, rect);

        if (!touchStartRef.current || getDistance(touchStartRef.current, point) > TOUCH_SLOP) {
          touchStartRef.current = null;
          return;
        }

        const furniture = pickFurniture(point);
        if (furniture) {
          onFurnitureTap(furniture.id);
          touchStartRef.current = null;
          return;
        }

        const tile = clampTilePoint(screenToIso(point, projection));
        const signature = `tile:${tile.x}:${tile.y}`;
        const now = Date.now();

        if (lastTapRef.current && lastTapRef.current.target === signature && now - lastTapRef.current.at < DOUBLE_TAP_DELAY) {
          onTileDoubleTap(tile);
          lastTapRef.current = null;
        } else {
          onTileTap(tile);
          lastTapRef.current = { target: signature, at: now };
        }

        touchStartRef.current = null;
      }}
      onTouchMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const point = getTouchPoint(event, rect);

        if (dragState) {
          onHoverTileChange(clampTilePoint(screenToIso(point, projection)));
          return;
        }

        if (touchStartRef.current && getDistance(touchStartRef.current, point) > TOUCH_SLOP) {
          clearLongPress();
        }
      }}
      onTouchStart={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const point = getTouchPoint(event, rect);
        touchStartRef.current = point;
        const furniture = pickFurniture(point);

        if (furniture) {
          longPressRef.current = window.setTimeout(() => {
            onFurnitureLongPress(furniture.id);
          }, LONG_PRESS_DELAY);
        }
      }}
      style={{
        display: "block",
        width: "100%",
        borderRadius: 28,
        background: "linear-gradient(180deg, #111524, #090b12)",
        touchAction: "none"
      }}
    />
  );
}
