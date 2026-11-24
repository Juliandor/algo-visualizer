import { EMPTY, WALL, type GridData } from '../pathfinding/types';
import { randInt, type Rng } from '../../lib/random';
import { lastOdd, placeEndpoints, snapToOdd, type MazeGenerator } from './common';

/**
 * Recursive division: starts with an empty room, draws a wall with
 * one gap and keeps dividing both halves recursively.
 * Walls sit on even, corridors on odd coordinates.
 */
export function recursiveDivision(grid: GridData, rng: Rng = Math.random) {
  const { rows, cols } = grid;
  const cells = new Uint8Array(rows * cols).fill(EMPTY);
  const set = (r: number, c: number) => {
    cells[r * cols + c] = WALL;
  };

  // Border
  for (let c = 0; c < cols; c++) {
    set(0, c);
    set(rows - 1, c);
  }
  for (let r = 0; r < rows; r++) {
    set(r, 0);
    set(r, cols - 1);
  }

  // top/left/bottom/right are odd coordinates (inclusive bounds of the open area).
  const divide = (top: number, left: number, bottom: number, right: number) => {
    const h = bottom - top;
    const w = right - left;
    if (h < 2 && w < 2) return;
    let horizontal: boolean;
    if (h < 2) horizontal = false;
    else if (w < 2) horizontal = true;
    else if (h > w) horizontal = true;
    else if (w > h) horizontal = false;
    else horizontal = rng() < 0.5;

    if (horizontal) {
      const y = top + 1 + 2 * randInt(rng, h / 2);
      const gap = left + 2 * randInt(rng, w / 2 + 1);
      for (let x = left; x <= right; x++) if (x !== gap) set(y, x);
      divide(top, left, y - 1, right);
      divide(y + 1, left, bottom, right);
    } else {
      const x = left + 1 + 2 * randInt(rng, w / 2);
      const gap = top + 2 * randInt(rng, h / 2 + 1);
      for (let y = top; y <= bottom; y++) if (y !== gap) set(y, x);
      divide(top, left, bottom, x - 1);
      divide(top, x + 1, bottom, right);
    }
  };

  divide(1, 1, lastOdd(rows - 2), lastOdd(cols - 2));
  return placeEndpoints(grid, snapToOdd(grid, grid.start), snapToOdd(grid, grid.end), cells);
}

export const recursiveDivisionMaze: MazeGenerator = {
  id: 'division',
  name: 'Recursive Division',
  description: 'Rectangular chambers with one doorway each – looks very architectural.',
  generate: recursiveDivision,
};
