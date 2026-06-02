import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, type GestureResponderEvent } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export default function TabsLayout() {
  const { neutral, accent } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent.work,
        tabBarInactiveTintColor: neutral.textMuted,
        tabBarStyle: {
          backgroundColor: neutral.surface,
          borderTopColor: neutral.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarButton: (props) => {
          const { onPress, onLongPress, accessibilityState, accessibilityLabel, testID, children, style } =
            props;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              onPress={(e) => onPress?.(e as GestureResponderEvent)}
              onLongPress={(e) => onLongPress?.(e as GestureResponderEvent)}
              android_ripple={null}
              style={[style, { alignItems: 'center', justifyContent: 'center' }]}
            >
              {children}
            </Pressable>
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Temporizador',
          tabBarIcon: ({ color, size }) => <Ionicons name="timer-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
