import { View } from 'react-native';

import { COLORS } from '../../../constants';
import { GlowOrb } from '../primitives';

export function Beetle({ S, beetle }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: S(beetle.x),
        top: S(beetle.y),
        width: S(beetle.w),
        height: S(beetle.h),
        backgroundColor: COLORS.beetle,
        borderTopLeftRadius: S(14),
        borderTopRightRadius: S(14),
        borderBottomLeftRadius: S(4),
        borderBottomRightRadius: S(4),
      }}
    >
      {/* shell seam */}
      <View
        style={{
          position: 'absolute',
          left: S(13),
          top: 0,
          width: S(2),
          height: S(beetle.h),
          backgroundColor: COLORS.beetleDark,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: S(8),
          left: beetle.dir > 0 ? S(19) : S(4),
          width: S(5),
          height: S(5),
          borderRadius: S(3),
          backgroundColor: COLORS.ink,
        }}
      />
    </View>
  );
}

function MothWing({ S, left, flap }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: S(left),
        top: S(2 + 6 * (1 - flap)),
        width: S(14),
        height: S(10 + 6 * flap),
        borderRadius: S(8),
        backgroundColor: COLORS.mothWing,
      }}
    />
  );
}

export function Moth({ S, moth }) {
  const flap = Math.abs(Math.sin(moth.t * 14));
  return (
    <View
      style={{ position: 'absolute', left: S(moth.x), top: S(moth.y), width: S(moth.w), height: S(moth.h) }}
    >
      <MothWing S={S} left={1} flap={flap} />
      <MothWing S={S} left={15} flap={flap} />
      <View
        style={{
          position: 'absolute',
          left: S(9),
          top: S(7),
          width: S(12),
          height: S(12),
          borderRadius: S(6),
          backgroundColor: COLORS.moth,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: S(11),
          left: moth.dir > 0 ? S(16) : S(11),
          width: S(3),
          height: S(3),
          borderRadius: S(2),
          backgroundColor: COLORS.ink,
        }}
      />
    </View>
  );
}

export function Ember({ S, ember }) {
  return (
    <GlowOrb
      S={S}
      x={ember.x - 8}
      y={ember.y - 8}
      size={38}
      coreSize={20}
      glowColor={COLORS.emberGlow}
      coreColor={COLORS.ember}
      coreStyle={{ borderWidth: S(2), borderColor: COLORS.glow }}
    />
  );
}

export function Shot({ S, shot }) {
  return (
    <GlowOrb
      S={S}
      x={shot.x - 6}
      y={shot.y - 6}
      size={28}
      coreSize={14}
      glowColor={COLORS.emberGlow}
      coreColor={COLORS.ember}
    />
  );
}
