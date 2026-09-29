import { AIR_JUMPS, GAME_STATUS, PLAYER_SIZE, STAGE_BANNER_TIME } from '../../constants';
import { buildStage } from '../levels/stages';

export function createPlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    ...PLAYER_SIZE,
    vx: 0,
    vy: 0,
    onGround: false,
    standingOn: null,
    facing: 1,
    coyote: 0,
    jumpBuffer: 0,
    airJumps: AIR_JUMPS,
    springing: false, // rising from a mushroom bounce
    invuln: 0,
  };
}

/** Fresh state for a stage. Score and lives carry over between stages. */
export function createGame(stageIndex, score, lives) {
  const level = buildStage(stageIndex);
  return {
    stage: stageIndex,
    level,
    spawn: { ...level.start },
    player: createPlayer(level.start),
    score,
    stageStartScore: score,
    lives,
    status: GAME_STATUS.playing,
    banner: STAGE_BANNER_TIME,
    bossDown: 0, // countdown after a boss is beaten
    camX: 0,
    shake: 0, // seconds of screen shake left
  };
}

export const createInput = () => ({ left: false, right: false, jump: false, jumpHeldLast: false });
