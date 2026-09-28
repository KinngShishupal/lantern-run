// First-launch tutorial. Each step waits for the player to actually do the
// thing (or times out, for tips), so it teaches by playing.

import { GAME_EVENTS } from './engine/events';

const MOVE_DISTANCE = 100; // world units to walk before "move" counts

/**
 * @typedef {object} TutorialStep
 * @property {string} id
 * @property {{ touch: string, keys: string }} text  prompt per input method
 * @property {'move' | 'jump' | null} highlight      touch pad to highlight
 * @property {string} [completeOn]                   GAME_EVENTS value that finishes it
 * @property {(game: object) => boolean} [isComplete] checked every tick
 * @property {number} [duration]                     seconds before it finishes on its own
 */

/** @type {TutorialStep[]} */
export const TUTORIAL_STEPS = [
  {
    id: 'move',
    text: { touch: 'Hold ◀ or ▶ to move', keys: 'Use ← → or A D to move' },
    highlight: 'move',
    isComplete: (game) => Math.abs(game.player.x - game.level.start.x) > MOVE_DISTANCE,
  },
  {
    id: 'jump',
    text: { touch: 'Tap Jump to jump', keys: 'Press Space, W or ↑ to jump' },
    highlight: 'jump',
    completeOn: GAME_EVENTS.jump,
  },
  {
    id: 'doubleJump',
    text: {
      touch: 'Tap Jump again in mid-air to jump higher',
      keys: 'Press jump again in mid-air to jump higher',
    },
    highlight: 'jump',
    completeOn: GAME_EVENTS.doubleJump,
  },
  {
    id: 'goal',
    text: {
      touch: 'Collect seeds, stomp beetles, dodge spikes. Reach the flag!',
      keys: 'Collect seeds, stomp beetles, dodge spikes. Reach the flag!',
    },
    highlight: null,
    duration: 4,
  },
];
