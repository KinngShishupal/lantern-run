// Regular levels are built from hand-made "chunks" (gaps, spikes, lifts,
// moving platforms, crumbling ledges, flame vents, thorn wheels, bounce
// mushrooms and a cast of enemies) picked by a seeded random generator,
// so each level is always the same. Difficulty rises from level 1 to 12,
// and every chunk stays within one full jump (about 160 across, 110 up).

import { GROUND_THICKNESS, GROUND_Y, MUSHROOM_SIZE } from '../../constants';
import { createRandom } from './random';

const LAST_LEVEL = 12;
const START_RUN = 400;
const FINISH_RUN = 500;
const GOAL_INSET = 120;
const CHECKPOINT_INSET = 80;

/** Chunks unlocked at each level number. Repeats weight the pick. */
const CHUNK_UNLOCKS = [
  [1, ['flat', 'gap', 'spikes']],
  [2, ['moverGap', 'flyers', 'mushroomWall']],
  [3, ['stairs', 'hoppers']],
  [4, ['lift', 'crumbleBridge']],
  [5, ['batCave']],
  [6, ['flyers', 'gap', 'moverGap', 'vents']],
  [7, ['spitter']],
  [8, ['thornWheel']],
  [9, ['lift', 'spikes', 'crumbleBridge']],
  [10, ['vents', 'batCave', 'thornWheel']],
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

  const L = {
    solids: [], spikes: [], seeds: [], beetles: [], flyers: [],
    hoppers: [], bats: [], spitters: [], vents: [], wheels: [],
  };
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
    // A bounce mushroom at the foot of a wall too tall to jump. It sits right
    // against the wall, so overshooting it still drops you onto it.
    mushroomWall() {
      const s = x;
      ground(600);
      L.solids.push({ x: s + 310 - MUSHROOM_SIZE.w - 4, y: GROUND_Y - MUSHROOM_SIZE.h, ...MUSHROOM_SIZE, kind: 'mushroom' });
      L.solids.push({ x: s + 310, y: 120, w: 130, h: GROUND_Y - 120, kind: 'block' });
      L.seeds.push([s + 250, 200], [s + 262, 120]);
      seedRow(s + 340, 90, 2, 50);
    },
    // Ledges over a pit that crumble shortly after you land
    crumbleBridge() {
      const gs = x, count = d > 0.5 ? 4 : 3, step = 130;
      for (let i = 0; i < count; i++) {
        const px = gs + 40 + i * step, y = 300 - (i % 2) * 30;
        L.solids.push({ x: px, y, w: 80, h: 16, kind: 'crumble' });
        L.seeds.push([px + 32, y - 32]);
      }
      x = gs + count * step + 40;
      ground(between(200, 300));
    },
    // Flame vents that erupt in a staggered wave
    vents() {
      const s = x, count = d > 0.4 ? 3 : 2, spacing = 150;
      ground(200 + count * spacing);
      for (let i = 0; i < count; i++) {
        const vx = s + 150 + i * spacing;
        L.vents.push({ x: vx, offset: i * 0.8 });
        L.seeds.push([vx + 7, 190]);
      }
    },
    // Spiked wheels swinging around a pivot; run under when they swing up
    thornWheel() {
      const s = x, two = d > 0.5;
      ground(two ? 660 : 460);
      const speed = 1.6 + d;
      L.wheels.push({ cx: s + 230, cy: 250, radius: 85, speed, angle: 0 });
      L.seeds.push([s + 222, 242]);
      if (two) {
        L.wheels.push({ cx: s + 450, cy: 250, radius: 85, speed: -speed, angle: Math.PI });
        L.seeds.push([s + 442, 242]);
      }
    },
    // Crickets that leap about (stompable)
    hoppers() {
      const s = x, len = between(440, 560);
      ground(len);
      const count = d > 0.5 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        L.hoppers.push({
          x: s + 120 + i * 200, min: s + 40, max: s + len - 40,
          speed: 120 + 40 * d, every: 1.3 - 0.4 * d,
        });
      }
      seedRow(s + len / 2 - 60, 250, 4);
    },
    // Bats hanging from vines swoop down when you pass beneath
    batCave() {
      const s = x, len = between(520, 640), count = d > 0.6 ? 3 : 2;
      ground(len);
      const spread = (len - 300) / (count - 1);
      for (let i = 0; i < count; i++) {
        L.bats.push({ x: Math.round(s + 150 + i * spread), y: 110, speed: 230 + 90 * d });
      }
      seedRow(s + len / 2 - 60, 320, 4);
    },
    // A plant spitting thorns along the ground; stomp it from the ledge
    spitter() {
      const s = x;
      ground(620);
      L.solids.push({ x: s + 150, y: 260, w: 100, h: 16, kind: 'ledge' });
      L.seeds.push([s + 192, 228]);
      const spit = { every: 2.2 - 0.8 * d, shotSpeed: 170 + 60 * d };
      L.spitters.push({ x: s + 340, ...spit });
      if (d > 0.6) L.spitters.push({ x: s + 470, ...spit });
    },
  };

  const pool = chunkPoolFor(n);
  const count = 9 + Math.floor(n * 0.8);
  // Longer levels get two checkpoints, at a third and two thirds of the way
  const checkpointAfter = count >= 12
    ? [Math.floor(count / 3), Math.floor((count * 2) / 3)]
    : [Math.floor(count / 2)];
  const checkpoints = [];
  let prev = null;

  ground(START_RUN);
  for (let i = 0; i < count; i++) {
    let chunk;
    do {
      chunk = pool[Math.floor(r() * pool.length)];
    } while (chunk === prev && pool.length > 1);
    prev = chunk;
    chunks[chunk]();
    if (checkpointAfter.includes(i)) checkpoints.push(x - CHECKPOINT_INSET);
  }
  ground(FINISH_RUN);

  return {
    ...L,
    width: x,
    start: { x: 60, y: 300 },
    checkpoints,
    goalX: x - GOAL_INSET,
    boss: null,
  };
}
