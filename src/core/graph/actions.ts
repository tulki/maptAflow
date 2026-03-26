import { canLink } from "./rules";
import type { NodeModel } from "./types";

export const removeChildFromParent = (child: NodeModel): boolean => {
  if (!child.parent) {
    return false;
  }

  const oldParent = child.parent;
  oldParent.children = oldParent.children.filter((node) => node !== child);
  child.parent = null;

  return true;
};

export const setParent = (parent: NodeModel, child: NodeModel): boolean => {
  if (!canLink(parent, child)) {
    return false;
  }

  if (child.parent === parent) {
    return false;
  }

  removeChildFromParent(child);

  child.parent = parent;
  parent.children.push(child);

  return true;
};