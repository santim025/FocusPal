import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedClock } from '@/components/AnimatedClock';
import { getTaskType } from '@/lib/taskTypes';
import { useSettingsStore } from '@/store/settingsStore';
import { PHASE_LABEL, useTimerStore, type Phase } from '@/store/timerStore';
import { useTasksStore } from '@/store/tasksStore';
import { useTheme } from '@/theme/useTheme';

const KEEP_AWAKE_TAG = 'focuspal-timer';

export default function TimerScreen() {
  const { neutral, accent } = useTheme();

  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const endTimestamp = useTimerStore((s) => s.endTimestamp);
  const remainingMs = useTimerStore((s) => s.remainingMs);
  const totalMs = useTimerStore((s) => s.totalMs);
  const completedWorkSessions = useTimerStore((s) => s.completedWorkSessions);
  const toggle = useTimerStore((s) => s.toggle);
  const reset = useTimerStore((s) => s.reset);
  const skip = useTimerStore((s) => s.skip);
  const complete = useTimerStore((s) => s.complete);
  const setOverride = useTimerStore((s) => s.setOverride);

  const workMinutes = useSettingsStore((s) => s.workMinutes);
  const shortBreakMinutes = useSettingsStore((s) => s.shortBreakMinutes);
  const longBreakMinutes = useSettingsStore((s) => s.longBreakMinutes);
  const cyclesBeforeLongBreak = useSettingsStore((s) => s.cyclesBeforeLongBreak);
  const keepAwake = useSettingsStore((s) => s.keepAwake);

  const tasks = useTasksStore((s) => s.tasks);
  const activeTaskId = useTasksStore((s) => s.activeTaskId);
  const activeTask = tasks.find((t) => t.id === activeTaskId && !t.done) ?? null;
  const activeType = activeTask ? getTaskType(activeTask.typeKey) : null;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (activeType && activeType.workMinutes != null) {
      setOverride({
        workMinutes: activeType.workMinutes,
        shortBreakMinutes: activeType.shortBreakMinutes,
        longBreakMinutes: activeType.longBreakMinutes,
        cyclesBeforeLongBreak: activeType.cyclesBeforeLongBreak,
      });
    } else {
      setOverride(null);
    }
  }, [activeTask?.id, activeTask?.typeKey, activeType, setOverride]);

  useEffect(() => {
    useTimerStore.getState().refreshDurations();
  }, [workMinutes, shortBreakMinutes, longBreakMinutes, phase]);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (status === 'running' && endTimestamp != null && now >= endTimestamp) {
      complete();
    }
  }, [now, status, endTimestamp, complete]);

  useEffect(() => {
    if (status === 'running' && keepAwake) {
      void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
      return () => {
        void deactivateKeepAwake(KEEP_AWAKE_TAG);
      };
    }
  }, [status, keepAwake]);

  const remaining =
    status === 'running' && endTimestamp != null ? Math.max(0, endTimestamp - now) : remainingMs;
  const progress = totalMs > 0 ? 1 - remaining / totalMs : 0;
  const elapsedSeconds = Math.max(0, Math.floor((totalMs - remaining) / 1000));
  const secondsAngle = (elapsedSeconds % 60) * 6;
  const phaseColor = phaseColors(phase, accent);
  const cycles = Math.max(1, cyclesBeforeLongBreak);
  const cyclePosition = completedWorkSessions % cycles;
  const running = status === 'running';
  const endingMs = Math.max(5000, totalMs * 0.1);
  const isEnding = status !== 'idle' && remaining > 0 && remaining <= endingMs;
  const displayColor = isEnding ? neutral.danger : phaseColor;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: neutral.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: neutral.text }]}>FocusPal</Text>
        <View style={[styles.phaseBadge, { backgroundColor: phaseColor + '22' }]}>
          <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
          <Text style={[styles.phaseBadgeText, { color: phaseColor }]}>{PHASE_LABEL[phase]}</Text>
        </View>
      </View>

      <View style={styles.ringWrap}>
        <AnimatedClock
          size={300}
          progress={progress}
          secondsAngle={secondsAngle}
          color={displayColor}
          trackColor={neutral.track}
          running={running}
          ending={isEnding}
        />
        <Text style={[styles.phaseUnder, { color: neutral.textMuted }]}>
          {phase === 'work' ? 'Mantente concentrado' : 'Tómate un respiro'}
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: cycles }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i < cyclePosition ? phaseColor : neutral.track,
                  borderColor: phaseColor,
                  borderWidth: i === cyclePosition && phase === 'work' ? 2 : 0,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {activeTask ? (
        <View style={[styles.taskChip, { backgroundColor: neutral.surface, borderColor: neutral.border }]}>
          <Ionicons name={(activeType?.icon ?? 'ellipse') as never} size={16} color={phaseColor} />
          <Text style={[styles.taskChipText, { color: neutral.text }]} numberOfLines={1}>
            {activeTask.title}
          </Text>
          <Text style={[styles.taskChipCount, { color: neutral.textMuted }]}>
            {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros}
          </Text>
        </View>
      ) : (
        <Text style={[styles.noTask, { color: neutral.textMuted }]}>
          Sin tarea activa · elígela en Tareas
        </Text>
      )}

      <View style={styles.controls}>
        <Pressable
          onPress={reset}
          style={[styles.secondaryBtn, { backgroundColor: neutral.surfaceAlt }]}
          hitSlop={8}
        >
          <Ionicons name="refresh" size={24} color={neutral.text} />
        </Pressable>

        <Pressable
          onPress={toggle}
          style={[styles.mainBtn, { backgroundColor: phaseColor }]}
          hitSlop={8}
        >
          <Ionicons name={running ? 'pause' : 'play'} size={40} color="#fff" />
        </Pressable>

        <Pressable
          onPress={skip}
          style={[styles.secondaryBtn, { backgroundColor: neutral.surfaceAlt }]}
          hitSlop={8}
        >
          <Ionicons name="play-skip-forward" size={22} color={neutral.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function phaseColors(phase: Phase, accent: { work: string; shortBreak: string; longBreak: string }) {
  if (phase === 'work') return accent.work;
  if (phase === 'short') return accent.shortBreak;
  return accent.longBreak;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  appName: { fontSize: 22, fontWeight: '800' },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phaseDot: { width: 8, height: 8, borderRadius: 4 },
  phaseBadgeText: { fontSize: 13, fontWeight: '700' },
  ringWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  phaseUnder: { fontSize: 15, fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  taskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '80%',
  },
  taskChipText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  taskChipCount: { fontSize: 13, fontWeight: '600' },
  noTask: { fontSize: 13, textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 32,
  },
  mainBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  secondaryBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
