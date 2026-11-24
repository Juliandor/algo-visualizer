import { colorOf } from '../lib/palette';

export interface StatRow {
  label: string;
  values: (number | string)[];
  /** Lower number wins (highlighted in compare mode). */
  lowerIsBetter?: boolean;
  format?: (v: number) => string;
}

export function StatsPanel({
  algos,
  rows,
  showWinner,
}: {
  algos: { id: string; name: string }[];
  rows: StatRow[];
  showWinner: boolean;
}) {
  const compare = algos.length > 1;
  return (
    <section className="panel">
      <h3 className="panel-title">Stats</h3>
      <table className="stats">
        {compare && (
          <thead>
            <tr>
              <th />
              {algos.map((a, i) => (
                <th key={i} style={{ ['--c' as string]: colorOf(a.id) }}>
                  <span className="algo-tag">{i === 0 ? 'A' : 'B'}</span>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => {
            const nums = row.values.filter((v): v is number => typeof v === 'number');
            const best =
              showWinner && compare && row.lowerIsBetter && nums.length === row.values.length
                ? Math.min(...nums)
                : null;
            const unique = best !== null && nums.filter((v) => v === best).length === 1;
            return (
              <tr key={row.label}>
                <td>{row.label}</td>
                {row.values.map((v, i) => {
                  const win = unique && v === best;
                  return (
                    <td key={i} className="stat-value">
                      <span className={win ? 'winner' : ''} style={{ ['--c' as string]: colorOf(algos[i].id) }}>
                        {typeof v === 'number' ? (row.format ? row.format(v) : v.toLocaleString('en-US')) : v}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
