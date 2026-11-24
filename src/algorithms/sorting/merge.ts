import { SortRecorder } from './recorder';
import type { SortAlgorithm } from './types';

export function mergeSortSteps(input: readonly number[]) {
  const r = new SortRecorder(input);
  const n = r.length;
  const a = r.a;

  const merge = (lo: number, mid: number, hi: number) => {
    const aux = a.slice(lo, hi + 1);
    const isFinal = lo === 0 && hi === n - 1;
    let i = lo;
    let j = mid + 1;
    let k = lo;
    while (i <= mid && j <= hi) {
      const vi = aux[i - lo];
      const vj = aux[j - lo];
      if (r.compareValues(i, j, vi, vj, 4) <= 0) {
        r.write(k, vi, 5);
        i++;
      } else {
        r.write(k, vj, 6);
        j++;
      }
      if (isFinal) r.sorted(k, 8);
      k++;
    }
    while (i <= mid) {
      r.write(k, aux[i - lo], 7);
      if (isFinal) r.sorted(k, 8);
      i++;
      k++;
    }
    while (j <= hi) {
      r.write(k, aux[j - lo], 7);
      if (isFinal) r.sorted(k, 8);
      j++;
      k++;
    }
  };

  const sort = (lo: number, hi: number) => {
    if (hi - lo < 1) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };

  sort(0, n - 1);
  return r.finish(8);
}

export const mergeSort: SortAlgorithm = {
  id: 'merge',
  name: 'Merge Sort',
  stable: true,
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  description:
    'Divide and conquer: the array is halved recursively until only single elements remain. The sorted halves are then zipped back together.',
  pros: ['Guaranteed O(n log n)', 'Stable', 'Ideal for linked lists and external sorting'],
  cons: ['Needs O(n) extra memory', 'Often a bit slower than Quick Sort in practice'],
  pseudocode: [
    'mergeSort(lo, hi):',
    '  if hi - lo < 1: return',
    '  mid = (lo + hi) / 2',
    '  mergeSort(lo, mid); mergeSort(mid+1, hi)',
    '  while left and right are not empty',
    '    if left[i] ≤ right[j]: a[k] = left[i++]',
    '    else: a[k] = right[j++]',
    '  copy what is left of the other half',
    '  (last merge: positions are final)',
  ],
  run: mergeSortSteps,
};
