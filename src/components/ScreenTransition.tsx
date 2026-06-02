import { useFocusEffect } from 'expo-router';
import { type ReactNode, useCallback } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/useTheme';

/**
 * Wraps a tab screen so its content gently fades + glides up with a micro-scale
 * each time the screen gains focus. The wrapper paints the theme background so
 * the brief upward glide never reveals an edge.
 */
export function ScreenTransition({ children }: { children: ReactNode }) {
  const { neutral } = useTheme();
  const p = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      p.value = 0;
      p.value = withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) });
    }, [p])
  );

  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 12 }, { scale: 0.99 + p.value * 0.01 }],
  }));

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: neutral.background }, style]}>
      {children}
    </Animated.View>
  );
}
