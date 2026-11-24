import type { MazeGenerator } from './common';
import { randomWallsMaze, randomWeightsMaze } from './random';
import { recursiveBacktrackingMaze } from './recursiveBacktracking';
import { recursiveDivisionMaze } from './recursiveDivision';

export const mazeGenerators: MazeGenerator[] = [
  recursiveBacktrackingMaze,
  recursiveDivisionMaze,
  randomWallsMaze,
  randomWeightsMaze,
];

export const getMazeGenerator = (id: string): MazeGenerator =>
  mazeGenerators.find((m) => m.id === id) ?? mazeGenerators[0];

export type { MazeGenerator, MazeResult } from './common';
