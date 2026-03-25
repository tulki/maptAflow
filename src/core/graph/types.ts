import * as PIXI from "pixi.js";

export type NodeModel = {
  dbId: string | null;
  view: PIXI.Graphics;
  parent: NodeModel | null;
  children: NodeModel[];
};

export type LinkModel = {
  parent: NodeModel;
  child: NodeModel;
  line: PIXI.Graphics;
};