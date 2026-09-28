import { useCallback, useEffect, useState } from 'react';

import { TUTORIAL_STEPS } from '../game/tutorial';
import { hasSeenTutorial, markTutorialSeen } from '../storage/preferences';

const NOT_ACTIVE = -1;

/**
 * Runs the first-launch tutorial against the live game.
 * @returns {{ step: import('../game/tutorial').TutorialStep | null,
 *   stepNumber: number, stepCount: number, skip: () => void }}
 */
export function useTutorial(store) {
  const [stepIndex, setStepIndex] = useState(NOT_ACTIVE);
  const step = TUTORIAL_STEPS[stepIndex] ?? null;

  // Start only once we know this is the first launch.
  useEffect(() => {
    let cancelled = false;
    hasSeenTutorial().then((seen) => {
      if (!cancelled && !seen) setStepIndex(0);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const finish = useCallback(() => {
    setStepIndex(NOT_ACTIVE);
    markTutorialSeen();
  }, []);

  // Targets a fixed index, so a step completing twice before the next render
  // can't skip the step after it.
  const advance = useCallback(() => {
    if (stepIndex + 1 < TUTORIAL_STEPS.length) setStepIndex(stepIndex + 1);
    else finish();
  }, [stepIndex, finish]);

  // Timed steps, e.g. a closing tip.
  useEffect(() => {
    if (!step?.duration) return undefined;
    const timer = setTimeout(advance, step.duration * 1000);
    return () => clearTimeout(timer);
  }, [step, advance]);

  // Event-driven steps, e.g. "jump".
  useEffect(() => {
    if (!step?.completeOn) return undefined;
    return store.addEventListener((event) => {
      if (event === step.completeOn) advance();
    });
  }, [store, step, advance]);

  // State-driven steps, e.g. "walk a bit", checked every tick.
  useEffect(() => {
    if (!step?.isComplete) return undefined;
    return store.subscribe(() => {
      if (step.isComplete(store.getGame())) advance();
    });
  }, [store, step, advance]);

  return {
    step,
    stepNumber: stepIndex + 1,
    stepCount: TUTORIAL_STEPS.length,
    skip: finish,
  };
}
