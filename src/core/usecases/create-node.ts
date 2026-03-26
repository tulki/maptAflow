import * as PIXI from "pixi.js";
import { createNode as createNodeInDb } from "../api/nodes";
import type { CanvasNode } from "../canvas/types";

type CreateNodeAtViewOriginOptions = {
  world: PIXI.Container;
  createAndBindNode: (
    x: number,
    y: number,
    dbId?: string | null
  ) => CanvasNode;
  registerNode: (id: string, node: CanvasNode) => void;
};

export const createNodeAtViewOrigin = async ({
  world,
  createAndBindNode,
  registerNode,
}: CreateNodeAtViewOriginOptions): Promise<CanvasNode> => {
  const x = -world.x;
  const y = -world.y;

  const created = await createNodeInDb({
    title: "New node",
    description: null,
    x,
    y,
    parent_id: null,
  });

  const node = createAndBindNode(x, y, created.id);
  registerNode(created.id, node);

  return node;
};