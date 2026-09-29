import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { COLORS, WORLDS } from '../constants';
import { STAGES } from '../game/levels/stages';

const stagesByWorld = WORLDS.map((_, w) =>
  STAGES.map((stage, index) => ({ stage, index })).filter(({ stage }) => stage.world === w),
);

/** Short text shown inside a stage box, e.g. "1-2" or "Boss". */
const boxLabel = (stage) => (stage.kind === 'boss' ? 'Boss' : stage.label.replace('World ', ''));

function StageBox({ stage, index, theme, onSelect }) {
  const boss = stage.kind === 'boss';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={boss ? `${stage.label}, ${stage.name}` : stage.label}
      onPress={() => onSelect(index)}
      style={({ pressed }) => [
        styles.box,
        { backgroundColor: theme.hillNear, borderColor: boss ? COLORS.glow : theme.moss },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.boxLabel, boss && styles.bossLabel]}>{boxLabel(stage)}</Text>
      {boss && (
        <Text style={styles.bossName} numberOfLines={1}>
          {stage.name}
        </Text>
      )}
    </Pressable>
  );
}

/** Landing page: every stage as a box, grouped by world. Any stage can be played. */
export function LevelSelectScreen({ onSelect }) {
  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lantern Run</Text>
        <Text style={styles.subtitle}>Pick a level</Text>

        {WORLDS.map((world, w) => (
          <View key={world.name} style={styles.world}>
            <Text style={styles.worldName}>
              World {w + 1}: {world.name}
            </Text>
            <View style={styles.row}>
              {stagesByWorld[w].map(({ stage, index }) => (
                <StageBox key={index} stage={stage} index={index} theme={world.theme} onSelect={onSelect} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
  content: { padding: 24, alignItems: 'center' },
  title: { color: COLORS.glow, fontSize: 32, fontWeight: '900' },
  subtitle: { color: COLORS.paper, fontSize: 16, marginBottom: 16 },
  world: { width: '100%', maxWidth: 560, marginBottom: 14 },
  worldName: { color: COLORS.paper, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 10 },
  box: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  boxLabel: { color: COLORS.paper, fontSize: 20, fontWeight: '900' },
  bossLabel: { color: COLORS.glow },
  bossName: { color: COLORS.paper, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
