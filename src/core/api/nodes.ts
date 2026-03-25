import { invoke } from "@tauri-apps/api/core";

export type DbNode = {
  id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  x: number;
  y: number;
};

export type Node = {
  id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateNodeInput = {
  title: string;
  description: string | null;
  x: number;
  y: number;
  parent_id: string | null;
};

export type UpdateNodePositionInput = {
  node_id: string;
  x: number;
  y: number;
};

export type SetNodeParentInput = {
  node_id: string;
  parent_id: string | null;
};

export async function listNodesWithPositions(): Promise<DbNode[]> {
  return invoke<DbNode[]>("list_nodes_with_positions");
}

export async function createNode(input: CreateNodeInput): Promise<Node> {
  return invoke<Node>("create_node", { input });
}

export async function setNodeParent(input: SetNodeParentInput): Promise<void> {
  return invoke("set_node_parent", { input });
}

export async function updateNodePosition(
  input: UpdateNodePositionInput
): Promise<void> {
  return invoke("update_node_position", { input });
}