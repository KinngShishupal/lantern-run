import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants';

const usesKeyboard = Platform.OS === 'web';

/** A hint card along the bottom of the game view, clear of the stage banner. */
export function TutorialPrompt({ step, stepNumber, stepCount, onSkip }) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.card} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Text style={styles.counter}>
          Tutorial {stepNumber}/{stepCount}
        </Text>
        <Text style={styles.text}>{usesKeyboard ? step.text.keys : step.text.touch}</Text>
        <Pressable onPress={onSkip} hitSlop={12} accessibilityRole="button" accessibilityLabel="Skip tutorial">
          {({ pressed }) => <Text style={[styles.skip, pressed && styles.pressed]}>Skip</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 16, alignItems: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    maxWidth: 640,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: COLORS.overlay,
    borderWidth: 2,
    borderColor: COLORS.glow,
  },
  counter: { color: COLORS.glow, fontSize: 13, fontWeight: '800' },
  text: { flexShrink: 1, color: COLORS.paper, fontSize: 17, fontWeight: '800' },
  skip: { color: COLORS.paper, fontSize: 14, fontWeight: '700', opacity: 0.75 },
  pressed: { opacity: 0.4 },
});
