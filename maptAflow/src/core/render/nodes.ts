import * as PIXI from "pixi.js";
import { NODE_RADIUS } from "../constants";
import type { NodeModel } from "../graph/types";

export const createNode = (
  x: number,
  y: number,
  nodes: NodeModel[],
  nodesLayer: PIXI.Container
) => {
  const g = new PIXI.Graphics();

  g.circle(0, 0, NODE_RADIUS);
  g.fill({ color: 0xffffff });

  g.x = x;
  g.y = y;
  g.eventMode = "dynamic";
  g.cursor = "pointer";

  nodesLayer.addChild(g);

  const node: NodeModel = {
    view: g,
    parent: null,
    children: [],
  };

  nodes.push(node);
  return node;
};