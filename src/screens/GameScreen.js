import { useEffect } from 'react';
import { StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';

import { COLORS, CONTROLS_HEIGHT, GAME_STATUS, MIN_GAME_HEIGHT, WORLD_HEIGHT } from '../constants';
import { TouchControls } from '../components/controls/TouchControls';
import { BossHealthBar } from '../components/hud/BossHealthBar';
import { Hud } from '../components/hud/Hud';
import { BossDefeatedBanner, BossEnragedBanner, StageTitleBanner } from '../components/hud/StageBanner';
import { StageOverlay } from '../components/overlays/StageOverlay';
import { TutorialPrompt } from '../components/overlays/TutorialPrompt';
import { Background } from '../components/scene/Background';
import { WorldLayer } from '../components/scene/WorldLayer';
import { STAGES } from '../game/levels/stages';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../hooks/useGameStore';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useSounds } from '../hooks/useSounds';
import { useTutorial } from '../hooks/useTutorial';

/** World units the screen jolts by, at the start of a shake. */
const SHAKE_AMPLITUDE = 7;

/** Random jolt that fades out as the shake runs down. */
function screenShake(secondsLeft, S) {
  if (!(secondsLeft > 0)) return [];
  const amp = S(SHAKE_AMPLITUDE * Math.min(1, secondsLeft * 3));
  return [{ translateX: (Math.random() - 0.5) * 2 * amp }, { translateY: (Math.random() - 0.5) * 2 * amp }];
}

export function GameScreen({ startStage = 0, onExit }) {
  const { width, height } = useWindowDimensions();
  const gameHeight = Math.max(MIN_GAME_HEIGHT, height - CONTROLS_HEIGHT);
  const scale = gameHeight / WORLD_HEIGHT;
  const viewWidth = width / scale; // visible width in world units
  const S = (n) => n * scale; // world units -> screen pixels

  const store = useGameStore(startStage);
  const { muted, toggleMute } = useSounds();
  useGameLoop(store.tick);
  useKeyboardControls(store);
  const tutorial = useTutorial(store);
  useEffect(() => {
    store.setViewWidth(viewWidth);
  }, [store, viewWidth]);

  const game = store.getGame();
  const { level, player, status } = game;
  const { boss } = level;
  const stage = STAGES[game.stage];
  const playing = status === GAME_STATUS.playing;
  const tutorialStep = playing ? tutorial.step : null;

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      <View style={[styles.game, { height: gameHeight, backgroundColor: level.theme.sky }]}>
        <View style={[StyleSheet.absoluteFill, { transform: screenShake(game.shake, S) }]}>
          <Background S={S} level={level} camX={game.camX} screenWidth={width} />
          <WorldLayer S={S} level={level} player={player} camX={game.camX} viewWidth={viewWidth} />
        </View>

        <Hud
          stageLabel={stage.label}
          score={game.score}
          seedsLeft={boss ? null : level.seeds.filter((s) => !s.taken).length}
          lives={game.lives}
          muted={muted}
          onToggleMute={toggleMute}
          onExit={onExit}
        />
        {boss && <BossHealthBar boss={boss} />}

        {playing && game.banner > 0 && (
          <StageTitleBanner stage={stage} timeLeft={game.banner} isBoss={!!boss} />
        )}
        {playing && boss?.enrageBanner > 0 && <BossEnragedBanner boss={boss} />}
        {playing && game.bossDown > 0 && <BossDefeatedBanner stage={stage} />}
        {tutorialStep && (
          <TutorialPrompt
            step={tutorialStep}
            stepNumber={tutorial.stepNumber}
            stepCount={tutorial.stepCount}
            onSkip={tutorial.skip}
          />
        )}

        <StageOverlay
          status={status}
          stageIndex={game.stage}
          score={game.score}
          onNext={store.nextStage}
          onRetry={store.retryStage}
          onStartOver={store.startOver}
          onExit={onExit}
        />
      </View>

      <TouchControls
        screenWidth={width}
        onInputChange={store.setInput}
        highlight={tutorialStep?.highlight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
  game: { width: '100%', overflow: 'hidden' },
});
