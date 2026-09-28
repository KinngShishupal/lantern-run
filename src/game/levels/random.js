/**
 * Mulberry32: a small, fast seeded PRNG. The same seed always yields the
 * same sequence, so generated levels are identical on every play.
 * @returns {() => number} a function returning floats in [0, 1)
 */
export function createRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
