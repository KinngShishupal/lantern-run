import { useCallback, useEffect, useState } from 'react';

import { STAGES } from '../game/levels/stages';
import {
  loadSeenStories,
  loadUnlockedStage,
  saveSeenStories,
  saveUnlockedStage,
} from '../storage/preferences';

/**
 * Which stages are unlocked (every index up to and including `unlocked`) and which story scenes were already shown,
 * persisted on the device.
 */
export function useProgress() {
  const [loaded, setLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState(0);
  const [seenStories, setSeenStories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadUnlockedStage(), loadSeenStories()]).then(([stage, stories]) => {
      if (cancelled) return;
      setUnlocked(Math.min(stage, STAGES.length));
      setSeenStories(stories);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Clearing stage `index` opens the one after it. */
  const completeStage = useCallback((index) => {
    // STAGES.length means every stage, final boss included, is cleared
    const next = Math.min(index + 1, STAGES.length);
    setUnlocked((current) => {
      if (next <= current) return current;
      saveUnlockedStage(next);
      return next;
    });
  }, []);

  const markStorySeen = useCallback((id) => {
    setSeenStories((current) => {
      if (current.includes(id)) return current;
      const updated = [...current, id];
      saveSeenStories(updated);
      return updated;
    });
  }, []);

  return { loaded, unlocked, seenStories, completeStage, markStorySeen };
}
