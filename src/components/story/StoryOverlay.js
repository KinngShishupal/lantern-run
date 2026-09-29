// Full-screen illustrated story pages with typewriter text. Tap to reveal the
// whole line, tap again for the next page; Skip ends it at once.

import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { COLORS, WORLDS } from '../../constants';
import { STORIES } from '../../game/story';
import { BossFigure, HeroFigure } from '../art/Figures';
import { Scenery } from '../art/Scenery';

const CHARS_PER_SECOND = 45;
const FADE_MS = 350;

/** Seconds since mount, ticking every frame (drives typing and animation). */
function useClock() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let frame;
    const start = Date.now();
    const loop = () => {
      setT((Date.now() - start) / 1000);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
  return t;
}

function PageArt({ page, world, worldIndex, pageIndex, t, height }) {
  const { theme, boss } = world;
  const seed = worldIndex * 10 + pageIndex + 1;
  const figureH = height * 0.42;
  const bob = Math.sin(t * 2) * 4;
  switch (page.art) {
    case 'lanternLit':
    case 'lanternDark':
      return <Scenery theme={theme} seed={seed} feature={page.art} />;
    case 'boss':
      return (
        <>
          <Scenery theme={theme} seed={seed} menace />
          <BossFigure
            config={boss}
            height={figureH * 1.1}
            t={t}
            enraged
            style={[styles.bossSpot, { bottom: height * 0.2 + bob }]}
          />
        </>
      );
    case 'seeds':
      return (
        <>
          <Scenery theme={theme} seed={seed} seedGlows={16} />
          <HeroFigure height={figureH} style={[styles.heroSpot, { bottom: height * 0.19 }]} />
        </>
      );
    default: // 'hero'
      return (
        <>
          <Scenery theme={theme} seed={seed} seedGlows={4} />
          <HeroFigure height={figureH} style={[styles.heroSpot, { bottom: height * 0.19 + Math.max(0, bob) }]} />
        </>
      );
  }
}

/**
 * @param {{ worldIndex: number, kind: 'intro' | 'outro', onDone: () => void }} props
 */
export function StoryOverlay({ worldIndex, kind, onDone }) {
  const { height } = useWindowDimensions();
  const pages = STORIES[worldIndex][kind];
  const world = WORLDS[worldIndex];
  const [pageIndex, setPageIndex] = useState(0);
  const [pageStart, setPageStart] = useState(0);
  const t = useClock();
  const fade = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
  }, [fade, pageIndex]);

  const page = pages[pageIndex];
  const shown = Math.floor((t - pageStart) * CHARS_PER_SECOND);
  const typing = shown < page.text.length;
  const last = pageIndex === pages.length - 1;

  const onTap = () => {
    if (typing) {
      setPageStart(-1e6); // reveal the rest of the line
    } else if (last) {
      onDone();
    } else {
      setPageIndex(pageIndex + 1);
      setPageStart(t);
    }
  };

  const heading = kind === 'intro'
    ? `World ${worldIndex + 1} · ${world.name}`
    : worldIndex === WORLDS.length - 1 ? 'Epilogue' : `${world.name} · cleared`;

  return (
    <Pressable style={styles.root} onPress={onTap} accessibilityRole="button" accessibilityLabel="Continue story">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <PageArt page={page} world={world} worldIndex={worldIndex} pageIndex={pageIndex} t={t} height={height} />
      </Animated.View>

      <Text style={styles.heading}>{heading}</Text>
      <Pressable onPress={onDone} hitSlop={12} style={styles.skip} accessibilityRole="button">
        <Text style={styles.skipText}>Skip ›</Text>
      </Pressable>

      <View style={styles.panel}>
        <Text style={styles.text}>{page.text.slice(0, Math.max(0, shown))}</Text>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {pages.map((_, i) => (
              <View key={i} style={[styles.dot, i === pageIndex && styles.dotActive]} />
            ))}
          </View>
          {!typing && (
            <Text style={[styles.more, { opacity: 0.6 + 0.4 * Math.sin(t * 5) }]}>
              {last ? 'Tap to play ▶' : 'Tap ▶'}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.ink },
  heroSpot: { position: 'absolute', left: '14%' },
  bossSpot: { position: 'absolute', right: '12%' },
  heading: {
    position: 'absolute',
    top: 16,
    left: 20,
    color: COLORS.glow,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: COLORS.ink,
    textShadowRadius: 6,
  },
  skip: { position: 'absolute', top: 14, right: 20, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: COLORS.overlay },
  skipText: { color: COLORS.paper, fontSize: 14, fontWeight: '800' },
  panel: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.overlay,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  text: { color: COLORS.paper, fontSize: 18, lineHeight: 25, fontWeight: '600', minHeight: 50 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(246, 239, 217, 0.3)' },
  dotActive: { backgroundColor: COLORS.glow, width: 18 },
  more: { color: COLORS.glow, fontSize: 14, fontWeight: '800' },
});
