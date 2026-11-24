import type { GridData, PathAlgorithm, PathResult } from '../algorithms/pathfinding/types';

export const NEVER = 0x7fffffff;

/**
 * Instead of copying states we store, per cell, the step in which it was
 * visited / added to the frontier / became part of the path.
 * The state at step k is then simply: xAt[cell] < k.
 * → Arbitrary seeking forwards and backwards in O(cells).
 */
export interface PathRun {
  algo: PathAlgorithm;
  result: PathResult;
  ms: number;
  visitedAt: Int32Array;
  frontierAt: Int32Array;
  pathAt: Int32Array;
  /** Number of visited cells after k steps */
  visitedCount: Int32Array;
  /** Index of the first path step (= end of the search) */
  searchEnd: number;
}

export function createPathRun(algo: PathAlgorithm, grid: GridData): PathRun {
  const t0 = performance.now();
  const result = algo.run(grid);
  const ms = performance.now() - t0;

  const n = grid.rows * grid.cols;
  const visitedAt = new Int32Array(n).fill(NEVER);
  const frontierAt = new Int32Array(n).fill(NEVER);
  const pathAt = new Int32Array(n).fill(NEVER);
  const visitedCount = new Int32Array(result.steps.length + 1);
  let searchEnd = result.steps.length;

  result.steps.forEach((s, k) => {
    visitedCount[k + 1] = visitedCount[k] + (s.type === 'visit' ? 1 : 0);
    const target = s.type === 'visit' ? visitedAt : s.type === 'frontier' ? frontierAt : pathAt;
    if (target[s.node] === NEVER) target[s.node] = k;
    if (s.type === 'path' && searchEnd === result.steps.length) searchEnd = k;
  });

  return { algo, result, ms, visitedAt, frontierAt, pathAt, visitedCount, searchEnd };
}

export type CellStatus = 0 | 1 | 2 | 3; // none | frontier | visited | path

export function cellStatus(run: PathRun | null, i: number, k: number): CellStatus {
  if (!run) return 0;
  if (run.pathAt[i] < k) return 3;
  if (run.visitedAt[i] < k) return 2;
  if (run.frontierAt[i] < k) return 1;
  return 0;
}
