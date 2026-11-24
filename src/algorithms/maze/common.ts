import type { GridData } from '../pathfinding/types';
import type { Rng } from '../../lib/random';

export interface MazeResult {
  cells: Uint8Array;
  start: number;
  end: number;
}

export interface MazeGenerator {
  id: string;
  name: string;
  description: string;
  generate: (grid: GridData, rng?: Rng) => MazeResult;
}

/** Largest odd number ≤ x. */
export const lastOdd = (x: number) => (x % 2 === 1 ? x : x - 1);

/**
 * Moves a cell to the nearest coordinate with an odd row and column.
 * Backtracking/division mazes have their corridors exactly there.
 */
export function snapToOdd(grid: GridData, i: number): number {
  const maxR = lastOdd(grid.rows - 2);
  const maxC = lastOdd(grid.cols - 2);
  let r = Math.floor(i / grid.cols);
  let c = i % grid.cols;
  if (r % 2 === 0) r += r < maxR ? 1 : -1;
  if (c % 2 === 0) c += c < maxC ? 1 : -1;
  r = Math.min(Math.max(r, 1), maxR);
  c = Math.min(Math.max(c, 1), maxC);
  return r * grid.cols + c;
}

/** Makes sure start and goal are distinct, free cells. */
export function placeEndpoints(_grid: GridData, start: number, end: number, cells: Uint8Array) {
  if (end === start) {
    // Fallback: put the goal on the last free cell.
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i] === 0 && i !== start) {
        end = i;
        break;
      }
    }
  }
  cells[start] = 0;
  cells[end] = 0;
  return { cells, start, end };
}
