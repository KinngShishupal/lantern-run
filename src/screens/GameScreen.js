import { useCallback, useEffect, useRef } from 'react';
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
import { StoryOverlay } from '../components/story/StoryOverlay';
import { GAME_EVENTS } from '../game/engine/events';
import { STAGES, isLastStage } from '../game/levels/stages';
import { storyId } from '../game/story';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../hooks/useGameStore';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useSounds } from '../hooks/useSounds';
import { useTutorial } from '../hooks/useTutorial';

/** Full-screen color flash, fading out. */
function ScreenFlash({ flash }) {
  const opacity = flash.strength * Math.max(0, flash.time / flash.duration);
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: flash.color, opacity }]} />;
}

/** The sky burns red while the final boss's inferno rages. */
function InfernoTint({ t }) {
  const opacity = 0.14 + 0.08 * Math.sin(t * 3);
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.ember, opacity }]} />;
}

/** World units the screen jolts by, at the start of a shake. */
const SHAKE_AMPLITUDE = 7;

/** Random jolt that fades out as the shake runs down. */
function screenShake(secondsLeft, S) {
  if (!(secondsLeft > 0)) return [];
  const amp = S(SHAKE_AMPLITUDE * Math.min(1, secondsLeft * 3));
  return [{ translateX: (Math.random() - 0.5) * 2 * amp }, { translateY: (Math.random() - 0.5) * 2 * amp }];
}

const isFirstOfWorld = (index) => STAGES.findIndex((s) => s.world === STAGES[index].world) === index;

/**
 *  {object} props
 * @param {number} props.startStage
 * @param {string[]} props.seenStories   story ids already shown (see game/story.js)
 * @param {(id: string) => void} props.onStorySeen
 * @param {(stageIndex: number) => void} props.onStageCleared
 * @param {() => void} props.onExit
 */
export function GameScreen({ startStage = 0, seenStories = [], onStorySeen, onStageCleared, onExit }) {
  const { width, height } = useWindowDimensions();
  const gameHeight = Math.max(MIN_GAME_HEIGHT, height - CONTROLS_HEIGHT);
  const scale = gameHeight / WORLD_HEIGHT;
  const viewWidth = width / scale; // visible width in world units
  const S = (n) => n * scale; // world units -> screen pixels

  const store = useGameStore(startStage);
  const { muted, toggleMute } = useSounds();
  // A story page pauses the game: no ticks, no keyboard input
  const storyRef = useRef(null);
  const tick = useCallback((dt) => {
    if (!storyRef.current) store.tick(dt);
  }, [store]);
  useGameLoop(tick);
  useKeyboardControls(store, storyRef);
  const tutorial = useTutorial(store);
  useEffect(() => {
    store.setViewWidth(viewWidth);
  }, [store, viewWidth]);

  const game = store.getGame();
  const { level, player, status } = game;
  const { boss } = level;
  const stage = STAGES[game.stage];
  const playing = status === GAME_STATUS.playing;

  // Unlock the next stage as soon as this one is cleared
  useEffect(
    () => store.addEventListener((event) => {
      if (event === GAME_EVENTS.stageCleared) onStageCleared?.(store.getGame().stage);
    }),
    [store, onStageCleared],
  );

  // The world's story: its intro before the first level, its ending after
  // the boss. Each shows once; it stays up until the parent marks it seen.
  const bossBeaten = stage.kind === 'boss' && (status === GAME_STATUS.cleared || status === GAME_STATUS.won);
  const story = [
    isFirstOfWorld(game.stage) && { worldIndex: stage.world, kind: 'intro' },
    bossBeaten && { worldIndex: stage.world, kind: 'outro' },
  ].find((s) => s && !seenStories.includes(storyId(s.worldIndex, s.kind))) ?? null;
  useEffect(() => {
    storyRef.current = story;
  }, [story]);
  const finishStory = () => onStorySeen?.(storyId(story.worldIndex, story.kind));
  const tutorialStep = playing && !story ? tutorial.step : null;

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      <View style={[styles.game, { height: gameHeight, backgroundColor: level.theme.sky }]}>
        <View style={[StyleSheet.absoluteFill, { transform: screenShake(game.shake, S) }]}>
          <Background S={S} level={level} camX={game.camX} screenWidth={width} />
          <WorldLayer S={S} level={level} player={player} camX={game.camX} viewWidth={viewWidth} />
        </View>
        {boss?.inferno && !boss.dead && <InfernoTint t={boss.t} />}
        {game.flash && <ScreenFlash flash={game.flash} />}

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
          <StageTitleBanner
            stage={stage}
            timeLeft={game.banner}
            isBoss={!!boss}
            isFinal={!!boss && isLastStage(game.stage)}
          />
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

      {story && <StoryOverlay key={storyId(story.worldIndex, story.kind)} {...story} onDone={finishStory} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
  game: { width: '100%', overflow: 'hidden' },
});
