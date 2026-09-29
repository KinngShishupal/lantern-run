import { View } from 'react-native';

import { COLORS } from '../../../constants';
import { Triangle } from '../primitives';
import { CrumbleLedge, Mushroom } from './Obstacles';

const SPIKE_TOOTH_WIDTH = 14;

/** Ground, ledges, blocks and moving platforms, with a grassy top strip. */
export function Solid({ S, solid, mossColor }) {
  const { kind } = solid;
  if (kind === 'crumble') return <CrumbleLedge S={S} solid={solid} />;
  if (kind === 'mushroom') return <Mushroom S={S} solid={solid} />;
  return (
    <View
      style={{
        position: 'absolute',
        left: S(solid.x),
        top: S(solid.y),
        width: S(solid.w),
        height: S(solid.h),
        backgroundColor: kind === 'block' ? COLORS.soilDark : COLORS.soil,
        borderRadius: kind === 'ground' ? 0 : S(5),
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: S(kind === 'block' ? 6 : 7),
          backgroundColor: kind === 'mover' ? COLORS.glow : mossColor,
        }}
      />
    </View>
  );
}

export function Spikes({ S, spikes }) {
  const count = Math.max(1, Math.round(spikes.w / SPIKE_TOOTH_WIDTH));
  const toothWidth = spikes.w / count;
  return (
    <View style={{ position: 'absolute', left: S(spikes.x), top: S(spikes.y), flexDirection: 'row' }}>
      {Array.from({ length: count }, (_, i) => (
        <Triangle key={i} S={S} width={toothWidth} height={spikes.h} color={COLORS.spike} />
      ))}
    </View>
  );
}
