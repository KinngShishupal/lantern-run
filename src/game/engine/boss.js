import {
  BOSS_DEFEAT_DELAY,
  BOSS_STOMP_BOUNCE,
  GRAVITY,
  GROUND_Y,
  JUMP_VELOCITY,
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

const FLY = {
  bobAmplitude: 18,
  bobSpeed: 2,
  diveSpeed: 300,
  riseSpeed: 180,
  restTime: 1.0,
};

const RAIN_OFFSETS = [-160, 0, 160];
const RAIN_SPREAD = 60;
const RAIN_SPEED = 230;

/** Sends the boss back to the far side so a respawn is fair. */
export function resetBossPosition(b, arenaWidth) {
  if (!b || b.dead) return;
  b.x = arenaWidth - b.w - BOSS_SPAWN_MARGIN;
  b.vx = 0;
  if (b.type === 'fly') {
    b.y = b.hoverY;
    b.mode = 'hover';
    b.swoopTimer = b.swoopEvery;
  }
}

// Flying bosses hover toward the player, dive, rest on the ground, then rise.
function moveFlyer(b, toward, rage, dt) {
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

// Ground bosses chase the player (backing off after a hit) and may jump.
function moveWalker(b, toward, rage, dt) {
  const dir = b.hurt > 0 ? -toward : toward;
  b.vx = dir * b.speed * rage;
  b.x += b.vx * dt;
  if (b.jumpEvery) {
    b.jumpTimer -= dt;
    if (b.onGround && b.jumpTimer <= 0) {
      b.vy = -b.jumpPower;
      b.jumpTimer = b.jumpEvery / rage;
    }
  }
  b.vy += GRAVITY * dt;
  b.y += b.vy * dt;
  b.onGround = false;
  if (b.y + b.h >= GROUND_Y) {
    b.y = GROUND_Y - b.h;
    b.vy = 0;
    b.onGround = true;
  }
}

// Aimed shots leave from `bossCenter`, where the boss was at the frame's start.
function shoot(g, b, bossCenter, rage, dt) {
  if (!b.shootEvery) return;
  b.shootTimer -= dt;
  if (b.shootTimer > 0) return;
  b.shootTimer = b.shootEvery / rage;

  const p = g.player;
  const playerCenter = p.x + p.w / 2;
  const fire = (x, y, vx, vy) => g.level.shots.push({ x, y, w: SHOT_SIZE, h: SHOT_SIZE, vx, vy });

  if (b.shot === 'aim') {
    const sx = bossCenter - SHOT_SIZE / 2;
    const sy = b.y + b.h * 0.3;
    const dx = playerCenter - bossCenter;
    const dy = p.y + p.h / 2 - sy;
    const len = Math.hypot(dx, dy) || 1;
    fire(sx, sy, (dx / len) * b.shotSpeed, (dy / len) * b.shotSpeed);
  } else {
    for (const offset of RAIN_OFFSETS) {
      fire(playerCenter + offset + (Math.random() - 0.5) * RAIN_SPREAD, -20, 0, RAIN_SPEED);
    }
  }
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
    g.score += SCORE.bossDefeat;
    g.bossDown = BOSS_DEFEAT_DELAY;
  }
  return false;
}

/** @returns true when the player got hurt. */
export function updateBoss(g, dt, emit) {
  const b = g.level.boss;
  if (!b || b.dead) return false;

  b.t += dt;
  if (b.hurt > 0) b.hurt -= dt;
  const bossCenter = b.x + b.w / 2;
  const toward = g.player.x + g.player.w / 2 > bossCenter ? 1 : -1;
  b.facing = toward;
  const rage = 1 + (b.hpMax - b.hp) * RAGE_PER_HIT; // faster as it loses health

  if (b.type === 'fly') moveFlyer(b, toward, rage, dt);
  else moveWalker(b, toward, rage, dt);
  b.x = Math.max(0, Math.min(g.level.width - b.w, b.x));

  shoot(g, b, bossCenter, rage, dt);
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
    const offscreen = s.y > GROUND_Y - 8 || s.y < -60 || s.x < -40 || s.x > width + 40;
    if (offscreen) {
      shots.splice(i, 1);
      continue;
    }
    if (p.invuln <= 0 && overlaps(p, inset(s, 3))) return true;
  }
  return false;
}
