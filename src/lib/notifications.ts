import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const CHANNEL_ID = 'pomodoro';
const ONGOING_CHANNEL_ID = 'pomodoro-ongoing';
const ONGOING_ID = 'focuspal-ongoing';

// Expo Go (SDK 53+) removed expo-notifications support and throws on import.
// We therefore load the module lazily and only outside of Expo Go, so the app
// runs fine in Expo Go (using sound + vibration) and gets full notifications in
// a development/production build.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');

let cached: NotificationsModule | null = null;
let handlerConfigured = false;

function getNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (!cached) {
    cached = require('expo-notifications') as NotificationsModule;
  }
  if (!handlerConfigured && cached) {
    cached.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }
  return cached;
}

export async function setupNotifications(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  try {
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Temporizador Pomodoro',
        importance: N.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
      await N.setNotificationChannelAsync(ONGOING_CHANNEL_ID, {
        name: 'Temporizador activo',
        importance: N.AndroidImportance.LOW,
        showBadge: false,
        sound: undefined,
      });
    }
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await N.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function schedulePhaseEndNotification(
  title: string,
  body: string,
  secondsFromNow: number,
  withSound: boolean
): Promise<string | null> {
  const N = getNotifications();
  if (!N || secondsFromNow <= 0) return null;
  try {
    return await N.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: withSound ? 'default' : undefined,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.ceil(secondsFromNow)),
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string | null): Promise<void> {
  const N = getNotifications();
  if (!N || !id) return;
  try {
    await N.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}

/**
 * Shows a persistent (ongoing) notification with the running timer so it stays
 * visible on the lock screen. Works only in a development/production build; in
 * Expo Go it is a no-op because expo-notifications is not loaded there.
 */
export async function presentOngoingTimer(
  title: string,
  body: string,
  color: string
): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  try {
    await N.scheduleNotificationAsync({
      identifier: ONGOING_ID,
      content: {
        title,
        body,
        color,
        sticky: true,
        autoDismiss: false,
        sound: undefined,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: ONGOING_CHANNEL_ID,
      },
    });
  } catch {
    // ignore
  }
}

export async function clearOngoingTimer(): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(ONGOING_ID);
    await N.dismissNotificationAsync(ONGOING_ID);
  } catch {
    // ignore
  }
}
