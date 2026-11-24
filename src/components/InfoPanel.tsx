import type { AlgorithmInfo } from '../algorithms/types';
import { colorOf } from '../lib/palette';

export function InfoPanel({
  algo,
  slot,
  badges = [],
}: {
  algo: AlgorithmInfo;
  slot?: 'A' | 'B';
  badges?: { label: string; good: boolean }[];
}) {
  const c = algo.complexity;
  return (
    <section className="panel" style={{ ['--c' as string]: colorOf(algo.id) }}>
      <h3 className="panel-title">
        <span className="algo-tag">{slot ?? ''}</span>
        How {algo.name} works
      </h3>
      {badges.length > 0 && (
        <div className="badges">
          {badges.map((b) => (
            <span key={b.label} className={`badge ${b.good ? 'badge-good' : 'badge-bad'}`}>
              {b.good ? '✓' : '✗'} {b.label}
            </span>
          ))}
        </div>
      )}
      <p className="info-text">{algo.description}</p>
      <dl className="complexity">
        {(
          [
            ['Best case', c.best],
            ['Average', c.average],
            ['Worst case', c.worst],
            ['Memory', c.space],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="pros-cons">
        <ul>
          {algo.pros.map((p) => (
            <li key={p} className="pro">
              {p}
            </li>
          ))}
        </ul>
        <ul>
          {algo.cons.map((p) => (
            <li key={p} className="con">
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
