// Maps engine events to sound effects and music changes.

import { GAME_EVENTS } from '../game/engine/events';
import { playEffect, restartMusic, stopMusic } from './sounds';

const EFFECT_FOR_EVENT = {
  [GAME_EVENTS.jump]: 'jump',
  [GAME_EVENTS.doubleJump]: 'jump',
  [GAME_EVENTS.seed]: 'seed',
  [GAME_EVENTS.checkpoint]: 'seed',
  [GAME_EVENTS.stomp]: 'stomp',
  [GAME_EVENTS.bounce]: 'jump',
  [GAME_EVENTS.hurt]: 'hurt',
  [GAME_EVENTS.stageCleared]: 'win',
  [GAME_EVENTS.gameOver]: 'gameover',
};

const STOPS_MUSIC = new Set([GAME_EVENTS.stageCleared, GAME_EVENTS.gameOver]);

export function handleGameEvent(event) {
  const effect = EFFECT_FOR_EVENT[event];
  if (effect) playEffect(effect);
  if (STOPS_MUSIC.has(event)) stopMusic();
  if (event === GAME_EVENTS.stageStarted) restartMusic();
}
