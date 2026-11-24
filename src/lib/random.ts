export type Rng = () => number;

/** Small seedable random generator (for reproducible tests). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randInt = (rng: Rng, maxExclusive: number) => Math.floor(rng() * maxExclusive);

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export type Distribution = 'random' | 'nearly' | 'reversed' | 'few';

export const distributions: { id: Distribution; name: string }[] = [
  { id: 'random', name: 'Random' },
  { id: 'nearly', name: 'Nearly sorted' },
  { id: 'reversed', name: 'Reversed' },
  { id: 'few', name: 'Few unique values' },
];

/** Generates n values in the range 1..n with the requested distribution. */
export function generateArray(n: number, dist: Distribution, rng: Rng = Math.random): number[] {
  const base = Array.from({ length: n }, (_, i) => i + 1);
  switch (dist) {
    case 'reversed':
      return base.reverse();
    case 'nearly': {
      const swaps = Math.max(1, Math.floor(n / 12));
      for (let s = 0; s < swaps; s++) {
        const i = randInt(rng, n);
        const j = Math.min(n - 1, i + 1 + randInt(rng, 3));
        [base[i], base[j]] = [base[j], base[i]];
      }
      return base;
    }
    case 'few': {
      const levels = 5;
      return shuffle(
        base.map((v) => Math.ceil((Math.ceil((v / n) * levels) / levels) * n)),
        rng,
      );
    }
    default:
      return shuffle(base, rng);
  }
}
