// Small persisted flags and progress. Storage errors are non-fatal: the worst
// case is showing the tutorial or a story again, or starting from World 1-1.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  tutorialSeen: 'lanternRun.tutorialSeen.v1',
  unlockedStage: 'lanternRun.unlockedStage.v1',
  storiesSeen: 'lanternRun.storiesSeen.v1',
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

/** Index of the furthest stage the player may start (0 = only the first; the stage count = all cleared). */
export async function loadUnlockedStage() {
  try {
    const value = Number(await AsyncStorage.getItem(KEYS.unlockedStage));
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export async function saveUnlockedStage(index) {
  try {
    await AsyncStorage.setItem(KEYS.unlockedStage, String(index));
  } catch {}
}

/** Ids of story scenes already shown, e.g. "0-intro". */
export async function loadSeenStories() {
  try {
    const list = JSON.parse((await AsyncStorage.getItem(KEYS.storiesSeen)) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveSeenStories(ids) {
  try {
    await AsyncStorage.setItem(KEYS.storiesSeen, JSON.stringify(ids));
  } catch {}
}
