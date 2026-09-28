// Lantern Run — a 16-stage platformer in React Native (Expo).
// 4 worlds, each with 3 levels and a boss. Collect glowing seeds, stomp
// beetles and moths, dodge spikes and embers, and beat each world's boss.

import { useLandscapeLock } from './hooks/useLandscapeLock';
import { GameScreen } from './screens/GameScreen';

export default function App() {
  useLandscapeLock();
  return <GameScreen />;
}
