import { EMPTY, WALL, WEIGHT, type GridData } from '../pathfinding/types';
import type { Rng } from '../../lib/random';
import { placeEndpoints, type MazeGenerator } from './common';

export function randomWalls(grid: GridData, rng: Rng = Math.random, density = 0.28) {
  const cells = new Uint8Array(grid.rows * grid.cols);
  for (let i = 0; i < cells.length; i++) cells[i] = rng() < density ? WALL : EMPTY;
  return placeEndpoints(grid, grid.start, grid.end, cells);
}

/** Scatters mud over free cells; existing walls are kept. */
export function randomWeights(grid: GridData, rng: Rng = Math.random, density = 0.3) {
  const cells = grid.cells.slice();
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === WALL) continue;
    cells[i] = rng() < density ? WEIGHT : EMPTY;
  }
  return placeEndpoints(grid, grid.start, grid.end, cells);
}

export const randomWallsMaze: MazeGenerator = {
  id: 'random',
  name: 'Random walls',
  description: 'About 28% of the cells become walls. There is not always a path!',
  generate: randomWalls,
};

export const randomWeightsMaze: MazeGenerator = {
  id: 'weights',
  name: 'Scatter mud',
  description: 'Scatters mud cells (cost 5). Great for Dijkstra vs. BFS.',
  generate: randomWeights,
};
