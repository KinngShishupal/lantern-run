import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants';

export function Hud({ stageLabel, score, seedsLeft, lives, muted, onToggleMute, onExit }) {
  return (
    <View style={styles.hud}>
      <View style={styles.left}>
        {onExit && (
          <Pressable onPress={onExit} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back to levels">
            <Text style={styles.text}>‹ Levels</Text>
          </Pressable>
        )}
        <Text style={styles.text}>{stageLabel}</Text>
      </View>
      <Text style={styles.text}>Score {score}</Text>
      {seedsLeft != null && <Text style={styles.text}>Seeds left {seedsLeft}</Text>}
      <View style={styles.right}>
        <Text style={styles.text} accessibilityLabel={`${lives} lives`}>
          {'♥ '.repeat(Math.max(0, lives)).trim()}
        </Text>
        <Pressable onPress={onToggleMute} hitSlop={12} accessibilityRole="button">
          <Text style={styles.text}>{muted ? 'Sound off' : 'Sound on'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  text: { color: COLORS.paper, fontSize: 16, fontWeight: '800' },
});
