/**
 * Walk animation manager for Habbo-style avatar animations
 */

export interface WalkAnimationState {
  isWalking: boolean;
  direction: number; // 0-7
  framePhase: number; // 0-1 (progress through animation)
  speed: number; // pixels per second
}

export class WalkAnimationManager {
  private state: WalkAnimationState = {
    isWalking: false,
    direction: 0,
    framePhase: 0,
    speed: 120, // pixels per second
  };

  private lastUpdateTime = Date.now();

  /**
   * Update animation state based on movement
   */
  update(
    isMoving: boolean,
    direction: number,
    deltaTime: number
  ): WalkAnimationState {
    this.state.direction = direction;
    this.state.isWalking = isMoving;

    if (isMoving) {
      // Advance animation phase (0-1, cycling)
      this.state.framePhase = (this.state.framePhase + (deltaTime / 1000) * 8) % 1;
    } else {
      // Reset to idle
      this.state.framePhase = 0;
    }

    return this.state;
  }

  /**
   * Get current walk frame (0-39 for 8 directions × 5 frames)
   * Frame 0: Idle
   * Frames 1-4: Walk cycle
   */
  getFrameIndex(): number {
    if (!this.state.isWalking) return 0;

    const walkFrame = Math.floor(this.state.framePhase * 4) + 1; // 1-4
    return this.state.direction * 5 + walkFrame;
  }

  /**
   * Get scale factor for flipping based on direction
   * Habbo uses simple horizontal flip for some directions
   */
  getScaleX(direction: number): number {
    // Directions 1,2,3 (left side) are flipped
    return [0, -1, -1, -1, 0, 1, 1, 1][direction] ?? 1;
  }

  /**
   * Get bob animation offset (vertical bobbing while walking)
   */
  getBobOffset(isWalking: boolean, framePhase: number): number {
    if (!isWalking) return 0;

    // Simple sine wave bob: -2 to +2 pixels
    return Math.sin(framePhase * Math.PI * 2) * 2;
  }

  getState(): WalkAnimationState {
    return this.state;
  }
}
