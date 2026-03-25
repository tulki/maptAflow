import { onCleanup, onMount } from "solid-js";
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

    const createAndBindNode = (x: number, y: number) => {
      const node = createNode(x, y, nodes, nodesLayer);
      drag.makeDraggable(node);
      return node;
    };

    const createButton = new PIXI.Graphics();
    createButton.circle(0, 0, 25);
    createButton.fill({ color: 0x00ff88 });
    createButton.eventMode = "dynamic";
    createButton.cursor = "pointer";

    app.stage.addChild(createButton);

    const centerButton = () => {
      const w = app.renderer.width / app.renderer.resolution;
      const h = app.renderer.height / app.renderer.resolution;

      createButton.x = w / 2;
      createButton.y = h / 2;
    };

    centerButton();
    app.renderer.on("resize", centerButton);

    createButton.on("pointerdown", () => {
      createAndBindNode(-world.x, -world.y);
    });

    const fallbackRoots: InitialRootNode[] = [
      { id: "local-root-1", title: "Root 1", x: 0, y: 0 },
      { id: "local-root-2", title: "Root 2", x: 120, y: 80 },
      { id: "local-root-3", title: "Root 3", x: -140, y: 60 },
    ];

    const rootsToRender =
      props.initialRootNodes && props.initialRootNodes.length > 0
        ? props.initialRootNodes
        : fallbackRoots;

    rootsToRender.forEach((root) => {
      createAndBindNode(root.x, root.y);
    });

    onCleanup(() => {
      pan.destroy();
      drag.destroy();

      app.renderer.off("resize", centerButton);
      app.ticker.remove(tick);

      app.destroy(true);
    });
  });

  return (
    <div
      ref={container}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    />
  );
}