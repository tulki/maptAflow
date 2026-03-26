export type NodeModel = {
  dbId: string | null;
  x: number;
  y: number;
  parent: NodeModel | null;
  children: NodeModel[];
};

export type LinkModel = {
  parent: NodeModel;
  child: NodeModel;
};