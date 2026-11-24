# Algorithm Playground

An interactive, colourful visualiser for **pathfinding** and **sorting algorithms** – with step-by-step playback, live pseudocode highlighting, a side-by-side compare mode and sound.

**Live demo:** https://juliandor.github.io/algo-visualizer/

## Features

### Pathfinding
- A 51 × 25 grid (19 × 27 on phones) with a start 🟢 and goal 🔴 – both can be dragged around
- Draw walls and **mud cells** (cost 5) with the mouse or your finger
- Algorithms: **BFS, DFS, Dijkstra, A\*, Greedy Best-First**
- Mazes: **Recursive Backtracking, Recursive Division, random walls, scattered mud**
- Visited cells light up in a wave in each algorithm's own colour; the final path glows yellow
- **Live mode:** once a run has finished, drag the start/goal or paint walls and the path is recomputed instantly

### Sorting
- 10–200 bars; starting data: random, nearly sorted, reversed, few unique values
- **Bubble, Selection, Insertion, Merge, Quick and Heap Sort**
- 🟨 comparing · 🟥 swapping/writing · 🟧 pivot/minimum · 🟩 final position
- **Sound:** every bar plays a note matching its height, plus a “done” sweep at the end (left/right in stereo in compare mode)

### Both visualisers
- **Stats:** comparisons, swaps and writes, or cells visited, path length, path cost and compute time
- **Compare mode:** two algorithms side by side on the same data (e.g. Dijkstra vs. A\*) – the winner gets a ★
- **Pseudocode** with the line currently executing highlighted
- **Playback:** play/pause, step back/forward, progress scrubber, speed from 1 to 3000 steps per second
- Keyboard: `Space` play/pause, `←`/`→` step
- An explanation for every algorithm (complexity, pros and cons)
- Desktop layout that fits one screen, responsive down to phones, light and dark mode

## Architecture

The algorithms **never animate anything themselves**. They are pure functions that return a list of steps:

```ts
quickSort.run([3, 1, 2]);
// → [{ type: 'swap', i: 1, j: 2, line: 2 }, { type: 'pivot', i: 2, line: 2 },
//    { type: 'compare', i: 0, j: 2, line: 5 }, ...]
```

`useAnimation` only knows an index *k* and plays the list back. That gives us:

- **Testability:** tests replay the steps and check the result – no DOM required.
- **Rewinding:** sorting steps are reversible (`swap` is its own inverse, `write` stores `prev`). For pathfinding we store, per cell, *the step in which* it was visited – the state at step k is simply `visitedAt[cell] < k`.
- **Speed, pause and compare mode** work identically for every algorithm.

```
src/
├── algorithms/
│   ├── pathfinding/   bfs, dfs, dijkstra, astar, greedy, grid, priorityQueue
│   ├── sorting/       bubble, selection, insertion, merge, quick, heap, recorder
│   └── maze/          recursiveBacktracking, recursiveDivision, random
├── components/        Grid, Node, BarChart, ControlPanel, PlaybackControls, Workspace,
│                      StatsPanel, PseudocodePanel, InfoPanel, Legend
├── hooks/             useAnimation, useTheme, usePlaybackKeys
├── lib/               pathRun, sortRun, sound, random, palette
├── views/             PathfindingView, SortingView
└── App.tsx
tests/                 Unit tests for every algorithm and maze generator (Vitest)
```

## Development

```bash
npm install
npm run dev        # dev server
npm test           # unit tests
npm run build      # production build into dist/
```

## Deployment

**GitHub Pages:** push the repository to GitHub, then under *Settings → Pages → Source* choose “GitHub Actions”. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes on every push to `main`.

**Vercel:** import the repository – Vite is detected automatically (build: `npm run build`, output: `dist`).

Tech stack: React 19 · TypeScript · Vite · Tailwind CSS 4 · Vitest
