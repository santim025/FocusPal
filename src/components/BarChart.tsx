import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  color: string;
  height?: number;
}

export function BarChart({ data, color, height = 140 }: BarChartProps) {
  const { neutral } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={[styles.container, { height }]}>
      {data.map((d, i) => {
        const ratio = d.value / max;
        const barHeight = Math.max(d.value > 0 ? 6 : 2, ratio * (height - 28));
        return (
          <View key={`${d.label}-${i}`} style={styles.column}>
            <Text style={[styles.value, { color: d.highlight ? color : neutral.textMuted }]}>
              {d.value > 0 ? d.value : ''}
            </Text>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: d.highlight ? color : neutral.track,
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                {
                  color: d.highlight ? neutral.text : neutral.textMuted,
                  fontWeight: d.highlight ? '700' : '600',
                },
              ]}
            >
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: '70%',
    maxWidth: 26,
    borderRadius: 8,
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
