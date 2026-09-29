// Game rules: lives, timers and scoring.

export const START_LIVES = 3;
export const RESPAWN_INVULNERABILITY = 1.5; // seconds
export const STAGE_BANNER_TIME = 2.2; // seconds
export const BOSS_DEFEAT_DELAY = 1.6; // seconds before the stage clears

export const SCORE = {
  seed: 10,
  moth: 30,
  beetle: 50,
  hopper: 40,
  bat: 40,
  spitter: 60,
  bossHit: 100,
  bossDefeat: 500,
  lifeBonus: 100, // per life left when a stage is cleared
};

export const GAME_STATUS = {
  playing: 'playing',
  cleared: 'cleared',
  won: 'won',
  over: 'over',
};
