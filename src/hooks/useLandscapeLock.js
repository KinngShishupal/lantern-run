import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

/** Keeps the screen in landscape (a no-op on web). */
export function useLandscapeLock() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);
}
