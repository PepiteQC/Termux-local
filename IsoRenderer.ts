export type Entity = {
  sprite: string;
};

export class IsoRendererEffects {
  drawWithEffects(
    ctx: CanvasRenderingContext2D,
    sprite: HTMLImageElement,
    x: number,
    y: number,
    entity: Entity
  ) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 22;
    ctx.drawImage(sprite, x + 4, y + 8);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (this.isNeonObject(entity.sprite)) {
      ctx.shadowColor = "#00f7ff";
      ctx.shadowBlur = 35;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.75;
      ctx.drawImage(sprite, x, y);
      ctx.shadowBlur = 20;
      ctx.drawImage(sprite, x, y);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }

    ctx.drawImage(sprite, x, y);
  }

  isNeonObject(sprite: string) {
    return ["lamp-halo", "neon-crown", "crystal-ether", "chair-nebula", "table-prism"].some((name) =>
      sprite.includes(name)
    );
  }
}
