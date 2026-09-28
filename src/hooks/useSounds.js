import { useCallback, useEffect, useState } from 'react';

import { initSounds, releaseSounds, setMuted } from '../audio/sounds';

/** Loads sounds and starts music on mount; exposes a mute toggle. */
export function useSounds() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    initSounds();
    return releaseSounds;
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }, [muted]);

  return { muted, toggleMute };
}
