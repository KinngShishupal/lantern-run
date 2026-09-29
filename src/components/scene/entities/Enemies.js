import { View } from 'react-native';

import { COLORS } from '../../../constants';
import { GlowOrb } from '../primitives';

const abs = (S, x, y, w, h) => ({ position: 'absolute', left: S(x), top: S(y), width: S(w), height: S(h) });
const dot = (S, x, y, size, color) => ({ ...abs(S, x, y, size, size), borderRadius: S(size / 2), backgroundColor: color });

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
  if (shot.kind === 'meteor') {
    // A burning rock with a fading tail above it
    return (
      <>
        {[3, 2, 1].map((i) => (
          <View
            key={i}
            style={{
              ...dot(S, shot.x + 8 - (10 - i * 2) / 2, shot.y - i * 12, 10 - i * 2, COLORS.ember),
              opacity: 0.5 - i * 0.12,
            }}
          />
        ))}
        <GlowOrb
          S={S}
          x={shot.x - 10}
          y={shot.y - 10}
          size={36}
          coreSize={18}
          glowColor={COLORS.emberGlow}
          coreColor={COLORS.ember}
          coreStyle={{ borderWidth: S(3), borderColor: COLORS.glow }}
        />
      </>
    );
  }
  if (shot.kind === 'thorn') {
    return (
      <View
        style={{
          ...abs(S, shot.x, shot.y + 3, shot.w, shot.h - 6),
          backgroundColor: COLORS.thorn,
          borderRadius: S(6),
          borderWidth: S(2),
          borderColor: COLORS.plantDark,
        }}
      />
    );
  }
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

/** Cricket: squats on the ground, stretches out mid-leap. */
export function Hopper({ S, hopper }) {
  const { x, y, w, h, dir, onGround, timer } = hopper;
  const crouch = onGround && timer < 0.25 ? 3 : 0; // winds up just before a hop
  const eyeX = dir > 0 ? w - 9 : 3;
  return (
    <View style={abs(S, x, y, w, h)}>
      {/* back legs */}
      <View
        style={{
          ...abs(S, dir > 0 ? 0 : w - 14, onGround ? h - 10 : h - 4, 14, 5),
          backgroundColor: COLORS.hopperDark,
          borderRadius: S(3),
          transform: [{ rotate: onGround ? `${dir * -30}deg` : `${dir * 25}deg` }],
        }}
      />
      <View
        style={{
          ...abs(S, 2, 6 + crouch, w - 4, h - 8 - crouch),
          backgroundColor: COLORS.hopper,
          borderRadius: S(10),
        }}
      />
      <View style={dot(S, eyeX, 3 + crouch, 7, COLORS.paper)} />
      <View style={dot(S, eyeX + (dir > 0 ? 3 : 1), 5 + crouch, 3, COLORS.ink)} />
      {/* antenna */}
      <View
        style={{
          ...abs(S, eyeX + 2, -6 + crouch, 2, 10),
          backgroundColor: COLORS.hopperDark,
          transform: [{ rotate: `${dir * 30}deg` }],
        }}
      />
    </View>
  );
}

/** Bat hanging from a vine; wings spread and flap while swooping. */
export function Bat({ S, bat }) {
  const { x, y, w, h, homeX, homeY, mode, t, dir } = bat;
  const flying = mode !== 'perch';
  const flap = flying ? Math.sin(t * 22) : 0;
  const wingW = flying ? 16 : 9;
  const wingTilt = flying ? flap * 35 : 60;
  return (
    <>
      {/* the vine it hangs from, anchored at its perch */}
      <View style={{ ...abs(S, homeX + w / 2 - 1, 0, 2, homeY + 2), backgroundColor: COLORS.vine }} />
      <View style={abs(S, x, y, w, h)}>
        <View
          style={{
            ...abs(S, w / 2 - wingW, 4, wingW, 9),
            backgroundColor: COLORS.batWing,
            borderTopLeftRadius: S(8),
            borderBottomLeftRadius: S(2),
            transform: [{ rotate: `${-wingTilt}deg` }],
          }}
        />
        <View
          style={{
            ...abs(S, w / 2, 4, wingW, 9),
            backgroundColor: COLORS.batWing,
            borderTopRightRadius: S(8),
            borderBottomRightRadius: S(2),
            transform: [{ rotate: `${wingTilt}deg` }],
          }}
        />
        <View style={dot(S, w / 2 - 7, 2, 14, COLORS.bat)} />
        <View style={dot(S, w / 2 - 4 + dir, 6, 3, COLORS.batEye)} />
        <View style={dot(S, w / 2 + 1 + dir, 6, 3, COLORS.batEye)} />
      </View>
    </>
  );
}

/** Snapping plant; its mouth opens when it spits a thorn. */
export function Spitter({ S, spitter }) {
  const { x, y, w, h, facing, mouth } = spitter;
  const open = mouth > 0;
  const headX = facing > 0 ? 4 : 0;
  return (
    <View style={abs(S, x, y, w, h)}>
      <View style={{ ...abs(S, w / 2 - 3, 14, 6, h - 14), backgroundColor: COLORS.plantDark }} />
      <View style={{ ...abs(S, 0, h - 12, 12, 6), backgroundColor: COLORS.plant, borderRadius: S(6), transform: [{ rotate: '-25deg' }] }} />
      <View style={{ ...abs(S, w - 12, h - 12, 12, 6), backgroundColor: COLORS.plant, borderRadius: S(6), transform: [{ rotate: '25deg' }] }} />
      <View style={{ ...abs(S, headX, 0, w - 4, 20), backgroundColor: COLORS.plant, borderRadius: S(10) }} />
      <View
        style={{
          ...abs(S, facing > 0 ? w - 9 : 0, open ? 5 : 8, 9, open ? 10 : 4),
          backgroundColor: COLORS.plantMouth,
          borderRadius: S(3),
        }}
      />
      <View style={dot(S, facing > 0 ? headX + 8 : w - 14, 4, 5, COLORS.ink)} />
    </View>
  );
}
