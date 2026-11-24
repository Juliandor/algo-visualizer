import { buildResult, neighbors } from './grid';
import type { GridData, PathAlgorithm, PathStep } from './types';

export function bfsSearch(grid: GridData) {
  const n = grid.rows * grid.cols;
  const parent = new Int32Array(n).fill(-1);
  const seen = new Uint8Array(n);
  const steps: PathStep[] = [];
  const queue: number[] = [grid.start];
  let head = 0;
  seen[grid.start] = 1;
  steps.push({ type: 'frontier', node: grid.start, line: 0 });

  while (head < queue.length) {
    const node = queue[head++];
    steps.push({ type: 'visit', node, line: 2 });
    if (node === grid.end) return buildResult(grid, steps, parent, true, 3);
    for (const nb of neighbors(grid, node)) {
      if (seen[nb]) continue;
      seen[nb] = 1;
      parent[nb] = node;
      queue.push(nb);
      steps.push({ type: 'frontier', node: nb, line: 7 });
    }
  }
  return buildResult(grid, steps, parent, false, 8);
}

export const bfs: PathAlgorithm = {
  id: 'bfs',
  name: 'BFS (Breadth-First Search)',
  weighted: false,
  guaranteesShortest: true,
  complexity: { best: 'O(1)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
  description:
    'Breadth-first search explores the grid layer by layer using a FIFO queue. It spreads out evenly like a wave and is guaranteed to find the shortest path in unweighted graphs. Weights (mud) are ignored.',
  pros: ['Guaranteed shortest path (without weights)', 'Simple and fast per step'],
  cons: ['Ignores weights', 'Visits a lot of cells because it is not goal-directed'],
  pseudocode: [
    'queue = [start]; mark start',
    'while queue is not empty',
    '  node = queue.dequeue()',
    '  if node == goal: return path',
    '  for each neighbour n of node',
    '    if n not seen and not a wall',
    '      mark n; parent[n] = node',
    '      queue.enqueue(n)',
    'return "no path"',
  ],
  run: bfsSearch,
};
