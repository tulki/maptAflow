import { onCleanup, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import * as PIXI from "pixi.js";
import {
  createNode,
  createScene,
  setupDrag,
  setupPan,
  updateLinks,
  type LinkModel,
  type NodeModel,
} from "../core";

type InitialRootNode = {
  id: string;
  title: string;
  x: number;
  y: number;
};

type CreatedNode = {
  id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PixiCanvasProps = {
  initialRootNodes?: InitialRootNode[];
};

export function PixiCanvas(props: PixiCanvasProps) {
  let container!: HTMLDivElement;
  let app: PIXI.Application;

  onMount(async () => {
    app = new PIXI.Application();

    await app.init({
      resizeTo: container,
      background: "#050509",
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    container.appendChild(app.canvas);

    const { world, linksLayer, nodesLayer } = createScene(app);
    const uiLayer = new PIXI.Container();
    app.stage.addChild(uiLayer);

    const nodes: NodeModel[] = [];
    const links: LinkModel[] = [];

    const pan = setupPan(app.canvas, world);
    const drag = setupDrag({
      app,
      world,
      nodes,
      links,
      linksLayer,
    });

    const tick = () => updateLinks(links);
    app.ticker.add(tick);

    const createAndBindNode = (
      x: number,
      y: number,
      dbId: string | null = null
    ) => {
      const node = createNode(x, y, nodes, nodesLayer, dbId);
      drag.makeDraggable(node);
      return node;
    };

    for (const root of props.initialRootNodes ?? []) {
      createAndBindNode(root.x, root.y, root.id);
    }

    const createButton = new PIXI.Graphics();
    createButton.circle(0, 0, 25);
    createButton.fill({ color: 0x00ff88 });
    createButton.eventMode = "dynamic";
    createButton.cursor = "pointer";
    uiLayer.addChild(createButton);

    const centerButton = () => {
      const w = app.renderer.width / app.renderer.resolution;
      const h = app.renderer.height / app.renderer.resolution;
      createButton.x = w / 2;
      createButton.y = h / 2;
    };

    centerButton();
    app.renderer.on("resize", centerButton);

    createButton.on("pointerdown", async () => {
      const x = -world.x;
      const y = -world.y;

      try {
        const created = await invoke<CreatedNode>("create_root_node", {
          input: {
            title: "New root node",
            description: null,
            x,
            y,
          },
        });

        createAndBindNode(x, y, created.id);
      } catch (error) {
        console.error("failed to create root node", error);
      }
    });

    onCleanup(() => {
      pan.destroy();
      drag.destroy();
      app.renderer.off("resize", centerButton);
      app.ticker.remove(tick);
      app.destroy(true);
    });
  });

  return <div ref={container!} style={{ width: "100%", height: "100%" }} />;
}