export const isoToScreen = (x: number, y: number) => {
  return {
    screenX: (x - y) * 32,
    screenY: (x + y) * 16,
  };
};

export const screenToIso = (screenX: number, screenY: number) => {
  return {
    x: Math.floor((screenY / 16 + screenX / 32) / 2),
    y: Math.floor((screenY / 16 - screenX / 32) / 2),
  };
};
