// OptimizedIsoEngine.ts - Moteur premium EtherWorld
export interface RenderLayer {
  name: 'floor' | 'walls' | 'objects' | 'player' | 'ui' | 'overlay';
  entities: RenderEntity[];
  zOffset: number;
}

export interface RenderEntity {
  id: string;
  type: 'furniture' | 'avatar' | 'tile' | 'wall';
  isoX: number;
  isoY: number;
  isoZ: number;
  sprite: string;
  rotation: number;
  scale: number;
  glow?: boolean; // Bloom néon
  shadow?: boolean;
  selected?: boolean;
  zOffset?: number;
}

export class OptimizedIsoEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private TILE_SIZE = 48; // Optimal mobile
  private VIEW_WIDTH = 16; // Grille 16x16
  private VIEW_HEIGHT = 12;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initHiDPICanvas();
    this.ctx = canvas.getContext('2d')!;
    this.setupGlobalRendering();
  }

  private initHiDPICanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = false; // Pixel perfect
  }

  private setupGlobalRendering() {
    // Ombres globales premium
    this.ctx.shadowColor = 'rgba(0, 34, 68, 0.4)';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowOffsetX = 4;
    this.ctx.shadowOffsetY = 4;
  }

  render(layers: RenderLayer[]) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Layer par layer (ordre critique)
    layers.forEach(layer => this.renderLayer(layer));
    
    // Post-processing bloom
    this.applyBloomEffect();
  }

  private renderLayer(layer: RenderLayer) {
    // Depth sort par Y puis Z
    const sorted = layer.entities.sort((a, b) => {
      const sortA = (a.isoX + a.isoZ) * 100 + (a.zOffset ?? 0);
      const sortB = (b.isoX + b.isoZ) * 100 + (b.zOffset ?? 0);
      return sortA - sortB;
    });

    sorted.forEach(entity => this.renderEntity(entity));
  }

  private renderEntity(entity: RenderEntity) {
    const screen = this.isoToScreen({
      x: entity.isoX,
      y: entity.isoY,
      z: entity.isoZ
    });

    this.ctx.save();
    this.ctx.translate(screen.screenX, screen.screenY);
    this.ctx.rotate((entity.rotation * Math.PI) / 2);
    
    // Glow néon pour objets spéciaux
    if (entity.glow) {
      this.ctx.shadowColor = '#00E0FF';
      this.ctx.shadowBlur = 20;
    }
    
    // Highlight sélection
    if (entity.selected) {
      this.ctx.shadowColor = '#4A3AFF';
      this.ctx.shadowBlur = 16;
      this.drawSelectionGlow(-24, -40, 48, 48);
    }

    // Sprite principal (ancrage bas-centre)
    const img = new Image();
    img.src = `/sprites/furnitures/${entity.sprite}.png`;
    this.ctx.drawImage(img, -24, -40, 48, 48);

    this.ctx.restore();
  }

  private drawSelectionGlow(x: number, y: number, w: number, h: number) {
    const gradient = this.ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, 32);
    gradient.addColorStop(0, 'rgba(74, 58, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(74, 58, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
  }

  private applyBloomEffect() {
    // Composite bloom global
    this.ctx.save();
    this.ctx.filter = 'blur(2px) brightness(1.3)';
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.drawImage(this.canvas, 0, 0);
    this.ctx.restore();
  }

  // Conversion OPTIMISÉE avec offsets centraux
  isoToScreen(iso: {x: number; y: number; z: number}): {screenX: number; screenY: number} {
    const rawX = (iso.x - iso.z) * this.TILE_SIZE * 0.5;
    const rawY = (iso.x + iso.z) * this.TILE_SIZE * 0.25 - iso.y * this.TILE_SIZE * 0.5;
    
    // OFFSET CENTRAL PREMIUM
    const centerX = (this.canvas.width / window.devicePixelRatio) * 0.5;
    const centerY = (this.canvas.height / window.devicePixelRatio) * 0.4;
    
    return {
      screenX: rawX + centerX - this.TILE_SIZE * 4,
      screenY: rawY + centerY - this.TILE_SIZE * 2
    };
  }

  generateFloorGrid(size = 16): RenderEntity[] {
    const tiles: RenderEntity[] = [];
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        tiles.push({
          id: `tile-${x}-${z}`,
          type: 'tile',
          isoX: x,
          isoY: 0,
          isoZ: z,
          sprite: 'tile-diamond',
          rotation: 0,
          scale: 1,
          zOffset: 0
        });
      }
    }
    return tiles;
  }

  generateWalls(): RenderEntity[] {
    return [
      // Mur gauche
      { id: 'wall-left', type: 'wall', isoX: -1, isoY: 0, isoZ: 0, sprite: 'wall-left', rotation: 0, scale: 1.5, zOffset: 100 },
      // Mur droite  
      { id: 'wall-right', type: 'wall', isoX: 17, isoY: 0, isoZ: 0, sprite: 'wall-right', rotation: 0, scale: 1.5, zOffset: 100 },
      // Mur haut
      { id: 'wall-top', type: 'wall', isoX: 8, isoY: 0, isoZ: -1, sprite: 'wall-top', rotation: 0, scale: 2, zOffset: 200 }
    ];
  }
}
