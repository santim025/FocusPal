import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { AMBIENT_NONE, getAmbientSound, type AmbientSoundKey } from './ambientSounds';

let player: AudioPlayer | null = null;
let currentKey: AmbientSoundKey = AMBIENT_NONE;
let currentVolume = 0.7;
let wantPlaying = false;

function disposePlayer() {
  if (player) {
    try {
      player.pause();
      player.release();
    } catch {
      // ignore
    }
    player = null;
  }
}

/** Selects the active ambient sound, (re)creating the looping player as needed. */
export function loadAmbient(key: AmbientSoundKey): void {
  if (key === currentKey) return;
  currentKey = key;
  disposePlayer();

  const sound = getAmbientSound(key);
  if (!sound.source) return; // "none"

  try {
    player = createAudioPlayer(sound.source);
    player.loop = true;
    player.volume = currentVolume;
    if (wantPlaying) {
      player.seekTo(0);
      player.play();
    }
  } catch {
    player = null;
  }
}

export function playAmbient(): void {
  wantPlaying = true;
  if (!player) return;
  try {
    player.play();
  } catch {
    // ignore
  }
}

export function pauseAmbient(): void {
  wantPlaying = false;
  if (!player) return;
  try {
    player.pause();
  } catch {
    // ignore
  }
}

export function setAmbientVolume(volume: number): void {
  currentVolume = Math.max(0, Math.min(1, volume));
  if (!player) return;
  try {
    player.volume = currentVolume;
  } catch {
    // ignore
  }
}
