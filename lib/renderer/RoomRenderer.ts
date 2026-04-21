import * as PIXI from 'pixi.js';
import { isoEngine } from '@/lib/engine/IsometricEngine';
import type { RoomState, FurnitureItem, Avatar, Point } from '@/lib/types/game';
import { FURNITURE_REGISTRY } from '@/lib/furniture/FurnitureRegistry';

export class RoomRenderer {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private tileGraphics: Map<string, PIXI.Graphics>;
  private furnitureSprites: Map<string, PIXI.Sprite | PIXI.Graphics>;
  private avatarSprites: Map<string, PIXI.Container>;
  private hoveredTile: { x: number; y: number } | null = null;
  private textureCache: Map<string, PIXI.Texture>;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    this.tileGraphics = new Map();
    this.furnitureSprites = new Map();
    this.avatarSprites = new Map();
    this.textureCache = new Map();
    this.app.stage.addChild(this.container);
  }

  async renderRoom(room: RoomState) {
    this.clearRoom();

    // Floor and grid
    this.renderFloor(room);

    // Furniture sorted by depth
    const sortedFurniture = [...room.furniture].sort(
      (a, b) =>
        isoEngine.calculateDepth(a.x, a.y, a.z) - isoEngine.calculateDepth(b.x, b.y, b.z)
    );

    for (const item of sortedFurniture) {
      await this.renderFurniture(item);
    }

    // Avatars sorted by depth
    const sortedAvatars = [...room.avatars].sort(
      (a, b) =>
        isoEngine.calculateDepth(a.x, a.y, a.z) - isoEngine.calculateDepth(b.x, b.y, b.z)
    );

    for (const avatar of sortedAvatars) {
      await this.renderAvatar(avatar);
    }

    // Hover tile
    if (this.hoveredTile && room.width > this.hoveredTile.x && room.height > this.hoveredTile.y) {
      this.renderHoverTile(this.hoveredTile.x, this.hoveredTile.y);
    }
  }

  private renderFloor(room: RoomState) {
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const corners = isoEngine.getTileCorners(x, y);
        const poly = new PIXI.Graphics();

        poly.fill({ color: parseInt(room.floorColor.replace('#', ''), 16), alpha: 0.95 });
        poly.moveTo(corners.nw.x, corners.nw.y);
        poly.lineTo(corners.ne.x, corners.ne.y);
        poly.lineTo(corners.se.x, corners.se.y);
        poly.lineTo(corners.sw.x, corners.sw.y);
        poly.closePath();

        poly.stroke({ color: 0x666666, width: 1, alpha: 0.3 });

        poly.zIndex = isoEngine.calculateDepth(x, y, 0);
        this.container.addChild(poly);
      }
    }
  }

  private renderHoverTile(x: number, y: number) {
    const corners = isoEngine.getTileCorners(x, y);
    const hover = new PIXI.Graphics();

    hover.fill({ color: 0x00ff00, alpha: 0.2 });
    hover.moveTo(corners.nw.x, corners.nw.y);
    hover.lineTo(corners.ne.x, corners.ne.y);
    hover.lineTo(corners.se.x, corners.se.y);
    hover.lineTo(corners.sw.x, corners.sw.y);
    hover.closePath();

    hover.zIndex = 9999999;
    this.container.addChild(hover);
  }

  async renderFurniture(item: FurnitureItem) {
    const def = FURNITURE_REGISTRY[item.type];
    if (!def) return;

    const pos = isoEngine.worldToScreen(item.x, item.y, item.z);

    try {
      const textureKey = `${item.type}`;
      let texture = this.textureCache.get(textureKey);

      if (!texture) {
        const loadedTexture = await PIXI.Assets.load(def.storagePath);
        if (!(loadedTexture instanceof PIXI.Texture)) {
          throw new Error(`Invalid furniture texture for ${def.storagePath}`);
        }
        texture = loadedTexture;
        this.textureCache.set(textureKey, texture);
      }

      const sprite = new PIXI.Sprite(texture);
      sprite.x = pos.x + def.offsetX;
      sprite.y = pos.y + def.offsetY;
      sprite.zIndex = isoEngine.calculateDepth(item.x, item.y, item.z + (def.height || 0));

      sprite.interactive = true;
      sprite.on('pointerdown', (e) => {
        e.stopPropagation();
      });

      this.furnitureSprites.set(item.id, sprite);
      this.container.addChild(sprite);
    } catch (err) {
      console.warn(`Failed to load furniture texture: ${def.storagePath}`, err);
      this.createFurniturePlaceholder(item, pos);
    }
  }

  private createFurniturePlaceholder(item: FurnitureItem, pos: Point) {
    const def = FURNITURE_REGISTRY[item.type];
    const rect = new PIXI.Graphics();
    rect.fill({ color: 0x666666, alpha: 0.6 });
    rect.rect(0, 0, def.drawWidth || 64, def.drawHeight || 64);
    rect.zIndex = isoEngine.calculateDepth(item.x, item.y, item.z);

    rect.x = pos.x;
    rect.y = pos.y;
    rect.interactive = true;
    rect.on('pointerdown', (e) => e.stopPropagation());

    this.furnitureSprites.set(item.id, rect);
    this.container.addChild(rect);
  }

  async renderAvatar(avatar: Avatar) {
    const pos = isoEngine.worldToScreen(avatar.x, avatar.y, avatar.z);
    const container = new PIXI.Container();
    container.x = pos.x;
    container.y = pos.y;

    const bodyColor = 0xffcc99;
    const body = new PIXI.Graphics();
    body.fill({ color: bodyColor });
    body.ellipse(0, 0, 16, 20);
    body.zIndex = 0;
    container.addChild(body);

    const headColor = 0xffcc99;
    const head = new PIXI.Graphics();
    head.fill({ color: headColor });
    head.circle(0, -18, 10);
    head.zIndex = 1;
    container.addChild(head);

    const legColor = 0x3333cc;
    const legs = new PIXI.Graphics();
    legs.fill({ color: legColor });
    legs.rect(-6, 18, 12, 14);
    legs.zIndex = -1;
    container.addChild(legs);

    container.zIndex = isoEngine.calculateDepth(avatar.x, avatar.y, avatar.z) + 100;
    this.avatarSprites.set(avatar.id, container);
    this.container.addChild(container);
  }

  updateHoveredTile(tile: { x: number; y: number } | null) {
    this.hoveredTile = tile;
  }

  private clearRoom() {
    this.container.removeChildren();
    this.tileGraphics.clear();
    this.furnitureSprites.clear();
    this.avatarSprites.clear();
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  cleanup() {
    this.clearRoom();
    this.container.destroy();
    this.textureCache.clear();
  }
}
