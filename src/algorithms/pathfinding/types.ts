import type { AlgorithmInfo } from '../types';

export const EMPTY = 0;
export const WALL = 1;
export const WEIGHT = 2;
/** Cost of entering a “mud” cell (normal cells cost 1). */
export const WEIGHT_COST = 5;

export type CellKind = typeof EMPTY | typeof WALL | typeof WEIGHT;

export interface GridData {
  rows: number;
  cols: number;
  /** Row-major: index = row * cols + col */
  cells: Uint8Array;
  start: number;
  end: number;
}

/**
 * frontier = added to the queue
 * visit    = expanded / visited
 * path     = part of the path found
 */
export interface PathStep {
  type: 'frontier' | 'visit' | 'path';
  node: number;
  line: number;
}

export interface PathResult {
  steps: PathStep[];
  path: number[];
  found: boolean;
  /** Sum of cell costs along the path (including weights). */
  cost: number;
}

export interface PathAlgorithm extends AlgorithmInfo {
  weighted: boolean;
  guaranteesShortest: boolean;
  run: (grid: GridData) => PathResult;
}
