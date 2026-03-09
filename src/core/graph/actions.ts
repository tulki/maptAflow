import * as PIXI from "pixi.js";
import type { LinkModel, NodeModel } from "./types";
import { canLink } from "./rules";

export const removeChildFromParent = (child: NodeModel) => {
  if (!child.parent) return;

  const oldParent = child.parent;
  oldParent.children = oldParent.children.filter((n) => n !== child);
  child.parent = null;
};

export const removeExistingLinkToChild = (
  child: NodeModel,
  links: LinkModel[],
  linksLayer: PIXI.Container
) => {
  const index = links.findIndex((l) => l.child === child);
  if (index === -1) return;

  const oldLink = links[index];
  linksLayer.removeChild(oldLink.line);
  oldLink.line.destroy();
  links.splice(index, 1);
};

export const setParent = (
  parent: NodeModel,
  child: NodeModel,
  links: LinkModel[],
  linksLayer: PIXI.Container
) => {
  if (!canLink(parent, child)) return;
  if (child.parent === parent) return;

  removeChildFromParent(child);
  removeExistingLinkToChild(child, links, linksLayer);

  child.parent = parent;
  parent.children.push(child);

  const line = new PIXI.Graphics();
  linksLayer.addChild(line);

  links.push({
    parent,
    child,
    line,
  });
};