import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Appearance } from '@/theme/themes';
import { defaultAccentKey, defaultCustomColor } from '@/theme/themes';

export interface SettingsState {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  dailyGoal: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  keepAwake: boolean;
  appearance: Appearance;
  accentKey: string;
  customAccent: string;
  showDigits: boolean;
  hydrated: boolean;
  set: (patch: Partial<SettingsState>) => void;
  reset: () => void;
  setHydrated: () => void;
}

export const DEFAULT_SETTINGS = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  dailyGoal: 8,
  soundEnabled: true,
  vibrationEnabled: true,
  keepAwake: true,
  appearance: 'system' as Appearance,
  accentKey: defaultAccentKey,
  customAccent: defaultCustomColor,
  showDigits: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      hydrated: false,
      set: (patch) => set(patch),
      reset: () => set({ ...DEFAULT_SETTINGS }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'focuspal-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, set, reset, setHydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
