import { useCallback, useEffect, useRef, useState } from 'react';

/** Speed slider 0..100 → steps per second (exponential, 1 to ~3000). */
export const speedToStepsPerSecond = (speed: number) => Math.round(Math.pow(10, (speed / 100) * 3.5));

/**
 * Plays back a list of `total` steps. It only knows an index –
 * what a step means is up to the view. That is why pause,
 * step forward/back, scrubbing and speed work the same for every algorithm.
 */
export function useAnimation(total: number, initialSpeed = 55) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const indexRef = useRef(0);

  const seek = useCallback((k: number) => {
    const next = Math.max(0, k);
    indexRef.current = next;
    setIndex(next);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const sps = speedToStepsPerSecond(speed);
    let raf = 0;
    let last = performance.now();
    let acc = 1; // first step immediately
    const tick = (now: number) => {
      acc += ((now - last) * sps) / 1000;
      last = now;
      const advance = Math.floor(acc);
      if (advance > 0) {
        acc -= advance;
        const next = Math.min(total, indexRef.current + advance);
        indexRef.current = next;
        setIndex(next);
        if (next >= total) {
          setPlaying(false);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  const pause = useCallback(() => setPlaying(false), []);
  const restart = useCallback(() => {
    seek(0);
    setPlaying(true);
  }, [seek]);
  const resume = useCallback(() => setPlaying(true), []);
  const stepForward = useCallback(() => {
    setPlaying(false);
    seek(Math.min(total, indexRef.current + 1));
  }, [seek, total]);
  const stepBack = useCallback(() => {
    setPlaying(false);
    seek(Math.max(0, indexRef.current - 1));
  }, [seek]);
  const reset = useCallback(() => {
    setPlaying(false);
    seek(0);
  }, [seek]);
  const toEnd = useCallback(
    (k = total) => {
      setPlaying(false);
      seek(k);
    },
    [seek, total],
  );

  const clamped = Math.min(index, total);
  return {
    index: clamped,
    total,
    playing,
    speed,
    setSpeed,
    done: total > 0 && clamped >= total,
    seek,
    pause,
    resume,
    restart,
    stepForward,
    stepBack,
    reset,
    toEnd,
  };
}

export type Animation = ReturnType<typeof useAnimation>;
