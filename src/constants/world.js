// World geometry, in world units. The visible world is WORLD_HEIGHT tall and
// scales to fit the screen; a full jump clears about 160 across and 110 up.

export const WORLD_HEIGHT = 400;
export const GROUND_Y = 360; // top of the ground
export const GROUND_THICKNESS = 40;

/** Falling this far below the world counts as falling into a pit. */
export const PIT_DEPTH = WORLD_HEIGHT + 80;

export const PLAYER_SIZE = { w: 26, h: 30 };
export const BEETLE_SIZE = { w: 28, h: 26 };
export const MOTH_SIZE = { w: 30, h: 22 };
export const EMBER_SIZE = { w: 22, h: 22 };
export const SEED_SIZE = 16;
export const SHOT_SIZE = 16;
export const SPIKE_HEIGHT = 14;
export const CHECKPOINT_SIZE = { w: 16, h: 60 };
export const GOAL_SIZE = { w: 24, h: 100 };
