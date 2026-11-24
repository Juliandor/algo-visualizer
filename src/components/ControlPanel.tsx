import type { CSSProperties, ReactNode } from 'react';
import { colorOf } from '../lib/palette';

/** Building blocks for the tool columns of both visualisers. */

export function ControlPanel({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="tool-section">
      <div className="tool-heading">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  disabled,
  title,
  className = '',
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  title?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="toggle" onClick={() => onChange(!checked)}>
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function Slider({
  value,
  min,
  max,
  onChange,
  disabled,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <input
      type="range"
      aria-label={label}
      className="range"
      style={{ ['--pct' as string]: `${((value - min) / (max - min)) * 100}%` }}
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  wrap,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; name: ReactNode }[];
  wrap?: boolean;
}) {
  return (
    <div className={`segmented ${wrap ? 'segmented-wrap' : ''}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className="segment"
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function AlgoTag({ id, slot }: { id: string; slot?: 'A' | 'B' }) {
  return (
    <span className="algo-tag" style={{ ['--c' as string]: colorOf(id) }}>
      {slot ?? ''}
    </span>
  );
}

/**
 * Algorithms as coloured chips. In compare mode every chip has
 * two buttons to pick it as A or B.
 */
export function AlgoPicker({
  options,
  a,
  b,
  compare,
  onA,
  onB,
}: {
  options: { id: string; name: string; hint: string }[];
  a: string;
  b: string;
  compare: boolean;
  onA: (id: string) => void;
  onB: (id: string) => void;
}) {
  return (
    <div className="algo-list" role="list">
      {options.map((o) => {
        const isA = o.id === a;
        const isB = compare && o.id === b;
        const style = { ['--c' as string]: colorOf(o.id) };
        if (!compare) {
          return (
            <button
              key={o.id}
              type="button"
              role="listitem"
              aria-pressed={isA}
              className="algo-chip"
              style={style}
              onClick={() => onA(o.id)}
            >
              <span className="algo-dot" />
              <span className="algo-text">
                <span className="algo-name">{o.name}</span>
                <span className="algo-hint">{o.hint}</span>
              </span>
            </button>
          );
        }
        return (
          <div key={o.id} role="listitem" className="algo-chip algo-chip-compare" aria-pressed={isA || isB} style={style}>
            <span className="algo-dot" />
            <span className="algo-text">
              <span className="algo-name">{o.name}</span>
              <span className="algo-hint">{o.hint}</span>
            </span>
            <span className="ab-buttons">
              <button type="button" aria-pressed={isA} title={`Use ${o.name} as A`} onClick={() => onA(o.id)}>
                A
              </button>
              <button type="button" aria-pressed={isB} title={`Use ${o.name} as B`} onClick={() => onB(o.id)}>
                B
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
