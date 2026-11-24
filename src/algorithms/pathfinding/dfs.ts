import { buildResult, neighbors } from './grid';
import type { GridData, PathAlgorithm, PathStep } from './types';

export function dfsSearch(grid: GridData) {
  const n = grid.rows * grid.cols;
  const parent = new Int32Array(n).fill(-1);
  const visited = new Uint8Array(n);
  const steps: PathStep[] = [];
  const stack: number[] = [grid.start];
  steps.push({ type: 'frontier', node: grid.start, line: 0 });

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited[node]) continue;
    visited[node] = 1;
    steps.push({ type: 'visit', node, line: 4 });
    if (node === grid.end) return buildResult(grid, steps, parent, true, 5);
    // Push in reverse so the first direction (up) is explored first.
    const nbs = neighbors(grid, node);
    for (let k = nbs.length - 1; k >= 0; k--) {
      const nb = nbs[k];
      if (visited[nb]) continue;
      parent[nb] = node;
      stack.push(nb);
      steps.push({ type: 'frontier', node: nb, line: 8 });
    }
  }
  return buildResult(grid, steps, parent, false, 9);
}

export const dfs: PathAlgorithm = {
  id: 'dfs',
  name: 'DFS (Depth-First Search)',
  weighted: false,
  guaranteesShortest: false,
  complexity: { best: 'O(1)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
  description:
    'Depth-first search uses a LIFO stack to follow one direction as far as possible before backtracking. It looks “chaotic” and usually does not find the shortest path.',
  pros: ['Little memory on deep, narrow graphs', 'Basis for maze generation, cycle detection and topological sorting'],
  cons: ['No guaranteed shortest path', 'Ignores weights', 'Can take long detours'],
  pseudocode: [
    'stack = [start]',
    'while stack is not empty',
    '  node = stack.pop()',
    '  if node visited: continue',
    '  mark node as visited',
    '  if node == goal: return path',
    '  for each neighbour n of node',
    '    if n not visited and not a wall',
    '      parent[n] = node; stack.push(n)',
    'return "no path"',
  ],
  run: dfsSearch,
};
