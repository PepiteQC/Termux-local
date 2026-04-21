import type { FurniturePlacement } from "./FurnitureTypes";

export type FurnitureVisualState = "idle" | "active" | "open" | "use";
export type FurnitureParticleEffect =
  | "dream-motes"
  | "warm-glow"
  | "ether-sparkles"
  | "neon-pulse"
  | "kush-smoke"
  | null;

export function resolveFurnitureVisualState(
  furniture: FurniturePlacement,
  options: {
    selectedId: string | null;
    hoveredId: string | null;
    tick: number;
  }
): FurnitureVisualState {
  if (options.selectedId === furniture.id) {
    return options.tick % 2 === 0 ? "use" : "open";
  }

  if (options.hoveredId === furniture.id) {
    return "active";
  }

  if (
    furniture.type === "lamp-halo" ||
    furniture.type === "crystal-ether" ||
    furniture.type === "neon-crown" ||
    furniture.type === "neon-sign-green" ||
    furniture.type === "neon-leaf" ||
    furniture.type === "cash-register"
  ) {
    return "active";
  }

  return "idle";
}

export function resolveFurnitureParticleEffect(
  furniture: FurniturePlacement
): FurnitureParticleEffect {
  if (furniture.type === "bed-obsidian") {
    return "dream-motes";
  }

  if (furniture.type === "lamp-halo") {
    return "warm-glow";
  }

  if (furniture.type === "crystal-ether") {
    return "ether-sparkles";
  }

  if (furniture.type === "neon-crown") {
    return "neon-pulse";
  }

  if (
    furniture.type === "neon-sign-green" ||
    furniture.type === "neon-leaf" ||
    furniture.type === "cash-register"
  ) {
    return "neon-pulse";
  }

  if (
    furniture.type === "dab-station" ||
    furniture.type === "cannabis-jar-diamond" ||
    furniture.type === "cannabis-jar-live-resin" ||
    furniture.type === "weed-plant-tall"
  ) {
    return "kush-smoke";
  }

  return null;
}
