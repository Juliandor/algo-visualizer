import type { SortAlgorithm, SortStep } from '../algorithms/sorting/types';

const NEVER = 0x7fffffff;

/**
 * Replays sorting steps on an array. Because swap and write (with prev)
 * are reversible, seek() can jump forwards and backwards efficiently.
 */
export class SortPlayer {
  readonly arr: number[];
  private pos = 0;

  constructor(
    initial: readonly number[],
    private readonly steps: SortStep[],
  ) {
    this.arr = initial.slice();
  }

  seek(k: number): number[] {
    const target = Math.max(0, Math.min(k, this.steps.length));
    while (this.pos < target) this.apply(this.steps[this.pos++], false);
    while (this.pos > target) this.apply(this.steps[--this.pos], true);
    return this.arr;
  }

  private apply(step: SortStep, undo: boolean) {
    const a = this.arr;
    if (step.type === 'swap') {
      const t = a[step.i];
      a[step.i] = a[step.j];
      a[step.j] = t;
    } else if (step.type === 'write') {
      a[step.i] = undo ? step.prev : step.value;
    }
  }
}

/** Everything the UI needs for one run – precomputed. */
export interface SortRun {
  algo: SortAlgorithm;
  initial: number[];
  steps: SortStep[];
  /** Algorithm runtime (including step recording) in ms */
  ms: number;
  /** Prefix sums: value after k steps */
  comparisons: Int32Array;
  swaps: Int32Array;
  writes: Int32Array;
  /** Step index from which a position is final */
  sortedAt: Int32Array;
  /** active pivot after k steps (-1 = none) */
  pivotAt: Int32Array;
  player: SortPlayer;
}

export function createSortRun(algo: SortAlgorithm, initial: number[]): SortRun {
  const t0 = performance.now();
  const steps = algo.run(initial);
  const ms = performance.now() - t0;

  const len = steps.length;
  const comparisons = new Int32Array(len + 1);
  const swaps = new Int32Array(len + 1);
  const writes = new Int32Array(len + 1);
  const pivotAt = new Int32Array(len + 1);
  const sortedAt = new Int32Array(initial.length).fill(NEVER);
  pivotAt[0] = -1;

  for (let k = 0; k < len; k++) {
    const s = steps[k];
    comparisons[k + 1] = comparisons[k] + (s.type === 'compare' ? 1 : 0);
    swaps[k + 1] = swaps[k] + (s.type === 'swap' ? 1 : 0);
    writes[k + 1] = writes[k] + (s.type === 'write' ? 1 : 0);
    pivotAt[k + 1] = s.type === 'pivot' ? s.i : pivotAt[k];
    if (s.type === 'sorted') for (const i of s.indices) if (sortedAt[i] === NEVER) sortedAt[i] = k;
  }

  return {
    algo,
    initial,
    steps,
    ms,
    comparisons,
    swaps,
    writes,
    sortedAt,
    pivotAt,
    player: new SortPlayer(initial, steps),
  };
}

/** Applies all steps (handy for tests). */
export function applyAllSteps(initial: readonly number[], steps: SortStep[]): number[] {
  return new SortPlayer(initial, steps).seek(steps.length).slice();
}
