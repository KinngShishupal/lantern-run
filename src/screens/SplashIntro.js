// Animated intro played after the native splash: a lantern flickers to life,
// light rays sweep out, the night sky fades in behind the Lantern Keeper and
// the title rises into place. Tap anywhere to skip.

import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroFigure } from '../components/art/Figures';
import { NightSky } from '../components/levelSelect/NightSky';
import { COLORS } from '../constants';

const RAY_COUNT = 12;
const HOLD_MS = 2600; // time on screen before fading out on its own
const FADE_OUT_MS = 450;

const timing = (value, toValue, duration, delay = 0, easing = Easing.out(Easing.cubic)) =>
  Animated.timing(value, { toValue, duration, delay, easing, useNativeDriver: true });

/** Rotating light rays behind the hero. */
function Rays({ spin, reveal }) {
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[styles.rays, { opacity: reveal, transform: [{ rotate }, { scale: reveal }] }]}>
      {Array.from({ length: RAY_COUNT }, (_, i) => (
        <View key={i} style={[styles.rayArm, { transform: [{ rotate: `${(i * 180) / RAY_COUNT}deg` }] }]}>
          <View style={styles.ray} />
          <View style={styles.ray} />
        </View>
      ))}
    </Animated.View>
  );
}

export function SplashIntro({ onDone }) {
  const [v] = useState(() => ({
    glow: new Animated.Value(0),
    flicker: new Animated.Value(0),
    sky: new Animated.Value(0),
    hero: new Animated.Value(0),
    rays: new Animated.Value(0),
    spin: new Animated.Value(0),
    title: new Animated.Value(0),
    tagline: new Animated.Value(0),
    out: new Animated.Value(1),
  }));
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const spin = Animated.loop(timing(v.spin, 1, 14000, 0, Easing.linear));
    const flicker = Animated.loop(
      Animated.sequence([timing(v.flicker, 1, 180), timing(v.flicker, 0.4, 120), timing(v.flicker, 0.8, 220)]),
    );
    const intro = Animated.parallel([
      timing(v.glow, 1, 900, 0, Easing.out(Easing.back(1.6))),
      timing(v.sky, 1, 1100, 250),
      Animated.spring(v.hero, { toValue: 1, delay: 450, friction: 5, tension: 60, useNativeDriver: true }),
      timing(v.rays, 1, 900, 600),
      timing(v.title, 1, 700, 950),
      timing(v.tagline, 1, 600, 1350),
    ]);
    spin.start();
    flicker.start();
    intro.start();
    const timer = setTimeout(() => setLeaving(true), HOLD_MS);
    return () => {
      clearTimeout(timer);
      spin.stop();
      flicker.stop();
      intro.stop();
    };
  }, [v]);

  useEffect(() => {
    if (!leaving) return undefined;
    const anim = timing(v.out, 0, FADE_OUT_MS, 0, Easing.in(Easing.quad));
    anim.start(({ finished }) => finished && onDone());
    return () => anim.stop();
  }, [leaving, v, onDone]);

  const glowScale = v.glow.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] });
  const glowOpacity = Animated.multiply(v.glow, v.flicker.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }));
  const heroScale = v.hero.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const rise = (value, from) => value.interpolate({ inputRange: [0, 1], outputRange: [from, 0] });

  return (
    <Pressable style={styles.root} onPress={() => setLeaving(true)} accessibilityRole="button" accessibilityLabel="Skip intro">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: v.out }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: v.sky }]}>
          <NightSky />
        </Animated.View>

        <View style={styles.center}>
          <View style={styles.stage}>
            <Rays spin={v.spin} reveal={v.rays} />
            <Animated.View style={[styles.glowOuter, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
            <Animated.View style={[styles.glowInner, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
            <Animated.View
              style={{ opacity: v.hero, transform: [{ scale: heroScale }, { translateY: rise(v.hero, 30) }] }}
            >
              <HeroFigure height={150} />
            </Animated.View>
          </View>

          <Animated.Text
            style={[styles.title, { opacity: v.title, transform: [{ translateY: rise(v.title, 24) }] }]}
          >
            Lantern Run
          </Animated.Text>
          <Animated.View style={{ opacity: v.tagline, transform: [{ translateY: rise(v.tagline, 12) }] }}>
            <Text style={styles.tagline}>Bring the light home</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  stage: { width: 220, height: 170, alignItems: 'center', justifyContent: 'center' },
  rays: { position: 'absolute', width: 420, height: 420, alignItems: 'center', justifyContent: 'center' },
  rayArm: {
    position: 'absolute',
    width: 420,
    height: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ray: { width: 150, height: 10, borderRadius: 5, backgroundColor: 'rgba(255, 209, 102, 0.16)' },
  glowOuter: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 209, 102, 0.16)',
  },
  glowInner: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 209, 102, 0.22)',
  },
  title: {
    color: COLORS.glow,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
    textShadowColor: 'rgba(255, 209, 102, 0.8)',
    textShadowRadius: 22,
  },
  tagline: { color: COLORS.paper, fontSize: 16, fontWeight: '700', letterSpacing: 3, marginTop: 2, opacity: 0.9 },
});
