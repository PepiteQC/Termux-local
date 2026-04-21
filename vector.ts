export interface Vector {
  x: number;
  y: number;
  z: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export const vec2 = (x = 0, y = 0): Vector2D => ({ x, y });

export const vec3 = (x = 0, y = 0, z = 0): Vector => ({ x, y, z });

export const add2 = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const sub2 = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const add3 = (a: Vector, b: Vector): Vector => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

export const sub3 = (a: Vector, b: Vector): Vector => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});

export const equals2 = (a: Vector2D, b: Vector2D): boolean =>
  a.x === b.x && a.y === b.y;

export const equals3 = (a: Vector, b: Vector): boolean =>
  a.x === b.x && a.y === b.y && a.z === b.z;

export const length2 = (v: Vector2D): number =>
  Math.sqrt(v.x * v.x + v.y * v.y);

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const lerp = (from: number, to: number, alpha: number): number =>
  from + (to - from) * alpha;

export const lerp2 = (from: Vector2D, to: Vector2D, alpha: number): Vector2D => ({
  x: lerp(from.x, to.x, alpha),
  y: lerp(from.y, to.y, alpha),
});

export const vectorKey2 = (v: Vector2D): string => `${v.x}:${v.y}`;

export const vectorKey3 = (v: Vector): string => `${v.x}:${v.y}:${v.z}`;
