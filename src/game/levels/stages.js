// 4 worlds x (3 levels + 1 boss) = 16 stages.

import { WORLDS } from '../../constants';
import { buildBossArena } from './bossArena';
import { generateLevel } from './generateLevel';
import { instantiateLevel } from './instantiateLevel';

const LEVELS_PER_WORLD = 3;

export const STAGES = WORLDS.flatMap((world, w) => [
  ...Array.from({ length: LEVELS_PER_WORLD }, (_, l) => ({
    kind: 'level',
    world: w,
    number: w * LEVELS_PER_WORLD + l + 1,
    label: `World ${w + 1}-${l + 1}`,
    name: world.name,
  })),
  { kind: 'boss', world: w, label: `World ${w + 1} boss`, name: world.boss.name },
]);

export const isLastStage = (index) => index === STAGES.length - 1;

/** Builds a fresh, playable copy of the stage at `index`. */
export function buildStage(index) {
  const stage = STAGES[index];
  const world = WORLDS[stage.world];
  const def = stage.kind === 'boss' ? buildBossArena(world) : generateLevel(stage.number);
  return instantiateLevel(def, world.theme);
}
