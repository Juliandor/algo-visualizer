import { useEffect, useRef, useState } from 'react';
import { getSortAlgorithm, sortAlgorithms } from '../algorithms/sorting';
import { BarChart } from '../components/BarChart';
import { AlgoPicker, Button, ControlPanel, Section, Segmented, Slider, Toggle } from '../components/ControlPanel';
import { InfoPanel } from '../components/InfoPanel';
import { Legend } from '../components/Legend';
import { PlaybackControls } from '../components/PlaybackControls';
import { PseudocodePanel } from '../components/PseudocodePanel';
import { StatsPanel, type StatRow } from '../components/StatsPanel';
import { StageSlot, Workspace } from '../components/Workspace';
import { useAnimation } from '../hooks/useAnimation';
import { usePlaybackKeys } from '../hooks/usePlaybackKeys';
import { colorOf } from '../lib/palette';
import { distributions, generateArray, type Distribution } from '../lib/random';
import { ensureAudio, playSweep, playTone, valueToFreq } from '../lib/sound';
import { createSortRun, type SortRun } from '../lib/sortRun';

const algoOptions = sortAlgorithms.map((a) => ({
  id: a.id,
  name: a.name,
  hint: `${a.complexity.average}${a.stable ? ', stable' : ''}`,
}));

const distNames: Record<Distribution, string> = {
  random: 'Random',
  nearly: 'Nearly sorted',
  reversed: 'Reversed',
  few: 'Few values',
};

export function SortingView() {
  const [size, setSize] = useState(() => (window.innerWidth < 640 ? 40 : 80));
  const [dist, setDist] = useState<Distribution>('random');
  const [data, setData] = useState(() => generateArray(size, 'random'));
  const [algoA, setAlgoA] = useState('quick');
  const [algoB, setAlgoB] = useState('merge');
  const [compare, setCompare] = useState(false);
  const [sound, setSound] = useState(false);
  const [runs, setRuns] = useState<SortRun[] | null>(null);

  const total = runs ? Math.max(...runs.map((r) => r.steps.length)) : 0;
  const anim = useAnimation(total, 60);
  const k = anim.index;

  const computeRuns = () =>
    (compare ? [algoA, algoB] : [algoA]).map((id) => createSortRun(getSortAlgorithm(id), data));

  const clearRun = () => {
    setRuns(null);
    anim.reset();
  };

  const regenerate = (n = size, d = dist) => {
    setData(generateArray(n, d));
    clearRun();
  };

  const handlePlay = () => {
    if (sound) ensureAudio();
    if (anim.playing) return anim.pause();
    if (!runs) {
      setRuns(computeRuns());
      anim.restart();
    } else if (anim.done) anim.restart();
    else anim.resume();
  };

  const handleStepForward = () => {
    if (sound) ensureAudio();
    if (!runs) setRuns(computeRuns());
    anim.stepForward();
  };

  usePlaybackKeys({ onToggle: handlePlay, onForward: handleStepForward, onBack: anim.stepBack });

  // Rebuild the current array state from the steps (seek is idempotent).
  const arrays = runs ? runs.map((r) => r.player.seek(k)) : [data];

  // ---------- Sound ----------
  const max = data.length;
  useEffect(() => {
    if (!sound || !runs || k === 0) return;
    runs.forEach((r, i) => {
      if (k > r.steps.length) return;
      const step = r.steps[k - 1];
      if (step.type === 'compare' || step.type === 'swap' || step.type === 'write') {
        const pan = runs.length > 1 ? (i === 0 ? -0.7 : 0.7) : 0;
        playTone(valueToFreq(r.player.arr[step.i], max), { pan });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);

  const wasDone = useRef(false);
  useEffect(() => {
    if (anim.done && !wasDone.current && sound && runs) {
      runs.forEach((r, i) => playSweep(r.player.arr, max, runs.length > 1 ? (i === 0 ? -0.7 : 0.7) : 0));
    }
    wasDone.current = anim.done;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim.done]);

  // ---------- Rendering ----------
  const algos = (compare ? [algoA, algoB] : [algoA]).map(getSortAlgorithm);
  const slotOf = (i: number) => (compare ? (i === 0 ? 'A' : 'B') : undefined);
  const at = (arr: Int32Array, r: SortRun) => arr[Math.min(k, r.steps.length)];

  const stats: StatRow[] = [
    { label: 'Comparisons', values: algos.map((_, i) => (runs?.[i] ? at(runs[i].comparisons, runs[i]) : 0)), lowerIsBetter: true },
    { label: 'Swaps', values: algos.map((_, i) => (runs?.[i] ? at(runs[i].swaps, runs[i]) : 0)), lowerIsBetter: true },
    { label: 'Writes', values: algos.map((_, i) => (runs?.[i] ? at(runs[i].writes, runs[i]) : 0)), lowerIsBetter: true },
    {
      label: 'Total steps',
      values: algos.map((_, i) => (runs?.[i] ? runs[i].steps.length : '–')),
      lowerIsBetter: true,
    },
    {
      label: 'Compute time',
      values: algos.map((_, i) => (runs?.[i] ? runs[i].ms : '–')),
      format: (v) => `${v.toFixed(2)} ms`,
    },
  ];

  const statusOf = (i: number) => {
    const r = runs?.[i];
    if (!r || k === 0) return `${data.length} bars`;
    return k >= r.steps.length ? 'Sorted ✓' : 'Sorting …';
  };

  const activeLine = (i: number) => {
    const r = runs?.[i];
    if (!r || k === 0) return null;
    return r.steps[Math.min(k, r.steps.length) - 1].line;
  };

  const tools = (
    <ControlPanel>
      <Section
        title="Algorithm"
        aside={
          <Toggle
            checked={compare}
            label="Compare"
            onChange={(v) => {
              setCompare(v);
              clearRun();
            }}
          />
        }
      >
        <AlgoPicker
          options={algoOptions}
          a={algoA}
          b={algoB}
          compare={compare}
          onA={(id) => {
            setAlgoA(id);
            clearRun();
          }}
          onB={(id) => {
            setAlgoB(id);
            clearRun();
          }}
        />
      </Section>

      <Section title="Number of bars" aside={<span className="value-pill">{size}</span>}>
        <Slider
          value={size}
          min={10}
          max={200}
          label="Number of bars"
          disabled={anim.playing}
          onChange={(v) => {
            setSize(v);
            regenerate(v);
          }}
        />
      </Section>

      <Section title="Starting data">
        <Segmented
          wrap
          value={dist}
          onChange={(d) => {
            setDist(d);
            regenerate(size, d);
          }}
          options={distributions.map((d) => ({ id: d.id, name: distNames[d.id] }))}
        />
        <Button onClick={() => regenerate()} disabled={anim.playing} className="w-full">
          🎲 Shuffle
        </Button>
      </Section>

      <Section title="Sound">
        <Toggle
          checked={sound}
          label={sound ? '🔊 Every bar plays a note' : '🔇 Muted'}
          onChange={(v) => {
            if (v) ensureAudio();
            setSound(v);
          }}
        />
      </Section>
    </ControlPanel>
  );

  const stage = (
    <>
      <div className={`stage-slots ${compare ? 'stage-slots-compare' : ''}`}>
        {algos.map((algo, i) => (
          <StageSlot key={i} title={algo.name} color={colorOf(algo.id)} slot={slotOf(i)} meta={statusOf(i)}>
            <BarChart values={arrays[i] ?? data} max={max} run={runs?.[i] ?? null} k={k} />
          </StageSlot>
        ))}
      </div>
      <Legend
        items={[
          { label: 'Comparing', className: 'bar-compare' },
          { label: 'Swapping', className: 'bar-swap' },
          { label: 'Pivot or minimum', className: 'bar-pivot' },
          { label: 'In final position', className: 'bar-sorted' },
        ]}
      />
    </>
  );

  const rail = (
    <>
      <StatsPanel algos={algos} rows={stats} showWinner={anim.done} />
      {algos.map((algo, i) => (
        <PseudocodePanel key={`p${i}`} id={algo.id} lines={algo.pseudocode} active={activeLine(i)} title={algo.name} slot={slotOf(i)} />
      ))}
      {algos.map((algo, i) => (
        <InfoPanel
          key={`i${i}`}
          algo={algo}
          slot={slotOf(i)}
          badges={[
            { label: 'Stable', good: algo.stable },
            { label: 'No extra memory', good: algo.complexity.space !== 'O(n)' },
          ]}
        />
      ))}
    </>
  );

  return (
    <Workspace
      tools={tools}
      stage={stage}
      transport={
        <PlaybackControls
          anim={anim}
          onPlay={handlePlay}
          onStepForward={handleStepForward}
          hasRun={!!runs}
          color={colorOf(algoA)}
          playLabel="Sort"
        />
      }
      rail={rail}
    />
  );
}
