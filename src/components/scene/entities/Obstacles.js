import { View } from 'react-native';

import { COLORS, FLAME_HEIGHT, GROUND_Y } from '../../../constants';

const abs = (S, x, y, w, h) => ({ position: 'absolute', left: S(x), top: S(y), width: S(w), height: S(h) });

/** Pale stone ledge that shakes before it crumbles away. */
export function CrumbleLedge({ S, solid }) {
  if (solid.state === 'gone') return null;
  const shake = solid.state === 'shaking' ? Math.sin(solid.timer * 80) * 2 : 0;
  return (
    <View
      style={{
        ...abs(S, solid.x + shake, solid.y, solid.w, solid.h),
        backgroundColor: COLORS.crumble,
        borderRadius: S(4),
        overflow: 'hidden',
        opacity: solid.state === 'falling' ? 0.7 : 1,
      }}
    >
      {[0.28, 0.62].map((f) => (
        <View
          key={f}
          style={{
            ...abs(S, solid.w * f, 0, 3, solid.h),
            backgroundColor: COLORS.crumbleDark,
            transform: [{ rotate: '18deg' }],
          }}
        />
      ))}
    </View>
  );
}

/** Spotted mushroom that squashes when bounced on. */
export function Mushroom({ S, solid }) {
  const { x, y, w, h, squash } = solid;
  const capH = 16 * (1 - squash * 0.35);
  return (
    <>
      <View style={{ ...abs(S, x + w / 2 - 10, y + 12, 20, h - 12), backgroundColor: COLORS.mushroomStem, borderRadius: S(4) }} />
      <View
        style={{
          ...abs(S, x - squash * 4, y + (16 - capH), w + squash * 8, capH),
          backgroundColor: COLORS.mushroomCap,
          borderTopLeftRadius: S(26),
          borderTopRightRadius: S(26),
          borderBottomLeftRadius: S(6),
          borderBottomRightRadius: S(6),
        }}
      >
        {[[12, 5, 8], [34, 2, 7], [56, 6, 7]].map(([dx, dy, size]) => (
          <View
            key={dx}
            style={{ ...abs(S, dx, dy * (1 - squash * 0.35), size, size), borderRadius: S(size / 2), backgroundColor: COLORS.paper }}
          />
        ))}
      </View>
    </>
  );
}

/** A grate in the ground that flickers, then erupts into a pillar of fire. */
export function Vent({ S, vent }) {
  const { x, w, phase, t } = vent;
  const flicker = Math.sin(t * 40) * 0.5 + 0.5;
  const flameH = phase === 'fire' ? FLAME_HEIGHT * (0.92 + flicker * 0.08) : phase === 'warn' ? 10 + flicker * 8 : 0;
  const top = GROUND_Y - flameH;
  return (
    <>
      {flameH > 0 && (
        <>
          <View style={{ ...abs(S, x - 2, top, w + 4, flameH), backgroundColor: COLORS.emberGlow, borderTopLeftRadius: S(16), borderTopRightRadius: S(16) }} />
          <View style={{ ...abs(S, x + 4, top + flameH * 0.12, w - 8, flameH * 0.88), backgroundColor: COLORS.ember, borderTopLeftRadius: S(12), borderTopRightRadius: S(12) }} />
          <View style={{ ...abs(S, x + 9, top + flameH * 0.35, w - 18, flameH * 0.65), backgroundColor: COLORS.flameCore, borderTopLeftRadius: S(8), borderTopRightRadius: S(8) }} />
        </>
      )}
      <View
        style={{
          ...abs(S, x - 3, GROUND_Y - 5, w + 6, 7),
          backgroundColor: COLORS.vent,
          borderRadius: S(2),
          borderWidth: S(1),
          borderColor: phase === 'idle' ? COLORS.soilDark : COLORS.ember,
        }}
      />
    </>
  );
}

const CHAIN_LINKS = 5;

/** A spiked wheel on a chain, swinging around its pivot. */
export function ThornWheel({ S, wheel }) {
  const { cx, cy, x, y, w, angle } = wheel;
  const wx = x + w / 2;
  const wy = y + w / 2;
  const spin = `${(angle * 180) / Math.PI * 2}deg`;
  const blade = { ...abs(S, x + 4, y + 4, w - 8, w - 8), backgroundColor: COLORS.spike, borderRadius: S(3) };
  return (
    <>
      {Array.from({ length: CHAIN_LINKS }, (_, i) => {
        const f = (i + 1) / (CHAIN_LINKS + 1);
        return (
          <View
            key={i}
            style={{ ...abs(S, cx + (wx - cx) * f - 2.5, cy + (wy - cy) * f - 2.5, 5, 5), borderRadius: S(3), backgroundColor: COLORS.post }}
          />
        );
      })}
      <View style={{ ...abs(S, cx - 7, cy - 7, 14, 14), borderRadius: S(7), backgroundColor: COLORS.lanternMetal, borderWidth: S(2), borderColor: COLORS.post }} />
      <View style={[blade, { transform: [{ rotate: spin }] }]} />
      <View style={[blade, { transform: [{ rotate: spin }, { rotate: '45deg' }] }]} />
      <View style={{ ...abs(S, wx - 8, wy - 8, 16, 16), borderRadius: S(8), backgroundColor: COLORS.beetleDark }} />
    </>
  );
}
