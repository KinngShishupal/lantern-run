import { useEffect } from 'react';
import { StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';

import { COLORS, CONTROLS_HEIGHT, GAME_STATUS, MIN_GAME_HEIGHT, WORLD_HEIGHT } from '../constants';
import { TouchControls } from '../components/controls/TouchControls';
import { BossHealthBar } from '../components/hud/BossHealthBar';
import { Hud } from '../components/hud/Hud';
import { BossDefeatedBanner, StageTitleBanner } from '../components/hud/StageBanner';
import { StageOverlay } from '../components/overlays/StageOverlay';
import { Background } from '../components/scene/Background';
import { WorldLayer } from '../components/scene/WorldLayer';
import { STAGES } from '../game/levels/stages';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../hooks/useGameStore';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useSounds } from '../hooks/useSounds';

export function GameScreen() {
  const { width, height } = useWindowDimensions();
  const gameHeight = Math.max(MIN_GAME_HEIGHT, height - CONTROLS_HEIGHT);
  const scale = gameHeight / WORLD_HEIGHT;
  const viewWidth = width / scale; // visible width in world units
  const S = (n) => n * scale; // world units -> screen pixels

  const store = useGameStore();
  const { muted, toggleMute } = useSounds();
  useGameLoop(store.tick);
  useKeyboardControls(store);
  useEffect(() => {
    store.setViewWidth(viewWidth);
  }, [store, viewWidth]);

  const game = store.getGame();
  const { level, player, status } = game;
  const { boss } = level;
  const stage = STAGES[game.stage];
  const playing = status === GAME_STATUS.playing;

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      <View style={[styles.game, { height: gameHeight, backgroundColor: level.theme.sky }]}>
        <Background S={S} level={level} camX={game.camX} screenWidth={width} />
        <WorldLayer S={S} level={level} player={player} camX={game.camX} viewWidth={viewWidth} />

        <Hud
          stageLabel={stage.label}
          score={game.score}
          seedsLeft={boss ? null : level.seeds.filter((s) => !s.taken).length}
          lives={game.lives}
          muted={muted}
          onToggleMute={toggleMute}
        />
        {boss && <BossHealthBar boss={boss} />}

        {playing && game.banner > 0 && (
          <StageTitleBanner stage={stage} timeLeft={game.banner} isBoss={!!boss} />
        )}
        {playing && game.bossDown > 0 && <BossDefeatedBanner stage={stage} />}

        <StageOverlay
          status={status}
          stageIndex={game.stage}
          score={game.score}
          onNext={store.nextStage}
          onRetry={store.retryStage}
          onStartOver={store.startOver}
        />
      </View>

      <TouchControls screenWidth={width} onInputChange={store.setInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
  game: { width: '100%', overflow: 'hidden' },
});
