import * as PIXI from "pixi.js";
import { setNodeParent, updateNodePosition } from "../api/nodes";
import { LINK_SNAP_DISTANCE } from "../constants";
import { canLink, distance } from "../graph/rules";
import { setupDrag } from "../input/drag";
import type { CanvasStore } from "./store";
import type { CanvasNode } from "./types";

type NodeDragControllerOptions = {
  app: PIXI.Application;
  world: PIXI.Container;
  store: CanvasStore;
};

type NodeDragController = {
  makeDraggable: (node: CanvasNode) => void;
  destroy: () => void;
};

const findSnapParent = (
  child: CanvasNode,
  nodes: CanvasNode[]
): CanvasNode | null => {
  let targetParent: CanvasNode | null = null;
  let bestDistance = Infinity;

  for (const node of nodes) {
    if (node === child) {
      continue;
    }

    if (!canLink(node.state, child.state)) {
      continue;
    }

    const d = distance(node.state, child.state);

    if (d < LINK_SNAP_DISTANCE && d < bestDistance) {
      bestDistance = d;
      targetParent = node;
    }
  }

  return targetParent;
};

export const createNodeDragController = ({
  app,
  world,
  store,
}: NodeDragControllerOptions): NodeDragController => {
  const drag = setupDrag<CanvasNode>({
    app,
    world,
    onMove: (node, position) => {
      node.state.x = position.x;
      node.state.y = position.y;
      store.syncNode(node);
    },
    onEnd: async (child) => {
      const targetParent = findSnapParent(child, store.nodes);

      if (targetParent && child.state.dbId && targetParent.state.dbId) {
        try {
          await setNodeParent({
            node_id: child.state.dbId,
            parent_id: targetParent.state.dbId,
          });

          store.setParent(targetParent, child);
        } catch (error) {
          console.error("failed to persist parent change", error);
        }
      }

      if (child.state.dbId) {
        try {
          await updateNodePosition({
            node_id: child.state.dbId,
            x: child.state.x,
            y: child.state.y,
          });
        } catch (error) {
          console.error("failed to persist node position", error);
        }
      }
    },
  });

  return {
    makeDraggable: drag.makeDraggable,
    destroy: drag.destroy,
  };
};