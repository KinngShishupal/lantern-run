import {
  BAT_SIZE,
  BEETLE_SIZE,
  CHECKPOINT_SIZE,
  EMBER_SIZE,
  GOAL_SIZE,
  GROUND_Y,
  HOPPER_SIZE,
  MOTH_SIZE,
  SEED_SIZE,
  SPIKE_HEIGHT,
  SPITTER_SIZE,
  VENT_WIDTH,
  WHEEL_SIZE,
} from '../../constants';

/** Evenly spaced parallax hills whose radii cycle through a few sizes. */
function makeHills(worldWidth, start, spacing, baseRadius, step, variants) {
  const hills = [];
  for (let x = start; x < worldWidth + 300; x += spacing) {
    hills.push({ x, r: baseRadius + (Math.round(x / spacing) % variants) * step });
  }
  return hills;
}

function instantiateSolid(s) {
  if (s.kind === 'crumble') return { ...s, dir: 1, homeY: s.y, state: 'solid', timer: 0, vy: 0, off: false };
  if (s.kind === 'mushroom') return { ...s, dir: 1, squash: 0 };
  return { ...s, dir: 1 };
}

/** Turns a level definition into fresh, mutable game objects. */
export function instantiateLevel(def, theme) {
  const { goalX } = def;
  return {
    width: def.width,
    theme,
    start: { ...def.start },
    checkpoints: (def.checkpoints ?? []).map((x) => ({
      x, y: GROUND_Y - CHECKPOINT_SIZE.h, ...CHECKPOINT_SIZE, lit: false,
    })),
    solids: def.solids.map(instantiateSolid),
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
    hoppers: (def.hoppers ?? []).map((h, i) => ({
      ...h, y: GROUND_Y - HOPPER_SIZE.h, ...HOPPER_SIZE,
      dir: 1, vx: 0, vy: 0, onGround: true, timer: 0.5 + i * 0.4, dead: false,
    })),
    bats: (def.bats ?? []).map((b, i) => ({
      ...b, ...BAT_SIZE, homeX: b.x, homeY: b.y,
      dir: 1, mode: 'perch', cooldown: 0, t: i * 0.7, dead: false,
    })),
    spitters: (def.spitters ?? []).map((s, i) => ({
      ...s, y: GROUND_Y - SPITTER_SIZE.h, ...SPITTER_SIZE,
      facing: -1, timer: 1 + i * 0.6, mouth: 0, dead: false,
    })),
    vents: (def.vents ?? []).map((v) => ({
      x: v.x, y: GROUND_Y - 6, w: VENT_WIDTH, h: 6, t: v.offset, phase: 'idle',
    })),
    wheels: (def.wheels ?? []).map((w) => ({
      ...w,
      x: w.cx + Math.cos(w.angle) * w.radius - WHEEL_SIZE / 2,
      y: w.cy + Math.sin(w.angle) * w.radius - WHEEL_SIZE / 2,
      w: WHEEL_SIZE,
      h: WHEEL_SIZE,
    })),
    goal: goalX != null ? { x: goalX, y: GROUND_Y - GOAL_SIZE.h, ...GOAL_SIZE } : null,
    boss: def.boss,
    shots: [],
    hillsFar: makeHills(def.width, 150, 520, 200, 70, 2),
    hillsNear: makeHills(def.width, 350, 560, 150, 40, 3),
  };
}
