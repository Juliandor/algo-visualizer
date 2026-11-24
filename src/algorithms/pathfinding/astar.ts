import { buildResult, cellCost, manhattan, neighbors } from './grid';
import { PriorityQueue } from './priorityQueue';
import type { GridData, PathAlgorithm, PathStep } from './types';

export function astarSearch(grid: GridData) {
  const n = grid.rows * grid.cols;
  const parent = new Int32Array(n).fill(-1);
  const g = new Float64Array(n).fill(Infinity);
  const closed = new Uint8Array(n);
  const steps: PathStep[] = [];
  const open = new PriorityQueue();
  const h = (i: number) => manhattan(grid, i, grid.end);
  g[grid.start] = 0;
  open.push(grid.start, h(grid.start), h(grid.start));
  steps.push({ type: 'frontier', node: grid.start, line: 0 });

  while (open.size > 0) {
    const node = open.pop()!;
    if (closed[node]) continue;
    closed[node] = 1;
    steps.push({ type: 'visit', node, line: 2 });
    if (node === grid.end) return buildResult(grid, steps, parent, true, 4);
    for (const nb of neighbors(grid, node)) {
      if (closed[nb]) continue;
      const tentative = g[node] + cellCost(grid, nb);
      if (tentative < g[nb]) {
        g[nb] = tentative;
        parent[nb] = node;
        const hn = h(nb);
        // Tie-break on h: with equal f, prefer the cell closer to the goal.
        open.push(nb, tentative + hn, hn);
        steps.push({ type: 'frontier', node: nb, line: 8 });
      }
    }
  }
  return buildResult(grid, steps, parent, false, 9);
}

export const astar: PathAlgorithm = {
  id: 'astar',
  name: 'A* Search',
  weighted: true,
  guaranteesShortest: true,
  complexity: { best: 'O(d)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)', space: 'O(V)' },
  description:
    'A* works like Dijkstra but orders cells by f = g + h: the cost so far g plus an estimate h of the remaining distance (Manhattan distance). Because h “aims” at the goal, A* visits visibly fewer cells and is still optimal.',
  pros: ['Optimal with an admissible heuristic', 'Usually far fewer visited cells than Dijkstra', 'Standard in games and navigation'],
  cons: ['Needs a good heuristic', 'With a poor heuristic it is no better than Dijkstra'],
  pseudocode: [
    'g[start] = 0; open = {start} with f = h(start)',
    'while open is not empty',
    '  node = open.extractMin()  // smallest f = g + h',
    '  if node in closed: continue; closed.add(node)',
    '  if node == goal: return path',
    '  for each neighbour n of node',
    '    t = g[node] + cost(n)',
    '    if t < g[n]',
    '      g[n] = t; parent[n] = node; open.insert(n, t + h(n))',
    'return "no path"',
  ],
  run: astarSearch,
};
