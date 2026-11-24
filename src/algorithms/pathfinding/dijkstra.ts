import { buildResult, cellCost, neighbors } from './grid';
import { PriorityQueue } from './priorityQueue';
import type { GridData, PathAlgorithm, PathStep } from './types';

export function dijkstraSearch(grid: GridData) {
  const n = grid.rows * grid.cols;
  const parent = new Int32Array(n).fill(-1);
  const dist = new Float64Array(n).fill(Infinity);
  const done = new Uint8Array(n);
  const steps: PathStep[] = [];
  const pq = new PriorityQueue();
  dist[grid.start] = 0;
  pq.push(grid.start, 0);
  steps.push({ type: 'frontier', node: grid.start, line: 0 });

  while (pq.size > 0) {
    const node = pq.pop()!;
    if (done[node]) continue;
    done[node] = 1;
    steps.push({ type: 'visit', node, line: 2 });
    if (node === grid.end) return buildResult(grid, steps, parent, true, 4);
    for (const nb of neighbors(grid, node)) {
      if (done[nb]) continue;
      const alt = dist[node] + cellCost(grid, nb);
      if (alt < dist[nb]) {
        dist[nb] = alt;
        parent[nb] = node;
        pq.push(nb, alt);
        steps.push({ type: 'frontier', node: nb, line: 8 });
      }
    }
  }
  return buildResult(grid, steps, parent, false, 9);
}

export const dijkstra: PathAlgorithm = {
  id: 'dijkstra',
  name: 'Dijkstra',
  weighted: true,
  guaranteesShortest: true,
  complexity: { best: 'O(1)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)', space: 'O(V)' },
  description:
    'Dijkstra always expands the cell with the lowest total cost so far (using a priority queue). That way it finds the cheapest path even with weights – mud cells cost 5 instead of 1.',
  pros: ['Guaranteed cheapest path with non-negative weights', 'Foundation of many route planners'],
  cons: ['Searches in every direction at once – not goal-directed', 'Does not work with negative weights'],
  pseudocode: [
    'dist[*] = ∞; dist[start] = 0; pq = {start}',
    'while pq is not empty',
    '  node = pq.extractMin()',
    '  if node is done: continue',
    '  if node == goal: return path',
    '  for each neighbour n of node',
    '    alt = dist[node] + cost(n)',
    '    if alt < dist[n]',
    '      dist[n] = alt; parent[n] = node; pq.insert(n, alt)',
    'return "no path"',
  ],
  run: dijkstraSearch,
};
