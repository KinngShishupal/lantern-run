// Boss behavior. Each boss has a movement style (ground or fly) plus optional
// attacks from its config: charges, ground-slam shockwaves, projectiles and
// minions. At half health it enrages and its `phase2` config is merged in.

import {
  BEETLE_SIZE,
  BOSS_DEFEAT_DELAY,
  BOSS_STOMP_BOUNCE,
  GRAVITY,
  GROUND_Y,
  JUMP_VELOCITY,
  MOTH_SIZE,
  SCORE,
  SHOT_SIZE,
} from '../../constants';
import { BOSS_SPAWN_MARGIN } from '../levels/bossArena';
import { inset, isStomp, overlaps } from './collision';
import { GAME_EVENTS } from './events';

const STOMP_TOLERANCE = 24;
const HURT_COOLDOWN = 1.0;
/** Each lost hit point makes the boss this much faster. */
const RAGE_PER_HIT = 0.15;
/** Seconds the "enraged" banner stays up. */
export const ENRAGE_BANNER_TIME = 1.8;

const FLY = {
  bobAmplitude: 18,
  bobSpeed: 2,
  diveSpeed: 300,
  riseSpeed: 180,
  restTime: 1.0,
};

/** Dizzy time after a charge slams into the arena wall: a chance to stomp. */
const CHARGE_STUN_TIME = 1.1;
/** Aimed leaps (jumpAim) cover ground this many times the walking speed. */
const LEAP_SPEED_FACTOR = 2.4;
/** Falling at least this fast when landing counts as a slam. */
const SLAM_MIN_SPEED = 250;

const SHOCKWAVE = { w: 26, h: 22, speed: 280 };
/** Screen shake durations, in seconds. */
const SHAKE = { slam: 0.3, crash: 0.45, enrage: 0.6 };

const RAIN_OFFSETS = [-160, 0, 160];
const RAIN_SPREAD = 60;
const RAIN_SPEED = 230;
const SPREAD_ANGLES = [-0.3, 0, 0.3];
const BURST_COUNT = 10;
const BURST_SPEED = 190;
const DEFAULT_SHOT_SPEED = 220;
const MINION_SPEED = { beetle: 95, moth: 85 };

const shake = (g, seconds) => {
  g.shake = Math.max(g.shake, seconds);
};

/**
 * After the player loses a life: clears projectiles, shockwaves and minions,
 * and sends the boss back to the far side so the restart is fair.
 */
export function resetBossFight(g) {
  const b = g.level.boss;
  g.level.shockwaves = [];
  if (!b || b.dead) return;
  // In an arena, every beetle and flyer is a minion
  for (const m of g.level.beetles) m.dead = true;
  for (const m of g.level.flyers) m.dead = true;
  b.x = g.level.width - b.w - BOSS_SPAWN_MARGIN;
  b.vx = 0;
  b.mode = b.type === 'fly' ? 'hover' : 'walk';
  b.chargeTimer = b.charge?.every ?? 0;
  if (b.type === 'fly') {
    b.y = b.hoverY;
    b.swoopTimer = b.swoopEvery;
  }
}

function spawnShockwaves(g, b) {
  const cx = b.x + b.w / 2;
  for (const dir of [-1, 1]) {
    g.level.shockwaves.push({
      x: cx - SHOCKWAVE.w / 2 + (dir * b.w) / 2,
      y: GROUND_Y - SHOCKWAVE.h,
      w: SHOCKWAVE.w,
      h: SHOCKWAVE.h,
      vx: dir * SHOCKWAVE.speed,
      t: 0,
    });
  }
  shake(g, SHAKE.slam);
}

function fireShots(g, b, type, bossCenter) {
  const p = g.player;
  const playerCenter = p.x + p.w / 2;
  const fire = (x, y, vx, vy) => g.level.shots.push({ x, y, w: SHOT_SIZE, h: SHOT_SIZE, vx, vy });
  const sx = bossCenter - SHOT_SIZE / 2;
  const sy = b.y + b.h * 0.3;
  const speed = b.shotSpeed ?? DEFAULT_SHOT_SPEED;

  switch (type) {
    case 'aim':
    case 'spread': {
      const aim = Math.atan2(p.y + p.h / 2 - sy, playerCenter - bossCenter);
      const angles = type === 'aim' ? [0] : SPREAD_ANGLES;
      for (const a of angles) fire(sx, sy, Math.cos(aim + a) * speed, Math.sin(aim + a) * speed);
      break;
    }
    case 'burst': {
      const cy = b.y + b.h / 2 - SHOT_SIZE / 2;
      for (let i = 0; i < BURST_COUNT; i++) {
        const a = (i / BURST_COUNT) * Math.PI * 2;
        fire(sx, cy, Math.cos(a) * BURST_SPEED, Math.sin(a) * BURST_SPEED);
      }
      break;
    }
    default: // 'rain': falls from the sky around the player
      for (const offset of RAIN_OFFSETS) {
        fire(playerCenter + offset + (Math.random() - 0.5) * RAIN_SPREAD, -20, 0, RAIN_SPEED);
      }
  }
}

/** Fires on a timer; `shot` may be a list, used in turn. */
function shoot(g, b, bossCenter, rage, dt) {
  if (!b.shootEvery || b.mode === 'stunned') return;
  b.shootTimer -= dt;
  if (b.shootTimer > 0) return;
  b.shootTimer = b.shootEvery / rage;
  const types = Array.isArray(b.shot) ? b.shot : [b.shot];
  fireShots(g, b, types[b.shotIndex % types.length], bossCenter);
  b.shotIndex += 1;
}

function spawnMinions(g, b, rage, dt) {
  const m = b.minions;
  if (!m) return;
  b.minionTimer -= dt;
  if (b.minionTimer > 0) return;
  b.minionTimer = m.every / rage;

  const pool = m.kind === 'moth' ? g.level.flyers : g.level.beetles;
  if (pool.filter((e) => !e.dead).length >= m.max) return;
  const x = b.x + b.w / 2 - 15;
  const dir = g.player.x < x ? -1 : 1;
  const speed = MINION_SPEED[m.kind];
  const { width } = g.level;
  if (m.kind === 'moth') {
    const baseY = 190 + Math.round(Math.random() * 70);
    pool.push({
      kind: 'moth', x, y: baseY, baseY, amp: 30, ...MOTH_SIZE,
      min: 40, max: width - 40, speed, dir, t: 0, dead: false,
    });
  } else {
    pool.push({
      x, y: GROUND_Y - BEETLE_SIZE.h, ...BEETLE_SIZE, min: 0, max: width, speed, dir, dead: false,
    });
  }
}

// Flying bosses hover toward the player, dive, rest on the ground, then rise.
function moveFlyer(g, b, toward, rage, dt) {
  switch (b.mode) {
    case 'hover':
      b.x += toward * b.speed * rage * dt;
      b.y = b.hoverY + Math.sin(b.t * FLY.bobSpeed) * FLY.bobAmplitude;
      b.swoopTimer -= dt;
      if (b.swoopTimer <= 0) b.mode = 'dive';
      break;
    case 'dive':
      b.y += FLY.diveSpeed * dt;
      b.x += toward * b.speed * 0.5 * dt;
      if (b.y >= GROUND_Y - b.h) {
        b.y = GROUND_Y - b.h;
        b.mode = 'rest';
        b.restTimer = FLY.restTime;
        if (b.slam) spawnShockwaves(g, b);
      }
      break;
    case 'rest':
      b.restTimer -= dt;
      if (b.restTimer <= 0) b.mode = 'rise';
      break;
    default: // 'rise'
      b.y -= FLY.riseSpeed * dt;
      if (b.y <= b.hoverY) {
        b.y = b.hoverY;
        b.mode = 'hover';
        b.swoopTimer = b.swoopEvery / rage;
      }
  }
}

// Ground bosses chase the player (backing off after a hit), and depending on
// their config jump, slam the ground on landing, or wind up and charge.
function moveWalker(g, b, toward, rage, dt, emit) {
  switch (b.mode) {
    case 'windup':
      b.vx = 0;
      b.modeTimer -= dt;
      if (b.modeTimer <= 0) b.mode = 'charge';
      break;
    case 'charge':
      b.vx = b.facing * b.charge.speed;
      break;
    case 'stunned':
      b.vx = 0;
      b.modeTimer -= dt;
      if (b.modeTimer <= 0) b.mode = 'walk';
      break;
    default: {
      // 'walk'
      const dir = b.hurt > 0 ? -toward : toward;
      b.vx = b.onGround || !b.jumpAim ? dir * b.speed * rage : b.vx;
      if (b.charge && b.onGround) {
        b.chargeTimer -= dt;
        if (b.chargeTimer <= 0) {
          b.mode = 'windup';
          b.modeTimer = b.charge.windup;
          b.chargeTimer = b.charge.every / rage;
          b.vx = 0;
          break;
        }
      }
      if (b.jumpEvery) {
        b.jumpTimer -= dt;
        if (b.onGround && b.jumpTimer <= 0) {
          b.vy = -b.jumpPower;
          b.jumpTimer = b.jumpEvery / rage;
          if (b.jumpAim) b.vx = toward * b.speed * LEAP_SPEED_FACTOR * rage;
        }
      }
    }
  }

  b.x += b.vx * dt;
  const maxX = g.level.width - b.w;
  if (b.mode === 'charge' && (b.x <= 0 || b.x >= maxX)) {
    b.mode = 'stunned';
    b.modeTimer = CHARGE_STUN_TIME;
    shake(g, SHAKE.crash);
    emit(GAME_EVENTS.bossSlam);
  }

  const fallSpeed = b.vy;
  b.vy += GRAVITY * dt;
  b.y += b.vy * dt;
  const wasOnGround = b.onGround;
  b.onGround = false;
  if (b.y + b.h >= GROUND_Y) {
    b.y = GROUND_Y - b.h;
    b.vy = 0;
    b.onGround = true;
    if (!wasOnGround && b.slam && fallSpeed > SLAM_MIN_SPEED) {
      spawnShockwaves(g, b);
      emit(GAME_EVENTS.bossSlam);
    }
  }
}

function enrage(g, b, emit) {
  b.enraged = true;
  Object.assign(b, b.phase2);
  b.enrageBanner = ENRAGE_BANNER_TIME;
  b.chargeTimer = 1.5;
  b.minionTimer = 1.5;
  for (const v of g.level.vents) v.dormant = false; // the arena wakes up too
  shake(g, SHAKE.enrage);
  emit(GAME_EVENTS.bossEnraged);
}

/** Stomping the top hurts the boss; touching its side hurts the player. */
function resolveContact(g, b, emit) {
  const p = g.player;
  if (!overlaps(p, b)) return false;

  if (!isStomp(p, b, STOMP_TOLERANCE)) return b.hurt <= 0 && p.invuln <= 0;

  p.vy = -JUMP_VELOCITY * BOSS_STOMP_BOUNCE;
  if (b.hurt > 0) return false;
  b.hp -= 1;
  b.hurt = HURT_COOLDOWN;
  g.score += SCORE.bossHit;
  emit(GAME_EVENTS.stomp);
  if (b.hp <= 0) {
    b.dead = true;
    g.level.shots = [];
    g.level.shockwaves = [];
    for (const m of [...g.level.beetles, ...g.level.flyers]) m.dead = true;
    g.score += SCORE.bossDefeat;
    g.bossDown = BOSS_DEFEAT_DELAY;
    shake(g, SHAKE.enrage);
  } else if (b.phase2 && !b.enraged && b.hp <= Math.ceil(b.hpMax / 2)) {
    enrage(g, b, emit);
  }
  return false;
}

/** @returns true when the player got hurt. */
export function updateBoss(g, dt, emit) {
  const b = g.level.boss;
  if (!b || b.dead) return false;

  b.t += dt;
  if (b.hurt > 0) b.hurt -= dt;
  if (b.enrageBanner > 0) b.enrageBanner -= dt;
  const bossCenter = b.x + b.w / 2;
  const toward = g.player.x + g.player.w / 2 > bossCenter ? 1 : -1;
  // A charge is committed to: no turning once the windup starts
  if (b.mode !== 'windup' && b.mode !== 'charge') b.facing = toward;
  const rage = 1 + (b.hpMax - b.hp) * RAGE_PER_HIT; // faster as it loses health

  if (b.type === 'fly') moveFlyer(g, b, toward, rage, dt);
  else moveWalker(g, b, toward, rage, dt, emit);
  b.x = Math.max(0, Math.min(g.level.width - b.w, b.x));

  shoot(g, b, bossCenter, rage, dt);
  spawnMinions(g, b, rage, dt);
  return resolveContact(g, b, emit);
}

/** @returns true when a projectile hit the player. */
export function updateShots(g, dt) {
  const { shots, width } = g.level;
  const p = g.player;
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (s.ttl != null) s.ttl -= dt;
    const expired = s.ttl != null && s.ttl <= 0;
    const offscreen = expired || s.y > GROUND_Y - 8 || s.y < -60 || s.x < -40 || s.x > width + 40;
    if (offscreen) {
      shots.splice(i, 1);
      continue;
    }
    if (p.invuln <= 0 && overlaps(p, inset(s, 3))) return true;
  }
  return false;
}

/** Ground shockwaves from a slam: jump over them. */
export function updateShockwaves(g, dt) {
  const { shockwaves, width } = g.level;
  const p = g.player;
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const s = shockwaves[i];
    s.x += s.vx * dt;
    s.t += dt;
    if (s.x < -40 || s.x > width + 40) {
      shockwaves.splice(i, 1);
      continue;
    }
    if (p.invuln <= 0 && overlaps(p, inset(s, 4, 8, 0))) return true;
  }
  return false;
}
