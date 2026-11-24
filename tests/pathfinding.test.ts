import { describe, expect, it } from 'vitest';
import {
  createGrid,
  getPathAlgorithm,
  neighbors,
  pathAlgorithms,
  toIndex,
  WALL,
  WEIGHT,
  type GridData,
} from '../src/algorithms/pathfinding';
import { mazeGenerators } from '../src/algorithms/maze';
import { mulberry32 } from '../src/lib/random';

function gridFrom(lines: string[]): GridData {
  const rows = lines.length;
  const cols = lines[0].length;
  const g = createGrid(rows, cols);
  lines.forEach((line, r) =>
    [...line].forEach((ch, c) => {
      const i = toIndex(g, r, c);
      if (ch === '#') g.cells[i] = WALL;
      if (ch === '~') g.cells[i] = WEIGHT;
      if (ch === 'S') g.start = i;
      if (ch === 'E') g.end = i;
    }),
  );
  return g;
}

function isValidPath(g: GridData, path: number[]) {
  if (path[0] !== g.start || path[path.length - 1] !== g.end) return false;
  for (let k = 1; k < path.length; k++) if (!neighbors(g, path[k - 1]).includes(path[k])) return false;
  return true;
}

const open = gridFrom(['S.........', '..........', '..........', '.........E']);

const walled = gridFrom([
  'S...#.....',
  '.##.#.###.',
  '.#..#...#.',
  '.#.####.#.',
  '.#......#E',
]);

const muddy = gridFrom(['S~~~E', '.....', '.....']);

const blocked = gridFrom(['S.#..', '..#..', '..#.E']);

describe.each(pathAlgorithms)('$name', (algo) => {
  it('finds a valid path on an open grid', () => {
    const res = algo.run(open);
    expect(res.found).toBe(true);
    expect(isValidPath(open, res.path)).toBe(true);
  });

  it('finds a valid path around walls', () => {
    const res = algo.run(walled);
    expect(res.found).toBe(true);
    expect(isValidPath(walled, res.path)).toBe(true);
    expect(res.path.every((i) => walled.cells[i] !== WALL)).toBe(true);
  });

  it('reports "no path" when the goal is unreachable', () => {
    const res = algo.run(blocked);
    expect(res.found).toBe(false);
    expect(res.path).toEqual([]);
    expect(res.steps.some((s) => s.type === 'path')).toBe(false);
  });

  it('only references valid pseudocode lines', () => {
    for (const s of algo.run(walled).steps) {
      expect(s.line).toBeGreaterThanOrEqual(0);
      expect(s.line).toBeLessThan(algo.pseudocode.length);
    }
  });

  if (algo.guaranteesShortest) {
    it('finds the shortest path (Manhattan on an open grid)', () => {
      expect(algo.run(open).path.length - 1).toBe(3 + 9);
    });
  }
});

describe('Weights', () => {
  it('Dijkstra and A* avoid expensive mud', () => {
    for (const id of ['dijkstra', 'astar']) {
      const res = getPathAlgorithm(id).run(muddy);
      expect(res.cost).toBe(6); // down, 4× right, up – instead of 3×5 + 1 = 16
    }
  });

  it('BFS ignores weights and walks through the mud', () => {
    const res = getPathAlgorithm('bfs').run(muddy);
    expect(res.path.length - 1).toBe(4);
    expect(res.cost).toBe(16);
  });

  it('A* never visits more cells than Dijkstra and has the same cost', () => {
    const rng = mulberry32(11);
    for (let t = 0; t < 10; t++) {
      const g = createGrid(25, 51);
      const maze = mazeGenerators.find((m) => m.id === 'random')!.generate(g, rng);
      const grid = { ...g, ...maze };
      const d = getPathAlgorithm('dijkstra').run(grid);
      const a = getPathAlgorithm('astar').run(grid);
      expect(a.found).toBe(d.found);
      expect(a.cost).toBe(d.cost);
      const visits = (r: typeof d) => r.steps.filter((s) => s.type === 'visit').length;
      expect(visits(a)).toBeLessThanOrEqual(visits(d));
    }
  });
});
