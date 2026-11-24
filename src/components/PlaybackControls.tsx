import { speedToStepsPerSecond, type Animation } from '../hooks/useAnimation';
import { Slider } from './ControlPanel';

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
    <path d={d} />
  </svg>
);

const icons = {
  play: 'M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z',
  pause: 'M6 4h4.5v16H6zM13.5 4H18v16h-4.5z',
  back: 'M5 5h2.5v14H5zM9 12l10 7V5z',
  forward: 'M16.5 5H19v14h-2.5zM5 19l10-7L5 5z',
  reset: 'M12 4V1L7 5.5 12 10V6.5a5.5 5.5 0 1 1-5.5 5.5H4a8 8 0 1 0 8-8z',
  end: 'M3 19l8.5-7L3 5zm9 0 8.5-7L12 5z',
};

export function PlaybackControls({
  anim,
  onPlay,
  onStepForward,
  hasRun,
  color,
  playLabel = 'Start',
}: {
  anim: Animation;
  onPlay: () => void;
  onStepForward: () => void;
  hasRun: boolean;
  color: string;
  playLabel?: string;
}) {
  const pct = anim.total > 0 ? (anim.index / anim.total) * 100 : 0;
  const label = anim.playing ? 'Pause' : anim.done ? 'Replay' : anim.index > 0 ? 'Resume' : playLabel;
  return (
    <div className="transport" style={{ ['--c' as string]: color }}>
      <button type="button" className="play-btn" onClick={onPlay} aria-label={label} title={`${label} (Space)`}>
        <Icon d={anim.playing ? icons.pause : icons.play} size={22} />
        <span>{label}</span>
      </button>

      <div className="transport-buttons">
        <button type="button" className="icon-btn" title="Step back (←)" aria-label="Step back" onClick={anim.stepBack} disabled={!hasRun || anim.index === 0}>
          <Icon d={icons.back} />
        </button>
        <button type="button" className="icon-btn" title="Step forward (→)" aria-label="Step forward" onClick={onStepForward} disabled={hasRun && anim.done}>
          <Icon d={icons.forward} />
        </button>
        <button type="button" className="icon-btn" title="Jump to end" aria-label="Jump to end" onClick={() => anim.toEnd()} disabled={!hasRun || anim.done}>
          <Icon d={icons.end} />
        </button>
        <button type="button" className="icon-btn" title="Back to start" aria-label="Back to start" onClick={anim.reset} disabled={!hasRun || anim.index === 0}>
          <Icon d={icons.reset} />
        </button>
      </div>

      <div className="scrubber">
        <input
          type="range"
          aria-label="Progress"
          className="range range-progress"
          style={{ ['--pct' as string]: `${pct}%` }}
          min={0}
          max={Math.max(1, anim.total)}
          value={anim.index}
          disabled={!hasRun}
          onChange={(e) => {
            anim.pause();
            anim.seek(Number(e.target.value));
          }}
        />
        <span className="step-count">
          Step <b>{anim.index.toLocaleString('en-US')}</b> of {anim.total.toLocaleString('en-US')}
        </span>
      </div>

      <div className="speed">
        <span title="Slow" aria-hidden>🐢</span>
        <Slider value={anim.speed} min={0} max={100} onChange={anim.setSpeed} label="Speed" />
        <span title="Fast" aria-hidden>🐇</span>
        <span className="speed-value">{speedToStepsPerSecond(anim.speed)} per s</span>
      </div>
    </div>
  );
}
