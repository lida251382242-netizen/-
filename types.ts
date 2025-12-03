export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  treePosition: [number, number, number];
  scatterPosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface OrnamentData extends DualPosition {
  id: number;
  type: 'box' | 'ball' | 'star';
  color: string;
}