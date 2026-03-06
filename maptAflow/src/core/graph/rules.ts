import type { NodeModel } from "./types";

export const distance = (a: NodeModel, b: NodeModel) => {
  const dx = a.view.x - b.view.x;
  const dy = a.view.y - b.view.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const canLink = (parent: NodeModel, child: NodeModel) => {
  if (parent === child) return false;

  let current: NodeModel | null = parent;
  while (current) {
    if (current === child) return false;
    current = current.parent;
  }

  return true;
};