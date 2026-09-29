// Lantern Run — a 16-stage platformer in React Native (Expo).
// 4 worlds, each with 3 levels and a boss. Collect glowing seeds, stomp
// beetles and moths, dodge spikes and embers, and beat each world's boss.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StoryOverlay } from './components/story/StoryOverlay';
import { COLORS } from './constants';
import { storyId } from './game/story';
import { useLandscapeLock } from './hooks/useLandscapeLock';
import { useProgress } from './hooks/useProgress';
import { GameScreen } from './screens/GameScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';

const SELECT = { name: 'select' };

export default function App() {
  useLandscapeLock();
  const progress = useProgress();
  // { name: 'select' } | { name: 'game', stage } | { name: 'story', world, kinds, step }
  const [screen, setScreen] = useState(SELECT);

  if (!progress.loaded) return <View style={styles.root} />;

  if (screen.name === 'game') {
    return (
      <GameScreen
        key={screen.stage}
        startStage={screen.stage}
        seenStories={progress.seenStories}
        onStorySeen={progress.markStorySeen}
        onStageCleared={progress.completeStage}
        onExit={() => setScreen(SELECT)}
      />
    );
  }

  if (screen.name === 'story') {
    const { world, kinds, step } = screen;
    const done = () =>
      setScreen(step + 1 < kinds.length ? { ...screen, step: step + 1 } : SELECT);
    return (
      <View style={styles.root}>
        <StoryOverlay key={`${world}-${step}`} worldIndex={world} kind={kinds[step]} onDone={done} />
      </View>
    );
  }

  return (
    <LevelSelectScreen
      unlocked={progress.unlocked}
      seenStories={progress.seenStories}
      onSelect={(stage) => setScreen({ name: 'game', stage })}
      onStory={(world) => {
        // Replays the intro, plus the ending once the world's boss has fallen
        const outroSeen = progress.seenStories.includes(storyId(world, 'outro'));
        setScreen({ name: 'story', world, kinds: outroSeen ? ['intro', 'outro'] : ['intro'], step: 0 });
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
});
