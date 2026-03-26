import { onCleanup, onMount } from "solid-js";
import * as PIXI from "pixi.js";
import { createCanvasStore } from "../core/canvas/store";
import type { CanvasNode } from "../core/canvas/types";
import { setupPan } from "../core/input/pan";
import { createScene } from "../core/render/scene";
import { createNodeAtViewOrigin } from "../core/usecases/create-node";
import {
  hydrateCanvas,
  type CanvasInitialNode,
} from "../core/usecases/hydrate-canvas";
import { createNodeDragUseCase } from "../core/usecases/node-drag";

type PixiCanvasProps = {
  initialNodes?: CanvasInitialNode[];
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
    const drag = createNodeDragUseCase({
      app,
      world,
      store,
    });

    const tick = () => {
      store.syncLinks();
    };

    app.ticker.add(tick);

    const createAndBindNode = (
      x: number,
      y: number,
      dbId: string | null = null
    ): CanvasNode => {
      const node = store.createNode(x, y, dbId);
      drag.makeDraggable(node);
      return node;
    };

    const nodeById = hydrateCanvas({
      initialNodes: props.initialNodes,
      createAndBindNode,
      linkNodes: (parent, child) => {
        store.setParent(parent, child);
      },
    });

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
      try {
        await createNodeAtViewOrigin({
          world,
          createAndBindNode,
          registerNode: (id, node) => {
            nodeById.set(id, node);
          },
        });
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

  return (
    <div
      ref={(el) => (container = el)}
      style={{ width: "100%", height: "80vh" }}
    />
  );
}