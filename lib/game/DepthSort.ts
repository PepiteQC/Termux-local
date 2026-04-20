export const depthSort = (entities: any[]) => {
  return entities.sort((a, b) => {
    const da = a.isoY + a.isoX;
    const db = b.isoY + b.isoX;
    return da - db;
  });
};
