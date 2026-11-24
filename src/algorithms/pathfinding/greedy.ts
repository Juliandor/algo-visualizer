import { buildResult, manhattan, neighbors } from './grid';
import { PriorityQueue } from './priorityQueue';
import type { GridData, PathAlgorithm, PathStep } from './types';

export function greedySearch(grid: GridData) {
  const n = grid.rows * grid.cols;
  const parent = new Int32Array(n).fill(-1);
  const seen = new Uint8Array(n);
  const visited = new Uint8Array(n);
  const steps: PathStep[] = [];
  const open = new PriorityQueue();
  const h = (i: number) => manhattan(grid, i, grid.end);
  open.push(grid.start, h(grid.start));
  seen[grid.start] = 1;
  steps.push({ type: 'frontier', node: grid.start, line: 0 });

  while (open.size > 0) {
    const node = open.pop()!;
    if (visited[node]) continue;
    visited[node] = 1;
    steps.push({ type: 'visit', node, line: 2 });
    if (node === grid.end) return buildResult(grid, steps, parent, true, 4);
    for (const nb of neighbors(grid, node)) {
      if (seen[nb]) continue;
      seen[nb] = 1;
      parent[nb] = node;
      open.push(nb, h(nb));
      steps.push({ type: 'frontier', node: nb, line: 7 });
    }
  }
  return buildResult(grid, steps, parent, false, 8);
}

export const greedy: PathAlgorithm = {
  id: 'greedy',
  name: 'Greedy Best-First',
  weighted: false,
  guaranteesShortest: false,
  complexity: { best: 'O(d)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)', space: 'O(V)' },
  description:
    'Greedy best-first search only looks at the heuristic h – “how close am I to the goal?” – and ignores the cost travelled so far. It often races straight to the goal, but obstacles lead it into dead ends and it does not always return the shortest path.',
  pros: ['Very fast, often visits extremely few cells', 'Simple'],
  cons: ['No guaranteed shortest path', 'Ignores weights', 'Easily misled by obstacles'],
  pseudocode: [
    'open = {start} with priority h(start)',
    'while open is not empty',
    '  node = open.extractMin()  // smallest h',
    '  if node visited: continue; mark node',
    '  if node == goal: return path',
    '  for each neighbour n of node',
    '    if n not seen and not a wall',
    '      parent[n] = node; open.insert(n, h(n))',
    'return "no path"',
  ],
  run: greedySearch,
};
