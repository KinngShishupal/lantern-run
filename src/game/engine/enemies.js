// Each update returns true when the player got hurt, so the step can stop.

import { JUMP_VELOCITY, SCORE, STOMP_BOUNCE } from '../../constants';
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
