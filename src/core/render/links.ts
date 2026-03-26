import * as PIXI from "pixi.js";
import type { LinkModel, NodeModel } from "../graph/types";
import {
  ARROW_OFFSET_FROM_CHILD,
  ARROW_SIZE,
  LINK_COLOR,
  LINK_WIDTH,
  NODE_RADIUS,
} from "../constants";

export const createLinkView = (linksLayer: PIXI.Container): PIXI.Graphics => {
  const line = new PIXI.Graphics();
  linksLayer.addChild(line);
  return line;
};

export const destroyLinkView = (
  linksLayer: PIXI.Container,
  line: PIXI.Graphics
): void => {
  linksLayer.removeChild(line);
  line.destroy();
};

export const drawArrowHead = (
  g: PIXI.Graphics,
  tipX: number,
  tipY: number,
  angle: number,
  size: number
): void => {
  const leftX = tipX - Math.cos(angle - Math.PI / 6) * size;
  const leftY = tipY - Math.sin(angle - Math.PI / 6) * size;
  const rightX = tipX - Math.cos(angle + Math.PI / 6) * size;
  const rightY = tipY - Math.sin(angle + Math.PI / 6) * size;

  g.moveTo(tipX, tipY);
  g.lineTo(leftX, leftY);
  g.moveTo(tipX, tipY);
  g.lineTo(rightX, rightY);
};

export const syncLinkView = (
  line: PIXI.Graphics,
  parent: NodeModel,
  child: NodeModel
): void => {
  const px = parent.x;
  const py = parent.y;
  const cx = child.x;
  const cy = child.y;

  const dx = cx - px;
  const dy = cy - py;
  const len = Math.sqrt(dx * dx + dy * dy);

  line.clear();

  if (len < 0.001) {
    return;
  }

  const ux = dx / len;
  const uy = dy / len;

  const startX = px + ux * NODE_RADIUS;
  const startY = py + uy * NODE_RADIUS;
  const endX = cx - ux * NODE_RADIUS;
  const endY = cy - uy * NODE_RADIUS;

  line.moveTo(startX, startY);
  line.lineTo(endX, endY);
  line.stroke({ width: LINK_WIDTH, color: LINK_COLOR });

  const arrowTipX = endX - ux * ARROW_OFFSET_FROM_CHILD;
  const arrowTipY = endY - uy * ARROW_OFFSET_FROM_CHILD;
  const angle = Math.atan2(uy, ux);

  drawArrowHead(line, arrowTipX, arrowTipY, angle, ARROW_SIZE);
  line.stroke({ width: LINK_WIDTH, color: LINK_COLOR });
};

export const updateLinks = (
  links: ReadonlyArray<{ state: LinkModel; view: PIXI.Graphics }>
): void => {
  for (const link of links) {
    syncLinkView(link.view, link.state.parent, link.state.child);
  }
};