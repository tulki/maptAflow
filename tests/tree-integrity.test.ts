// Runs the real schema.sql and the real cycle query used by the Rust backend
// (node_repository::would_create_cycle) against SQLite via node:sqlite.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const SCHEMA = read("../src-tauri/src/db/schema.sql");
const WOULD_CREATE_CYCLE = read("../src-tauri/src/db/queries/would_create_cycle.sql");

const openDb = () => {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  const insert = db.prepare(
    "INSERT INTO nodes (id, parent_id, title, status, sort_order, created_at, updated_at) VALUES (?, ?, 'n', 'idle', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
  );
  // Tree: A -> B -> C, D is a separate root
  insert.run("A", null);
  insert.run("B", "A");
  insert.run("C", "B");
  insert.run("D", null);
  return db;
};

const wouldCreateCycle = (db: DatabaseSync, nodeId: string, newParentId: string) => {
  const row = db.prepare(WOULD_CREATE_CYCLE).get(nodeId, newParentId) as Record<string, number>;
  return Object.values(row)[0] === 1;
};

test("schema alone does not stop a cycle (why the backend guard is needed)", () => {
  const db = openDb();
  const changes = db.prepare("UPDATE nodes SET parent_id = ?2 WHERE id = ?1").run("A", "C").changes;
  assert.equal(changes, 1);
  const roots = db.prepare("SELECT COUNT(*) AS c FROM nodes WHERE parent_id IS NULL").get() as { c: number };
  assert.equal(roots.c, 1); // only D is left as a root, A-B-C is now a loop
});

test("moving a node under its own descendant is detected (AC1)", () => {
  const db = openDb();
  assert.equal(wouldCreateCycle(db, "A", "C"), true);
  assert.equal(wouldCreateCycle(db, "A", "B"), true);
  assert.equal(wouldCreateCycle(db, "B", "C"), true);
});

test("self parent is detected (AC1)", () => {
  const db = openDb();
  assert.equal(wouldCreateCycle(db, "A", "A"), true);
});

test("valid moves are allowed (AC2)", () => {
  const db = openDb();
  assert.equal(wouldCreateCycle(db, "C", "A"), false);
  assert.equal(wouldCreateCycle(db, "D", "C"), false);
  assert.equal(wouldCreateCycle(db, "B", "D"), false);
});

test("query terminates even if the table already contains a cycle", () => {
  const db = openDb();
  db.prepare("UPDATE nodes SET parent_id = 'C' WHERE id = 'A'").run();
  assert.equal(wouldCreateCycle(db, "D", "A"), false);
  assert.equal(wouldCreateCycle(db, "B", "A"), true);
});
