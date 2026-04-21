/**
 * Avatar direction system for 8-directional movement
 * Matches Habbo Hotel's 8-direction avatar system
 */

export type AvatarDirection = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const DIRECTIONS = {
  SOUTH: 0,      // ↓ (front)
  SW: 1,         // ↙
  WEST: 2,       // ← (left)
  NW: 3,         // ↖
  NORTH: 4,      // ↑ (back)
  NE: 5,         // ↗
  EAST: 6,       // → (right)
  SE: 7,         // ↘
} as const;

export const DIRECTION_ANGLES: Record<AvatarDirection, number> = {
  [DIRECTIONS.SOUTH]: 0,      // 0°
  [DIRECTIONS.SW]: 45,        // 45°
  [DIRECTIONS.WEST]: 90,      // 90°
  [DIRECTIONS.NW]: 135,       // 135°
  [DIRECTIONS.NORTH]: 180,    // 180°
  [DIRECTIONS.NE]: 225,       // 225°
  [DIRECTIONS.EAST]: 270,     // 270°
  [DIRECTIONS.SE]: 315,       // 315°
};

/**
 * Calculate direction from velocity vector
 * @param vx Velocity X
 * @param vy Velocity Y
 * @returns Direction (0-7)
 */
export function getDirectionFromVelocity(vx: number, vy: number): AvatarDirection {
  if (vx === 0 && vy === 0) return DIRECTIONS.SOUTH;

  const angle = Math.atan2(vy, vx) * (180 / Math.PI);
  const normalizedAngle = (angle + 360 + 90) % 360; // Offset for Habbo coords

  // Map angle to direction (0-7)
  const directionIndex = Math.round(normalizedAngle / 45) % 8;
  return directionIndex as AvatarDirection;
}

/**
 * Get walk frame index based on direction and phase
 * Habbo uses different frame sets for each direction
 *
 * Frame layout:
 * - Frame 0: Standing idle (same for all directions)
 * - Frame 1-4: Walk frames (L->R leg movement)
 */
export function getWalkFrameIndex(direction: AvatarDirection, walkPhase: number): number {
  // Walk phase cycles 0-4 (0=idle, 1-4=walk frames)
  const frameInCycle = Math.floor(walkPhase % 4) + 1; // 1-4
  // Direction contributes to frame selection
  return direction * 5 + frameInCycle;
}

/**
 * Check if two directions are opposite
 */
export function areDirectionsOpposite(dir1: AvatarDirection, dir2: AvatarDirection): boolean {
  return Math.abs(dir1 - dir2) === 4;
}

/**
 * Interpolate smoothly between two directions
 * (Habbo doesn't rotate, but we can use this for visual direction hints)
 */
export function lerpDirection(
  from: AvatarDirection,
  to: AvatarDirection,
  alpha: number
): AvatarDirection {
  // For 8-way direction, we use discrete steps
  return alpha > 0.5 ? to : from;
}
