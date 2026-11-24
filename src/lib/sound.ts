/**
 * Tiny synthesiser using the Web Audio API: every bar gets a tone
 * matching its height.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

/** Must be called from a user gesture (autoplay rules). */
export function ensureAudio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export const valueToFreq = (value: number, max: number) => 160 + (value / Math.max(1, max)) * 1100;

export function playTone(freq: number, opts: { pan?: number; duration?: number; delay?: number; volume?: number } = {}) {
  if (!ctx || !master || ctx.state !== 'running') return;
  const { pan = 0, duration = 0.07, delay = 0, volume = 0.12 } = opts;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  let node: AudioNode = gain;
  if (pan !== 0 && 'createStereoPanner' in ctx) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    gain.connect(panner);
    node = panner;
  }
  osc.connect(gain);
  node.connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** The well-known “done” sweep across all bars from left to right. */
export function playSweep(values: readonly number[], max: number, pan = 0) {
  const count = Math.min(values.length, 70);
  for (let k = 0; k < count; k++) {
    const v = values[Math.floor((k / count) * values.length)];
    playTone(valueToFreq(v, max), { pan, delay: k * 0.014, duration: 0.09, volume: 0.08 });
  }
}
