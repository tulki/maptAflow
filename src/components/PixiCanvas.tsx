import { onCleanup, onMount } from "solid-js";
import * as PIXI from "pixi.js";
import { createNode as createNodeInDb, type Node as DbNodeRecord } from "../core/api/nodes";
import { createNodeDragController } from "../core/canvas/drag-node";
import { createCanvasStore } from "../core/canvas/store";
import type { CanvasNode } from "../core/canvas/types";
import { setupPan } from "../core/input/pan";
import { createScene } from "../core/render/scene";

type InitialNode = {
  id: string;
  parent_id: string | null;
  title: string;
  x: number;
  y: number;
};

type PixiCanvasProps = {
  initialNodes?: InitialNode[];
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

    const store = createCanvasStore({
      nodesLayer,
      linksLayer,
    });

    const pan = setupPan(app.canvas, world);
    const drag = createNodeDragController({
      app,
      world,
      store,
    });

    const tick = () => {
      store.syncLinks();
    };

    app.ticker.add(tick);

    const nodeById = new Map<string, CanvasNode>();

    const createAndBindNode = (
      x: number,
      y: number,
      dbId: string | null = null
    ): CanvasNode => {
      const node = store.createNode(x, y, dbId);
      drag.makeDraggable(node);
      return node;
    };

    for (const item of props.initialNodes ?? []) {
      const node = createAndBindNode(item.x, item.y, item.id);
      nodeById.set(item.id, node);
    }

    for (const item of props.initialNodes ?? []) {
      if (!item.parent_id) {
        continue;
      }

      const child = nodeById.get(item.id);
      const parent = nodeById.get(item.parent_id);

      if (!child || !parent) {
        continue;
      }

      store.setParent(parent, child);
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
        const created: DbNodeRecord = await createNodeInDb({
          title: "New node",
          description: null,
          x,
          y,
          parent_id: null,
        });

        const node = createAndBindNode(x, y, created.id);
        nodeById.set(created.id, node);
      } catch (error) {
        console.error("failed to create node", error);
      }
    });

    onCleanup(() => {
      pan.destroy();
      drag.destroy();
      app.renderer.off("resize", centerButton);
      app.ticker.remove(tick);
      store.destroy();
      app.destroy(true);
    });
  });

  return <div ref={(el) => (container = el)} style={{ width: "100%", height: "80vh" }} />;
}