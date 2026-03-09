import * as PIXI from "pixi.js";
import type { LinkModel } from "../graph/types";
import {
  ARROW_OFFSET_FROM_CHILD,
  ARROW_SIZE,
  LINK_COLOR,
  LINK_WIDTH,
  NODE_RADIUS,
} from "../constants";

export const drawArrowHead = (
  g: PIXI.Graphics,
  tipX: number,
  tipY: number,
  angle: number,
  size: number
) => {
  const leftX = tipX - Math.cos(angle - Math.PI / 6) * size;
  const leftY = tipY - Math.sin(angle - Math.PI / 6) * size;

  const rightX = tipX - Math.cos(angle + Math.PI / 6) * size;
  const rightY = tipY - Math.sin(angle + Math.PI / 6) * size;

  g.moveTo(tipX, tipY);
  g.lineTo(leftX, leftY);
  g.moveTo(tipX, tipY);
  g.lineTo(rightX, rightY);
};

export const updateLinks = (links: LinkModel[]) => {
  for (const link of links) {
    const { parent, child, line } = link;

    const px = parent.view.x;
    const py = parent.view.y;
    const cx = child.view.x;
    const cy = child.view.y;

    const dx = cx - px;
    const dy = cy - py;
    const len = Math.sqrt(dx * dx + dy * dy);

    line.clear();

    if (len < 0.001) continue;

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
  }
};