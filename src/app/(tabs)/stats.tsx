import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarChart, type BarDatum } from '@/components/BarChart';
import { Card, SectionTitle } from '@/components/ui';
import { formatFocusDuration, todayKey, weekdayLabel } from '@/lib/time';
import { useSettingsStore } from '@/store/settingsStore';
import { selectTotals, selectWeek, useStatsStore } from '@/store/statsStore';
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
    <SafeAreaView style={[styles.safe, { backgroundColor: neutral.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: neutral.text }]}>Estadísticas</Text>

        <SectionTitle>Objetivo de hoy</SectionTitle>
        <Card>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalValue, { color: neutral.text }]}>
              {today.pomodoros}
              <Text style={[styles.goalTotal, { color: neutral.textMuted }]}> / {dailyGoal}</Text>
            </Text>
            <Text style={[styles.goalLabel, { color: neutral.textMuted }]}>pomodoros</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: neutral.track }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${goalProgress * 100}%`, backgroundColor: accent.work },
              ]}
            />
          </View>
          <Text style={[styles.goalNote, { color: neutral.textMuted }]}>
            {goalProgress >= 1
              ? '¡Objetivo cumplido! Excelente trabajo.'
              : `Te faltan ${Math.max(0, dailyGoal - today.pomodoros)} para tu meta.`}
          </Text>
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
          <Ionicons name="hourglass-outline" size={22} color={accent.work} />
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
  const { neutral } = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: neutral.surface, borderColor: neutral.border }]}>
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
  goalHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  goalValue: { fontSize: 34, fontWeight: '800' },
  goalTotal: { fontSize: 20, fontWeight: '600' },
  goalLabel: { fontSize: 14 },
  progressTrack: { height: 12, borderRadius: 6, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  goalNote: { fontSize: 13, marginTop: 10 },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 6,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  totalFocus: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  totalFocusLabel: { fontSize: 13 },
  totalFocusValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
});
