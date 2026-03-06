import * as PIXI from "pixi.js";

type PanController = {
  destroy: () => void;
};

export const setupPan = (
  canvas: HTMLCanvasElement,
  world: PIXI.Container
): PanController => {
  let panning = false;
  let lastX = 0;
  let lastY = 0;

  const panMove = (e: PointerEvent) => {
    if (!panning) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    world.x += dx;
    world.y += dy;

    lastX = e.clientX;
    lastY = e.clientY;
  };

  const panUp = () => {
    panning = false;
    window.removeEventListener("pointermove", panMove);
    window.removeEventListener("pointerup", panUp);
  };

  const onCanvasPointerDown = (e: PointerEvent) => {
    if (e.button !== 1) return;

    panning = true;
    lastX = e.clientX;
    lastY = e.clientY;

    window.addEventListener("pointermove", panMove);
    window.addEventListener("pointerup", panUp);
  };

  canvas.addEventListener("pointerdown", onCanvasPointerDown);

  return {
    destroy: () => {
      window.removeEventListener("pointermove", panMove);
      window.removeEventListener("pointerup", panUp);
      canvas.removeEventListener("pointerdown", onCanvasPointerDown);
    },
  };
};