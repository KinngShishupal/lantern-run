import { View } from 'react-native';

import { COLORS } from '../../../constants';
import { Triangle } from '../primitives';

function Wing({ S, boss, side }) {
  return (
    <View
      style={{
        position: 'absolute',
        [side]: S(-18),
        top: S(-10),
        width: S(56),
        height: S(52),
        borderRadius: S(26),
        backgroundColor: boss.dark,
        opacity: 0.7,
        transform: [{ scaleY: 0.6 + 0.4 * Math.abs(Math.sin(boss.t * 8)) }],
      }}
    />
  );
}

function FlyingBody({ S, boss }) {
  return (
    <>
      <Wing S={S} boss={boss} side="left" />
      <Wing S={S} boss={boss} side="right" />
      <View
        style={{
          position: 'absolute',
          left: S(boss.w / 2 - 26),
          top: 0,
          width: S(52),
          height: S(boss.h),
          borderRadius: S(26),
          backgroundColor: boss.color,
        }}
      />
    </>
  );
}

function GroundBody({ S, boss }) {
  return (
    <View
      style={{
        width: S(boss.w),
        height: S(boss.h),
        backgroundColor: boss.color,
        borderTopLeftRadius: S(boss.w / 2),
        borderTopRightRadius: S(boss.w / 2),
        borderBottomLeftRadius: S(8),
        borderBottomRightRadius: S(8),
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: S(boss.w / 2 - 2),
          top: 0,
          width: S(4),
          height: S(boss.h),
          backgroundColor: boss.dark,
        }}
      />
    </View>
  );
}

/** The crown marks the weak spot: stomp from above. */
function Crown({ S, boss }) {
  return (
    <View style={{ position: 'absolute', left: S(boss.w / 2 - 14), top: S(-10), flexDirection: 'row' }}>
      {[0, 1, 2].map((i) => (
        <Triangle key={i} S={S} width={10} height={10} color={COLORS.glow} />
      ))}
    </View>
  );
}

function Eyes({ S, boss }) {
  const eye = { width: S(9), height: S(9), borderRadius: S(5), backgroundColor: COLORS.paper };
  return (
    <View
      style={{
        position: 'absolute',
        top: S(boss.h * 0.3),
        left: boss.facing > 0 ? S(boss.w * 0.55) : S(boss.w * 0.15),
        flexDirection: 'row',
      }}
    >
      <View style={eye} />
      <View style={[eye, { marginLeft: S(6) }]} />
    </View>
  );
}

export function Boss({ S, boss }) {
  const blinking = boss.hurt > 0 && Math.floor(boss.hurt * 12) % 2 === 0;
  return (
    <View
      style={{
        position: 'absolute',
        left: S(boss.x),
        top: S(boss.y),
        width: S(boss.w),
        height: S(boss.h),
        opacity: blinking ? 0.35 : 1,
      }}
    >
      {boss.type === 'fly' ? <FlyingBody S={S} boss={boss} /> : <GroundBody S={S} boss={boss} />}
      <Crown S={S} boss={boss} />
      <Eyes S={S} boss={boss} />
    </View>
  );
}
