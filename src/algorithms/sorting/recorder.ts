import type { SortStep } from './types';

/**
 * Helper: works on a copy of the array and records every
 * operation as a step. Keeps the algorithms short and readable.
 */
export class SortRecorder {
  readonly steps: SortStep[] = [];
  readonly a: number[];
  private readonly marked: boolean[];
  private pivotActive = false;

  constructor(input: readonly number[]) {
    this.a = input.slice();
    this.marked = new Array<boolean>(input.length).fill(false);
  }

  get length(): number {
    return this.a.length;
  }

  /** Compares a[i] with a[j]; returns < 0, 0 or > 0. */
  compare(i: number, j: number, line: number): number {
    this.steps.push({ type: 'compare', i, j, line });
    return this.a[i] - this.a[j];
  }

  /** Comparison with explicitly passed values (e.g. from an auxiliary array). */
  compareValues(i: number, j: number, vi: number, vj: number, line: number): number {
    this.steps.push({ type: 'compare', i, j, line });
    return vi - vj;
  }

  swap(i: number, j: number, line: number): void {
    this.steps.push({ type: 'swap', i, j, line });
    const t = this.a[i];
    this.a[i] = this.a[j];
    this.a[j] = t;
  }

  write(i: number, value: number, line: number): void {
    this.steps.push({ type: 'write', i, value, prev: this.a[i], line });
    this.a[i] = value;
  }

  pivot(i: number, line: number): void {
    this.pivotActive = i >= 0;
    this.steps.push({ type: 'pivot', i, line });
  }

  /** Marks positions as final (each only once). */
  sorted(indices: number | number[], line: number): void {
    const list = (Array.isArray(indices) ? indices : [indices]).filter(
      (i) => i >= 0 && i < this.a.length && !this.marked[i],
    );
    if (list.length === 0) return;
    for (const i of list) this.marked[i] = true;
    this.steps.push({ type: 'sorted', indices: list, line });
  }

  /** Finishes: clears the pivot mark and marks the rest as sorted. */
  finish(line: number): SortStep[] {
    if (this.pivotActive) this.pivot(-1, line);
    const rest: number[] = [];
    for (let i = 0; i < this.a.length; i++) if (!this.marked[i]) rest.push(i);
    this.sorted(rest, line);
    return this.steps;
  }
}

export const range = (from: number, to: number): number[] => {
  const out: number[] = [];
  for (let i = from; i < to; i++) out.push(i);
  return out;
};
