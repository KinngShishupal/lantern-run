// Lantern Run — a 16-stage platformer in React Native (Expo).
// 4 worlds, each with 3 levels and a boss. Collect glowing seeds, stomp
// beetles and moths, dodge spikes and embers, and beat each world's boss.

import { useState } from 'react';

import { useLandscapeLock } from './hooks/useLandscapeLock';
import { GameScreen } from './screens/GameScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';

export default function App() {
  useLandscapeLock();
  // null = on the level select screen, otherwise the stage being played
  const [startStage, setStartStage] = useState(null);

  if (startStage == null) return <LevelSelectScreen onSelect={setStartStage} />;
  return <GameScreen key={startStage} startStage={startStage} onExit={() => setStartStage(null)} />;
}
