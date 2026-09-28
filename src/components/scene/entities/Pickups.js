import { View } from 'react-native';

import { COLORS } from '../../../constants';
import { GlowOrb } from '../primitives';

export function Seed({ S, seed }) {
  return (
    <GlowOrb
      S={S}
      x={seed.x - 6}
      y={seed.y - 6}
      size={28}
      coreSize={12}
      glowColor={COLORS.glowSoft}
      coreColor={COLORS.glow}
    />
  );
}

/** A lantern post that lights up once reached. */
export function Checkpoint({ S, checkpoint }) {
  const { lit } = checkpoint;
  return (
    <View style={{ position: 'absolute', left: S(checkpoint.x), top: S(checkpoint.y) }}>
      {lit && (
        <View
          style={{
            position: 'absolute',
            left: S(-12),
            top: S(-14),
            width: S(40),
            height: S(40),
            borderRadius: S(20),
            backgroundColor: COLORS.glowSoft,
          }}
        />
      )}
      <View
        style={{
          width: S(16),
          height: S(16),
          borderRadius: S(4),
          backgroundColor: lit ? COLORS.glow : COLORS.skyLow,
          borderWidth: S(2),
          borderColor: COLORS.ink,
        }}
      />
      <View style={{ marginLeft: S(6), width: S(4), height: S(44), backgroundColor: COLORS.post }} />
    </View>
  );
}

export function GoalFlag({ S, goal }) {
  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: S(goal.x + 10),
          top: S(goal.y),
          width: S(4),
          height: S(goal.h),
          backgroundColor: COLORS.paper,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: S(goal.x + 14),
          top: S(goal.y + 4),
          width: S(34),
          height: S(22),
          backgroundColor: COLORS.glow,
          borderTopRightRadius: S(10),
          borderBottomRightRadius: S(10),
        }}
      />
    </>
  );
}
