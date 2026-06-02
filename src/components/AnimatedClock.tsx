import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

interface AnimatedClockProps {
  size: number;
  /** Fraction elapsed, 0 = full ring, 1 = empty. */
  progress: number;
  color: string;
  trackColor: string;
  running: boolean;
  /** When true (time almost up) the ring pulses faster to signal urgency. */
  ending?: boolean;
  /** Digital readout / icon rendered centered over the ring. */
  children?: ReactNode;
}

// Everything is laid out in a 100x100 viewBox so it scales to any `size`.
const VB = 100;
const C = 50;
const RADIUS = 42;
const CIRC = 2 * Math.PI * RADIUS;
const TICK_OUTER = 47.5;

function polar(radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: C + radius * Math.cos(rad), y: C + radius * Math.sin(rad) };
}

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0;
  const inner = major ? 43.2 : 45;
  const outer = polar(TICK_OUTER, i * 6);
  const start = polar(inner, i * 6);
  return { major, x1: start.x, y1: start.y, x2: outer.x, y2: outer.y };
});

export function AnimatedClock({
  size,
  progress,
  color,
  trackColor,
  running,
  ending = false,
  children,
}: AnimatedClockProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  // Remaining arc, pinned to 12 o'clock; the empty gap grows clockwise.
  const remainingLength = (1 - clamped) * CIRC;
  const guide = polar(RADIUS, clamped * 360);

  const scale = useSharedValue(1);

  useEffect(() => {
    if (running) {
      scale.value = withRepeat(
        withTiming(1.025, {
          duration: ending ? 1000 : 3400,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [running, ending, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
        {TICKS.map((t, i) => (
          <Line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={trackColor}
            strokeWidth={t.major ? 1.1 : 0.6}
            strokeLinecap="round"
            opacity={t.major ? 0.9 : 0.55}
          />
        ))}

        {/* Base ring */}
        <Circle
          cx={C}
          cy={C}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={4}
          fill="none"
          opacity={0.6}
        />
        {/* Progress arc: drains from the top, clockwise */}
        <Circle
          cx={C}
          cy={C}
          r={RADIUS}
          stroke={color}
          strokeWidth={4.5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${remainingLength} ${CIRC}`}
          transform={`rotate(-90 ${C} ${C})`}
        />
        {/* Guide dot on the consumed edge */}
        <Circle cx={guide.x} cy={guide.y} r={2.6} fill={color} />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
