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
  const [isReady, setIsReady] = createSignal(false);

  async function loadNodeCount() {
    const count = await invoke<number>("count_nodes");
    setNodeCount(count);
  }

  async function loadRootNodes() {
    const nodes = await invoke<DbRootNode[]>("list_root_nodes_with_positions");
    setRootNodes(nodes);
  }

  async function loadInitialState() {
    try {
      setDbError("");
      await loadNodeCount();
      await loadRootNodes();
    } catch (error) {
      setDbError(String(error));
    } finally {
      setIsReady(true);
    }
  }

  onMount(async () => {
    await loadInitialState();
  });

  return (
    <main class="app-shell">
      <aside class="sidebar-overlay">
        <div class="db-status">
          {dbError()
            ? `DB error: ${dbError()}`
            : `Nodes in DB: ${nodeCount() ?? "loading..."}`}
        </div>

        <h2>Root nodes</h2>
        <ul>
          {rootNodes().map((node) => (
            <li>
              {node.title} — ({node.x}, {node.y})
            </li>
          ))}
        </ul>
      </aside>

      <Show when={isReady() && !dbError()}>
        <PixiCanvas
          initialRootNodes={rootNodes().map((node) => ({
            id: node.id,
            title: node.title,
            x: node.x,
            y: node.y,
          }))}
        />
      </Show>
    </main>
  );
}

export default App;