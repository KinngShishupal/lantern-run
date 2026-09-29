import { SCORE } from '../../constants';
import { overlaps } from './collision';
import { GAME_EVENTS } from './events';

/** Lights a checkpoint lantern and moves the respawn point to it. */
export function updateCheckpoints(g, emit) {
  for (const cp of g.level.checkpoints) {
    if (cp.lit || !overlaps(g.player, cp)) continue;
    cp.lit = true;
    g.spawn = { x: cp.x - 4, y: cp.y };
    emit(GAME_EVENTS.checkpoint);
  }
}

export function collectSeeds(g, emit) {
  for (const seed of g.level.seeds) {
    if (seed.taken || !overlaps(g.player, seed)) continue;
    seed.taken = true;
    g.score += SCORE.seed;
    emit(GAME_EVENTS.seed);
  }
}
