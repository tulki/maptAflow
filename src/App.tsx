import "./App.css";
import { PixiCanvas } from "./components/PixiCanvas";
import { createSignal, onMount, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

type DbNode = {
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
  const [nodes, setNodes] = createSignal<DbNode[]>([]);
  const [isReady, setIsReady] = createSignal(false);

  async function loadNodes() {
    const dbNodes = await invoke<DbNode[]>("list_nodes_with_positions");
    setNodes(dbNodes);
  }

  async function loadInitialState() {
    try {
      await loadNodes();
    } catch (error) {
      console.error("failed to load nodes", error);
    } finally {
      setIsReady(true);
    }
  }

  onMount(async () => {
    await loadInitialState();
  });

  return (
    <main>
      <Show when={isReady()}>
        <PixiCanvas initialNodes={nodes()} />
      </Show>
    </main>
  );
}

export default App;