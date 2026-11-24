import { useRef, useState } from 'react';
import { getMazeGenerator, mazeGenerators } from '../algorithms/maze';
import {
  createGrid,
  EMPTY,
  getPathAlgorithm,
  pathAlgorithms,
  WALL,
  WEIGHT,
  WEIGHT_COST,
  type GridData,
} from '../algorithms/pathfinding';
import { AlgoPicker, Button, ControlPanel, Section, Segmented, Toggle } from '../components/ControlPanel';
import { Grid } from '../components/Grid';
import { InfoPanel } from '../components/InfoPanel';
import { Legend } from '../components/Legend';
import { PlaybackControls } from '../components/PlaybackControls';
import { PseudocodePanel } from '../components/PseudocodePanel';
import { StatsPanel, type StatRow } from '../components/StatsPanel';
import { StageSlot, Workspace } from '../components/Workspace';
import { useAnimation } from '../hooks/useAnimation';
import { usePlaybackKeys } from '../hooks/usePlaybackKeys';
import { colorOf } from '../lib/palette';
import { createPathRun, type PathRun } from '../lib/pathRun';

type Brush = 'wall' | 'weight';
type DragMode = 'start' | 'end' | 'paint' | 'erase' | null;

const initialGrid = () => (window.innerWidth < 640 ? createGrid(27, 19) : createGrid(25, 51));

const algoOptions = pathAlgorithms.map((a) => ({
  id: a.id,
  name: a.name.replace(/ \(.*\)/, ''),
  hint: a.guaranteesShortest
    ? a.weighted
      ? 'Shortest path, handles mud'
      : 'Shortest path, ignores mud'
    : 'Not always the shortest',
}));

const mazeIcons: Record<string, string> = {
  backtracking: '🌀',
  division: '🧱',
  random: '🎲',
  weights: '🟫',
};

export function PathfindingView() {
  const [grid, setGrid] = useState<GridData>(initialGrid);
  const [algoA, setAlgoA] = useState('dijkstra');
  const [algoB, setAlgoB] = useState('astar');
  const [compare, setCompare] = useState(false);
  const [brush, setBrush] = useState<Brush>('wall');
  const [runs, setRuns] = useState<PathRun[] | null>(null);

  const gridRef = useRef(grid);
  const drag = useRef<DragMode>(null);

  const total = runs ? Math.max(...runs.map((r) => r.result.steps.length)) : 0;
  const anim = useAnimation(total, 62);

  const computeRuns = (g: GridData, a = algoA, b = algoB, cmp = compare) => {
    const ids = cmp ? [a, b] : [a];
    return ids.map((id) => createPathRun(getPathAlgorithm(id), g));
  };

  /**
   * After an edit: if the animation had finished, recompute immediately
   * and show the final result (“live mode” while dragging start/goal).
   * Otherwise the old visualisation is discarded.
   */
  const invalidate = (opts: { grid?: GridData; a?: string; b?: string; compare?: boolean } = {}) => {
    if (!runs) return;
    if (anim.done) {
      const next = computeRuns(opts.grid ?? gridRef.current, opts.a, opts.b, opts.compare);
      setRuns(next);
      anim.toEnd(Math.max(...next.map((r) => r.result.steps.length)));
    } else {
      setRuns(null);
      anim.reset();
    }
  };

  const commitGrid = (g: GridData, opts: { keepRun?: boolean } = {}) => {
    gridRef.current = g;
    setGrid(g);
    if (opts.keepRun) invalidate({ grid: g });
    else {
      setRuns(null);
      anim.reset();
    }
  };

  const ensureRuns = () => {
    if (runs) return runs;
    const next = computeRuns(gridRef.current);
    setRuns(next);
    return next;
  };

  const handlePlay = () => {
    if (anim.playing) return anim.pause();
    if (!runs || anim.done) {
      if (!runs) ensureRuns();
      anim.restart();
    } else anim.resume();
  };

  const handleStepForward = () => {
    ensureRuns();
    anim.stepForward();
  };

  // ---------- Drawing & drag-and-drop ----------
  const paintCell = (cell: number, mode: DragMode) => {
    const g = gridRef.current;
    if (cell === g.start || cell === g.end) return;
    const value = mode === 'erase' ? EMPTY : brush === 'wall' ? WALL : WEIGHT;
    if (g.cells[cell] === value) return;
    const cells = g.cells.slice();
    cells[cell] = value;
    commitGrid({ ...g, cells }, { keepRun: true });
  };

  const onCellDown = (cell: number) => {
    const g = gridRef.current;
    if (cell === g.start) drag.current = 'start';
    else if (cell === g.end) drag.current = 'end';
    else {
      const target = brush === 'wall' ? WALL : WEIGHT;
      drag.current = g.cells[cell] === target ? 'erase' : 'paint';
      paintCell(cell, drag.current);
    }
  };

  const onCellEnter = (cell: number) => {
    const g = gridRef.current;
    const mode = drag.current;
    if (mode === 'start' || mode === 'end') {
      if (g.cells[cell] === WALL) return;
      if (cell === (mode === 'start' ? g.end : g.start)) return;
      commitGrid({ ...g, [mode]: cell }, { keepRun: true });
    } else if (mode) paintCell(cell, mode);
  };

  // ---------- Actions ----------
  const generateMaze = (id: string) => {
    const g = gridRef.current;
    commitGrid({ ...g, ...getMazeGenerator(id).generate(g) });
  };

  const clearWalls = () => {
    const g = gridRef.current;
    commitGrid({ ...g, cells: new Uint8Array(g.cells.length) });
  };

  const clearPath = () => {
    setRuns(null);
    anim.reset();
  };

  const resetAll = () => commitGrid(createGrid(grid.rows, grid.cols));

  usePlaybackKeys({ onToggle: handlePlay, onForward: handleStepForward, onBack: anim.stepBack });

  // ---------- Rendering ----------
  const algos = (compare ? [algoA, algoB] : [algoA]).map(getPathAlgorithm);
  const k = anim.index;
  const slotOf = (i: number) => (compare ? (i === 0 ? 'A' : 'B') : undefined);

  const stats: StatRow[] = [
    {
      label: 'Cells visited',
      values: algos.map((_, i) => (runs?.[i] ? runs[i].visitedCount[Math.min(k, runs[i].result.steps.length)] : 0)),
      lowerIsBetter: true,
    },
    {
      label: 'Path length',
      values: algos.map((_, i) => {
        const r = runs?.[i];
        if (!r || k <= r.searchEnd) return '–';
        return r.result.found ? r.result.path.length - 1 : 'no path';
      }),
      lowerIsBetter: true,
    },
    {
      label: 'Path cost',
      values: algos.map((_, i) => {
        const r = runs?.[i];
        if (!r || k <= r.searchEnd) return '–';
        return r.result.found ? r.result.cost : 'no path';
      }),
      lowerIsBetter: true,
    },
    {
      label: 'Total steps',
      values: algos.map((_, i) => (runs?.[i] ? runs[i].result.steps.length : '–')),
      lowerIsBetter: true,
    },
    {
      label: 'Compute time',
      values: algos.map((_, i) => (runs?.[i] ? runs[i].ms : '–')),
      format: (v) => `${v.toFixed(2)} ms`,
    },
  ];

  const activeLine = (i: number) => {
    const r = runs?.[i];
    if (!r || k === 0) return null;
    return r.result.steps[Math.min(k, r.result.steps.length) - 1].line;
  };

  const noPath = anim.done && runs?.some((r) => !r.result.found);
  const hint = noPath
    ? 'No path found: the goal is walled in. Remove a few walls.'
    : anim.done
      ? 'Now drag the start or goal – the path updates instantly.'
      : 'Click and drag to draw. Drag the start and goal to move them.';

  const tools = (
    <ControlPanel>
      <Section title="Algorithm" aside={<Toggle checked={compare} label="Compare" onChange={(v) => { setCompare(v); invalidate({ compare: v }); }} />}>
        <AlgoPicker
          options={algoOptions}
          a={algoA}
          b={algoB}
          compare={compare}
          onA={(id) => {
            setAlgoA(id);
            invalidate({ a: id });
          }}
          onB={(id) => {
            setAlgoB(id);
            invalidate({ b: id });
          }}
        />
      </Section>

      <Section title="Brush">
        <Segmented
          value={brush}
          onChange={setBrush}
          options={[
            { id: 'wall', name: <><span className="legend-swatch wall" /> Wall</> },
            { id: 'weight', name: <><span className="legend-swatch weight" /> Mud</> },
          ]}
        />
      </Section>

      <Section title="Generate a maze">
        <div className="maze-grid">
          {mazeGenerators.map((m) => (
            <button key={m.id} type="button" className="maze-btn" title={m.description} onClick={() => generateMaze(m.id)}>
              <span className="maze-icon" aria-hidden>
                {mazeIcons[m.id]}
              </span>
              {m.name}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Clean up">
        <div className="button-row">
          <Button variant="ghost" onClick={clearPath} disabled={!runs}>
            Clear path
          </Button>
          <Button variant="ghost" onClick={clearWalls}>
            Clear walls
          </Button>
          <Button variant="ghost" onClick={resetAll}>
            Reset all
          </Button>
        </div>
      </Section>
    </ControlPanel>
  );

  const stage = (
    <>
      <div className={`stage-slots ${compare ? 'stage-slots-compare' : ''}`}>
        {algos.map((algo, i) => (
          <StageSlot
            key={i}
            title={algo.name}
            color={colorOf(algo.id)}
            slot={slotOf(i)}
            meta={i === 0 ? hint : undefined}
          >
            <div className="fit-box">
              <Grid
                grid={grid}
                run={runs?.[i] ?? null}
                k={k}
                color={colorOf(algo.id)}
                editable={!anim.playing}
                onCellDown={onCellDown}
                onCellEnter={onCellEnter}
                onUp={() => (drag.current = null)}
              />
            </div>
          </StageSlot>
        ))}
      </div>
      <Legend
        color={colorOf(algoA)}
        items={[
          { label: 'Start', className: 'start' },
          { label: 'Goal', className: 'end' },
          { label: 'Wall', className: 'wall' },
          { label: `Mud costs ${WEIGHT_COST}`, className: 'weight' },
          { label: 'Queued', className: 'frontier' },
          { label: 'Visited', className: 'visited' },
          { label: 'Shortest path', className: 'path' },
        ]}
      />
    </>
  );

  const rail = (
    <>
      <StatsPanel algos={algos} rows={stats} showWinner={anim.done} />
      {algos.map((algo, i) => (
        <PseudocodePanel key={`p${i}`} id={algo.id} lines={algo.pseudocode} active={activeLine(i)} title={algo.name} slot={slotOf(i)} />
      ))}
      {algos.map((algo, i) => (
        <InfoPanel
          key={`i${i}`}
          algo={algo}
          slot={slotOf(i)}
          badges={[
            { label: 'Shortest path guaranteed', good: algo.guaranteesShortest },
            { label: 'Handles weights', good: algo.weighted },
          ]}
        />
      ))}
    </>
  );

  return (
    <Workspace
      tools={tools}
      stage={stage}
      transport={
        <PlaybackControls
          anim={anim}
          onPlay={handlePlay}
          onStepForward={handleStepForward}
          hasRun={!!runs}
          color={colorOf(algoA)}
          playLabel="Find path"
        />
      }
      rail={rail}
    />
  );
}
