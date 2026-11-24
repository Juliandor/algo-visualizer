import { SortRecorder } from './recorder';
import type { SortAlgorithm } from './types';

export function heapSortSteps(input: readonly number[]) {
  const r = new SortRecorder(input);
  const n = r.length;

  const siftDown = (start: number, size: number) => {
    let i = start;
    for (;;) {
      const left = 2 * i + 1;
      const right = left + 1;
      let largest = i;
      if (left < size && r.compare(left, largest, 5) > 0) largest = left;
      if (right < size && r.compare(right, largest, 5) > 0) largest = right;
      if (largest === i) return;
      r.swap(i, largest, 6);
      i = largest;
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  for (let end = n - 1; end > 0; end--) {
    r.swap(0, end, 2);
    r.sorted(end, 2);
    siftDown(0, end);
  }
  return r.finish(2);
}

export const heapSort: SortAlgorithm = {
  id: 'heap',
  name: 'Heap Sort',
  stable: false,
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
  description:
    'First builds a max-heap (a binary tree stored in the array where every parent is larger than its children). It then repeatedly swaps the largest element (the root) to the end and repairs the heap.',
  pros: ['Guaranteed O(n log n)', 'No extra memory'],
  cons: ['Not stable', 'Jumpy memory access – often slower than Quick Sort'],
  pseudocode: [
    'for i = n/2-1 down to 0: siftDown(i, n)  // build heap',
    'for end = n-1 down to 1',
    '  swap(a[0], a[end]); a[end] is sorted',
    '  siftDown(0, end)',
    'siftDown(i, size):',
    '  largest = largest of a[i], a[2i+1], a[2i+2]',
    '  if largest ≠ i: swap(a[i], a[largest]); continue at largest',
  ],
  run: heapSortSteps,
};
