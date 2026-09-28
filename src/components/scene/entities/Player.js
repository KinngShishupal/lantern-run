// The hero: a little cartoon kid in a cloak and knit hat, carrying a lantern.
//
// Drawn in its own 60 x 64 canvas (world units). The 26 x 30 hitbox sits at
// HITBOX_ORIGIN inside it, feet on the hitbox bottom; the art overflows the
// hitbox so the hat and lantern can stick out. Drawn facing right and
// mirrored for left. All motion is derived from the player's physics state.

import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '../../../constants';

const CANVAS = { w: 60, h: 64 };
const HITBOX_ORIGIN = { x: 17, y: 20 };
const CENTER_X = 30;
const HIP_Y = 42;
const FOOT_Y = 50;
const HAND = { x: 41, y: 35 };

const STRIDE = 0.18; // walk-cycle radians per world unit travelled
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Limb angles and offsets for the current frame. */
function getPose(p) {
  const speed = Math.abs(p.vx);
  const walking = p.onGround && speed > 20;
  const phase = p.x * STRIDE;
  const swing = walking ? Math.sin(phase) : 0;

  let legs;
  if (walking) legs = { front: { dx: swing * 5, dy: 0 }, back: { dx: -swing * 5, dy: 0 } };
  else if (p.onGround) legs = { front: { dx: 2, dy: 0 }, back: { dx: -2, dy: 0 } };
  else if (p.vy < 0) legs = { front: { dx: 4, dy: -3 }, back: { dx: -3, dy: -1 } }; // rising: knee up
  else legs = { front: { dx: 2.5, dy: 0.5 }, back: { dx: -2.5, dy: 0.5 } }; // falling: legs dangle

  // The lantern trails behind when running and lags vertical motion
  const lanternAngle =
    clamp(speed * 0.06, 0, 16) +
    (walking ? Math.sin(phase * 2) * 4 : 0) +
    clamp(p.vy * 0.012, -10, 10);

  return {
    legs,
    bob: walking ? -Math.abs(Math.sin(phase)) * 1.2 : 0,
    lanternAngle,
  };
}

function Leg({ dx, dy }) {
  const footX = CENTER_X + dx;
  const footY = FOOT_Y + dy - 2;
  return (
    <>
      <Line
        x1={CENTER_X}
        y1={HIP_Y}
        x2={footX}
        y2={footY}
        stroke={COLORS.heroBoot}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      {/* boot, toe pointing forward */}
      <Ellipse cx={footX + 1.2} cy={footY + 0.6} rx={3} ry={1.9} fill={COLORS.heroBoot} />
    </>
  );
}

function Lantern({ angle }) {
  return (
    <G rotation={angle} origin={`${HAND.x}, ${HAND.y}`}>
      {/* handle */}
      <Path
        d={`M ${HAND.x - 3} ${HAND.y + 4} Q ${HAND.x} ${HAND.y - 2} ${HAND.x + 3} ${HAND.y + 4}`}
        stroke={COLORS.lanternMetal}
        strokeWidth={1.4}
        fill="none"
      />
      {/* cap */}
      <Rect x={HAND.x - 4} y={HAND.y + 3.5} width={8} height={2.5} rx={1} fill={COLORS.lanternMetal} />
      {/* glass */}
      <Rect
        x={HAND.x - 3.5}
        y={HAND.y + 6}
        width={7}
        height={8}
        rx={2}
        fill={COLORS.glow}
        stroke={COLORS.lanternMetal}
        strokeWidth={1.2}
      />
      {/* flame */}
      <Ellipse cx={HAND.x} cy={HAND.y + 10.5} rx={1.6} ry={2.4} fill={COLORS.lanternFlame} />
      {/* base */}
      <Rect x={HAND.x - 4} y={HAND.y + 13.5} width={8} height={2} rx={1} fill={COLORS.lanternMetal} />
    </G>
  );
}

function Hero({ pose }) {
  return (
    <>
      <Leg {...pose.legs.back} />

      <G y={pose.bob}>
        {/* back arm */}
        <Line
          x1={27} y1={35} x2={24} y2={40}
          stroke={COLORS.heroCloakDark} strokeWidth={3.5} strokeLinecap="round"
        />
        {/* cloak */}
        <Path d="M 24.5 32 Q 30 29.5 35.5 32 L 38 44 Q 30 46 22 44 Z" fill={COLORS.heroCloak} />
        <Path d="M 30 32 L 30 44.8" stroke={COLORS.heroCloakDark} strokeWidth={1} />
        {/* scarf */}
        <Path d="M 24 31 Q 30 34 36 31 L 36 33 Q 30 36 24 33 Z" fill={COLORS.heroScarf} />
        <Path d="M 25 32.5 L 22 38 L 25.5 37.5 Z" fill={COLORS.heroScarf} />

        {/* head */}
        <Circle cx={CENTER_X + 1} cy={24} r={8.5} fill={COLORS.heroSkin} />
        {/* knit hat with a floppy tip */}
        <Path
          d="M 22.2 23 Q 22 14 31 14.5 Q 38.5 15 39.6 22.5 Q 31 20 22.2 23 Z"
          fill={COLORS.heroScarf}
        />
        <Path d="M 23 17 Q 18 16 16.5 20" stroke={COLORS.heroScarf} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={16.3} cy={20.5} r={2.2} fill={COLORS.paper} />
        <Path d="M 22.4 22.6 Q 31 19.6 39.6 22.2" stroke={COLORS.paper} strokeWidth={1.6} fill="none" />

        {/* face */}
        <Ellipse cx={33} cy={25.5} rx={1.4} ry={2} fill={COLORS.ink} />
        <Ellipse cx={37} cy={25.5} rx={1.4} ry={2} fill={COLORS.ink} />
        <Circle cx={33.5} cy={24.8} r={0.5} fill={COLORS.paper} />
        <Circle cx={37.5} cy={24.8} r={0.5} fill={COLORS.paper} />
        <Circle cx={31} cy={28.5} r={1.3} fill={COLORS.heroBlush} opacity={0.7} />
        <Path d="M 34 29 Q 35.5 30.4 37 29" stroke={COLORS.ink} strokeWidth={0.8} strokeLinecap="round" fill="none" />

        {/* front arm reaching out with the lantern */}
        <Line
          x1={33} y1={34} x2={HAND.x} y2={HAND.y}
          stroke={COLORS.heroCloak} strokeWidth={3.5} strokeLinecap="round"
        />
        <Circle cx={HAND.x} cy={HAND.y} r={1.8} fill={COLORS.heroSkin} />
        <Lantern angle={pose.lanternAngle} />
      </G>

      <Leg {...pose.legs.front} />
    </>
  );
}

export function Player({ S, player }) {
  const blinking = player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0;
  const pose = getPose(player);
  const flip = player.facing < 0 ? `translate(${CANVAS.w}, 0) scale(-1, 1)` : undefined;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: S(player.x - HITBOX_ORIGIN.x),
        top: S(player.y - HITBOX_ORIGIN.y),
        width: S(CANVAS.w),
        height: S(CANVAS.h),
        opacity: blinking ? 0.3 : 1,
      }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}>
        <Defs>
          <RadialGradient id="heroLanternGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={COLORS.glow} stopOpacity={0.45} />
            <Stop offset="1" stopColor={COLORS.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <G transform={flip}>
          {/* warm light around the lantern */}
          <Circle cx={HAND.x} cy={HAND.y + 9} r={18} fill="url(#heroLanternGlow)" />
          <Hero pose={pose} />
        </G>
      </Svg>
    </View>
  );
}
