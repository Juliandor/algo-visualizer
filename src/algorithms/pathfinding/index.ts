import { astar } from './astar';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { dijkstra } from './dijkstra';
import { greedy } from './greedy';
import type { PathAlgorithm } from './types';

export const pathAlgorithms: PathAlgorithm[] = [bfs, dfs, dijkstra, astar, greedy];

export const getPathAlgorithm = (id: string): PathAlgorithm =>
  pathAlgorithms.find((a) => a.id === id) ?? pathAlgorithms[0];

export * from './types';
export * from './grid';
