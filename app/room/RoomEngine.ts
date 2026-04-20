import { IsoRenderer } from "@/lib/game/IsoRenderer";
import { loadSprite } from "@/lib/game/SpriteLoader";

type Entity = {
  isoX: number;
  isoY: number;
  sprite: HTMLImageElement;
  offsetY?: number;
};

export class RoomEngine {
  renderer: IsoRenderer;
  entities: Entity[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.renderer = new IsoRenderer(ctx);
  }

  async addEntity(
    x: number,
    y: number,
    spritePath: string,
    offsetY: number = 0
  ) {
    const sprite = await loadSprite(spritePath);

    const entity: Entity = {
      isoX: x,
      isoY: y,
      sprite,
      offsetY,
    };

    this.entities.push(entity);
    this.renderer.add(entity);
  }

  render() {
    this.renderer.render();
  }
}
