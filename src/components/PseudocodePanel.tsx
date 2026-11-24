import { colorOf } from '../lib/palette';

export function PseudocodePanel({
  id,
  lines,
  active,
  title,
  slot,
}: {
  id: string;
  lines: string[];
  active: number | null;
  title: string;
  slot?: 'A' | 'B';
}) {
  return (
    <section className="panel" style={{ ['--c' as string]: colorOf(id) }}>
      <h3 className="panel-title">
        <span className="algo-tag">{slot ?? ''}</span>
        Pseudocode: {title}
      </h3>
      <pre className="code">
        {lines.map((line, i) => (
          <div key={i} className="code-line" aria-current={active === i ? 'step' : undefined}>
            <span className="code-num">{i + 1}</span>
            {line}
          </div>
        ))}
      </pre>
    </section>
  );
}
