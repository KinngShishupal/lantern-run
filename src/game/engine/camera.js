import { STAGE_BANNER_TIME } from '../../constants';

const FOLLOW_SMOOTHING = 0.15;
/** Extra margin so objects don't pop in at the screen edges. */
const CULL_MARGIN = 80;

/** Eases the camera toward the player, snapping at the start of a stage. */
export function updateCamera(g, viewWidth) {
  const p = g.player;
  const maxCam = Math.max(0, g.level.width - viewWidth);
  const target = Math.max(0, Math.min(maxCam, p.x + p.w / 2 - viewWidth / 2));
  const stageJustStarted = g.banner > STAGE_BANNER_TIME - 0.05;
  g.camX = stageJustStarted ? target : g.camX + (target - g.camX) * FOLLOW_SMOOTHING;
}

export const isOnScreen = (obj, camX, viewWidth) =>
  obj.x + (obj.w || 0) > camX - CULL_MARGIN && obj.x < camX + viewWidth + CULL_MARGIN;
