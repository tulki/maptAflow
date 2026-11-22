import type { NodeModel } from "../src/core/graph/types";

export type TestNode = { name: string; state: NodeModel };

export const makeNode = (
  name: string,
  x: number,
  y: number,
  dbId: string | null = name
): TestNode => ({
  name,
  state: { dbId, x, y, parent: null, children: [] },
});
