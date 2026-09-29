// Terrain that reacts or runs on a timer: crumbling ledges, bounce mushrooms,
// flame vents and thorn wheels. Hazard updates return true when the player
// got hurt, so the step can stop.

import {
  AIR_JUMPS,
  FLAME_HEIGHT,
  GRAVITY,
  GROUND_Y,
  MUSHROOM_BOUNCE_VELOCITY,
  PIT_DEPTH,
} from '../../constants';
import { inset, overlaps } from './collision';
import { GAME_EVENTS } from './events';

const CRUMBLE = { shakeTime: 0.45, respawnTime: 3 };
const SQUASH_RECOVERY = 6; // per second
/** Vent cycle, in seconds: idle, then a warning flicker, then fire. */
export const VENT_CYCLE = { period: 2.4, warn: 0.5, fire: 0.9 };
const FLAME_HITBOX_DX = 6;
const WHEEL_HITBOX_INSET = 6;

/** Crumbling ledges shake when stood on, fall away, then grow back. */
export function updateTerrain(solids, p, dt) {
  for (const s of solids) {
    if (s.kind === 'mushroom') {
      s.squash = Math.max(0, s.squash - SQUASH_RECOVERY * dt);
      continue;
    }
    if (s.kind !== 'crumble') continue;
    switch (s.state) {
      case 'solid':
        if (p.standingOn === s) {
          s.state = 'shaking';
          s.timer = CRUMBLE.shakeTime;
        }
        break;
      case 'shaking':
        s.timer -= dt;
        if (s.timer <= 0) {
          s.state = 'falling';
          s.off = true; // no longer collides
          s.vy = 0;
        }
        break;
      case 'falling':
        s.vy += GRAVITY * dt;
        s.y += s.vy * dt;
        if (s.y > PIT_DEPTH) {
          s.state = 'gone';
          s.timer = CRUMBLE.respawnTime;
        }
        break;
      default: // 'gone': regrow once the spot is clear
        s.timer -= dt;
        if (s.timer <= 0 && !overlaps(p, { ...s, y: s.homeY })) {
          s.state = 'solid';
          s.y = s.homeY;
          s.off = false;
        }
    }
  }
}

/** Landing on a mushroom launches the player high into the air. */
export function bounceOnMushrooms(p, emit) {
  const s = p.standingOn;
  if (s?.kind !== 'mushroom') return;
  s.squash = 1;
  p.vy = -MUSHROOM_BOUNCE_VELOCITY;
  p.onGround = false;
  p.standingOn = null;
  p.coyote = 0;
  p.airJumps = AIR_JUMPS;
  p.springing = true; // full height even without holding jump
  emit(GAME_EVENTS.bounce);
}

export function updateVents(g, dt) {
  const p = g.player;
  let hurt = false;
  for (const v of g.level.vents) {
    v.t = (v.t + dt) % VENT_CYCLE.period;
    const fireStart = VENT_CYCLE.period - VENT_CYCLE.fire;
    v.phase = v.t >= fireStart ? 'fire' : v.t >= fireStart - VENT_CYCLE.warn ? 'warn' : 'idle';
    if (v.phase !== 'fire' || p.invuln > 0) continue;
    const flame = {
      x: v.x + FLAME_HITBOX_DX,
      y: GROUND_Y - FLAME_HEIGHT,
      w: v.w - FLAME_HITBOX_DX * 2,
      h: FLAME_HEIGHT,
    };
    if (overlaps(p, flame)) hurt = true;
  }
  return hurt;
}

/** Spiked wheels swinging around a pivot. */
export function updateWheels(g, dt) {
  const p = g.player;
  let hurt = false;
  for (const w of g.level.wheels) {
    w.angle += w.speed * dt;
    w.x = w.cx + Math.cos(w.angle) * w.radius - w.w / 2;
    w.y = w.cy + Math.sin(w.angle) * w.radius - w.h / 2;
    if (p.invuln <= 0 && overlaps(p, inset(w, WHEEL_HITBOX_INSET))) hurt = true;
  }
  return hurt;
}
