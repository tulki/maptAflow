import * as PIXI from "pixi.js";
import { removeChildFromParent, setParent as setGraphParent } from "../graph/actions";
import { canLink } from "../graph/rules";
import type { LinkModel, NodeModel } from "../graph/types";
import { createLinkView, destroyLinkView, syncLinkView, updateLinks } from "../render/links";
import { createNodeView, syncNodeView } from "../render/nodes";
import type { CanvasLink, CanvasNode } from "./types";

export type CanvasStore = {
  nodes: CanvasNode[];
  links: CanvasLink[];
  createNode: (x: number, y: number, dbId?: string | null) => CanvasNode;
  setParent: (parent: CanvasNode, child: CanvasNode) => boolean;
  clearParent: (child: CanvasNode) => boolean;
  syncNode: (node: CanvasNode) => void;
  syncLinks: () => void;
  destroy: () => void;
};

type CanvasStoreOptions = {
  nodesLayer: PIXI.Container;
  linksLayer: PIXI.Container;
};

const createNodeState = (
  x: number,
  y: number,
  dbId: string | null = null
): NodeModel => ({
  dbId,
  x,
  y,
  parent: null,
  children: [],
});

const findLinkIndexByChild = (
  links: CanvasLink[],
  childState: NodeModel
): number => {
  return links.findIndex((link) => link.state.child === childState);
};

export const createCanvasStore = ({
  nodesLayer,
  linksLayer,
}: CanvasStoreOptions): CanvasStore => {
  const nodes: CanvasNode[] = [];
  const links: CanvasLink[] = [];

  const syncNode = (node: CanvasNode) => {
    syncNodeView(node.view, node.state);
  };

  const syncLinks = () => {
    updateLinks(links);
  };

  const removeLinkByChild = (childState: NodeModel) => {
    const index = findLinkIndexByChild(links, childState);

    if (index === -1) {
      return;
    }

    const [link] = links.splice(index, 1);
    destroyLinkView(linksLayer, link.view);
  };

  const createNode = (
    x: number,
    y: number,
    dbId: string | null = null
  ): CanvasNode => {
    const state = createNodeState(x, y, dbId);
    const view = createNodeView(nodesLayer);

    const node: CanvasNode = {
      state,
      view,
    };

    syncNode(node);
    nodes.push(node);

    return node;
  };

  const setParent = (parent: CanvasNode, child: CanvasNode): boolean => {
    if (!canLink(parent.state, child.state)) {
      return false;
    }

    if (child.state.parent === parent.state) {
      return false;
    }

    removeLinkByChild(child.state);

    const changed = setGraphParent(parent.state, child.state);

    if (!changed) {
      return false;
    }

    const linkState: LinkModel = {
      parent: parent.state,
      child: child.state,
    };

    const linkView = createLinkView(linksLayer);

    links.push({
      state: linkState,
      view: linkView,
    });

    syncLinkView(linkView, parent.state, child.state);

    return true;
  };

  const clearParent = (child: CanvasNode): boolean => {
    const changed = removeChildFromParent(child.state);

    if (!changed) {
      return false;
    }

    removeLinkByChild(child.state);

    return true;
  };

  const destroy = () => {
    for (const link of links.splice(0)) {
      destroyLinkView(linksLayer, link.view);
    }

    for (const node of nodes.splice(0)) {
      nodesLayer.removeChild(node.view);
      node.view.destroy();
    }
  };

  return {
    nodes,
    links,
    createNode,
    setParent,
    clearParent,
    syncNode,
    syncLinks,
    destroy,
  };
};