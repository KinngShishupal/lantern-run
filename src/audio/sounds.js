// Tiny sound manager for Lantern Run, built on expo-audio.
// Audio failures are swallowed on purpose: sound must never crash the game.

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const EFFECTS = {
  jump: require('../../assets/sounds/jump.wav'),
  seed: require('../../assets/sounds/seed.wav'),
  stomp: require('../../assets/sounds/stomp.wav'),
  hurt: require('../../assets/sounds/hurt.wav'),
  win: require('../../assets/sounds/win.wav'),
  gameover: require('../../assets/sounds/gameover.wav'),
};
const MUSIC = require('../../assets/sounds/music.wav');

const EFFECT_VOLUME = 0.7;
const MUSIC_VOLUME = 0.35;

let players = {};
let music = null;
let muted = false;

export async function initSounds() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {}
  for (const [name, source] of Object.entries(EFFECTS)) {
    const player = createAudioPlayer(source);
    player.volume = EFFECT_VOLUME;
    players[name] = player;
  }
  music = createAudioPlayer(MUSIC);
  music.loop = true;
  music.volume = MUSIC_VOLUME;
  if (!muted) music.play();
}

/** @param {keyof typeof EFFECTS} name */
export function playEffect(name) {
  const player = players[name];
  if (muted || !player) return;
  try {
    player.seekTo(0); // rewind so rapid repeats (like seeds) retrigger
    player.play();
  } catch {}
}

export function stopMusic() {
  try {
    music?.pause();
  } catch {}
}

export function restartMusic() {
  if (!music || muted) return;
  try {
    music.seekTo(0);
    music.play();
  } catch {}
}

export function setMuted(value) {
  muted = value;
  if (!music) return;
  try {
    if (value) music.pause();
    else music.play();
  } catch {}
}

export function releaseSounds() {
  Object.values(players).forEach((player) => player.remove());
  music?.remove();
  players = {};
  music = null;
}
