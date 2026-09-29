// Events the engine emits so other layers (audio, analytics...) can react
// without the simulation depending on them.

export const GAME_EVENTS = {
  jump: 'jump',
  doubleJump: 'doubleJump',
  seed: 'seed',
  checkpoint: 'checkpoint',
  stomp: 'stomp',
  bounce: 'bounce',
  hurt: 'hurt',
  stageCleared: 'stageCleared',
  gameOver: 'gameOver',
  stageStarted: 'stageStarted',
};
