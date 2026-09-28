// Physics tuning, in world units per second.

export const GRAVITY = 1800;
/** Extra gravity while rising with jump released, for variable jump height. */
export const SHORT_HOP_GRAVITY_MULTIPLIER = 2.2;
export const MOVE_SPEED = 230;
export const ACCELERATION = 12;
export const JUMP_VELOCITY = 640;
/** Extra jumps allowed in mid-air (tap jump again while airborne). */
export const AIR_JUMPS = 1;
export const DOUBLE_JUMP_VELOCITY = 580;
export const MAX_FALL_SPEED = 900;

/** Grace period to still jump after walking off a ledge (seconds). */
export const COYOTE_TIME = 0.1;
/** How early a jump press is remembered before landing (seconds). */
export const JUMP_BUFFER_TIME = 0.12;

/** Upward bounce after stomping, as a fraction of JUMP_VELOCITY. */
export const STOMP_BOUNCE = 0.6;
export const BOSS_STOMP_BOUNCE = 0.75;

/** Longest simulated step, so a stall can't tunnel through walls. */
export const MAX_FRAME_DT = 1 / 30;
