import type { AlgorithmInfo } from '../types';

/**
 * A sorting algorithm does not animate itself; it returns a list of
 * such steps. The UI plays them back (forwards and backwards).
 */
export type SortStep =
  | { type: 'compare'; i: number; j: number; line: number }
  | { type: 'swap'; i: number; j: number; line: number }
  /** Overwrite (Merge Sort). `prev` makes the step reversible. */
  | { type: 'write'; i: number; value: number; prev: number; line: number }
  | { type: 'sorted'; indices: number[]; line: number }
  /** Marks a pivot/minimum element. i = -1 clears the mark. */
  | { type: 'pivot'; i: number; line: number };

export interface SortAlgorithm extends AlgorithmInfo {
  stable: boolean;
  run: (input: readonly number[]) => SortStep[];
}
