import {
  BEETLE_SIZE,
  CHECKPOINT_SIZE,
  EMBER_SIZE,
  GOAL_SIZE,
  GROUND_Y,
  MOTH_SIZE,
  SEED_SIZE,
  SPIKE_HEIGHT,
} from '../../constants';

/** Evenly spaced parallax hills whose radii cycle through a few sizes. */
function makeHills(worldWidth, start, spacing, baseRadius, step, variants) {
  const hills = [];
  for (let x = start; x < worldWidth + 300; x += spacing) {
    hills.push({ x, r: baseRadius + (Math.round(x / spacing) % variants) * step });
  }
  return hills;
}

/** Turns a level definition into fresh, mutable game objects. */
export function instantiateLevel(def, theme) {
  const { checkpoint, goalX } = def;
  return {
    width: def.width,
    theme,
    start: { ...def.start },
    checkpoint: checkpoint && checkpoint.x != null
      ? { x: checkpoint.x, y: GROUND_Y - CHECKPOINT_SIZE.h, ...CHECKPOINT_SIZE, lit: false }
      : null,
    solids: def.solids.map((s) => ({ ...s, dir: 1 })),
    spikes: def.spikes.map((s) => ({ x: s.x, y: GROUND_Y - SPIKE_HEIGHT, w: s.w, h: SPIKE_HEIGHT })),
    seeds: def.seeds.map(([x, y]) => ({ x, y, w: SEED_SIZE, h: SEED_SIZE, taken: false })),
    beetles: def.beetles.map((b) => ({
      ...b, y: GROUND_Y - BEETLE_SIZE.h, ...BEETLE_SIZE, dir: 1, dead: false,
    })),
    flyers: def.flyers.map((f, i) =>
      f.kind === 'moth'
        ? { ...f, x: f.min, y: f.baseY, ...MOTH_SIZE, dir: 1, t: i * 1.3, dead: false }
        : { ...f, y: f.min, ...EMBER_SIZE, dir: 1, dead: false }
    ),
    goal: goalX != null ? { x: goalX, y: GROUND_Y - GOAL_SIZE.h, ...GOAL_SIZE } : null,
    boss: def.boss,
    shots: [],
    hillsFar: makeHills(def.width, 150, 520, 200, 70, 2),
    hillsNear: makeHills(def.width, 350, 560, 150, 40, 3),
  };
}
