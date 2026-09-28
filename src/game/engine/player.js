import {
  ACCELERATION,
  AIR_JUMPS,
  COYOTE_TIME,
  DOUBLE_JUMP_VELOCITY,
  GRAVITY,
  JUMP_BUFFER_TIME,
  JUMP_VELOCITY,
  MAX_FALL_SPEED,
  MOVE_SPEED,
  SHORT_HOP_GRAVITY_MULTIPLIER,
} from '../../constants';
import { overlaps } from './collision';
import { GAME_EVENTS } from './events';

/** Moves platforms back and forth, carrying the player if standing on one. */
export function updateMovers(solids, p, dt) {
  for (const s of solids) {
    if (s.kind !== 'mover') continue;
    const axis = s.axis === 'y' ? 'y' : 'x';
    const prev = s[axis];
    s[axis] += s.dir * s.speed * dt;
    if (s[axis] < s.min) { s[axis] = s.min; s.dir = 1; }
    if (s[axis] > s.max) { s[axis] = s.max; s.dir = -1; }
    if (p.standingOn === s) p[axis] += s[axis] - prev;
  }
}

/** Running, jumping (with coyote time + input buffering) and gravity. */
export function applyPlayerInput(p, input, dt, emit) {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir !== 0) p.facing = dir;
  p.vx += (dir * MOVE_SPEED - p.vx) * Math.min(1, ACCELERATION * dt);

  const jumpPressed = input.jump && !input.jumpHeldLast;
  input.jumpHeldLast = input.jump;
  if (p.onGround) p.airJumps = AIR_JUMPS;
  p.coyote = p.onGround ? COYOTE_TIME : p.coyote - dt;
  p.jumpBuffer = jumpPressed ? JUMP_BUFFER_TIME : p.jumpBuffer - dt;
  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = -JUMP_VELOCITY;
    p.jumpBuffer = 0;
    p.coyote = 0;
    emit(GAME_EVENTS.jump);
  } else if (jumpPressed && p.airJumps > 0) {
    // Second tap in mid-air: a fresh upward boost for extra height
    p.vy = -DOUBLE_JUMP_VELOCITY;
    p.jumpBuffer = 0;
    p.airJumps -= 1;
    emit(GAME_EVENTS.doubleJump);
  }

  // Heavier gravity when jump is released early = variable jump height
  const gravity = p.vy < 0 && !input.jump ? GRAVITY * SHORT_HOP_GRAVITY_MULTIPLIER : GRAVITY;
  p.vy = Math.min(MAX_FALL_SPEED, p.vy + gravity * dt);
}

/** Integrates velocity one axis at a time, resolving against solids. */
export function movePlayer(p, solids, worldWidth, dt) {
  p.x += p.vx * dt;
  for (const s of solids) {
    if (!overlaps(p, s)) continue;
    if (p.vx > 0) p.x = s.x - p.w;
    else if (p.vx < 0) p.x = s.x + s.w;
    p.vx = 0;
  }
  p.x = Math.max(0, Math.min(worldWidth - p.w, p.x));

  p.y += p.vy * dt;
  p.onGround = false;
  p.standingOn = null;
  for (const s of solids) {
    if (!overlaps(p, s)) continue;
    if (p.vy >= 0) {
      p.y = s.y - p.h;
      p.onGround = true;
      p.standingOn = s;
    } else {
      p.y = s.y + s.h;
    }
    p.vy = 0;
  }
}
