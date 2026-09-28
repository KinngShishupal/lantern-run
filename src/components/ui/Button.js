import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '../../constants';

/** Rounded pill button. `variant="ghost"` renders an outlined style. */
export function Button({ label, onPress, variant = 'primary' }) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [ghost ? styles.ghost : styles.primary, pressed && styles.pressed]}
    >
      <Text style={ghost ? styles.ghostText : styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: { backgroundColor: COLORS.glow, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28 },
  primaryText: { color: COLORS.ink, fontSize: 18, fontWeight: '800' },
  ghost: {
    borderWidth: 2,
    borderColor: COLORS.paper,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 28,
  },
  ghostText: { color: COLORS.paper, fontSize: 18, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
