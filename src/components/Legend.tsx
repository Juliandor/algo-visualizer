export function Legend({ items, color }: { items: { label: string; className: string }[]; color?: string }) {
  return (
    <div className="legend" style={color ? { ['--legend-c' as string]: color } : undefined}>
      {items.map((it) => (
        <span key={it.label} className="legend-item">
          <span className={`legend-swatch ${it.className}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
