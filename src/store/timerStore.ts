import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  cancelNotification,
  clearOngoingTimer,
  presentOngoingTimer,
  schedulePhaseEndNotification,
} from '@/lib/notifications';
import { playChime } from '@/lib/sound';
import { formatClock } from '@/lib/time';
import { accents, defaultAccentKey } from '@/theme/themes';
import { DEFAULT_SETTINGS, useSettingsStore, type SettingsState } from './settingsStore';
import { useStatsStore } from './statsStore';
import { useTasksStore } from './tasksStore';

export type Phase = 'work' | 'short' | 'long';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface DurationOverride {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
}

interface TimerState {
  phase: Phase;
  status: TimerStatus;
  endTimestamp: number | null;
  remainingMs: number;
  totalMs: number;
  completedWorkSessions: number;
  override: DurationOverride | null;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  complete: () => void;
  refreshDurations: () => void;
  setOverride: (override: DurationOverride | null) => void;
  getRemainingMs: (now?: number) => number;
}

let pendingNotificationId: string | null = null;

function resolveConfig(override: DurationOverride | null): DurationOverride {
  const s = useSettingsStore.getState();
  return {
    workMinutes: override?.workMinutes ?? s.workMinutes,
    shortBreakMinutes: override?.shortBreakMinutes ?? s.shortBreakMinutes,
    longBreakMinutes: override?.longBreakMinutes ?? s.longBreakMinutes,
    cyclesBeforeLongBreak: override?.cyclesBeforeLongBreak ?? s.cyclesBeforeLongBreak,
  };
}

function phaseMinutes(phase: Phase, cfg: DurationOverride): number {
  if (phase === 'work') return cfg.workMinutes;
  if (phase === 'short') return cfg.shortBreakMinutes;
  return cfg.longBreakMinutes;
}

function phaseDurationMs(phase: Phase, cfg: DurationOverride): number {
  return Math.max(1, phaseMinutes(phase, cfg)) * 60 * 1000;
}

const PHASE_LABEL: Record<Phase, string> = {
  work: 'Concentración',
  short: 'Descanso corto',
  long: 'Descanso largo',
};

async function scheduleEnd(phase: Phase, remainingMs: number, s: SettingsState) {
  await cancelNotification(pendingNotificationId);
  pendingNotificationId = null;
  const nextIsBreak = phase === 'work';
  const title = nextIsBreak ? 'Tiempo de descanso' : 'De vuelta al trabajo';
  const body = nextIsBreak
    ? `Terminó tu sesión de ${PHASE_LABEL[phase].toLowerCase()}. Toma un respiro.`
    : 'Tu descanso terminó. ¡A concentrarte!';
  pendingNotificationId = await schedulePhaseEndNotification(
    title,
    body,
    remainingMs / 1000,
    s.soundEnabled
  );
}

function cancelPending() {
  void cancelNotification(pendingNotificationId);
  pendingNotificationId = null;
}

function phaseAccentColor(phase: Phase): string {
  const accentKey = useSettingsStore.getState().accentKey;
  const a = accents.find((x) => x.key === accentKey) ?? accents.find((x) => x.key === defaultAccentKey)!;
  if (phase === 'work') return a.work;
  if (phase === 'short') return a.shortBreak;
  return a.longBreak;
}

function showOngoing(phase: Phase, endTimestamp: number) {
  const label = PHASE_LABEL[phase];
  const body = `Termina a las ${formatClock(endTimestamp)}`;
  void presentOngoingTimer(`Cadencia · ${label}`, body, phaseAccentColor(phase));
}

function hideOngoing() {
  void clearOngoingTimer();
}

function fireCompletionFeedback(s: SettingsState) {
  if (s.soundEnabled) playChime();
  if (s.vibrationEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}

const initialTotal = Math.max(1, DEFAULT_SETTINGS.workMinutes) * 60 * 1000;

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      phase: 'work',
      status: 'idle',
      endTimestamp: null,
      remainingMs: initialTotal,
      totalMs: initialTotal,
      completedWorkSessions: 0,
      override: null,

      getRemainingMs: (now = Date.now()) => {
        const s = get();
        if (s.status === 'running' && s.endTimestamp != null) {
          return Math.max(0, s.endTimestamp - now);
        }
        return s.remainingMs;
      },

      start: () => {
        const s = get();
        if (s.status === 'running') return;
        const settings = useSettingsStore.getState();
        const cfg = resolveConfig(s.override);
        let remaining = s.remainingMs;
        let total = s.totalMs;
        if (remaining <= 0) {
          total = phaseDurationMs(s.phase, cfg);
          remaining = total;
        }
        const endTimestamp = Date.now() + remaining;
        set({ status: 'running', endTimestamp, remainingMs: remaining, totalMs: total });
        void scheduleEnd(s.phase, remaining, settings);
        showOngoing(s.phase, endTimestamp);
      },

      pause: () => {
        const s = get();
        if (s.status !== 'running') return;
        const remaining = s.getRemainingMs();
        cancelPending();
        hideOngoing();
        set({ status: 'paused', remainingMs: remaining, endTimestamp: null });
      },

      toggle: () => {
        const s = get();
        if (s.status === 'running') s.pause();
        else s.start();
      },

      reset: () => {
        const s = get();
        const cfg = resolveConfig(s.override);
        cancelPending();
        hideOngoing();
        const total = phaseDurationMs(s.phase, cfg);
        set({ status: 'idle', endTimestamp: null, totalMs: total, remainingMs: total });
      },

      skip: () => {
        const s = get();
        const cfg = resolveConfig(s.override);
        cancelPending();
        hideOngoing();
        const nextPhase: Phase = s.phase === 'work' ? 'short' : 'work';
        const total = phaseDurationMs(nextPhase, cfg);
        set({
          phase: nextPhase,
          status: 'idle',
          endTimestamp: null,
          totalMs: total,
          remainingMs: total,
        });
      },

      complete: () => {
        const s = get();
        const settings = useSettingsStore.getState();
        const cfg = resolveConfig(s.override);
        const wasWork = s.phase === 'work';
        cancelPending();
        hideOngoing();
        fireCompletionFeedback(settings);

        if (wasWork) {
          useStatsStore.getState().recordPomodoro(cfg.workMinutes * 60);
          useTasksStore.getState().incrementActivePomodoro();
        }

        let completed = s.completedWorkSessions;
        let nextPhase: Phase;
        if (wasWork) {
          completed += 1;
          const cycles = Math.max(1, cfg.cyclesBeforeLongBreak);
          nextPhase = completed % cycles === 0 ? 'long' : 'short';
        } else {
          nextPhase = 'work';
        }

        const total = phaseDurationMs(nextPhase, cfg);
        set({
          phase: nextPhase,
          completedWorkSessions: completed,
          status: 'idle',
          endTimestamp: null,
          totalMs: total,
          remainingMs: total,
        });

        const auto = nextPhase === 'work' ? settings.autoStartPomodoros : settings.autoStartBreaks;
        if (auto) get().start();
      },

      refreshDurations: () => {
        const s = get();
        if (s.status !== 'idle') return;
        const cfg = resolveConfig(s.override);
        const total = phaseDurationMs(s.phase, cfg);
        set({ totalMs: total, remainingMs: total });
      },

      setOverride: (override) => {
        const s = get();
        const changed = JSON.stringify(s.override) !== JSON.stringify(override);
        if (!changed) return;
        set({ override });
        if (s.status === 'idle') {
          const cfg = resolveConfig(override);
          const total = phaseDurationMs(s.phase, cfg);
          set({ totalMs: total, remainingMs: total });
        }
      },
    }),
    {
      name: 'focuspal-timer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        phase: s.phase,
        status: s.status,
        endTimestamp: s.endTimestamp,
        remainingMs: s.remainingMs,
        totalMs: s.totalMs,
        completedWorkSessions: s.completedWorkSessions,
        override: s.override,
      }),
    }
  )
);

export { PHASE_LABEL };
