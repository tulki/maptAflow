import type { CanvasNode } from "../canvas/types";

export type CanvasInitialNode = {
  id: string;
  parent_id: string | null;
  title: string;
  x: number;
  y: number;
};

type HydrateCanvasOptions = {
  initialNodes?: CanvasInitialNode[];
  createAndBindNode: (
    x: number,
    y: number,
    dbId?: string | null
  ) => CanvasNode;
  linkNodes: (parent: CanvasNode, child: CanvasNode) => boolean | void;
};

export const hydrateCanvas = ({
  initialNodes = [],
  createAndBindNode,
  linkNodes,
}: HydrateCanvasOptions): Map<string, CanvasNode> => {
  const nodeById = new Map<string, CanvasNode>();

  for (const item of initialNodes) {
    const node = createAndBindNode(item.x, item.y, item.id);
    nodeById.set(item.id, node);
  }

  for (const item of initialNodes) {
    if (!item.parent_id) {
      continue;
    }

    const child = nodeById.get(item.id);
    const parent = nodeById.get(item.parent_id);

    if (!child || !parent) {
      continue;
    }

    linkNodes(parent, child);
  }

  return nodeById;
};