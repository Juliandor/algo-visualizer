import type { ReactNode } from 'react';

/**
 * Desktop layout: tools on the left, stage in the middle (fills the screen),
 * stats & pseudocode on the right. Stacks below 1200 px.
 */
export function Workspace({
  tools,
  stage,
  transport,
  rail,
}: {
  tools: ReactNode;
  stage: ReactNode;
  transport: ReactNode;
  rail: ReactNode;
}) {
  return (
    <div className="workspace">
      <aside className="ws-tools">{tools}</aside>
      <div className="ws-center">
        <div className="ws-stage">{stage}</div>
        {transport}
      </div>
      <aside className="ws-rail">{rail}</aside>
    </div>
  );
}

export function StageSlot({
  title,
  color,
  slot,
  meta,
  children,
}: {
  title: ReactNode;
  color: string;
  slot?: 'A' | 'B';
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="stage-card" style={{ ['--c' as string]: color }}>
      <div className="stage-head">
        <span className="algo-tag">{slot ?? ''}</span>
        <span className="stage-title">{title}</span>
        {meta && <span className="stage-meta">{meta}</span>}
      </div>
      <div className="stage-body">{children}</div>
    </div>
  );
}
