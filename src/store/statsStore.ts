import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { lastNDays, todayKey } from '@/lib/time';

export interface DayStat {
  date: string;
  pomodoros: number;
  focusSeconds: number;
}

interface StatsState {
  days: Record<string, DayStat>;
  recordPomodoro: (focusSeconds: number) => void;
  getDay: (date: string) => DayStat;
  reset: () => void;
}

function emptyDay(date: string): DayStat {
  return { date, pomodoros: 0, focusSeconds: 0 };
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      days: {},
      recordPomodoro: (focusSeconds) =>
        set((s) => {
          const key = todayKey();
          const current = s.days[key] ?? emptyDay(key);
          return {
            days: {
              ...s.days,
              [key]: {
                ...current,
                pomodoros: current.pomodoros + 1,
                focusSeconds: current.focusSeconds + Math.max(0, Math.round(focusSeconds)),
              },
            },
          };
        }),
      getDay: (date) => get().days[date] ?? emptyDay(date),
      reset: () => set({ days: {} }),
    }),
    {
      name: 'focuspal-stats',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ days: s.days }),
    }
  )
);

export function selectWeek(days: Record<string, DayStat>): DayStat[] {
  return lastNDays(7).map((date) => days[date] ?? emptyDay(date));
}

export function selectTotals(days: Record<string, DayStat>) {
  return Object.values(days).reduce(
    (acc, d) => {
      acc.pomodoros += d.pomodoros;
      acc.focusSeconds += d.focusSeconds;
      return acc;
    },
    { pomodoros: 0, focusSeconds: 0 }
  );
}
