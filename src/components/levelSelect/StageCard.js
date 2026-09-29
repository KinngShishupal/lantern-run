import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { COLORS, WORLDS } from '../../constants';
import { BossFigure } from '../art/Figures';
import { Scenery } from '../art/Scenery';

function LockIcon({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 11 V8 a5 5 0 0 1 10 0 V11" stroke={COLORS.paper} strokeWidth={2.4} fill="none" />
      <Rect x={4.5} y={10.5} width={15} height={11} rx={2.5} fill={COLORS.paper} />
      <Rect x={11} y={14} width={2} height={4} rx={1} fill={COLORS.ink} />
    </Svg>
  );
}

/**
 * A level card: a little painting of the stage, its number, and a lock
 * until the stage before it is cleared.
 */
export function StageCard({ stage, index, locked, isNext, cleared, onSelect }) {
  const world = WORLDS[stage.world];
  const boss = stage.kind === 'boss';
  const label = boss ? 'BOSS' : stage.label.replace('World ', '');
  const a11y = `${boss ? `${stage.label}, ${stage.name}` : stage.label}${locked ? ', locked' : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled: locked }}
      disabled={locked}
      onPress={() => onSelect(index)}
      style={({ pressed }) => [
        styles.card,
        { borderColor: isNext ? COLORS.glow : boss ? world.boss.color : 'rgba(246, 239, 217, 0.25)' },
        isNext && styles.next,
        pressed && styles.pressed,
      ]}
    >
      <Scenery theme={world.theme} seed={index + 3} seedGlows={boss ? 0 : 3} menace={boss} />
      {boss && (
        <View style={styles.bossWrap}>
          <BossFigure config={world.boss} height={58} t={0.4} />
        </View>
      )}

      <View style={[styles.badge, boss && { backgroundColor: world.boss.dark }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
      {cleared && (
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
      {isNext && (
        <View style={styles.playTag}>
          <Text style={styles.playText}>PLAY</Text>
        </View>
      )}
      {locked && (
        <View style={styles.lock}>
          <LockIcon size={24} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 92,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: COLORS.ink,
  },
  next: { borderWidth: 3, shadowColor: COLORS.glow, shadowOpacity: 0.8, shadowRadius: 10, elevation: 8 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  bossWrap: { position: 'absolute', right: 0, left: 0, bottom: 6, alignItems: 'center' },
  badge: {
    position: 'absolute',
    left: 6,
    top: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 21, 48, 0.75)',
  },
  badgeText: { color: COLORS.paper, fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  check: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: COLORS.ink, fontSize: 12, fontWeight: '900' },
  playTag: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.glow,
  },
  playText: { color: COLORS.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  lock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 11, 32, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
