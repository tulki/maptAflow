# AGENTS.md - instructions for coding agents

This file is for AI coding agents (Claude Code, Codex, Copilot agent and similar).
Read it fully before you change anything. If your tool does not load it automatically,
the human operator pastes the relevant sections into the prompt.

## 1. Purpose

maptAflow is a local-first desktop app for breaking a goal into a tree of nodes
(parent -> children). Only leaf nodes are executable. Data is stored locally in SQLite.
See `README.md` (product) and `docs/concept.md`, `docs/tech.md` (design).

## 2. Architecture

| Layer | Path | Notes |
|-------|------|-------|
| UI shell | `src/App.tsx`, `src/index.tsx` | SolidJS, loads nodes on start |
| Canvas | `src/components/PixiCanvas.tsx`, `src/core/render/*`, `src/core/input/*` | PixiJS drawing, pan, drag |
| Graph rules | `src/core/graph/*` | Pure TS, no I/O. `canLink` blocks cycles on the canvas |
| Use cases | `src/core/usecases/*` | Glue between canvas and persistence |
| Persistence port | `src/core/api/node-gateway.ts` | `NodeGateway` interface + Tauri adapter |
| IPC client | `src/core/api/nodes.ts` | The only place that calls Tauri `invoke` |
| Tauri commands | `src-tauri/src/app/commands.rs` | Thin layer, maps errors to strings |
| Services | `src-tauri/src/app/services/node_service.rs` | Validation (existence, self-parent, cycles) |
| Repository | `src-tauri/src/infrastructure/db/*` | rusqlite, SQL in `src-tauri/src/db/` |
| Schema | `src-tauri/src/db/schema.sql` | Applied on every start (`CREATE ... IF NOT EXISTS`) |

Invariant: the node graph is a forest. A node can never become its own ancestor.
The backend (`node_service`) is the source of truth for this rule, the frontend check is only UX.

## 3. Setup

Prerequisites: Node.js 22, Rust stable (1.77+), Tauri 2 system packages
(Linux: `libwebkit2gtk-4.1-dev librsvg2-dev libayatana-appindicator3-dev`).

```
npm install
npm run tauri dev        # tauri.conf.json runs "pnpm dev" before start, so pnpm must be installed
```

## 4. Safe commands (allowed without asking)

```
npm run typecheck                # tsc --noEmit
npm test                         # tsx --test tests/*.test.ts (pure TS + SQL tests)
npm run build                    # vite build into dist/
cd src-tauri && cargo check
cd src-tauri && cargo test --locked
git status / git diff / git log
```

Reading any file in the repo is allowed. Writing is allowed only inside the files listed for your task.

## 5. Forbidden actions

- No secrets: never add tokens, keys, `.env` files or real personal data. Test data is synthetic only.
- No production actions: no `tauri build` releases, no publishing, no tags, no GitHub releases.
- No destructive commands: no `rm -rf`, `git push --force`, `git reset --hard` on shared branches,
  no deleting or rewriting `*.db` files, no `DROP TABLE` / destructive migrations.
- No unreviewed dependency changes: do not add, remove or upgrade packages in `package.json`
  or `src-tauri/Cargo.toml` / `Cargo.lock` unless the task says so. If you think one is needed,
  stop and explain why.
- Do not change the Tauri command names or payload shapes (`create_node`, `set_node_parent`,
  `update_node_position`, `list_nodes_with_positions`, `count_nodes`) or `schema.sql`
  without an explicit task.
- Do not edit `.github/workflows/*` to make a failing check pass. Fix the code or report.
- Never push to `main`. Work on a branch, open a PR.

## 6. Coding conventions

- TypeScript: `strict`, no `any`, named exports, small pure functions in `src/core/graph` and `src/core/usecases`.
- Only `src/core/api/nodes.ts` may import `@tauri-apps/api`. Other code uses `NodeGateway`.
- Rust: errors go through `AppError` (`Database`, `NotFound`, `Validation`), no `unwrap()` outside tests.
- SQL lives in `.sql` files or repository functions, always with bound parameters (`?1`), never string formatting.
- Files end with a newline (`.editorconfig`).

## 7. Test expectations

- Every bug fix or behaviour change comes with a test that fails before and passes after.
- Graph rules and use cases: `tests/*.test.ts` (Node test runner via tsx, no browser needed).
- SQL behaviour: tests run the real `schema.sql` in `node:sqlite` (see `tests/tree-integrity.test.ts`).
- Rust services: `#[cfg(test)]` modules with an in-memory database (`open_database(":memory:")`).
- The acceptance criteria in `docs/acceptance-criteria.md` must stay true.

## 8. Review gate

An agent change is done only when:
1. `npm run typecheck`, `npm test`, `npm run build` and `cargo test --locked` pass in CI (`.github/workflows/ci.yml`).
2. The PR description lists changed files, commands run with pass/fail counts, and known risks.
3. A human reviewed the diff and approved the PR. Agents never merge their own PRs.
