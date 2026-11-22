# Acceptance criteria

These must stay true after any change (Assignment 05 baseline: commit `b7aaaaf` on `main`).

| ID | Criterion | How it is checked |
|----|-----------|-------------------|
| AC1 | A node can never become its own ancestor: self-parent and "move under own descendant" are rejected by the frontend rule and by the backend. | `tests/graph-rules.test.ts`, `tests/tree-integrity.test.ts`, Rust tests in `node_service.rs` |
| AC2 | Valid tree edits still work: create a node under an existing parent, re-parent to a non-descendant, detach (parent = null). Missing node or parent gives `NotFound`. | Rust tests in `node_service.rs`, `tests/tree-integrity.test.ts` |
| AC3 | On drag-drop near a valid parent, the parent change is saved to the backend first and only then linked on the canvas; if saving fails, the canvas link is not created. The node position is saved after every drop. | `tests/drop-node.test.ts` |
| AC4 | The IPC contract is unchanged: same Tauri command names, same payload fields, same `schema.sql`. | `git diff b7aaaaf -- src-tauri/src/db/schema.sql src-tauri/src/app/dto.rs src-tauri/src/app/commands.rs` is empty |
| AC5 | CI is real: it fails when typecheck, tests, frontend build or Rust tests fail (no `echo "passed"` steps). | `.github/workflows/ci.yml` |
