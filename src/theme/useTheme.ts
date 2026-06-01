import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import {
  accents,
  buildCustomAccent,
  customAccentKey,
  defaultAccentKey,
  neutrals,
  type Accent,
  type Neutral,
} from './themes';

export interface AppTheme {
  dark: boolean;
  neutral: Neutral;
  accent: Accent;
}

export function useTheme(): AppTheme {
  const system = useColorScheme();
  const appearance = useSettingsStore((s) => s.appearance);
  const accentKey = useSettingsStore((s) => s.accentKey);
  const customAccent = useSettingsStore((s) => s.customAccent);

  const dark = appearance === 'system' ? system === 'dark' : appearance === 'dark';
  const neutral = dark ? neutrals.dark : neutrals.light;
  const accent =
    accentKey === customAccentKey
      ? buildCustomAccent(customAccent)
      : accents.find((a) => a.key === accentKey) ?? accents.find((a) => a.key === defaultAccentKey)!;

  return { dark, neutral, accent };
}
