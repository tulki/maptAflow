import * as PIXI from "pixi.js";
import { tauriNodeGateway, type NodeGateway } from "../api/node-gateway";
import { setupDrag } from "../input/drag";
import { commitNodeDrop } from "../usecases/drop-node";
import type { CanvasStore } from "./store";
import type { CanvasNode } from "./types";

type NodeDragControllerOptions = {
  app: PIXI.Application;
  world: PIXI.Container;
  store: CanvasStore;
  gateway?: NodeGateway;
};

type NodeDragController = {
  makeDraggable: (node: CanvasNode) => void;
  destroy: () => void;
};

export const createNodeDragController = ({
  app,
  world,
  store,
  gateway = tauriNodeGateway,
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
      await commitNodeDrop({
        child,
        nodes: store.nodes,
        gateway,
        linkOnCanvas: store.setParent,
      });
    },
  });

  return {
    makeDraggable: drag.makeDraggable,
    destroy: drag.destroy,
  };
};
