import { SortRecorder } from './recorder';
import type { SortAlgorithm } from './types';

export function selectionSortSteps(input: readonly number[]) {
  const r = new SortRecorder(input);
  const n = r.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.pivot(min, 1);
    for (let j = i + 1; j < n; j++) {
      if (r.compare(j, min, 3) < 0) {
        min = j;
        r.pivot(min, 4);
      }
    }
    if (min !== i) r.swap(i, min, 5);
    r.pivot(-1, 6);
    r.sorted(i, 6);
  }
  return r.finish(6);
}

export const selectionSort: SortAlgorithm = {
  id: 'selection',
  name: 'Selection Sort',
  stable: false,
  complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  description:
    'Scans the unsorted part for the minimum (marked orange) and swaps it to the front. The sorted part grows from left to right.',
  pros: ['Simple', 'At most n-1 swaps – good when writes are expensive'],
  cons: ['Always O(n²) comparisons, even on sorted data', 'Not stable'],
  pseudocode: [
    'for i = 0 to n-2',
    '  min = i',
    '  for j = i+1 to n-1',
    '    if a[j] < a[min]',
    '      min = j',
    '  swap(a[i], a[min])',
    '  a[i] is in its final position',
  ],
  run: selectionSortSteps,
};
