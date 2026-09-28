import { useEffect } from 'react';

import { MAX_FRAME_DT } from '../constants';

/** Calls `tick(dt)` once per animation frame, with `dt` in seconds. */
export function useGameLoop(tick) {
  useEffect(() => {
    let frame;
    let last = null;
    const step = (time) => {
      if (last == null) last = time;
      const dt = Math.min((time - last) / 1000, MAX_FRAME_DT);
      last = time;
      tick(dt);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [tick]);
}
