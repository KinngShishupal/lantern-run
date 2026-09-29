import {
  GAME_STATUS,
  PIT_DEPTH,
  RESPAWN_INVULNERABILITY,
  SCORE,
} from '../../constants';
import { isLastStage } from '../levels/stages';
import { resetBossPosition, updateBoss, updateShots } from './boss';
import { overlaps } from './collision';
import {
  touchesSpikes,
  updateBats,
  updateBeetles,
  updateFlyers,
  updateHoppers,
  updateSpitters,
} from './enemies';
import { GAME_EVENTS } from './events';
import { createPlayer } from './gameState';
import { bounceOnMushrooms, updateTerrain, updateVents, updateWheels } from './obstacles';
import { collectSeeds, updateCheckpoints } from './pickups';
import { applyPlayerInput, movePlayer, updateMovers } from './player';

function hurtPlayer(g, emit) {
  g.lives -= 1;
  g.level.shots = [];
  if (g.lives <= 0) {
    g.status = GAME_STATUS.over;
    emit(GAME_EVENTS.gameOver);
    return;
  }
  emit(GAME_EVENTS.hurt);
  g.player = createPlayer(g.spawn);
  g.player.invuln = RESPAWN_INVULNERABILITY;
  resetBossPosition(g.level.boss, g.level.width);
}

function clearStage(g, emit) {
  g.score += g.lives * SCORE.lifeBonus;
  g.status = isLastStage(g.stage) ? GAME_STATUS.won : GAME_STATUS.cleared;
  emit(GAME_EVENTS.stageCleared);
}

/**
 * Advances the simulation by `dt` seconds, mutating `g` in place.
 * @param emit called with a GAME_EVENTS value for things other layers react to
 */
export function stepGame(g, input, dt, emit) {
  if (g.status !== GAME_STATUS.playing) return;
  if (g.banner > 0) g.banner -= dt;
  if (g.bossDown > 0) {
    g.bossDown -= dt;
    if (g.bossDown <= 0) {
      clearStage(g, emit);
      return;
    }
  }

  const p = g.player;
  const { solids, spikes, goal, width } = g.level;

  updateMovers(solids, p, dt);
  updateTerrain(solids, p, dt);
  applyPlayerInput(p, input, dt, emit);
  movePlayer(p, solids, width, dt);
  bounceOnMushrooms(p, emit);
  if (p.invuln > 0) p.invuln -= dt;

  const fellInPit = p.y > PIT_DEPTH;
  if (fellInPit || touchesSpikes(p, spikes)) {
    hurtPlayer(g, emit);
    return;
  }

  updateCheckpoints(g, emit);
  collectSeeds(g, emit);

  const hit =
    updateBeetles(g, dt, emit) ||
    updateFlyers(g, dt, emit) ||
    updateHoppers(g, dt, emit) ||
    updateBats(g, dt, emit) ||
    updateSpitters(g, dt, emit) ||
    updateVents(g, dt) ||
    updateWheels(g, dt) ||
    updateBoss(g, dt, emit) ||
    updateShots(g, dt);
  if (hit) {
    hurtPlayer(g, emit);
    return;
  }

  if (goal && overlaps(p, goal)) clearStage(g, emit);
}
