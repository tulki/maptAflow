import * as PIXI from "pixi.js";
import { NODE_RADIUS } from "../constants";

type PositionLike = {
  x: number;
  y: number;
};

export const createNodeView = (nodesLayer: PIXI.Container): PIXI.Graphics => {
  const g = new PIXI.Graphics();

  g.circle(0, 0, NODE_RADIUS);
  g.fill({ color: 0xffffff });
  g.eventMode = "dynamic";
  g.cursor = "pointer";

  nodesLayer.addChild(g);

  return g;
};

export const syncNodeView = (
  view: PIXI.Graphics,
  position: PositionLike
): void => {
  view.x = position.x;
  view.y = position.y;
};