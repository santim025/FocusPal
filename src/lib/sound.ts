import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;
let ready = false;

export async function initSound(): Promise<void> {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    player = createAudioPlayer(require('@/assets/sounds/chime.wav'));
    ready = true;
  } catch {
    ready = false;
  }
}

export function playChime(): void {
  if (!ready || !player) return;
  try {
    player.seekTo(0);
    player.play();
  } catch {
    // ignore playback errors
  }
}
