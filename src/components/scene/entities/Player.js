import { View } from 'react-native';

import { COLORS } from '../../../constants';

/** The hero: a little lantern that blinks while invulnerable. */
export function Player({ S, player }) {
  const blinking = player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0;
  const eye = { width: S(4), height: S(7), borderRadius: S(2), backgroundColor: COLORS.ink };

  return (
    <View style={{ position: 'absolute', left: S(player.x), top: S(player.y), opacity: blinking ? 0.3 : 1 }}>
      {/* glow */}
      <View
        style={{
          position: 'absolute',
          left: S(-14),
          top: S(-12),
          width: S(54),
          height: S(54),
          borderRadius: S(27),
          backgroundColor: COLORS.glowSoft,
        }}
      />
      {/* handle */}
      <View
        style={{
          position: 'absolute',
          left: S(9),
          top: S(-5),
          width: S(8),
          height: S(6),
          backgroundColor: COLORS.ink,
          borderRadius: S(2),
        }}
      />
      {/* body */}
      <View
        style={{
          width: S(player.w),
          height: S(player.h),
          borderRadius: S(9),
          backgroundColor: COLORS.glow,
          borderWidth: S(2.5),
          borderColor: COLORS.ink,
        }}
      >
        <View
          style={{ position: 'absolute', top: S(9), left: player.facing > 0 ? S(11) : S(4), flexDirection: 'row' }}
        >
          <View style={eye} />
          <View style={[eye, { marginLeft: S(4) }]} />
        </View>
      </View>
    </View>
  );
}
