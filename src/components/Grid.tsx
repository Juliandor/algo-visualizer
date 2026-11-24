import { useRef, type PointerEvent } from 'react';
import type { GridData } from '../algorithms/pathfinding/types';
import { cellStatus, type PathRun } from '../lib/pathRun';
import { Node } from './Node';

interface GridProps {
  grid: GridData;
  run: PathRun | null;
  /** Number of steps played so far */
  k: number;
  editable: boolean;
  onCellDown: (cell: number) => void;
  onCellEnter: (cell: number) => void;
  onUp: () => void;
  /** Algorithm colour (visit wave) */
  color: string;
}

export function Grid({ grid, run, k, editable, onCellDown, onCellEnter, onUp, color }: GridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const last = useRef(-1);

  const cellAt = (e: PointerEvent): [number, number] | null => {
    const rect = ref.current!.getBoundingClientRect();
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * grid.cols);
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * grid.rows);
    if (r < 0 || c < 0 || r >= grid.rows || c >= grid.cols) return null;
    return [r, c];
  };

  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!editable || e.button !== 0) return;
    const rc = cellAt(e);
    if (!rc) return;
    e.preventDefault();
    ref.current!.setPointerCapture(e.pointerId);
    active.current = true;
    last.current = rc[0] * grid.cols + rc[1];
    onCellDown(last.current);
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    const rc = cellAt(e);
    if (!rc) return;
    const target = rc[0] * grid.cols + rc[1];
    if (target === last.current) return;
    // Interpolate in-between cells so fast mouse moves leave no gaps.
    const r0 = Math.floor(last.current / grid.cols);
    const c0 = last.current % grid.cols;
    const steps = Math.max(Math.abs(rc[0] - r0), Math.abs(rc[1] - c0));
    for (let s = 1; s <= steps; s++) {
      const r = Math.round(r0 + ((rc[0] - r0) * s) / steps);
      const c = Math.round(c0 + ((rc[1] - c0) * s) / steps);
      const cell = r * grid.cols + c;
      if (cell !== last.current) {
        last.current = cell;
        onCellEnter(cell);
      }
    }
  };

  const handleUp = () => {
    if (!active.current) return;
    active.current = false;
    onUp();
  };

  const total = run ? run.result.steps.length : 0;
  const cur = run && k > 0 ? run.result.steps[Math.min(k, total) - 1] : null;
  const currentNode = cur && cur.type === 'visit' ? cur.node : -1;

  const nodes = [];
  for (let i = 0; i < grid.cells.length; i++) {
    nodes.push(
      <Node
        key={i}
        kind={grid.cells[i]}
        role={i === grid.start ? 'start' : i === grid.end ? 'end' : null}
        status={cellStatus(run, i, k)}
        current={i === currentNode}
      />,
    );
  }

  return (
    <div
      ref={ref}
      className={`grid-board ${editable ? 'editable' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
        aspectRatio: `${grid.cols} / ${grid.rows}`,
        ['--ratio' as string]: grid.cols / grid.rows,
        ['--c' as string]: color,
      }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {nodes}
    </div>
  );
}
