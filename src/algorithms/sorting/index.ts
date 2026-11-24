import { bubbleSort } from './bubble';
import { heapSort } from './heap';
import { insertionSort } from './insertion';
import { mergeSort } from './merge';
import { quickSort } from './quick';
import { selectionSort } from './selection';
import type { SortAlgorithm } from './types';

export const sortAlgorithms: SortAlgorithm[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
];

export const getSortAlgorithm = (id: string): SortAlgorithm =>
  sortAlgorithms.find((a) => a.id === id) ?? sortAlgorithms[0];

export * from './types';
