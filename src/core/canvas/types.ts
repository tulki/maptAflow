import * as PIXI from "pixi.js";
import type {
  LinkModel as GraphLinkModel,
  NodeModel as GraphNodeModel,
} from "../graph/types";

export type CanvasNode = {
  state: GraphNodeModel;
  view: PIXI.Graphics;
};

export type CanvasLink = {
  state: GraphLinkModel;
  view: PIXI.Graphics;
};