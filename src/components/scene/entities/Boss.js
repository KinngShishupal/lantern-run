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

/** Glowing seams across a molten body. */
function MoltenCracks({ S, boss }) {
  const glow = 0.55 + 0.45 * Math.sin(boss.t * 5);
  const crack = (left, top, width, deg) => ({
    position: 'absolute',
    left: S(left),
    top: S(top),
    width: S(width),
    height: S(3),
    borderRadius: S(2),
    backgroundColor: boss.inferno ? COLORS.flameCore : COLORS.glow,
    opacity: glow,
    transform: [{ rotate: `${deg}deg` }],
  });
  return (
    <>
      <View style={crack(boss.w * 0.12, boss.h * 0.55, 26, 25)} />
      <View style={crack(boss.w * 0.3, boss.h * 0.75, 20, -15)} />
      <View style={crack(boss.w * 0.58, boss.h * 0.6, 28, -30)} />
      <View style={crack(boss.w * 0.7, boss.h * 0.82, 16, 10)} />
    </>
  );
}

/** A crown of living flame: taller and wilder as the fight goes on. */
function FlameCrown({ S, boss }) {
  const scale = boss.inferno ? 1.6 : boss.enraged ? 1.25 : 1;
  return (
    <View style={{ position: 'absolute', left: S(boss.w / 2 - 30), top: S(-8), width: S(60), height: S(1) }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const base = i === 2 ? 30 : i === 1 || i === 3 ? 22 : 14;
        const h = base * scale * (0.8 + 0.2 * Math.sin(boss.t * 11 + i * 1.7));
        const w = i === 2 ? 14 : 11;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: S(i * 12 + (14 - w) / 2 - 1),
              top: S(-h),
              width: S(w),
              height: S(h),
              borderTopLeftRadius: S(w),
              borderTopRightRadius: S(w),
              borderBottomLeftRadius: S(3),
              borderBottomRightRadius: S(3),
              backgroundColor: i % 2 ? COLORS.ember : COLORS.glow,
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: S(w / 2 - 2.5),
                bottom: 0,
                width: S(5),
                height: S(h * 0.5),
                borderTopLeftRadius: S(3),
                borderTopRightRadius: S(3),
                backgroundColor: COLORS.flameCore,
              }}
            />
          </View>
        );
      })}
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
  // Red eyes warn of a charge and mark an enraged boss
  const angry = boss.enraged || boss.mode === 'windup' || boss.mode === 'charge';
  const eye = { width: S(9), height: S(9), borderRadius: S(5), backgroundColor: angry ? COLORS.hp : COLORS.paper };
  const brow = {
    position: 'absolute',
    top: S(-5),
    width: S(11),
    height: S(3),
    backgroundColor: boss.dark,
  };
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
      {angry && <View style={[brow, { left: S(-1), transform: [{ rotate: '20deg' }] }]} />}
      {angry && <View style={[brow, { left: S(14), transform: [{ rotate: '-20deg' }] }]} />}
    </View>
  );
}

/** A pulsing red glow around an enraged boss. */
function RageAura({ S, boss }) {
  const pulse = 0.5 + 0.5 * Math.sin(boss.t * 8);
  const pad = 10 + pulse * 6;
  return (
    <View
      style={{
        position: 'absolute',
        left: S(-pad),
        top: S(-pad),
        width: S(boss.w + pad * 2),
        height: S(boss.h + pad * 2),
        borderRadius: S((boss.w + pad * 2) / 2),
        backgroundColor: COLORS.emberGlow,
        opacity: 0.6 + pulse * 0.4,
      }}
    />
  );
}

/** Stars circling the head while dizzy after a charge. */
function DizzyStars({ S, boss }) {
  return [0, 1, 2].map((i) => {
    const a = boss.t * 6 + (i * Math.PI * 2) / 3;
    return (
      <View
        key={i}
        style={{
          position: 'absolute',
          left: S(boss.w / 2 - 4 + Math.cos(a) * 26),
          top: S(-22 + Math.sin(a) * 6),
          width: S(8),
          height: S(8),
          borderRadius: S(2),
          backgroundColor: COLORS.glow,
          transform: [{ rotate: '45deg' }],
        }}
      />
    );
  });
}

/** Dust kicked up behind a charging boss. */
function DustTrail({ S, boss }) {
  return [0, 1, 2].map((i) => (
    <View
      key={i}
      style={{
        position: 'absolute',
        left: boss.facing > 0 ? S(-14 - i * 16) : S(boss.w + 4 + i * 16),
        top: S(boss.h - 14 + (i % 2) * 4),
        width: S(12 - i * 3),
        height: S(12 - i * 3),
        borderRadius: S(6),
        backgroundColor: COLORS.paper,
        opacity: 0.45 - i * 0.12,
      }}
    />
  ));
}

export function Boss({ S, boss }) {
  const blinking = boss.hurt > 0 && Math.floor(boss.hurt * 12) % 2 === 0;
  // Trembles while winding up a charge: the tell to get out of the way
  const tremble = boss.mode === 'windup' ? Math.sin(boss.t * 70) * 3 : 0;
  return (
    <View
      style={{
        position: 'absolute',
        left: S(boss.x + tremble),
        top: S(boss.y),
        width: S(boss.w),
        height: S(boss.h),
        opacity: blinking ? 0.35 : 1,
      }}
    >
      {boss.enraged && <RageAura S={S} boss={boss} />}
      {boss.mode === 'charge' && <DustTrail S={S} boss={boss} />}
      {boss.type === 'fly' ? <FlyingBody S={S} boss={boss} /> : <GroundBody S={S} boss={boss} />}
      {boss.look === 'ember' && <MoltenCracks S={S} boss={boss} />}
      {boss.look === 'ember' ? <FlameCrown S={S} boss={boss} /> : <Crown S={S} boss={boss} />}
      <Eyes S={S} boss={boss} />
      {boss.mode === 'stunned' && <DizzyStars S={S} boss={boss} />}
    </View>
  );
}

/** A crest of glowing rubble rolling along the ground. */
export function Shockwave({ S, wave }) {
  const { x, y, w, h, t, vx } = wave;
  const wobble = Math.sin(t * 30) * 2;
  return (
    <View style={{ position: 'absolute', left: S(x), top: S(y), width: S(w), height: S(h) }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: S(4 + wobble),
          width: S(w),
          height: S(h - 4 - wobble),
          backgroundColor: COLORS.emberGlow,
          borderTopLeftRadius: S(vx > 0 ? 4 : 14),
          borderTopRightRadius: S(vx > 0 ? 14 : 4),
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: S(5),
          top: S(10 + wobble),
          width: S(w - 10),
          height: S(h - 10 - wobble),
          backgroundColor: COLORS.glow,
          borderTopLeftRadius: S(vx > 0 ? 3 : 10),
          borderTopRightRadius: S(vx > 0 ? 10 : 3),
        }}
      />
    </View>
  );
}
