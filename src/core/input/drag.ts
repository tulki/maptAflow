import * as PIXI from "pixi.js";
import { LINK_SNAP_DISTANCE } from "../constants";
import { setParent } from "../graph/actions";
import { canLink, distance } from "../graph/rules";
import type { LinkModel, NodeModel } from "../graph/types";

type DragControllerOptions = {
  app: PIXI.Application;
  world: PIXI.Container;
  nodes: NodeModel[];
  links: LinkModel[];
  linksLayer: PIXI.Container;
};

type DragController = {
  makeDraggable: (node: NodeModel) => void;
  destroy: () => void;
};

export const setupDrag = ({
  app,
  world,
  nodes,
  links,
  linksLayer,
}: DragControllerOptions): DragController => {
  let draggingNode: NodeModel | null = null;
  let offsetX = 0;
  let offsetY = 0;

  const move = (e: PointerEvent) => {
    if (!draggingNode) return;

    const rect = app.canvas.getBoundingClientRect();

    const x =
      (e.clientX - rect.left) * (app.renderer.width / rect.width) - world.x;
    const y =
      (e.clientY - rect.top) * (app.renderer.height / rect.height) - world.y;

    draggingNode.view.x = x + offsetX;
    draggingNode.view.y = y + offsetY;
  };

  const up = () => {
    if (!draggingNode) return;

    const child = draggingNode;

    let targetParent: NodeModel | null = null;
    let bestDistance = Infinity;

    for (const node of nodes) {
      if (node === child) continue;
      if (!canLink(node, child)) continue;

      const d = distance(node, child);
      if (d < LINK_SNAP_DISTANCE && d < bestDistance) {
        bestDistance = d;
        targetParent = node;
      }
    }

    if (targetParent) {
      setParent(targetParent, child, links, linksLayer);
    }

    draggingNode = null;

    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };

  const makeDraggable = (node: NodeModel) => {
    node.view.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
      if (event.button !== 0) return;

      draggingNode = node;

      offsetX = node.view.x - event.global.x + world.x;
      offsetY = node.view.y - event.global.y + world.y;

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  };

  return {
    makeDraggable,
    destroy: () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    },
  };
};