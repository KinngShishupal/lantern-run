import { GROUND_THICKNESS, GROUND_Y } from '../../constants';

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
    swoopTimer: cfg.swoopEvery || 0,
    mode: 'hover',
    restTimer: 0,
    dead: false,
  };
}

/** A flat arena with two ledges and the world's boss. */
export function buildBossArena(world) {
  const width = ARENA_WIDTH;
  return {
    width,
    start: { x: 100, y: 300 },
    checkpoints: [],
    solids: [
      { x: 0, y: GROUND_Y, w: width, h: GROUND_THICKNESS, kind: 'ground' },
      { x: 220, y: 250, w: 150, h: 16, kind: 'ledge' },
      { x: 1030, y: 250, w: 150, h: 16, kind: 'ledge' },
    ],
    spikes: [],
    seeds: [[280, 220], [320, 220], [1090, 220], [1130, 220]],
    beetles: [],
    flyers: [],
    goalX: null,
    boss: createBoss(world.boss, width),
  };
}
