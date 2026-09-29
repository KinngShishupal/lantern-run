// The game's own character art, posed outside the game world for menus and
// story pages.

import { View } from 'react-native';

import { Boss } from '../scene/entities/Boss';
import { Player } from '../scene/entities/Player';

const HERO_CANVAS = { w: 60, h: 64, originX: 17, originY: 20 };

/** The Lantern Keeper standing idle, `height` pixels tall. */
export function HeroFigure({ height, facing = 1, style }) {
  const k = height / HERO_CANVAS.h;
  const player = {
    x: HERO_CANVAS.originX, y: HERO_CANVAS.originY,
    vx: 0, vy: 0, onGround: true, facing, invuln: 0,
  };
  return (
    <View pointerEvents="none" style={[{ width: HERO_CANVAS.w * k, height }, style]}>
      <Player S={(n) => n * k} player={player} />
    </View>
  );
}

/** Room around a boss's body for its crown, wings and aura. */
const BOSS_PAD = { x: 34, top: 44, bottom: 6 };

/** A world's boss from its config, `height` pixels tall. `t` animates it. */
export function BossFigure({ config, height, t = 0, enraged = false, style }) {
  const boxH = config.h + BOSS_PAD.top + BOSS_PAD.bottom;
  const k = height / boxH;
  const boss = {
    ...config, x: BOSS_PAD.x, y: BOSS_PAD.top, t, hurt: 0, facing: -1,
    mode: config.type === 'fly' ? 'hover' : 'walk', enraged, inferno: false,
  };
  return (
    <View pointerEvents="none" style={[{ width: (config.w + BOSS_PAD.x * 2) * k, height }, style]}>
      <Boss S={(n) => n * k} boss={boss} />
    </View>
  );
}
