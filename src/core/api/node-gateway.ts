import { setNodeParent, updateNodePosition } from "./nodes";
import type { SetNodeParentInput, UpdateNodePositionInput } from "./nodes";

/**
 * Port for saving canvas changes. Use cases depend on this interface,
 * not on Tauri, so they can run in tests with an in-memory fake.
 */
export type NodeGateway = {
  setNodeParent: (input: SetNodeParentInput) => Promise<void>;
  updateNodePosition: (input: UpdateNodePositionInput) => Promise<void>;
};

/** Adapter: maps the gateway calls to the Tauri IPC commands in ./nodes. */
export const tauriNodeGateway: NodeGateway = {
  setNodeParent,
  updateNodePosition,
};
