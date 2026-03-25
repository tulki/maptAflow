import "./App.css";
import { PixiCanvas } from "./components/PixiCanvas";
import { createSignal, onMount, Show } from "solid-js";
import { listNodesWithPositions, type DbNode } from "./core";

function App() {
  const [nodes, setNodes] = createSignal<DbNode[]>([]);
  const [isReady, setIsReady] = createSignal(false);

  async function loadNodes() {
    const dbNodes = await listNodesWithPositions();
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
    <Show when={isReady()} fallback={<div>Loading...</div>}>
      <PixiCanvas initialNodes={nodes()} />
    </Show>
  );
}

export default App;