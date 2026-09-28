// Small persisted flags. Storage errors are non-fatal: the worst case is
// showing the tutorial again.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  tutorialSeen: 'lanternRun.tutorialSeen.v1',
};

export async function hasSeenTutorial() {
  try {
    return (await AsyncStorage.getItem(KEYS.tutorialSeen)) === 'true';
  } catch {
    return false;
  }
}

export async function markTutorialSeen() {
  try {
    await AsyncStorage.setItem(KEYS.tutorialSeen, 'true');
  } catch {}
}
