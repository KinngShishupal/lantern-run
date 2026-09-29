import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { HeroFigure } from '../components/art/Figures';
import { NightSky } from '../components/levelSelect/NightSky';
import { StageCard } from '../components/levelSelect/StageCard';
import { COLORS, WORLDS } from '../constants';
import { STAGES } from '../game/levels/stages';
import { storyId } from '../game/story';

const stagesByWorld = WORLDS.map((_, w) =>
  STAGES.map((stage, index) => ({ stage, index })).filter(({ stage }) => stage.world === w),
);

/**
 * Landing page: every stage as a card, grouped by world. A stage opens once
 * the one before it is cleared; any open stage can be played directly.
 */
export function LevelSelectScreen({ unlocked, seenStories, onSelect, onStory }) {
  const cleared = Math.min(unlocked, STAGES.length);
  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <NightSky />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <HeroFigure height={84} />
          <View>
            <Text style={styles.title}>Lantern Run</Text>
            <Text style={styles.subtitle}>
              Bring the light home · {cleared}/{STAGES.length} stages cleared
            </Text>
          </View>
        </View>

        {WORLDS.map((world, w) => {
          const stages = stagesByWorld[w];
          const open = stages[0].index <= unlocked;
          const hasStory = seenStories.includes(storyId(w, 'intro'));
          return (
            <View key={world.name} style={styles.world}>
              <View style={styles.worldHeader}>
                <Text style={[styles.worldName, !open && styles.dim]}>
                  World {w + 1} · {world.name}
                </Text>
                {hasStory && (
                  <Pressable onPress={() => onStory(w)} hitSlop={10} accessibilityRole="button">
                    <Text style={styles.story}>▶ Story</Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.row}>
                {stages.map(({ stage, index }) => (
                  <StageCard
                    key={index}
                    stage={stage}
                    index={index}
                    locked={index > unlocked}
                    isNext={index === unlocked}
                    cleared={index < unlocked}
                    onSelect={onSelect}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
  content: { padding: 20, paddingTop: 12, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  title: {
    color: COLORS.glow,
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 209, 102, 0.6)',
    textShadowRadius: 16,
  },
  subtitle: { color: COLORS.paper, fontSize: 14, fontWeight: '600', opacity: 0.9 },
  world: { width: '100%', maxWidth: 640, marginBottom: 14 },
  worldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  worldName: {
    color: COLORS.paper,
    fontSize: 15,
    fontWeight: '800',
    textShadowColor: COLORS.ink,
    textShadowRadius: 4,
  },
  dim: { opacity: 0.55 },
  story: { color: COLORS.glow, fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10 },
});
