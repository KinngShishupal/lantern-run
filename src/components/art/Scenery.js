// Painted backdrops drawn in a world's colors: a night sky, moon, stars,
// rolling hills and mossy ground. Used for level cards and story pages.
// Drawn on a 400 x 240 canvas that scales to cover its container.

import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '../../constants';
import { createRandom } from '../../game/levels/random';

export const SCENE = { w: 400, h: 240, groundY: 190 };

function Stars({ r, count }) {
  return Array.from({ length: count }, (_, i) => (
    <Circle
      key={i}
      cx={r() * SCENE.w}
      cy={r() * SCENE.groundY * 0.6}
      r={0.6 + r() * 1.3}
      fill={COLORS.paper}
      opacity={0.35 + r() * 0.5}
    />
  ));
}

function Hills({ r, color, baseY, count, minR, maxR }) {
  const step = SCENE.w / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const radius = minR + r() * (maxR - minR);
    return (
      <Ellipse
        key={i}
        cx={i * step + (r() - 0.5) * step * 0.6}
        cy={baseY + radius * 0.35}
        rx={radius * 1.3}
        ry={radius}
        fill={color}
      />
    );
  });
}

/** The Great Lantern on its hill; `lit` blazes, unlit is a cold husk. */
function GreatLantern({ lit, halo }) {
  const x = 200;
  const y = 70;
  return (
    <G>
      {lit && <Circle cx={x} cy={y + 28} r={120} fill={halo} />}
      {lit &&
        Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <Path
              key={i}
              d={`M ${x + Math.cos(a) * 34} ${y + 28 + Math.sin(a) * 34} L ${x + Math.cos(a) * 70} ${y + 28 + Math.sin(a) * 70}`}
              stroke={COLORS.glow}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.55}
            />
          );
        })}
      <Rect x={x - 3} y={y + 50} width={6} height={80} fill={COLORS.lanternMetal} />
      <Path d={`M ${x - 22} ${y + 6} L ${x + 22} ${y + 6} L ${x + 16} ${y - 6} L ${x - 16} ${y - 6} Z`} fill={COLORS.lanternMetal} />
      <Rect x={x - 20} y={y + 6} width={40} height={44} rx={6} fill={lit ? COLORS.glow : COLORS.skyLow} stroke={COLORS.lanternMetal} strokeWidth={4} />
      {lit && <Rect x={x - 10} y={y + 14} width={20} height={28} rx={8} fill={COLORS.lanternFlame} />}
      <Rect x={x - 24} y={y + 48} width={48} height={6} rx={3} fill={COLORS.lanternMetal} />
    </G>
  );
}

/**
 * @param {object} props
 * @param {object} props.theme      world theme (sky, hillFar, hillNear, moss)
 * @param {number} [props.seed]     varies the stars and hills
 * @param {number} [props.seedGlows] glowing seeds scattered on the ground
 * @param {'lanternLit' | 'lanternDark'} [props.feature]
 * @param {boolean} [props.menace]  a red glow on the horizon, for boss scenes
 */
export function Scenery({ theme, seed = 1, seedGlows = 0, feature, menace = false, style }) {
  // Gradient ids must be unique per drawing: on web every Svg shares one document
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name) => `${name}${uid}`;
  const url = (name) => `url(#${id(name)})`;
  const r = createRandom(seed * 131 + 7);
  const moonX = 60 + r() * 280;
  const moonY = 30 + r() * 30;
  const { groundY } = SCENE;
  return (
    <Svg
      style={[StyleSheet.absoluteFill, style]}
      viewBox={`0 0 ${SCENE.w} ${SCENE.h}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COLORS.ink} />
          <Stop offset="1" stopColor={theme.sky} />
        </LinearGradient>
        <RadialGradient id={id('moonGlow')} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={COLORS.paper} stopOpacity={0.45} />
          <Stop offset="1" stopColor={COLORS.paper} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={id('seedGlow')} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={COLORS.glow} stopOpacity={0.8} />
          <Stop offset="1" stopColor={COLORS.glow} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={id('lanternHalo')} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={COLORS.glow} stopOpacity={0.55} />
          <Stop offset="1" stopColor={COLORS.glow} stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={id('menace')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COLORS.ember} stopOpacity={0} />
          <Stop offset="1" stopColor={COLORS.ember} stopOpacity={0.45} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={SCENE.w} height={SCENE.h} fill={url('sky')} />
      <Stars r={r} count={40} />
      {menace && <Rect x={0} y={groundY * 0.35} width={SCENE.w} height={groundY * 0.65} fill={url('menace')} />}
      {!feature && (
        <>
          <Circle cx={moonX} cy={moonY} r={34} fill={url('moonGlow')} />
          <Circle cx={moonX} cy={moonY} r={15} fill={COLORS.paper} />
          <Circle cx={moonX + 6} cy={moonY - 4} r={13} fill={theme.sky} opacity={0.35} />
        </>
      )}
      <Hills r={r} color={theme.hillFar} baseY={groundY - 30} count={5} minR={40} maxR={70} />
      {feature && <GreatLantern lit={feature === 'lanternLit'} halo={url('lanternHalo')} />}
      <Hills r={r} color={theme.hillNear} baseY={groundY - 4} count={6} minR={24} maxR={44} />
      <Rect x={0} y={groundY} width={SCENE.w} height={SCENE.h - groundY} fill={COLORS.soil} />
      <Rect x={0} y={groundY} width={SCENE.w} height={6} fill={theme.moss} />
      {Array.from({ length: seedGlows }, (_, i) => {
        const x = 30 + r() * (SCENE.w - 60);
        const y = groundY - 14 - r() * 60;
        return (
          <G key={i}>
            <Circle cx={x} cy={y} r={11} fill={url('seedGlow')} />
            <Circle cx={x} cy={y} r={3.5} fill={COLORS.glow} />
          </G>
        );
      })}
    </Svg>
  );
}
