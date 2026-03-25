import "./App.css";
import { PixiCanvas } from "./components/PixiCanvas";
import { createSignal, onMount, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

type DbRootNode = {
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

function App() {
  const [nodeCount, setNodeCount] = createSignal<number | null>(null);
  const [rootNodes, setRootNodes] = createSignal<DbRootNode[]>([]);
  const [dbError, setDbError] = createSignal("");
  const [isCreating, setIsCreating] = createSignal(false);
  const [canvasVersion, setCanvasVersion] = createSignal(0);

  async function loadNodeCount() {
    try {
      const count = await invoke<number>("count_nodes");
      setNodeCount(count);
      setDbError("");
    } catch (error) {
      setDbError(String(error));
    }
  }

  async function loadRootNodes() {
    try {
      const nodes = await invoke<DbRootNode[]>("list_root_nodes_with_positions");
      setRootNodes(nodes);
      setCanvasVersion((v) => v + 1);
      setDbError("");
    } catch (error) {
      setDbError(String(error));
    }
  }

  async function refreshDbState() {
    await loadNodeCount();
    await loadRootNodes();
  }

  async function createRootNode() {
    try {
      setIsCreating(true);

      const nextIndex = rootNodes().length;

      await invoke("create_root_node", {
        input: {
          title: "New root node",
          description: null,
          x: nextIndex * 140,
          y: 0,
        },
      });

      await refreshDbState();
    } catch (error) {
      setDbError(String(error));
    } finally {
      setIsCreating(false);
    }
  }

  onMount(async () => {
    await refreshDbState();
  });

  return (
    <div class="app-root">
      <div
        style={{
          position: "fixed",
          top: "12px",
          left: "12px",
          "z-index": "1000",
          display: "flex",
          "flex-direction": "column",
          gap: "8px",
          padding: "8px 12px",
          "background-color": "rgba(0, 0, 0, 0.7)",
          color: "white",
          "border-radius": "8px",
          "font-size": "14px",
          "min-width": "280px",
          "max-width": "360px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
          <span>
            {dbError()
              ? `DB error: ${dbError()}`
              : `Nodes in DB: ${nodeCount() ?? "loading..."}`}
          </span>

          <button onClick={createRootNode} disabled={isCreating()}>
            {isCreating() ? "Creating..." : "Create root node"}
          </button>
        </div>

        <div>
          <div style={{ "margin-bottom": "6px", "font-weight": "600" }}>
            Root nodes
          </div>

          <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
            {rootNodes().map((node) => (
              <li>
                {node.title} — {node.status} — ({node.x}, {node.y})
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Show when={canvasVersion()} keyed>
        <PixiCanvas
          initialRootNodes={rootNodes().map((node) => ({
            id: node.id,
            title: node.title,
            x: node.x,
            y: node.y,
          }))}
        />
      </Show>
    </div>
  );
}

export default App;