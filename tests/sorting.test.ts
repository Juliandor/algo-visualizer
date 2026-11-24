import { describe, expect, it } from 'vitest';
import { sortAlgorithms } from '../src/algorithms/sorting';
import { applyAllSteps, createSortRun } from '../src/lib/sortRun';
import { generateArray, mulberry32, type Distribution } from '../src/lib/random';

const sorted = (a: number[]) => a.slice().sort((x, y) => x - y);

const cases: number[][] = [
  [],
  [1],
  [2, 1],
  [3, 1, 2],
  [5, 5, 5, 5],
  [1, 2, 3, 4, 5, 6],
  [9, 8, 7, 6, 5, 4, 3, 2, 1],
  [4, 1, 3, 1, 2, 4, 2, 3],
];

describe.each(sortAlgorithms)('$name', (algo) => {
  it('sorts edge cases correctly (just by replaying the steps)', () => {
    for (const input of cases) {
      expect(applyAllSteps(input, algo.run(input))).toEqual(sorted(input));
    }
  });

  it('sorts random arrays of every distribution', () => {
    const rng = mulberry32(42);
    const dists: Distribution[] = ['random', 'nearly', 'reversed', 'few'];
    for (const dist of dists) {
      for (const n of [10, 37, 120]) {
        const input = generateArray(n, dist, rng);
        expect(applyAllSteps(input, algo.run(input))).toEqual(sorted(input));
      }
    }
  });

  it('does not mutate the input array', () => {
    const input = [3, 2, 1];
    algo.run(input);
    expect(input).toEqual([3, 2, 1]);
  });

  it('marks every position as sorted exactly once', () => {
    const input = generateArray(50, 'random', mulberry32(7));
    const steps = algo.run(input);
    const marked = steps.flatMap((s) => (s.type === 'sorted' ? s.indices : []));
    expect(marked.slice().sort((a, b) => a - b)).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });

  it('only references valid pseudocode lines', () => {
    const steps = algo.run(generateArray(30, 'random', mulberry32(3)));
    for (const s of steps) {
      expect(s.line).toBeGreaterThanOrEqual(0);
      expect(s.line).toBeLessThan(algo.pseudocode.length);
    }
  });

  it('can seek forwards and backwards', () => {
    const input = generateArray(40, 'random', mulberry32(9));
    const run = createSortRun(algo, input);
    const end = run.player.seek(run.steps.length).slice();
    expect(end).toEqual(sorted(input));
    expect(run.player.seek(0)).toEqual(input);
    run.player.seek(Math.floor(run.steps.length / 2));
    expect(run.player.seek(run.steps.length)).toEqual(end);
  });
});

describe('Stats', () => {
  it('Bubble Sort needs only n-1 comparisons on sorted data', () => {
    const run = createSortRun(sortAlgorithms[0], [1, 2, 3, 4, 5]);
    expect(run.comparisons[run.steps.length]).toBe(4);
    expect(run.swaps[run.steps.length]).toBe(0);
  });

  it('Selection Sort swaps at most n-1 times', () => {
    const algo = sortAlgorithms.find((a) => a.id === 'selection')!;
    const input = generateArray(60, 'random', mulberry32(1));
    const run = createSortRun(algo, input);
    expect(run.swaps[run.steps.length]).toBeLessThanOrEqual(59);
  });
});
