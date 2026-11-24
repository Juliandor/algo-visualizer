import { EMPTY, WALL, WEIGHT, WEIGHT_COST, type GridData, type PathResult, type PathStep } from './types';

export const toIndex = (grid: Pick<GridData, 'cols'>, row: number, col: number) => row * grid.cols + col;
export const rowOf = (grid: Pick<GridData, 'cols'>, i: number) => Math.floor(i / grid.cols);
export const colOf = (grid: Pick<GridData, 'cols'>, i: number) => i % grid.cols;

export function createGrid(rows: number, cols: number): GridData {
  const midRow = Math.floor(rows / 2);
  const offset = Math.max(1, Math.floor(cols / 5));
  return {
    rows,
    cols,
    cells: new Uint8Array(rows * cols).fill(EMPTY),
    start: midRow * cols + offset,
    end: midRow * cols + (cols - 1 - offset),
  };
}

/** Walkable neighbours in the order up, right, down, left. */
export function neighbors(grid: GridData, i: number): number[] {
  const r = rowOf(grid, i);
  const c = colOf(grid, i);
  const out: number[] = [];
  if (r > 0) out.push(i - grid.cols);
  if (c < grid.cols - 1) out.push(i + 1);
  if (r < grid.rows - 1) out.push(i + grid.cols);
  if (c > 0) out.push(i - 1);
  return out.filter((n) => grid.cells[n] !== WALL);
}

export const cellCost = (grid: GridData, i: number) => (grid.cells[i] === WEIGHT ? WEIGHT_COST : 1);

export function manhattan(grid: GridData, a: number, b: number): number {
  return Math.abs(rowOf(grid, a) - rowOf(grid, b)) + Math.abs(colOf(grid, a) - colOf(grid, b));
}

export function reconstructPath(parent: Int32Array, start: number, end: number): number[] {
  const path: number[] = [];
  let cur = end;
  while (cur !== -1) {
    path.push(cur);
    if (cur === start) break;
    cur = parent[cur];
  }
  path.reverse();
  return path[0] === start ? path : [];
}

export function pathCost(grid: GridData, path: number[]): number {
  let cost = 0;
  for (let k = 1; k < path.length; k++) cost += cellCost(grid, path[k]);
  return cost;
}

/** Builds the result and appends the path steps for the yellow animation. */
export function buildResult(
  grid: GridData,
  steps: PathStep[],
  parent: Int32Array,
  found: boolean,
  line: number,
): PathResult {
  if (!found) return { steps, path: [], found: false, cost: 0 };
  const path = reconstructPath(parent, grid.start, grid.end);
  for (const node of path) steps.push({ type: 'path', node, line });
  return { steps, path, found: true, cost: pathCost(grid, path) };
}
