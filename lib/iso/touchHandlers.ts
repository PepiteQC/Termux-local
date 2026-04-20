import type { TouchEvent as ReactTouchEvent } from "react";
import type { ScreenPoint } from "../furniture/FurnitureTypes";

export const TOUCH_SLOP = 14;
export const DOUBLE_TAP_DELAY = 220;
export const LONG_PRESS_DELAY = 420;

export function getDistance(left: ScreenPoint, right: ScreenPoint) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export function getTouchPoint(
  event: TouchEvent | ReactTouchEvent,
  rect?: DOMRect
): ScreenPoint {
  const touch = "changedTouches" in event ? event.changedTouches[0] ?? event.touches[0] : null;
  const x = touch?.clientX ?? 0;
  const y = touch?.clientY ?? 0;

  if (!rect) {
    return { x, y };
  }

  return {
    x: x - rect.left,
    y: y - rect.top
  };
}
