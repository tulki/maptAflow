import type { NodeModel } from "./types";

type PointLike = {
  x: number;
  y: number;
};

export const distance = (a: PointLike, b: PointLike): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const canLink = (parent: NodeModel, child: NodeModel): boolean => {
  if (parent === child) {
    return false;
  }

  let current: NodeModel | null = parent;

  while (current) {
    if (current === child) {
      return false;
    }

    current = current.parent;
  }

  return true;
};