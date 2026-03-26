import * as PIXI from "pixi.js";

export type DragPosition = {
  x: number;
  y: number;
};

export type DraggableTarget = {
  view: PIXI.Graphics;
};

type DragControllerOptions<T extends DraggableTarget> = {
  app: PIXI.Application;
  world: PIXI.Container;
  onMove: (target: T, position: DragPosition) => void;
  onEnd: (target: T) => void | Promise<void>;
};

type DragController<T extends DraggableTarget> = {
  makeDraggable: (target: T) => void;
  destroy: () => void;
};

export const setupDrag = <T extends DraggableTarget>({
  app,
  world,
  onMove,
  onEnd,
}: DragControllerOptions<T>): DragController<T> => {
  let draggingTarget: T | null = null;
  let offsetX = 0;
  let offsetY = 0;

  const toWorldPosition = (e: PointerEvent): DragPosition => {
    const rect = app.canvas.getBoundingClientRect();

    const x =
      (e.clientX - rect.left) * (app.renderer.width / rect.width) - world.x;
    const y =
      (e.clientY - rect.top) * (app.renderer.height / rect.height) - world.y;

    return { x, y };
  };

  const move = (e: PointerEvent) => {
    if (!draggingTarget) {
      return;
    }

    const position = toWorldPosition(e);

    onMove(draggingTarget, {
      x: position.x + offsetX,
      y: position.y + offsetY,
    });
  };

  const up = async () => {
    if (!draggingTarget) {
      return;
    }

    const target = draggingTarget;
    draggingTarget = null;

    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);

    await onEnd(target);
  };

  const makeDraggable = (target: T) => {
    target.view.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      draggingTarget = target;

      offsetX = target.view.x - event.global.x + world.x;
      offsetY = target.view.y - event.global.y + world.y;

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  };

  return {
    makeDraggable,
    destroy: () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    },
  };
};