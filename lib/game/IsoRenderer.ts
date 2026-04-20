import { isoToScreen } from "./IsoMath";
import { depthSort } from "./DepthSort";

export class IsoRenderer {
  ctx: CanvasRenderingContext2D;
  entities: any[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  add(entity: any) {
    this.entities.push(entity);
  }

  render() {
    this.ctx.clearRect(0, 0, 2000, 2000);

    const sorted = depthSort(this.entities);

    sorted.forEach((e) => {
      const { screenX, screenY } = isoToScreen(e.isoX, e.isoY);
      this.ctx.drawImage(e.sprite, screenX, screenY - (e.offsetY || 0));
    });
  }
}
