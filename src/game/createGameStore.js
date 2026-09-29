// Owns the mutable game state outside React. The simulation mutates it in
// place every frame (cheap, no per-frame allocation) and bumps `version`, so
// components can subscribe with useSyncExternalStore and re-render per tick.

import { START_LIVES } from '../constants';
import { updateCamera } from './engine/camera';
import { GAME_EVENTS } from './engine/events';
import { createGame, createInput } from './engine/gameState';
import { stepGame } from './engine/stepGame';

/**
 * @param {{ onEvent?: (event: string) => void, startStage?: number }} options
 *   onEvent receives every GAME_EVENTS value, e.g. to play sounds. More
 *   listeners can be attached later with addEventListener.
 */
export function createGameStore({ onEvent = () => {}, startStage = 0 } = {}) {
  let game = createGame(startStage, 0, START_LIVES);
  let version = 0;
  let viewWidth = 0;
  const input = createInput();
  const listeners = new Set();
  const eventListeners = new Set([onEvent]);

  const emit = (event) => eventListeners.forEach((listener) => listener(event));

  const notify = () => {
    version += 1;
    listeners.forEach((listener) => listener());
  };

  const loadStage = (stageIndex, score, lives) => {
    game = createGame(stageIndex, score, lives);
    updateCamera(game, viewWidth);
    emit(GAME_EVENTS.stageStarted);
    notify();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Listens for GAME_EVENTS values; returns an unsubscribe function. */
    addEventListener(listener) {
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },
    getVersion: () => version,
    getGame: () => game,

    /** Width of the visible world, in world units. */
    setViewWidth(width) {
      viewWidth = width;
    },

    /** Merges pressed/released controls, e.g. `{ left: true }`. */
    setInput(controls) {
      Object.assign(input, controls);
    },

    tick(dt) {
      stepGame(game, input, dt, emit);
      updateCamera(game, viewWidth);
      notify();
    },

    nextStage: () => loadStage(game.stage + 1, game.score, game.lives),
    retryStage: () => loadStage(game.stage, game.stageStartScore, START_LIVES),
    startOver: () => loadStage(0, 0, START_LIVES),
  };
}
