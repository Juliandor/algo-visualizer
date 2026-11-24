import { SortRecorder, range } from './recorder';
import type { SortAlgorithm } from './types';

export function bubbleSortSteps(input: readonly number[]) {
  const r = new SortRecorder(input);
  const n = r.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (r.compare(j, j + 1, 3) > 0) {
        r.swap(j, j + 1, 4);
        swapped = true;
      }
    }
    r.sorted(n - i - 1, 5);
    if (!swapped) {
      r.sorted(range(0, n - i - 1), 6);
      break;
    }
  }
  return r.finish(6);
}

export const bubbleSort: SortAlgorithm = {
  id: 'bubble',
  name: 'Bubble Sort',
  stable: true,
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  description:
    'Compares neighbouring elements and swaps them when they are in the wrong order. After every pass the largest remaining element has reached the far right – it “bubbles” up.',
  pros: ['Extremely easy to understand', 'Stable and in-place', 'Detects already sorted data in O(n)'],
  cons: ['Very slow on large arrays', 'Lots of swaps'],
  pseudocode: [
    'for i = 0 to n-1',
    '  swapped = false',
    '  for j = 0 to n-i-2',
    '    if a[j] > a[j+1]',
    '      swap(a[j], a[j+1]); swapped = true',
    '  a[n-i-1] is in its final position',
    '  if not swapped: break  // rest is sorted',
  ],
  run: bubbleSortSteps,
};
