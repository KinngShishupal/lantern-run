import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants';

export function BossHealthBar({ boss }) {
  return (
    <View pointerEvents="none" style={styles.bar}>
      <Text style={styles.name}>{boss.name}</Text>
      <View style={styles.row}>
        {Array.from({ length: boss.hpMax }, (_, i) => (
          <View key={i} style={[styles.pip, { backgroundColor: i < boss.hp ? COLORS.hp : COLORS.hpBack }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center' },
  name: { color: COLORS.paper, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 4 },
  pip: { width: 26, height: 10, borderRadius: 3 },
});
