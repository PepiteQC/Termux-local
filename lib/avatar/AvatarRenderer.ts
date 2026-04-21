import type { AvatarOutfit } from '@/lib/types/game';
import { CLOTHING_ITEMS } from '@/data/clothing';

export interface AvatarColors {
  skin: string;
  hair: string;
  shirt: string;
  jacket: string;
  pants: string;
  shoes: string;
}

export function getAvatarColors(outfit: Partial<AvatarOutfit>): AvatarColors {
  const hairItem = outfit.hair ? (CLOTHING_ITEMS.hair as Record<string, any>)[outfit.hair] : null;
  const shirtItem = outfit.shirt ? (CLOTHING_ITEMS.shirts as Record<string, any>)[outfit.shirt] : null;
  const jacketItem = outfit.jacket ? (CLOTHING_ITEMS.jackets as Record<string, any>)[outfit.jacket] : null;
  const pantsItem = outfit.pants ? (CLOTHING_ITEMS.pants as Record<string, any>)[outfit.pants] : null;
  const shoesItem = outfit.shoes ? (CLOTHING_ITEMS.shoes as Record<string, any>)[outfit.shoes] : null;

  return {
    skin: '#d6a67a',
    hair: hairItem?.color || '#000000',
    shirt: shirtItem?.color || '#ffffff',
    jacket: jacketItem?.color || 'transparent',
    pants: pantsItem?.color || '#0066cc',
    shoes: shoesItem?.color || '#000000',
  };
}

export function drawAvatarCustom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colors: AvatarColors,
  direction: 'NW' | 'NE' | 'SE' | 'SW',
  walking: boolean,
  frame: number,
  lookShift: number = 0,
  armShift: number = 0,
) {
  const px = Math.round(x - 15);
  const py = Math.round(y - 72);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.24)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 15, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes (base, lowest layer)
  ctx.fillStyle = colors.shoes;
  ctx.fillRect(px + 5, py + 54, 8, 7);
  ctx.fillRect(px + 16, py + 54, 8, 7);

  // Legs / Pants
  ctx.fillStyle = colors.pants;
  ctx.fillRect(px + 6, py + 40, 7, 15);
  ctx.fillRect(px + 16, py + 40, 7, 15);

  // Body / Shirt
  ctx.fillStyle = colors.shirt;
  ctx.fillRect(px + 3, py + 19, 23, 24);

  // Jacket (if any)
  if (colors.jacket !== 'transparent') {
    ctx.fillStyle = colors.jacket;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(px + 3, py + 19, 23, 20);
    ctx.globalAlpha = 1;
  }

  // Arms
  ctx.fillStyle = '#8f1721';
  ctx.fillRect(px + 0, py + 22 + armShift, 6, 14);
  ctx.fillRect(px + 24, py + 22 - armShift, 6, 14);

  // Head (skin)
  ctx.fillStyle = colors.skin;
  ctx.fillRect(px + 9 + lookShift, py + 4, 13, 13);

  // Hair
  ctx.fillStyle = colors.hair;
  ctx.fillRect(px + 8 + lookShift, py + 1, 15, 7);
  ctx.beginPath();
  ctx.arc(px + 15 + lookShift, py + 4, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 12 + lookShift, py + 9, 2, 2);
  ctx.fillRect(px + 18 + lookShift, py + 9, 2, 2);

  // Pupils
  ctx.fillStyle = '#000000';
  ctx.fillRect(px + 12 + lookShift, py + 9, 1, 1);
  ctx.fillRect(px + 18 + lookShift, py + 9, 1, 1);

  ctx.restore();
}

export function drawPixelBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  border = '#000000',
) {
  ctx.fillStyle = border;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 1, Math.max(0, w - 2), Math.max(0, h - 2));
}
