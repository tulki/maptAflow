import assert from "node:assert/strict";
import { test } from "node:test";
import type { NodeGateway } from "../src/core/api/node-gateway";
import { setParent } from "../src/core/graph/actions";
import { commitNodeDrop, findSnapParent } from "../src/core/usecases/drop-node";
import { makeNode, type TestNode } from "./helpers";

const fakeGateway = (failParent = false) => {
  const calls: string[] = [];
  const gateway: NodeGateway = {
    setNodeParent: async (input) => {
      calls.push(`setNodeParent:${input.node_id}->${input.parent_id}`);
      if (failParent) throw new Error("backend rejected");
    },
    updateNodePosition: async (input) => {
      calls.push(`updateNodePosition:${input.node_id}@${input.x},${input.y}`);
    },
  };
  return { gateway, calls };
};

const canvasLinker = (calls: string[]) => (parent: TestNode, child: TestNode) => {
  calls.push(`linkOnCanvas:${parent.name}->${child.name}`);
  return setParent(parent.state, child.state);
};

const silent = () => {};

test("drop near a valid parent saves parent first, then links, then saves position (AC3)", async () => {
  const parent = makeNode("P", 0, 0);
  const child = makeNode("C", 10, 0);
  const { gateway, calls } = fakeGateway();

  const result = await commitNodeDrop({
    child,
    nodes: [parent, child],
    gateway,
    linkOnCanvas: canvasLinker(calls),
  });

  assert.deepEqual(calls, [
    "setNodeParent:C->P",
    "linkOnCanvas:P->C",
    "updateNodePosition:C@10,0",
  ]);
  assert.equal(result.linkedTo, parent);
  assert.equal(result.positionSaved, true);
  assert.equal(child.state.parent, parent.state);
});

test("if the backend rejects the parent, no canvas link is created but position is saved (AC3)", async () => {
  const parent = makeNode("P", 0, 0);
  const child = makeNode("C", 10, 0);
  const { gateway, calls } = fakeGateway(true);
  const errors: string[] = [];

  const result = await commitNodeDrop({
    child,
    nodes: [parent, child],
    gateway,
    linkOnCanvas: canvasLinker(calls),
    onError: (message) => errors.push(message),
  });

  assert.deepEqual(calls, ["setNodeParent:C->P", "updateNodePosition:C@10,0"]);
  assert.deepEqual(errors, ["failed to persist parent change"]);
  assert.equal(result.linkedTo, null);
  assert.equal(child.state.parent, null);
});

test("drop far from every node only saves the position", async () => {
  const other = makeNode("O", 0, 0);
  const child = makeNode("C", 500, 500);
  const { gateway, calls } = fakeGateway();

  await commitNodeDrop({ child, nodes: [other, child], gateway, linkOnCanvas: canvasLinker(calls), onError: silent });

  assert.deepEqual(calls, ["updateNodePosition:C@500,500"]);
});

test("never snaps a node under its own descendant (AC1)", () => {
  const a = makeNode("A", 0, 0);
  const b = makeNode("B", 5, 0);
  setParent(a.state, b.state);
  assert.equal(findSnapParent(a, [a, b]), null);
});

test("picks the closest valid parent inside the snap distance", () => {
  const near = makeNode("N", 0, 0);
  const nearer = makeNode("M", 18, 0);
  const child = makeNode("C", 20, 0);
  assert.equal(findSnapParent(child, [near, nearer, child]), nearer);
});

test("a node that is not saved yet (no dbId) triggers no backend calls", async () => {
  const parent = makeNode("P", 0, 0);
  const child = makeNode("C", 10, 0, null);
  const { gateway, calls } = fakeGateway();

  const result = await commitNodeDrop({ child, nodes: [parent, child], gateway, linkOnCanvas: canvasLinker(calls) });

  assert.deepEqual(calls, []);
  assert.equal(result.positionSaved, false);
});
