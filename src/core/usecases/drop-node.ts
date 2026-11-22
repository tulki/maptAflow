import type { NodeGateway } from "../api/node-gateway";
import { LINK_SNAP_DISTANCE } from "../constants";
import { canLink, distance } from "../graph/rules";
import type { NodeModel } from "../graph/types";

export type DropTarget = {
  state: NodeModel;
};

export type CommitNodeDropOptions<T extends DropTarget> = {
  child: T;
  nodes: readonly T[];
  gateway: NodeGateway;
  linkOnCanvas: (parent: T, child: T) => boolean | void;
  onError?: (message: string, error: unknown) => void;
};

export type CommitNodeDropResult<T extends DropTarget> = {
  linkedTo: T | null;
  positionSaved: boolean;
};

export const findSnapParent = <T extends DropTarget>(
  child: T,
  nodes: readonly T[]
): T | null => {
  let targetParent: T | null = null;
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

const logError = (message: string, error: unknown) => {
  console.error(message, error);
};

/**
 * Called when a node drag ends: snap to the nearest valid parent,
 * save the parent first and link on the canvas only if saving worked,
 * then save the node position.
 */
export const commitNodeDrop = async <T extends DropTarget>({
  child,
  nodes,
  gateway,
  linkOnCanvas,
  onError = logError,
}: CommitNodeDropOptions<T>): Promise<CommitNodeDropResult<T>> => {
  const result: CommitNodeDropResult<T> = {
    linkedTo: null,
    positionSaved: false,
  };

  const targetParent = findSnapParent(child, nodes);

  if (targetParent && child.state.dbId && targetParent.state.dbId) {
    try {
      await gateway.setNodeParent({
        node_id: child.state.dbId,
        parent_id: targetParent.state.dbId,
      });

      linkOnCanvas(targetParent, child);
      result.linkedTo = targetParent;
    } catch (error) {
      onError("failed to persist parent change", error);
    }
  }

  if (child.state.dbId) {
    try {
      await gateway.updateNodePosition({
        node_id: child.state.dbId,
        x: child.state.x,
        y: child.state.y,
      });

      result.positionSaved = true;
    } catch (error) {
      onError("failed to persist node position", error);
    }
  }

  return result;
};
