import * as PIXI from "pixi.js";
import { createNodeDragController } from "../canvas/drag-node";
import type { CanvasStore } from "../canvas/store";

export type NodeDragUseCaseOptions = {
  app: PIXI.Application;
  world: PIXI.Container;
  store: CanvasStore;
};

export const createNodeDragUseCase = ({
  app,
  world,
  store,
}: NodeDragUseCaseOptions) => {
  return createNodeDragController({
    app,
    world,
    store,
  });
};