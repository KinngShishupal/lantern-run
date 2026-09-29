// Animated backdrop for the landing screen: a moonlit sky with twinkling
// stars, drifting fireflies and layered hills. Animations run on the native
// driver, so they cost the JS thread nothing once started.

import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { COLORS, WORLDS } from '../../constants';
import { createRandom } from '../../game/levels/random';

const STAR_COUNT = 26;
const FIREFLY_COUNT = 16;

const loop = (value, duration, delay = 0) =>
  Animated.loop(
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]),
  );

function Twinkle({ x, y, size, delay }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const anim = loop(v, 1400 + delay % 900, delay);
    anim.start();
    return () => anim.stop();
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: COLORS.paper,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.95] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] }) }],
      }}
    />
  );
}

function Firefly({ x, y, dx, dy, duration, delay }) {
  const drift = useState(() => new Animated.Value(0))[0];
  const glow = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const a = loop(drift, duration, delay);
    const b = loop(glow, 900 + (delay % 700), delay / 2);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [drift, glow, duration, delay]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
        transform: [
          { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
          { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
        ],
      }}
    >
      <View style={styles.fireflyHalo}>
        <View style={styles.fireflyCore} />
      </View>
    </Animated.View>
  );
}

/** Slowly breathing moon glow. */
function Moon({ x, y }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const anim = loop(v, 3000);
    anim.start();
    return () => anim.stop();
  }, [v]);
  return (
    <View style={{ position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120 }}>
      <Animated.View
        style={[
          styles.moonHalo,
          { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) }] },
        ]}
      />
      <View style={styles.moon}>
        <View style={styles.moonShade} />
      </View>
    </View>
  );
}

export function NightSky() {
  const { width, height } = useWindowDimensions();
  const r = useMemo(() => createRandom(2024), []);
  const stars = useMemo(
    () => Array.from({ length: STAR_COUNT }, (_, i) => ({
      x: r() * width, y: r() * height * 0.55, size: 2 + r() * 2.5, delay: Math.round(r() * 2000) + i,
    })),
    [r, width, height],
  );
  const flies = useMemo(
    () => Array.from({ length: FIREFLY_COUNT }, () => ({
      x: r() * width, y: height * (0.35 + r() * 0.6),
      dx: (r() - 0.5) * 120, dy: (r() - 0.5) * 80,
      duration: 2600 + r() * 2600, delay: Math.round(r() * 1500),
    })),
    [r, width, height],
  );
  const [far, near] = [WORLDS[0].theme.hillFar, WORLDS[0].theme.hillNear];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="landingSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0E0B20" />
            <Stop offset="0.7" stopColor={WORLDS[0].theme.sky} />
            <Stop offset="1" stopColor="#43336B" />
          </LinearGradient>
          <RadialGradient id="landingHaze" cx="50%" cy="100%" r="70%">
            <Stop offset="0" stopColor={COLORS.glow} stopOpacity={0.16} />
            <Stop offset="1" stopColor={COLORS.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={240} fill="url(#landingSky)" />
        <Rect x={0} y={60} width={400} height={180} fill="url(#landingHaze)" />
        {[40, 130, 230, 330, 410].map((x, i) => (
          <Ellipse key={`f${x}`} cx={x} cy={214} rx={70 + (i % 2) * 20} ry={52 + (i % 3) * 8} fill={far} />
        ))}
        {[0, 90, 170, 260, 350].map((x, i) => (
          <Ellipse key={`n${x}`} cx={x} cy={236} rx={60 + (i % 2) * 18} ry={34 + (i % 3) * 6} fill={near} />
        ))}
        {/* distant lanterns glowing on the hills */}
        {[[118, 176], [262, 184], [352, 196]].map(([x, y]) => (
          <Circle key={x} cx={x} cy={y} r={2} fill={COLORS.glow} opacity={0.8} />
        ))}
      </Svg>
      <Moon x={width * 0.82} y={height * 0.16} />
      {stars.map((s, i) => <Twinkle key={i} {...s} />)}
      {flies.map((f, i) => <Firefly key={i} {...f} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  moonHalo: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(246, 239, 217, 0.12)',
  },
  moon: {
    position: 'absolute',
    left: 34,
    top: 34,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.paper,
    overflow: 'hidden',
  },
  moonShade: {
    position: 'absolute',
    left: 18,
    top: -6,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(43, 35, 80, 0.3)',
  },
  fireflyHalo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 209, 102, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireflyCore: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.glow },
});
