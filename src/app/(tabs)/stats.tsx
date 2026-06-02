import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { BarChart, type BarDatum } from '@/components/BarChart';
import { ScreenTransition } from '@/components/ScreenTransition';
import { Card, SectionTitle } from '@/components/ui';
import { formatFocusDuration, todayKey, weekdayLabel } from '@/lib/time';
import { useSettingsStore } from '@/store/settingsStore';
import { selectTotals, selectWeek, useStatsStore } from '@/store/statsStore';
import { cardShadow } from '@/theme/themes';
import { useTheme } from '@/theme/useTheme';

export default function StatsScreen() {
  const { neutral, accent } = useTheme();
  const days = useStatsStore((s) => s.days);
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);

  const week = selectWeek(days);
  const totals = selectTotals(days);
  const today = days[todayKey()] ?? { pomodoros: 0, focusSeconds: 0 };
  const goalProgress = Math.min(1, today.pomodoros / Math.max(1, dailyGoal));

  const chartData: BarDatum[] = week.map((d, i) => ({
    label: weekdayLabel(d.date),
    value: d.pomodoros,
    highlight: i === week.length - 1,
  }));

  const weekTotal = week.reduce((acc, d) => acc + d.pomodoros, 0);
  const activeDays = Object.values(days).filter((d) => d.pomodoros > 0).length;

  return (
    <ScreenTransition>
      <SafeAreaView style={[styles.safe, { backgroundColor: neutral.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: neutral.text }]}>Estadísticas</Text>

        <SectionTitle>Objetivo de hoy</SectionTitle>
        <Card>
          <View style={styles.goalCard}>
            <GoalRing
              progress={goalProgress}
              done={today.pomodoros}
              goal={dailyGoal}
              color={accent.work}
            />
            <View style={styles.goalInfo}>
              <Text style={[styles.goalNote, { color: neutral.text }]}>
                {goalProgress >= 1
                  ? '¡Objetivo cumplido!'
                  : `Te faltan ${Math.max(0, dailyGoal - today.pomodoros)}`}
              </Text>
              <Text style={[styles.goalSub, { color: neutral.textMuted }]}>
                {goalProgress >= 1 ? 'Excelente trabajo.' : 'para tu meta de hoy.'}
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: neutral.track }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${goalProgress * 100}%`, backgroundColor: accent.work },
                  ]}
                />
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.statRow}>
          <StatBox
            icon="timer-outline"
            value={formatFocusDuration(today.focusSeconds)}
            label="Foco hoy"
            color={accent.work}
          />
          <StatBox
            icon="flame-outline"
            value={`${weekTotal}`}
            label="Esta semana"
            color={accent.shortBreak}
          />
        </View>
        <View style={styles.statRow}>
          <StatBox
            icon="checkmark-done-outline"
            value={`${totals.pomodoros}`}
            label="Total pomodoros"
            color={accent.longBreak}
          />
          <StatBox
            icon="calendar-outline"
            value={`${activeDays}`}
            label="Días activos"
            color={accent.work}
          />
        </View>

        <SectionTitle>Últimos 7 días</SectionTitle>
        <Card>
          <BarChart data={chartData} color={accent.work} />
        </Card>

        <Card style={styles.totalFocus}>
          <View style={[styles.statIcon, { backgroundColor: accent.work + '22' }]}>
            <Ionicons name="hourglass-outline" size={18} color={accent.work} />
          </View>
          <View>
            <Text style={[styles.totalFocusLabel, { color: neutral.textMuted }]}>
              Tiempo total enfocado
            </Text>
            <Text style={[styles.totalFocusValue, { color: neutral.text }]}>
              {formatFocusDuration(totals.focusSeconds)}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
    </ScreenTransition>
  );
}

const RING_R = 42;
const RING_C = 2 * Math.PI * RING_R;

function GoalRing({
  progress,
  done,
  goal,
  color,
}: {
  progress: number;
  done: number;
  goal: number;
  color: string;
}) {
  const { neutral } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.ring}>
      <Svg width={104} height={104} viewBox="0 0 100 100">
        <Circle cx={50} cy={50} r={RING_R} stroke={neutral.track} strokeWidth={9} fill="none" />
        <Circle
          cx={50}
          cy={50}
          r={RING_R}
          stroke={color}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${clamped * RING_C} ${RING_C}`}
          transform="rotate(-90 50 50)"
        />
      </Svg>
      <View style={styles.ringCenter} pointerEvents="none">
        <Text style={[styles.ringValue, { color: neutral.text }]}>
          {done}
          <Text style={[styles.ringGoal, { color: neutral.textMuted }]}>/{goal}</Text>
        </Text>
      </View>
    </View>
  );
}

function StatBox({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}) {
  const { neutral, dark } = useTheme();
  return (
    <View
      style={[
        styles.statBox,
        { backgroundColor: neutral.surface, borderColor: neutral.border },
        cardShadow(dark),
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: neutral.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: neutral.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ring: { width: 104, height: 104, alignItems: 'center', justifyContent: 'center' },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: { fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  ringGoal: { fontSize: 16, fontWeight: '600' },
  goalInfo: { flex: 1 },
  goalNote: { fontSize: 17, fontWeight: '700' },
  goalSub: { fontSize: 13, marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12 },
  totalFocus: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  totalFocusLabel: { fontSize: 13 },
  totalFocusValue: { fontSize: 18, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
});
