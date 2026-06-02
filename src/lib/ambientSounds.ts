import { Ionicons } from '@expo/vector-icons';
import { type AudioSource } from 'expo-audio';

export type AmbientSoundKey =
  | 'none'
  | 'rain'
  | 'forest'
  | 'ocean'
  | 'lofi'
  | 'jazz'
  | 'brown'
  | 'pink'
  | 'white'
  | (string & {});

export interface AmbientSound {
  key: AmbientSoundKey;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  /**
   * Audio source for `createAudioPlayer`. A `require(...)` for bundled files or
   * a `{ uri }` for remote streams. `null` means "no sound" (the off chip).
   */
  source: AudioSource | null;
}

export const AMBIENT_NONE: AmbientSoundKey = 'none';

/**
 * Catalog of selectable ambient sounds. The first three are synthesized loops
 * (no external assets). To add rain / thunder / lofi later, drop a file in
 * `assets/sounds/ambient/` and add `{ ..., source: require('@/assets/sounds/ambient/rain.mp3') }`,
 * or stream one with `{ ..., source: { uri: 'https://…' } }`.
 */
export const ambientSounds: AmbientSound[] = [
  { key: 'none', name: 'Silencio', icon: 'volume-mute-outline', source: null },
  {
    key: 'rain',
    name: 'Lluvia',
    icon: 'rainy-outline',
    source: require('@/assets/sounds/ambient/rain.mp3'),
  },
  {
    key: 'forest',
    name: 'Bosque',
    icon: 'leaf-outline',
    source: require('@/assets/sounds/ambient/forest.mp3'),
  },
  {
    key: 'ocean',
    name: 'Olas',
    icon: 'water-outline',
    source: require('@/assets/sounds/ambient/ocean.mp3'),
  },
  {
    key: 'lofi',
    name: 'Lo-fi',
    icon: 'musical-notes-outline',
    source: require('@/assets/sounds/ambient/lofi.mp3'),
  },
  {
    key: 'jazz',
    name: 'Jazz',
    icon: 'musical-note-outline',
    source: require('@/assets/sounds/ambient/jazz.mp3'),
  },
  {
    key: 'brown',
    name: 'Ruido marrón',
    icon: 'radio-outline',
    source: require('@/assets/sounds/ambient/brown.wav'),
  },
  {
    key: 'pink',
    name: 'Ruido rosa',
    icon: 'pulse-outline',
    source: require('@/assets/sounds/ambient/pink.wav'),
  },
  {
    key: 'white',
    name: 'Ruido blanco',
    icon: 'cloud-outline',
    source: require('@/assets/sounds/ambient/white.wav'),
  },
];

export function getAmbientSound(key: string | undefined | null): AmbientSound {
  return ambientSounds.find((s) => s.key === key) ?? ambientSounds[0];
}
