import { useState, useSyncExternalStore } from 'react';

import { handleGameEvent } from '../audio/gameAudio';
import { createGameStore } from '../game/createGameStore';

/** Creates the game store once (at `startStage`) and re-renders on every simulation tick. */
export function useGameStore(startStage = 0) {
  const [store] = useState(() => createGameStore({ onEvent: handleGameEvent, startStage }));
  useSyncExternalStore(store.subscribe, store.getVersion);
  return store;
}
