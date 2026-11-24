import { SortRecorder } from './recorder';
import type { SortAlgorithm } from './types';

export function quickSortSteps(input: readonly number[]) {
  const r = new SortRecorder(input);

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      r.sorted(lo, 1);
      return;
    }
    // Middle element as pivot (avoids O(n²) on sorted data), moved to the end.
    const mid = Math.floor((lo + hi) / 2);
    if (mid !== hi) r.swap(mid, hi, 2);
    r.pivot(hi, 2);
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (r.compare(j, hi, 5) < 0) {
        if (i !== j) r.swap(i, j, 6);
        i++;
      }
    }
    if (i !== hi) r.swap(i, hi, 7);
    r.pivot(-1, 7);
    r.sorted(i, 7);
    sort(lo, i - 1);
    sort(i + 1, hi);
  };

  sort(0, r.length - 1);
  return r.finish(8);
}

export const quickSort: SortAlgorithm = {
  id: 'quick',
  name: 'Quick Sort',
  stable: false,
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
  description:
    'Picks a pivot (orange) and partitions the array so that all smaller values end up left of it and all larger ones right of it. The pivot is then in its final position and both sides are sorted recursively.',
  pros: ['Usually the fastest comparison sort in practice', 'In-place and cache-friendly'],
  cons: ['Worst case O(n²) with a bad pivot', 'Not stable'],
  pseudocode: [
    'quickSort(lo, hi):',
    '  if lo >= hi: return',
    '  pivot = a[middle] → swap to the end',
    '  i = lo',
    '  for j = lo to hi-1',
    '    if a[j] < pivot',
    '      swap(a[i], a[j]); i = i + 1',
    '  swap(a[i], a[hi])  // pivot in final position',
    '  quickSort(lo, i-1); quickSort(i+1, hi)',
  ],
  run: quickSortSteps,
};
