import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants';

const FADE_OUT_TIME = 0.5;

/** Stage title that fades out at the start of a stage. */
export function StageTitleBanner({ stage, timeLeft, isBoss }) {
  const opacity = Math.max(0, Math.min(1, timeLeft / FADE_OUT_TIME));
  return (
    <View pointerEvents="none" style={[styles.banner, { opacity }]}>
      <Text style={styles.small}>{stage.label}</Text>
      <Text style={styles.big}>{stage.name}</Text>
      {isBoss && <Text style={styles.hint}>Jump on its head</Text>}
    </View>
  );
}

export function BossDefeatedBanner({ stage }) {
  return (
    <View pointerEvents="none" style={styles.banner}>
      <Text style={styles.big}>{stage.name} defeated</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', top: '30%', left: 0, right: 0, alignItems: 'center' },
  small: { color: COLORS.paper, fontSize: 16, fontWeight: '700', opacity: 0.85 },
  big: { color: COLORS.glow, fontSize: 34, fontWeight: '900', marginTop: 2, textAlign: 'center' },
  hint: { color: COLORS.paper, fontSize: 15, fontWeight: '700', marginTop: 6 },
});
