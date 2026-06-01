import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Row, SectionTitle, Segmented, Stepper } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { useTimerStore } from '@/store/timerStore';
import { accents, customAccentKey, hexToRgb, rgbToHex, type Appearance } from '@/theme/themes';
import { useTheme } from '@/theme/useTheme';

export default function SettingsScreen() {
  const { neutral, accent } = useTheme();
  const s = useSettingsStore();

  const setDuration = (patch: Parameters<typeof s.set>[0]) => {
    s.set(patch);
    useTimerStore.getState().refreshDurations();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: neutral.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: neutral.text }]}>Ajustes</Text>

        <SectionTitle>Duración (minutos)</SectionTitle>
        <Card>
          <Row
            icon="briefcase-outline"
            label="Concentración"
            right={
              <Stepper
                value={s.workMinutes}
                onChange={(v) => setDuration({ workMinutes: v })}
                min={1}
                max={120}
              />
            }
          />
          <Divider />
          <Row
            icon="cafe-outline"
            label="Descanso corto"
            right={
              <Stepper
                value={s.shortBreakMinutes}
                onChange={(v) => setDuration({ shortBreakMinutes: v })}
                min={1}
                max={60}
              />
            }
          />
          <Divider />
          <Row
            icon="bed-outline"
            label="Descanso largo"
            right={
              <Stepper
                value={s.longBreakMinutes}
                onChange={(v) => setDuration({ longBreakMinutes: v })}
                min={1}
                max={60}
              />
            }
          />
          <Divider />
          <Row
            icon="repeat-outline"
            label="Ciclos para descanso largo"
            right={
              <Stepper
                value={s.cyclesBeforeLongBreak}
                onChange={(v) => s.set({ cyclesBeforeLongBreak: v })}
                min={2}
                max={12}
              />
            }
          />
        </Card>

        <SectionTitle>Automatización</SectionTitle>
        <Card>
          <Row
            icon="play-forward-outline"
            label="Iniciar descansos automáticamente"
            right={
              <Switch
                value={s.autoStartBreaks}
                onValueChange={(v) => s.set({ autoStartBreaks: v })}
                trackColor={{ true: accent.work }}
              />
            }
          />
          <Divider />
          <Row
            icon="play-outline"
            label="Iniciar concentración automáticamente"
            right={
              <Switch
                value={s.autoStartPomodoros}
                onValueChange={(v) => s.set({ autoStartPomodoros: v })}
                trackColor={{ true: accent.work }}
              />
            }
          />
        </Card>

        <SectionTitle>Objetivo y avisos</SectionTitle>
        <Card>
          <Row
            icon="flag-outline"
            label="Objetivo diario"
            description="Pomodoros a completar cada día"
            right={
              <Stepper value={s.dailyGoal} onChange={(v) => s.set({ dailyGoal: v })} min={1} max={30} />
            }
          />
          <Divider />
          <Row
            icon="volume-high-outline"
            label="Sonido al terminar"
            right={
              <Switch
                value={s.soundEnabled}
                onValueChange={(v) => s.set({ soundEnabled: v })}
                trackColor={{ true: accent.work }}
              />
            }
          />
          <Divider />
          <Row
            icon="phone-portrait-outline"
            label="Vibración"
            right={
              <Switch
                value={s.vibrationEnabled}
                onValueChange={(v) => s.set({ vibrationEnabled: v })}
                trackColor={{ true: accent.work }}
              />
            }
          />
          <Divider />
          <Row
            icon="sunny-outline"
            label="Mantener pantalla encendida"
            description="Mientras el temporizador corre"
            right={
              <Switch
                value={s.keepAwake}
                onValueChange={(v) => s.set({ keepAwake: v })}
                trackColor={{ true: accent.work }}
              />
            }
          />
        </Card>

        <SectionTitle>Apariencia</SectionTitle>
        <Card>
          <Segmented<Appearance>
            value={s.appearance}
            onChange={(v) => s.set({ appearance: v })}
            options={[
              { label: 'Sistema', value: 'system' },
              { label: 'Claro', value: 'light' },
              { label: 'Oscuro', value: 'dark' },
            ]}
          />
          <Text style={[styles.swatchTitle, { color: neutral.textMuted }]}>Tema de color</Text>
          <View style={styles.swatches}>
            {accents.map((a) => {
              const selected = a.key === s.accentKey;
              return (
                <Pressable
                  key={a.key}
                  onPress={() => s.set({ accentKey: a.key })}
                  style={styles.swatchWrap}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: a.work, borderColor: selected ? neutral.text : 'transparent' },
                    ]}
                  >
                    {selected ? <Ionicons name="checkmark" size={20} color="#fff" /> : null}
                  </View>
                  <Text style={[styles.swatchLabel, { color: neutral.textMuted }]}>{a.name}</Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => s.set({ accentKey: customAccentKey })}
              style={styles.swatchWrap}
            >
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: s.customAccent,
                    borderColor: s.accentKey === customAccentKey ? neutral.text : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={s.accentKey === customAccentKey ? 'checkmark' : 'color-palette'}
                  size={20}
                  color="#fff"
                />
              </View>
              <Text style={[styles.swatchLabel, { color: neutral.textMuted }]}>Custom</Text>
            </Pressable>
          </View>

          {s.accentKey === customAccentKey ? (
            <RgbPicker
              value={s.customAccent}
              onChange={(hex) => s.set({ customAccent: hex })}
            />
          ) : null}
        </Card>

        <Pressable
          onPress={() =>
            Alert.alert('Restablecer ajustes', '¿Volver a los valores por defecto?', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Restablecer',
                style: 'destructive',
                onPress: () => {
                  s.reset();
                  useTimerStore.getState().reset();
                },
              },
            ])
          }
          style={[styles.resetBtn, { borderColor: neutral.border }]}
        >
          <Ionicons name="refresh" size={18} color={neutral.danger} />
          <Text style={[styles.resetText, { color: neutral.danger }]}>Restablecer ajustes</Text>
        </Pressable>

        <Text style={[styles.version, { color: neutral.textMuted }]}>FocusPal v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Divider() {
  const { neutral } = useTheme();
  return <View style={[styles.divider, { backgroundColor: neutral.border }]} />;
}

function RgbPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const { neutral } = useTheme();
  const { r, g, b } = hexToRgb(value);
  const channel = (key: 'r' | 'g' | 'b', v: number) => {
    const next = { r, g, b, [key]: v };
    onChange(rgbToHex(next.r, next.g, next.b));
  };
  const channels: { key: 'r' | 'g' | 'b'; label: string; val: number; color: string }[] = [
    { key: 'r', label: 'R', val: r, color: '#E5484D' },
    { key: 'g', label: 'G', val: g, color: '#30A46C' },
    { key: 'b', label: 'B', val: b, color: '#3B82F6' },
  ];
  return (
    <View style={styles.rgbWrap}>
      <View style={[styles.rgbPreview, { backgroundColor: value, borderColor: neutral.border }]} />
      <View style={styles.rgbSliders}>
        {channels.map((c) => (
          <View key={c.key} style={styles.rgbRow}>
            <Text style={[styles.rgbLabel, { color: neutral.textMuted }]}>{c.label}</Text>
            <Slider
              style={styles.rgbSlider}
              minimumValue={0}
              maximumValue={255}
              step={1}
              value={c.val}
              minimumTrackTintColor={c.color}
              maximumTrackTintColor={neutral.track}
              thumbTintColor={c.color}
              onValueChange={(v) => channel(c.key, v)}
            />
            <Text style={[styles.rgbValue, { color: neutral.text }]}>{c.val}</Text>
          </View>
        ))}
        <Text style={[styles.rgbHex, { color: neutral.textMuted }]}>{value.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },
  swatchTitle: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 10 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  swatchWrap: { alignItems: 'center', gap: 6, width: 64 },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  swatchLabel: { fontSize: 11, fontWeight: '600' },
  rgbWrap: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  rgbPreview: { width: 56, height: 56, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  rgbSliders: { flex: 1 },
  rgbRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rgbLabel: { width: 14, fontSize: 13, fontWeight: '700' },
  rgbSlider: { flex: 1, height: 32 },
  rgbValue: { width: 32, fontSize: 12, fontWeight: '600', textAlign: 'right' },
  rgbHex: { fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'right' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  resetText: { fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 16 },
});
