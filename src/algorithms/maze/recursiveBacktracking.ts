import { EMPTY, WALL, type GridData } from '../pathfinding/types';
import { randInt, type Rng } from '../../lib/random';
import { lastOdd, placeEndpoints, snapToOdd, type MazeGenerator } from './common';

/**
 * Randomised depth-first search: starts with walls everywhere and carves corridors
 * by jumping to random unvisited neighbours (distance 2).
 * Result: a “perfect” maze with long, winding corridors.
 */
export function recursiveBacktracking(grid: GridData, rng: Rng = Math.random) {
  const { rows, cols } = grid;
  const cells = new Uint8Array(rows * cols).fill(WALL);
  const maxR = lastOdd(rows - 2);
  const maxC = lastOdd(cols - 2);
  const start = snapToOdd(grid, grid.start);
  const end = snapToOdd(grid, grid.end);

  const stack = [start];
  cells[start] = EMPTY;
  const dirs = [
    [-2, 0],
    [0, 2],
    [2, 0],
    [0, -2],
  ];

  while (stack.length > 0) {
    const cur = stack[stack.length - 1];
    const r = Math.floor(cur / cols);
    const c = cur % cols;
    const options: number[][] = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 1 || nc < 1 || nr > maxR || nc > maxC) continue;
      if (cells[nr * cols + nc] === WALL) options.push([nr, nc]);
    }
    if (options.length === 0) {
      stack.pop();
      continue;
    }
    const [nr, nc] = options[randInt(rng, options.length)];
    cells[((r + nr) / 2) * cols + (c + nc) / 2] = EMPTY;
    cells[nr * cols + nc] = EMPTY;
    stack.push(nr * cols + nc);
  }
  return placeEndpoints(grid, start, end, cells);
}

export const recursiveBacktrackingMaze: MazeGenerator = {
  id: 'backtracking',
  name: 'Recursive Backtracking',
  description: 'Long, winding corridors – ideal for comparing DFS and BFS.',
  generate: recursiveBacktracking,
};
