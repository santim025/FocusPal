import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/useTheme';

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { neutral } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: neutral.surface, borderColor: neutral.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const { neutral } = useTheme();
  return <Text style={[styles.sectionTitle, { color: neutral.textMuted }]}>{children}</Text>;
}

export function Row({
  icon,
  label,
  description,
  right,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  right?: ReactNode;
}) {
  const { neutral, accent } = useTheme();
  return (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: accent.work + '22' }]}>
          <Ionicons name={icon} size={18} color={accent.work} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: neutral.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.rowDescription, { color: neutral.textMuted }]}>{description}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const { neutral, accent } = useTheme();
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(clamp(value - step))}
        style={[styles.stepperBtn, { backgroundColor: neutral.surfaceAlt }]}
        hitSlop={6}
      >
        <Ionicons name="remove" size={18} color={accent.work} />
      </Pressable>
      <Text style={[styles.stepperValue, { color: neutral.text }]}>{value}</Text>
      <Pressable
        onPress={() => onChange(clamp(value + step))}
        style={[styles.stepperBtn, { backgroundColor: neutral.surfaceAlt }]}
        hitSlop={6}
      >
        <Ionicons name="add" size={18} color={accent.work} />
      </Pressable>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { neutral, accent } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: neutral.surfaceAlt }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && { backgroundColor: accent.work }]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: active ? '#fff' : neutral.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowDescription: { fontSize: 12, marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 17,
    fontWeight: '700',
    minWidth: 34,
    textAlign: 'center',
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
