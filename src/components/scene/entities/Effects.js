import { View } from 'react-native';

import { COLORS, GROUND_Y } from '../../../constants';

/** Sparks, embers and debris; each fades and shrinks as it runs out of life. */
export function Particles({ S, particles }) {
  return particles.map((q, i) => {
    const k = q.life / q.maxLife;
    const size = q.size * (0.4 + 0.6 * k);
    return (
      <View
        key={i}
        style={{
          position: 'absolute',
          left: S(q.x - size / 2),
          top: S(q.y - size / 2),
          width: S(size),
          height: S(size),
          borderRadius: S(size / 2),
          backgroundColor: q.color,
          opacity: Math.min(1, k * 1.5),
        }}
      />
    );
  });
}

/** Flames licking up from scorched ground; they die down as the patch expires. */
export function FirePatch({ S, patch }) {
  const { x, w, t, life } = patch;
  const fade = Math.min(1, life / 0.6);
  return (
    <View style={{ position: 'absolute', left: S(x), top: S(GROUND_Y - 30), width: S(w), height: S(30), opacity: fade }}>
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: S(w), height: S(5), backgroundColor: COLORS.ember, borderRadius: S(3) }} />
      {[0, 1, 2].map((i) => {
        const h = (12 + 8 * Math.abs(Math.sin(t * 9 + i * 2.1))) * fade;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: S(3 + i * 11),
              bottom: S(3),
              width: S(10),
              height: S(h),
              borderTopLeftRadius: S(5),
              borderTopRightRadius: S(5),
              backgroundColor: i === 1 ? COLORS.glow : COLORS.ember,
            }}
          />
        );
      })}
    </View>
  );
}

/** Molten light seeping along the arena floor. */
export function LavaGlow({ S, width, t }) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);
  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: S(GROUND_Y - 26),
          width: S(width),
          height: S(26),
          backgroundColor: COLORS.emberGlow,
          opacity: 0.35 + pulse * 0.35,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: S(GROUND_Y + 8),
          width: S(width),
          height: S(4),
          backgroundColor: COLORS.ember,
          opacity: 0.6 + pulse * 0.4,
        }}
      />
      {/* glowing cracks in the ground */}
      {Array.from({ length: Math.floor(width / 140) }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: S(40 + i * 140 + (i % 3) * 23),
            top: S(GROUND_Y + 14),
            width: S(34 + (i % 2) * 20),
            height: S(3),
            backgroundColor: COLORS.glow,
            opacity: 0.4 + pulse * 0.5,
            transform: [{ rotate: `${(i % 2 ? 1 : -1) * 12}deg` }],
          }}
        />
      ))}
    </>
  );
}
