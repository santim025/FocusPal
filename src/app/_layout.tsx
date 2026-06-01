import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { setupNotifications } from '@/lib/notifications';
import { initSound } from '@/lib/sound';
import { useTheme } from '@/theme/useTheme';

export default function RootLayout() {
  const { dark, neutral, accent } = useTheme();

  useEffect(() => {
    void setupNotifications();
    void initSound();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;
    void (async () => {
      try {
        const NavigationBar = await import('expo-navigation-bar');
        if (cancelled) return;
        await NavigationBar.setButtonStyleAsync(dark ? 'light' : 'dark');
        await NavigationBar.setBackgroundColorAsync(neutral.surface);
      } catch {
        // No-op on environments where the navigation bar can't be styled (e.g. edge-to-edge / Expo Go).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dark, neutral.surface]);

  const base = dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: accent.work,
      background: neutral.background,
      card: neutral.surface,
      text: neutral.text,
      border: neutral.border,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
