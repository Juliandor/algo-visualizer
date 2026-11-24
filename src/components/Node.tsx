import { memo } from 'react';
import { WALL, WEIGHT } from '../algorithms/pathfinding/types';
import type { CellStatus } from '../lib/pathRun';

const STATUS_CLASS = ['', ' frontier', ' visited', ' path'] as const;

interface NodeProps {
  kind: number;
  role: 'start' | 'end' | null;
  status: CellStatus;
  current: boolean;
}

/** A single grid cell. memo → only changed cells re-render. */
export const Node = memo(function Node({ kind, role, status, current }: NodeProps) {
  let cls = 'cell';
  if (kind === WALL) cls += ' wall';
  else {
    if (kind === WEIGHT) cls += ' weight';
    cls += STATUS_CLASS[status];
  }
  if (role) cls += ` ${role}`;
  if (current) cls += ' current';
  return <div className={cls} />;
});
