import assert from "node:assert/strict";
import { test } from "node:test";
import { removeChildFromParent, setParent } from "../src/core/graph/actions";
import { canLink, distance } from "../src/core/graph/rules";
import { makeNode } from "./helpers";

test("canLink rejects linking a node to itself", () => {
  const a = makeNode("A", 0, 0);
  assert.equal(canLink(a.state, a.state), false);
});

test("canLink rejects moving a node under its own descendant (AC1)", () => {
  const a = makeNode("A", 0, 0);
  const b = makeNode("B", 0, 0);
  const c = makeNode("C", 0, 0);
  assert.equal(setParent(a.state, b.state), true);
  assert.equal(setParent(b.state, c.state), true);
  assert.equal(canLink(c.state, a.state), false);
  assert.equal(setParent(c.state, a.state), false);
  assert.equal(a.state.parent, null);
});

test("setParent moves a child from the old parent to the new one", () => {
  const p1 = makeNode("P1", 0, 0);
  const p2 = makeNode("P2", 0, 0);
  const child = makeNode("C", 0, 0);
  setParent(p1.state, child.state);
  assert.equal(setParent(p2.state, child.state), true);
  assert.equal(child.state.parent, p2.state);
  assert.deepEqual(p1.state.children, []);
  assert.deepEqual(p2.state.children, [child.state]);
  assert.equal(setParent(p2.state, child.state), false);
});

test("removeChildFromParent detaches and reports changes", () => {
  const p = makeNode("P", 0, 0);
  const c = makeNode("C", 0, 0);
  assert.equal(removeChildFromParent(c.state), false);
  setParent(p.state, c.state);
  assert.equal(removeChildFromParent(c.state), true);
  assert.equal(c.state.parent, null);
  assert.deepEqual(p.state.children, []);
});

test("distance is euclidean", () => {
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});
