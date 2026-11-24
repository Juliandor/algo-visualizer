/** Every algorithm has its own colour – used for tags, the visit wave and progress. */
export const algoColors: Record<string, string> = {
  // Pathfinding
  bfs: '#3fc1f0',
  dfs: '#ff5fa2',
  dijkstra: '#7b5cff',
  astar: '#22c39a',
  greedy: '#ff8c42',
  // Sorting
  bubble: '#3fc1f0',
  selection: '#ff5fa2',
  insertion: '#ff8c42',
  merge: '#7b5cff',
  quick: '#22c39a',
  heap: '#e0457b',
};

export const colorOf = (id: string) => algoColors[id] ?? '#7b5cff';
