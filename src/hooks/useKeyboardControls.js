import { useEffect } from 'react';
import { Platform } from 'react-native';

import { GAME_STATUS } from '../constants';

const KEY_TO_CONTROL = {
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right',
  ArrowUp: 'jump',
  w: 'jump',
  ' ': 'jump',
};

/**
 * Arrow keys / WASD / space to play, Enter to continue (web only).
 * Keys are ignored while `pausedRef.current` is truthy, e.g. during a story.
 */
export function useKeyboardControls(store, pausedRef) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const onKeyDown = (e) => {
      if (pausedRef?.current) return;
      const control = KEY_TO_CONTROL[e.key];
      if (control) {
        store.setInput({ [control]: true });
        e.preventDefault();
      }
      if (e.key === 'Enter') {
        const { status } = store.getGame();
        if (status === GAME_STATUS.cleared) store.nextStage();
        else if (status === GAME_STATUS.over) store.retryStage();
        else if (status === GAME_STATUS.won) store.startOver();
      }
    };
    const onKeyUp = (e) => {
      const control = KEY_TO_CONTROL[e.key];
      if (control) store.setInput({ [control]: false });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [store, pausedRef]);
}
