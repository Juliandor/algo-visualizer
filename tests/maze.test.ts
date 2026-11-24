import { describe, expect, it } from 'vitest';
import { mazeGenerators } from '../src/algorithms/maze';
import { createGrid, getPathAlgorithm, WALL } from '../src/algorithms/pathfinding';
import { mulberry32 } from '../src/lib/random';

const perfect = mazeGenerators.filter((m) => m.id === 'backtracking' || m.id === 'division');

describe.each(mazeGenerators)('$name', (gen) => {
  it('keeps start and goal free and preserves the grid size', () => {
    const g = createGrid(25, 51);
    const maze = gen.generate(g, mulberry32(5));
    expect(maze.cells.length).toBe(25 * 51);
    expect(maze.cells[maze.start]).not.toBe(WALL);
    expect(maze.cells[maze.end]).not.toBe(WALL);
    expect(maze.start).not.toBe(maze.end);
  });
});

describe.each(perfect)('$name (perfect maze)', (gen) => {
  it.each([
    [25, 51],
    [27, 19],
    [24, 50],
  ])('start and goal are always connected (%i×%i)', (rows, cols) => {
    for (let seed = 1; seed <= 20; seed++) {
      const g = createGrid(rows, cols);
      const maze = gen.generate(g, mulberry32(seed));
      const res = getPathAlgorithm('bfs').run({ ...g, ...maze });
      expect(res.found).toBe(true);
    }
  });

  it('actually creates walls', () => {
    const maze = gen.generate(createGrid(25, 51), mulberry32(1));
    const walls = maze.cells.reduce((n, c) => n + (c === WALL ? 1 : 0), 0);
    expect(walls).toBeGreaterThan(200);
  });
});
