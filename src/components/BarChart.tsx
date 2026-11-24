import type { SortRun } from '../lib/sortRun';

/**
 * Draws the array as bars. Colours:
 * yellow = compare, red = swap/write, green = final, orange = pivot/minimum.
 */
export function BarChart({ values, max, run, k }: { values: readonly number[]; max: number; run: SortRun | null; k: number }) {
  const len = run ? run.steps.length : 0;
  const kk = Math.min(k, len);
  const step = run && kk > 0 ? run.steps[kk - 1] : null;
  const pivot = run ? run.pivotAt[kk] : -1;

  let a = -1;
  let b = -1;
  let kind = '';
  if (step?.type === 'compare' || step?.type === 'swap') {
    a = step.i;
    b = step.j;
    kind = step.type;
  } else if (step?.type === 'write') {
    a = step.i;
    kind = 'swap';
  }

  const n = values.length;
  const gap = n > 120 ? 0 : n > 60 ? 1 : 2;
  const showLabels = n <= 30;

  return (
    <div className={`bar-board ${n <= 60 ? 'chunky' : ''}`} style={{ gap: n <= 60 ? Math.max(gap, 3) : gap }}>
      {values.map((v, i) => {
        let cls = 'bar';
        if (i === a || i === b) cls += ` ${kind}`;
        else if (i === pivot) cls += ' pivot';
        else if (run && run.sortedAt[i] < kk) cls += ' sorted';
        return (
          <div key={i} className={cls} style={{ height: `${(v / max) * 100}%` }}>
            {showLabels && <span className="bar-label">{v}</span>}
          </div>
        );
      })}
    </div>
  );
}
