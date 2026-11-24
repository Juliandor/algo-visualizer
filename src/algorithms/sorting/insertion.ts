import { SortRecorder } from './recorder';
import type { SortAlgorithm } from './types';

export function insertionSortSteps(input: readonly number[]) {
  const r = new SortRecorder(input);
  const n = r.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && r.compare(j - 1, j, 2) > 0) {
      r.swap(j - 1, j, 3);
      j--;
    }
  }
  return r.finish(5);
}

export const insertionSort: SortAlgorithm = {
  id: 'insertion',
  name: 'Insertion Sort',
  stable: true,
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  description:
    'Sorts like a hand of playing cards: each new element is shifted left until it sits in the right place within the already sorted part.',
  pros: ['Very fast on nearly sorted data', 'Stable, in-place, online', 'Used inside hybrids (Timsort) for small runs'],
  cons: ['O(n²) on random or reversed data'],
  pseudocode: [
    'for i = 1 to n-1',
    '  j = i',
    '  while j > 0 and a[j-1] > a[j]',
    '    swap(a[j-1], a[j])',
    '    j = j - 1',
    'done: every element is sorted',
  ],
  run: insertionSortSteps,
};
