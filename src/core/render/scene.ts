import * as PIXI from "pixi.js";

export const createScene = (app: PIXI.Application) => {
  const world = new PIXI.Container();
  const linksLayer = new PIXI.Container();
  const nodesLayer = new PIXI.Container();

  world.addChild(linksLayer);
  world.addChild(nodesLayer);
  app.stage.addChild(world);

  return {
    world,
    linksLayer,
    nodesLayer,
  };
};