import { StyleSheet, Text, View } from 'react-native';

import { COLORS, GAME_STATUS, WORLDS } from '../../constants';
import { STAGES } from '../../game/levels/stages';
import { Button } from '../ui/Button';

function Overlay({ title, subtitle, children }) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.buttons}>{children}</View>
    </View>
  );
}

const describeNext = (next) => (next.kind === 'boss' ? `Boss, ${next.name}` : next.label);

/** Between-stage and end screens, chosen by the game status. */
export function StageOverlay({ status, stageIndex, score, onNext, onRetry, onStartOver, onExit }) {
  const levelsButton = onExit && <Button label="All levels" variant="ghost" onPress={onExit} />;
  const stage = STAGES[stageIndex];

  switch (status) {
    case GAME_STATUS.cleared:
      return (
        <Overlay
          title={stage.kind === 'boss' ? `${stage.name} defeated` : `${stage.label} cleared`}
          subtitle={`Score ${score}`}
        >
          <Button label={`Next: ${describeNext(STAGES[stageIndex + 1])}`} onPress={onNext} />
          {levelsButton}
        </Overlay>
      );
    case GAME_STATUS.over:
      return (
        <Overlay title="The lantern went out" subtitle={`${stage.label}: ${stage.name}`}>
          <Button label="Retry stage" onPress={onRetry} />
          {stageIndex > 0 && (
            <Button label={`Start from ${STAGES[0].label}`} variant="ghost" onPress={onStartOver} />
          )}
          {levelsButton}
        </Overlay>
      );
    case GAME_STATUS.won:
      return (
        <Overlay
          title="You made it home"
          subtitle={`All ${WORLDS.length} worlds cleared. Final score ${score}`}
        >
          <Button label="Play again" onPress={onStartOver} />
          {levelsButton}
        </Overlay>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: COLORS.glow, fontSize: 30, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: COLORS.paper, fontSize: 18, marginBottom: 24, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
});
