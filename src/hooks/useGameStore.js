import { useState, useSyncExternalStore } from 'react';

import { handleGameEvent } from '../audio/gameAudio';
import { createGameStore } from '../game/createGameStore';

/** Creates the game store once and re-renders on every simulation tick. */
export function useGameStore() {
  const [store] = useState(() => createGameStore({ onEvent: handleGameEvent }));
  useSyncExternalStore(store.subscribe, store.getVersion);
  return store;
}
