import { COLORS, GROUND_THICKNESS, GROUND_Y, MUSHROOM_SIZE } from '../../constants';

const ARENA_WIDTH = 1400;
/** Distance the boss keeps from the arena's right wall when (re)spawned. */
export const BOSS_SPAWN_MARGIN = 150;

function createBoss(cfg, arenaWidth) {
  return {
    ...cfg,
    x: arenaWidth - cfg.w - BOSS_SPAWN_MARGIN,
    y: cfg.type === 'fly' ? cfg.hoverY : GROUND_Y - cfg.h,
    vx: 0,
    vy: 0,
    hpMax: cfg.hp,
    hurt: 0,
    t: 0,
    onGround: true,
    facing: -1,
    jumpTimer: cfg.jumpEvery || 0,
    shootTimer: cfg.shootEvery || 0,
    shotIndex: 0,
    swoopTimer: cfg.swoopEvery || 0,
    chargeTimer: cfg.charge?.every ?? 0,
    minionTimer: 0,
    mode: cfg.type === 'fly' ? 'hover' : 'walk',
    modeTimer: 0,
    restTimer: 0,
    enraged: false,
    inferno: false,
    enrageBanner: 0,
    bannerText: '',
    trailX: 0,
    dead: false,
  };
}

const ledge = (x, kind = 'ledge') => ({ x, y: 250, w: 150, h: 16, kind });

/** Each world's arena adds its own twist to the fight. */
const ARENA_FEATURES = {
  // Two safe ledges to escape the charge
  garden: () => ({ solids: [ledge(220), ledge(1030)] }),
  // Ledges crumble under you, so you can't wait out the shockwaves forever
  marsh: () => ({ solids: [ledge(220, 'crumble'), ledge(620, 'crumble'), ledge(1030, 'crumble')] }),
  // Bounce mushrooms reach the queen while she hovers
  ridge: () => ({
    solids: [ledge(220), ledge(1030), ...[430, 900].map((x) => ({
      x, y: GROUND_Y - MUSHROOM_SIZE.h, ...MUSHROOM_SIZE, kind: 'mushroom',
    }))],
  }),
  // A lava-lit cavern full of drifting embers, with flame vents that wake
  // up when the king enrages
  hollow: () => ({
    solids: [ledge(220), ledge(1030)],
    lava: true,
    ambient: { colors: [COLORS.ember, COLORS.glow] },
    vents: [480, 685, 890].map((x, i) => ({ x, offset: i * 0.8, dormant: true })),
  }),
};

/** A flat arena with the world's boss and its arena features. */
export function buildBossArena(world) {
  const width = ARENA_WIDTH;
  const features = ARENA_FEATURES[world.arena]?.() ?? ARENA_FEATURES.garden();
  return {
    width,
    start: { x: 100, y: 300 },
    checkpoints: [],
    solids: [{ x: 0, y: GROUND_Y, w: width, h: GROUND_THICKNESS, kind: 'ground' }, ...features.solids],
    spikes: [],
    seeds: [[280, 220], [320, 220], [1090, 220], [1130, 220]],
    beetles: [],
    flyers: [],
    vents: features.vents ?? [],
    lava: features.lava,
    ambient: features.ambient,
    goalX: null,
    boss: createBoss(world.boss, width),
  };
}
