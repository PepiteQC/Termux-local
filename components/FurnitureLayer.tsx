"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { FurnitureControls } from "./FurnitureControls";
import { FurniturePreview } from "./FurniturePreview";
import { TouchButton } from "./ui/TouchButton";
import { canPlaceFurniture } from "../lib/furniture/FurnitureCollision";
import { FurnitureEngine } from "../lib/furniture/FurnitureEngine";
import { getFurnitureDefinition, FURNITURE_ORDER } from "../lib/furniture/FurnitureRegistry";
import {
  drawAvatarSprite,
  drawFloorGrid,
  drawFurnitureItem,
  drawFurnitureParticles,
  drawFurniturePreview,
  loadAvatarLayerSprites,
  loadFurnitureSprites,
  sortFurnitureForRender
} from "../lib/furniture/FurnitureRenderer";
import type {
  FurniturePlacement,
  FurniturePreviewState,
  FurnitureRotation,
  FurnitureType
} from "../lib/furniture/FurnitureTypes";
import {
  fetchRoomFurnitures,
  persistFurniture,
  removeFurniture,
  subscribeToRoomFurnitures
} from "../lib/firebase/firestore";
import { OptimizedIsoEngine } from "../lib/iso/OptimizedIsoEngine";
import { isoToScreen, type ProjectionConfig } from "../lib/iso/isoToScreen";
import { buildPathCollisionMap, findPath } from "../lib/iso/pathfinding";
import {
  resolveFurnitureParticleEffect,
  resolveFurnitureVisualState
} from "../lib/furniture/FurnitureVisuals";

type FurnitureLayerProps = {
  roomId: string;
  roomName: string;
  avatarLayers?: string[];
  onAvatarInteract?: () => void;
};

const ROOM_WIDTH = 12;
const ROOM_DEPTH = 12;
const DEFAULT_AVATAR_TILE = { x: 9, y: 0, z: 9 };

export function FurnitureLayer({
  roomId,
  roomName,
  avatarLayers = ["/sprites/avatar/avatar-ether.png"],
  onAvatarInteract
}: FurnitureLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [furnitures, setFurnitures] = useState<FurniturePlacement[]>([]);
  const [selectedType, setSelectedType] = useState<FurnitureType | null>(FURNITURE_ORDER[0] ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverTile, setHoverTile] = useState<{ x: number; z: number } | null>(null);
  const [preview, setPreview] = useState<FurniturePreviewState | null>(null);
  const [buildMode, setBuildMode] = useState(true);
  const [syncState, setSyncState] = useState("idle");
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [avatarImages, setAvatarImages] = useState<Record<string, HTMLImageElement>>({});
  const [avatarTile, setAvatarTile] = useState(DEFAULT_AVATAR_TILE);
  const [avatarPath, setAvatarPath] = useState<Array<{ x: number; z: number }>>([]);
  const [avatarFocus, setAvatarFocus] = useState(false);
  const [renderTick, setRenderTick] = useState(0);
  const [isPending, startTransition] = useTransition();
  const engineRef = useRef<FurnitureEngine | null>(null);

  const projection: ProjectionConfig = useMemo(
    () => ({
      originX: canvasSize.width / 2,
      originY: 170,
      tileWidth: 64,
      tileHeight: 32
    }),
    [canvasSize.width]
  );

  const selectedFurniture = furnitures.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    void loadFurnitureSprites(FURNITURE_ORDER).then(setImages);
  }, []);

  useEffect(() => {
    void loadAvatarLayerSprites(avatarLayers).then(setAvatarImages);
  }, [avatarLayers]);

  useEffect(() => {
    setAvatarTile(DEFAULT_AVATAR_TILE);
    setAvatarPath([]);
    setAvatarFocus(false);
  }, [roomId]);

  useEffect(() => {
    if (!avatarFocus) {
      return;
    }

    const timeout = window.setTimeout(() => setAvatarFocus(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [avatarFocus]);

  useEffect(() => {
    if (avatarPath.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const [next, ...rest] = avatarPath;
      setAvatarTile((current) => ({
        ...current,
        x: next.x,
        z: next.z
      }));
      setAvatarPath(rest);
      setSyncState(rest.length === 0 ? "arrived" : "walking");
    }, 110);

    return () => window.clearTimeout(timeout);
  }, [avatarPath]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRenderTick((current) => (current + 1) % 10_000);
    }, 120);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setCanvasSize({
        width: Math.floor(rect.width),
        height: Math.max(560, Math.min(window.innerHeight * 0.65, 780))
      });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
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

    const isoEngine = new OptimizedIsoEngine(canvas, projection.tileWidth ?? 64);
    engineRef.current = new FurnitureEngine(isoEngine, {
      roomWidth: ROOM_WIDTH,
      roomDepth: ROOM_DEPTH
    });
    engineRef.current.setSelectedType(selectedType);
  }, [canvasSize.height, canvasSize.width, projection.tileWidth, selectedType]);

  useEffect(() => {
    setSyncState("loading");

    const unsubscribe = subscribeToRoomFurnitures(
      roomId,
      (next) => {
        setFurnitures(next);
        setSyncState("live");
      },
      async () => {
        try {
          const fallback = await fetchRoomFurnitures(roomId);
          setFurnitures(fallback);
          setSyncState("fallback");
        } catch {
          setSyncState("offline");
        }
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const background = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
    background.addColorStop(0, "#121521");
    background.addColorStop(0.5, "#0d1118");
    background.addColorStop(1, "#06080d");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    drawFloorGrid(ctx, projection, ROOM_WIDTH, ROOM_DEPTH, hoverTile);
    drawFurniturePreview(ctx, preview, projection);

    sortFurnitureForRender(furnitures).forEach((item) => {
      const visualState = resolveFurnitureVisualState(item, {
        selectedId,
        hoveredId,
        tick: renderTick
      });
      drawFurnitureItem(ctx, item, projection, images, { id: selectedId, hoveredId }, {
        visualState,
        tick: renderTick
      });
      drawFurnitureParticles(
        ctx,
        item,
        projection,
        resolveFurnitureParticleEffect(item),
        renderTick
      );
    });

    drawAvatarSprite(ctx, projection, avatarTile, avatarLayers, avatarImages, avatarFocus);
  }, [
    avatarFocus,
    avatarImages,
    avatarLayers,
    avatarTile,
    canvasSize.height,
    canvasSize.width,
    furnitures,
    hoveredId,
    hoverTile,
    images,
    preview,
    projection,
    renderTick,
    selectedId
  ]);

  useEffect(() => {
    const current = engineRef.current;
    if (!current) {
      return;
    }

    current.setSelectedType(selectedType);
    current.setSelection({ id: selectedId, hoveredId });

    if (hoverTile && buildMode) {
      setPreview(current.buildPreview({ x: hoverTile.x, y: 0, z: hoverTile.z }, furnitures));
    } else {
      setPreview(null);
    }
  }, [buildMode, furnitures, hoveredId, hoverTile, selectedId, selectedType]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && selectedId) {
        void handleDelete(selectedId);
      }

      if (event.key.toLowerCase() === "r") {
        if (selectedFurniture) {
          void handleRotateSelected();
        } else if (selectedType) {
          handleRotatePreview();
        }
      }

      if (event.key === "ArrowUp") {
        handleStepMove(0, -1);
      }

      if (event.key === "ArrowDown") {
        handleStepMove(0, 1);
      }

      if (event.key === "ArrowLeft") {
        handleStepMove(-1, 0);
      }

      if (event.key === "ArrowRight") {
        handleStepMove(1, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFurniture, selectedId, selectedType, furnitures, avatarTile, avatarPath]);

  const isAvatarHit = (localX: number, localY: number) => {
    const anchor = isoToScreen(avatarTile.x + 0.5, avatarTile.y, avatarTile.z + 0.5, projection);
    const drawWidth = 84;
    const drawHeight = 112;
    const left = anchor.x - drawWidth / 2;
    const top = anchor.y - drawHeight + 6;
    return localX >= left && localX <= left + drawWidth && localY >= top && localY <= top + drawHeight;
  };

  const refreshPreviewAt = (localX: number, localY: number) => {
    const current = engineRef.current;
    if (!current) {
      return;
    }

    const tile = current.screenToTile({ x: localX, y: localY });
    setHoverTile({ x: tile.x, z: tile.z });

    const picked = current.pickFurnitureAtPoint({ x: localX, y: localY }, furnitures, projection);
    setHoveredId(picked?.id ?? null);

    if (buildMode) {
      setPreview(current.buildPreview(tile, furnitures));
    }
  };

  const moveAvatarToTile = (targetX: number, targetZ: number) => {
    const collisionMap = buildPathCollisionMap(furnitures);
    if (!collisionMap.isWalkable(targetX, targetZ)) {
      setSyncState("tile-blocked");
      return;
    }

    const start = avatarPath.length > 0 ? avatarPath[avatarPath.length - 1] : { x: avatarTile.x, z: avatarTile.z };
    const path = findPath(
      { x: start.x, y: start.z },
      { x: targetX, y: targetZ },
      collisionMap
    );

    if (path.length === 0) {
      if (targetX === avatarTile.x && targetZ === avatarTile.z) {
        setAvatarFocus(true);
      } else {
        setSyncState("no-path");
      }
      return;
    }

    setSelectedId(null);
    setBuildMode(false);
    setAvatarPath(path.map((step) => ({ x: step.x, z: step.y })));
    setSyncState("walking");
  };

  const handleCanvasActivate = async (localX: number, localY: number) => {
    const current = engineRef.current;
    if (!current) {
      return;
    }

    const point = { x: localX, y: localY };

    if (isAvatarHit(localX, localY)) {
      setAvatarFocus(true);
      setBuildMode(false);
      setSelectedId(null);
      onAvatarInteract?.();
      return;
    }

    const picked = current.pickFurnitureAtPoint(point, furnitures, projection);
    if (picked) {
      setSelectedId(picked.id);
      setBuildMode(false);
      return;
    }

    const tile = current.screenToTile(point);

    if (!buildMode || !selectedType) {
      moveAvatarToTile(tile.x, tile.z);
      return;
    }

    const placement = current.createPlacement(crypto.randomUUID(), tile);
    if (!placement) {
      return;
    }

    const validation = canPlaceFurniture(placement, furnitures, ROOM_WIDTH, ROOM_DEPTH);
    if (!validation.valid) {
      setPreview({
        type: placement.type,
        tile,
        rotation: placement.rotation,
        valid: false,
        reason: validation.reason
      });
      return;
    }

    startTransition(() => {
      void persistFurniture({ roomId, furniture: placement })
        .then((saved) => {
          setSelectedId(saved.id);
          setSyncState("saved");
        })
        .catch(() => setSyncState("error"));
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(() => {
      void removeFurniture(roomId, id)
        .then(() => {
          setSelectedId(null);
          setSyncState("deleted");
        })
        .catch(() => setSyncState("error"));
    });
  };

  const handleRotateSelected = async () => {
    if (!selectedFurniture) {
      return;
    }

    const rotated: FurniturePlacement = {
      ...selectedFurniture,
      rotation: ((selectedFurniture.rotation + 1) % 4) as FurnitureRotation,
      updatedAt: new Date().toISOString()
    };
    const validation = canPlaceFurniture(
      rotated,
      furnitures,
      ROOM_WIDTH,
      ROOM_DEPTH,
      selectedFurniture.id
    );

    if (!validation.valid) {
      setSyncState(validation.reason ?? "blocked");
      return;
    }

    startTransition(() => {
      void persistFurniture({ roomId, furniture: rotated })
        .then(() => setSyncState("rotated"))
        .catch(() => setSyncState("error"));
    });
  };

  const handleRotatePreview = () => {
    const current = engineRef.current;
    if (!current) {
      return;
    }

    current.rotateClockwise();
    if (hoverTile) {
      setPreview(current.buildPreview({ x: hoverTile.x, y: 0, z: hoverTile.z }, furnitures));
    }
  };

  const handleStepMove = (dx: number, dz: number) => {
    const base = avatarPath.length > 0 ? avatarPath[avatarPath.length - 1] : { x: avatarTile.x, z: avatarTile.z };
    moveAvatarToTile(base.x + dx, base.z + dz);
  };

  return (
    <>
      <section className="mobile-room furniture-room">
        <canvas
          ref={canvasRef}
          className="furniture-canvas"
          onContextMenu={(event) => {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;
            const current = engineRef.current;
            if (!current) {
              return;
            }

            const picked = current.pickFurnitureAtPoint({ x: localX, y: localY }, furnitures, projection);
            const id = picked?.id ?? selectedId;
            if (id) {
              void handleDelete(id);
            }
          }}
          onPointerDown={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;
            pointerStartRef.current = { x: localX, y: localY };
            refreshPreviewAt(localX, localY);
          }}
          onPointerLeave={() => {
            setHoverTile(null);
            setHoveredId(null);
            setPreview(null);
            pointerStartRef.current = null;
          }}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            refreshPreviewAt(event.clientX - rect.left, event.clientY - rect.top);
          }}
          onPointerUp={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;
            const start = pointerStartRef.current;
            pointerStartRef.current = null;

            if (!start) {
              return;
            }

            const moved = Math.hypot(localX - start.x, localY - start.y);
            if (moved <= 12) {
              void handleCanvasActivate(localX, localY);
            }
          }}
        />

        <div className="furniture-overlay">
          <span className="badge mono">{roomName}</span>
          <div className="stat-pill">
            Hover {hoverTile ? `${hoverTile.x},${hoverTile.z}` : "none"}
          </div>
          <div className="stat-pill">
            Avatar {avatarTile.x},{avatarTile.z}
          </div>
          <div className="stat-pill">
            Selection {selectedFurniture ? getFurnitureDefinition(selectedFurniture.type).label : "none"}
          </div>
          <TouchButton
            onClick={() => setBuildMode((current) => !current)}
            variant={buildMode ? "primary" : "secondary"}
          >
            {buildMode ? "Build ON" : "Walk ON"}
          </TouchButton>
          <TouchButton
            onClick={() => {
              setAvatarFocus(true);
              setBuildMode(false);
              onAvatarInteract?.();
            }}
            variant="secondary"
          >
            Looks
          </TouchButton>
        </div>

        <div className="avatar-dpad glass-panel">
          <div className="avatar-dpad-grid">
            <div />
            <TouchButton onClick={() => handleStepMove(0, -1)} variant="secondary">
              ↑
            </TouchButton>
            <div />
            <TouchButton onClick={() => handleStepMove(-1, 0)} variant="secondary">
              ←
            </TouchButton>
            <TouchButton
              onClick={() => {
                setBuildMode(false);
                setAvatarFocus(true);
              }}
              variant="primary"
            >
              ●
            </TouchButton>
            <TouchButton onClick={() => handleStepMove(1, 0)} variant="secondary">
              →
            </TouchButton>
            <div />
            <TouchButton onClick={() => handleStepMove(0, 1)} variant="secondary">
              ↓
            </TouchButton>
            <div />
          </div>
        </div>
      </section>

      <FurnitureControls
        buildMode={buildMode}
        selectedFurniture={selectedFurniture}
        selectedType={selectedType}
        syncState={isPending ? "syncing" : syncState}
        onDeleteSelected={() => selectedId && void handleDelete(selectedId)}
        onRotatePreview={handleRotatePreview}
        onRotateSelected={() => void handleRotateSelected()}
        onSelectType={(type) => {
          setSelectedType(type);
          setBuildMode(Boolean(type));
          setSelectedId(null);
        }}
        onToggleBuildMode={() => setBuildMode((current) => !current)}
      />

      <FurniturePreview preview={preview} />
    </>
  );
}
