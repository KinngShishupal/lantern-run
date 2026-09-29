// Each update returns true when the player got hurt, so the step can stop.

import { GRAVITY, GROUND_Y, JUMP_VELOCITY, SCORE, SHOT_SIZE, STOMP_BOUNCE } from '../../constants';
import { inset, isStomp, overlaps, patrol } from './collision';
import { GAME_EVENTS } from './events';

const STOMP_TOLERANCE = 16;
const SPIKE_HITBOX = { dx: 4, top: 5, bottom: 0 };

function stomp(g, enemy, points, emit) {
  enemy.dead = true;
  g.player.vy = -JUMP_VELOCITY * STOMP_BOUNCE;
  g.score += points;
  emit(GAME_EVENTS.stomp);
}

export function touchesSpikes(p, spikes) {
  if (p.invuln > 0) return false;
  return spikes.some((s) =>
    overlaps(p, inset(s, SPIKE_HITBOX.dx, SPIKE_HITBOX.top, SPIKE_HITBOX.bottom))
  );
}

export function updateBeetles(g, dt, emit) {
  const p = g.player;
  for (const e of g.level.beetles) {
    if (e.dead) continue;
    patrol(e, 'x', dt, e.w);
    if (!overlaps(p, e)) continue;
    if (isStomp(p, e, STOMP_TOLERANCE)) stomp(g, e, SCORE.beetle, emit);
    else if (p.invuln <= 0) return true;
  }
  return false;
}

/** Moths float along and can be stomped; embers bob up and down and can't. */
export function updateFlyers(g, dt, emit) {
  const p = g.player;
  for (const f of g.level.flyers) {
    if (f.dead) continue;
    if (f.kind === 'moth') {
      f.t += dt;
      patrol(f, 'x', dt, f.w);
      f.y = f.baseY + Math.sin(f.t * 3) * f.amp;
    } else {
      patrol(f, 'y', dt);
    }
    if (!overlaps(p, inset(f, 3))) continue;
    if (f.kind === 'moth' && isStomp(p, f, STOMP_TOLERANCE)) stomp(g, f, SCORE.moth, emit);
    else if (p.invuln <= 0) return true;
  }
  return false;
}

/** Stomping kills `enemy`; touching it any other way hurts. */
function contact(g, enemy, points, emit) {
  const p = g.player;
  if (!overlaps(p, inset(enemy, 2))) return false;
  if (isStomp(p, enemy, STOMP_TOLERANCE)) {
    stomp(g, enemy, points, emit);
    return false;
  }
  return p.invuln <= 0;
}

const HOP_POWER = 520;

/** Crickets that sit still, then leap forward in an arc. */
export function updateHoppers(g, dt, emit) {
  for (const h of g.level.hoppers) {
    if (h.dead) continue;
    if (h.onGround) {
      h.timer -= dt;
      if (h.timer <= 0) {
        h.vy = -HOP_POWER;
        h.vx = h.dir * h.speed;
        h.onGround = false;
        h.timer = h.every;
      }
    } else {
      h.vy += GRAVITY * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      if (h.y >= GROUND_Y - h.h) {
        h.y = GROUND_Y - h.h;
        h.vx = 0;
        h.vy = 0;
        h.onGround = true;
      }
    }
    if (h.x < h.min) {
      h.x = h.min;
      h.dir = 1;
      h.vx = Math.abs(h.vx);
    }
    if (h.x + h.w > h.max) {
      h.x = h.max - h.w;
      h.dir = -1;
      h.vx = -Math.abs(h.vx);
    }
    if (contact(g, h, SCORE.hopper, emit)) return true;
  }
  return false;
}

const BAT = { triggerRange: 150, returnSpeed: 150, cooldown: 1.2 };

/** Moves `obj` up to `step` toward (tx, ty); true once it arrives. */
function moveToward(obj, tx, ty, step) {
  const dx = tx - obj.x;
  const dy = ty - obj.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= step) {
    obj.x = tx;
    obj.y = ty;
    return true;
  }
  obj.x += (dx / dist) * step;
  obj.y += (dy / dist) * step;
  obj.dir = dx >= 0 ? 1 : -1;
  return false;
}

/** Bats hang from vines, dive at where the player was, then fly back. */
export function updateBats(g, dt, emit) {
  const p = g.player;
  const px = p.x + p.w / 2;
  for (const b of g.level.bats) {
    if (b.dead) continue;
    b.t += dt;
    if (b.mode === 'perch') {
      b.cooldown -= dt;
      const near = Math.abs(px - (b.x + b.w / 2)) < BAT.triggerRange;
      if (b.cooldown <= 0 && near && p.y > b.y) {
        b.mode = 'dive';
        b.tx = px - b.w / 2;
        b.ty = Math.min(p.y + p.h / 2 - b.h / 2, GROUND_Y - b.h);
      }
    } else if (b.mode === 'dive') {
      if (moveToward(b, b.tx, b.ty, b.speed * dt)) b.mode = 'return';
    } else if (moveToward(b, b.homeX, b.homeY, BAT.returnSpeed * dt)) {
      b.mode = 'perch';
      b.cooldown = BAT.cooldown;
    }
    if (contact(g, b, SCORE.bat, emit)) return true;
  }
  return false;
}

const SPIT = { range: 420, shotLife: 3, mouthTime: 0.25 };

/** Plants that turn to face the player and spit thorns along the ground. */
export function updateSpitters(g, dt, emit) {
  const p = g.player;
  const px = p.x + p.w / 2;
  for (const s of g.level.spitters) {
    if (s.dead) continue;
    const cx = s.x + s.w / 2;
    s.facing = px < cx ? -1 : 1;
    s.mouth = Math.max(0, s.mouth - dt);
    s.timer -= dt;
    if (s.timer <= 0 && Math.abs(px - cx) < SPIT.range) {
      s.timer = s.every;
      s.mouth = SPIT.mouthTime;
      g.level.shots.push({
        kind: 'thorn',
        x: cx + (s.facing * s.w) / 2 - SHOT_SIZE / 2,
        y: s.y + 6,
        w: SHOT_SIZE,
        h: SHOT_SIZE,
        vx: s.facing * s.shotSpeed,
        vy: 0,
        ttl: SPIT.shotLife,
      });
    }
    if (contact(g, s, SCORE.spitter, emit)) return true;
  }
  return false;
}
