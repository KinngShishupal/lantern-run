import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants';

const FADE_OUT_TIME = 0.5;

/** Stage title that fades out at the start of a stage. */
export function StageTitleBanner({ stage, timeLeft, isBoss, isFinal }) {
  const opacity = Math.max(0, Math.min(1, timeLeft / FADE_OUT_TIME));
  return (
    <View pointerEvents="none" style={[styles.banner, { opacity }]}>
      <Text style={[styles.small, isFinal && styles.final]}>{isFinal ? 'FINAL BOSS' : stage.label}</Text>
      <Text style={styles.big}>{stage.name}</Text>
      {isBoss && <Text style={styles.hint}>Jump on its head</Text>}
    </View>
  );
}

/** Flashes up when a boss drops to half health and changes its attacks. */
export function BossEnragedBanner({ boss }) {
  const flash = Math.floor(boss.enrageBanner * 8) % 2 === 0;
  return (
    <View pointerEvents="none" style={styles.banner}>
      <Text style={[styles.big, styles.rage, { opacity: flash ? 1 : 0.6 }]}>{boss.name} {boss.bannerText}</Text>
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
  rage: { color: COLORS.hp },
  final: { color: COLORS.ember, fontSize: 18, fontWeight: '900', letterSpacing: 4, opacity: 1 },
  hint: { color: COLORS.paper, fontSize: 15, fontWeight: '700', marginTop: 6 },
});
