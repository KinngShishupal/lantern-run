// Regular levels are built from hand-made "chunks" (gaps, spikes, lifts,
// moving platforms, flying enemies...) picked by a seeded random generator,
// so each level is always the same. Difficulty rises from level 1 to 12,
// and every chunk stays within one full jump (about 160 across, 110 up).

import { GROUND_THICKNESS, GROUND_Y } from '../../constants';
import { createRandom } from './random';

const LAST_LEVEL = 12;
const START_RUN = 400;
const FINISH_RUN = 500;
const GOAL_INSET = 120;
const CHECKPOINT_INSET = 80;

/** Chunks unlocked at each level number. Repeats weight the pick. */
const CHUNK_UNLOCKS = [
  [1, ['flat', 'gap', 'spikes']],
  [2, ['moverGap', 'flyers']],
  [3, ['stairs']],
  [4, ['lift']],
  [6, ['flyers', 'gap', 'moverGap']],
  [9, ['lift', 'spikes']],
];

function chunkPoolFor(levelNumber) {
  return CHUNK_UNLOCKS
    .filter(([minLevel]) => levelNumber >= minLevel)
    .flatMap(([, chunks]) => chunks);
}

/**
 * Builds the layout of regular level `n` (1-based).
 * @returns a level definition, turned into live objects by instantiateLevel.
 */
export function generateLevel(n) {
  const r = createRandom(n * 7919 + 13);
  const d = (n - 1) / (LAST_LEVEL - 1); // difficulty 0..1
  const between = (a, b) => Math.round(a + r() * (b - a));

  const L = { solids: [], spikes: [], seeds: [], beetles: [], flyers: [] };
  let x = 0; // build cursor; every chunk starts and ends on ground

  const ground = (len) => {
    L.solids.push({ x, y: GROUND_Y, w: len, h: GROUND_THICKNESS, kind: 'ground' });
    x += len;
  };
  const seedRow = (sx, y, count, gap = 40) => {
    for (let i = 0; i < count; i++) L.seeds.push([Math.round(sx + i * gap), y]);
  };
  const beetle = (min, max) =>
    L.beetles.push({ x: Math.round((min + max) / 2), min, max, speed: 55 + d * 60 });

  const chunks = {
    // Flat run, often guarded by a beetle
    flat() {
      const s = x, len = between(320, 480);
      ground(len);
      if (r() < 0.4 + d * 0.4) beetle(s + 20, s + len - 20);
      seedRow(s + len / 2 - 40, 320, 3);
    },
    // Simple pit
    gap() {
      const gw = between(80, 90 + 40 * d);
      L.seeds.push([Math.round(x + gw / 2 - 8), 250]);
      x += gw;
      const s = x, len = between(170, 260);
      ground(len);
      if (len >= 200 && r() < 0.2 + 0.4 * d) beetle(s + 30, s + len - 10);
    },
    // Wide pit crossed on a sliding platform
    moverGap() {
      const gs = x, len = between(240, 260 + 120 * d), ge = gs + len;
      L.solids.push({
        x: gs + 50, y: between(275, 300), w: 90, h: 16, kind: 'mover', axis: 'x',
        min: gs + 50, max: ge - 140, speed: 55 + 35 * d,
      });
      seedRow(gs + len / 2 - 28, 240, 2);
      x = ge;
      ground(between(200, 300));
    },
    // Ground spikes to hop over
    spikes() {
      const s = x, len = 400;
      ground(len);
      const sw = between(40, 50 + 50 * d);
      const sx = Math.round(s + (len - sw) / 2);
      L.spikes.push({ x: sx, w: sw });
      L.seeds.push([Math.round(sx + sw / 2 - 8), 265]);
      if (d > 0.5 && r() < 0.5) L.spikes.push({ x: s + len - 70, w: 42 });
    },
    // Rising ledges, over a pit in later levels
    stairs() {
      const s = x;
      const pit = n >= 5 && r() < 0.6;
      [[60, 290], [210, 230], [360, 170]].forEach(([dx, y]) => {
        L.solids.push({ x: s + dx, y, w: 100, h: 16, kind: 'ledge' });
        L.seeds.push([s + dx + 42, y - 30]);
      });
      if (pit) {
        ground(60);
        x = s + 560;
        ground(between(200, 300));
      } else {
        ground(620);
      }
    },
    // A lift up to a wall too tall to jump
    lift() {
      const s = x;
      ground(520);
      L.solids.push({
        x: s + 120, y: 318, w: 80, h: 16, kind: 'mover', axis: 'y',
        min: 200, max: 318, speed: 45 + 30 * d,
      });
      L.solids.push({ x: s + 220, y: 210, w: 120, h: 150, kind: 'block' });
      L.seeds.push([s + 152, 176], [s + 272, 180]);
    },
    // Moths float along (stompable), embers bob up and down (avoid them)
    flyers() {
      const s = x, len = between(480, 620);
      ground(len);
      L.flyers.push({
        kind: 'moth', min: s + 100, max: s + len - 100,
        baseY: 285 - Math.round(r() * 20), amp: 25, speed: 60 + 40 * d,
      });
      if (n >= 5) {
        L.flyers.push({
          kind: 'ember', x: Math.round(s + len * 0.7), min: 150, max: 320, speed: 90 + 60 * d,
        });
      }
      if (n >= 9) {
        L.flyers.push({
          kind: 'moth', min: s + 60, max: s + len - 60, baseY: 250, amp: 35, speed: 80 + 40 * d,
        });
      }
      seedRow(s + len / 2 - 40, 320, 3);
    },
  };

  const pool = chunkPoolFor(n);
  const count = 6 + Math.floor(n * 0.6);
  const checkpointAfter = Math.floor(count / 2);
  let prev = null;
  let checkpointX = null;

  ground(START_RUN);
  for (let i = 0; i < count; i++) {
    let chunk;
    do {
      chunk = pool[Math.floor(r() * pool.length)];
    } while (chunk === prev && pool.length > 1);
    prev = chunk;
    chunks[chunk]();
    if (i === checkpointAfter) checkpointX = x - CHECKPOINT_INSET;
  }
  ground(FINISH_RUN);

  return {
    ...L,
    width: x,
    start: { x: 60, y: 300 },
    checkpoint: { x: checkpointX },
    goalX: x - GOAL_INSET,
    boss: null,
  };
}
