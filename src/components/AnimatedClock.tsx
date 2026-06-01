import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

interface AnimatedClockProps {
  size: number;
  /** Fraction elapsed, 0 = full dial, 1 = empty. */
  progress: number;
  /** Seconds hand angle in degrees (driven by real elapsed time, ticks per second). */
  secondsAngle: number;
  color: string;
  trackColor: string;
  running: boolean;
  /** When true (time almost up) the stopwatch pulses faster to signal urgency. */
  ending?: boolean;
}

// Everything is laid out in a 100x100 viewBox so it scales to any `size`.
const VB = 100;
const CX = 50;
const CY = 57;
const RADIUS = 36;
const STROKE = 6;
const CIRC = 2 * Math.PI * RADIUS;
const HAND_LENGTH = 25;

export function AnimatedClock({
  size,
  progress,
  secondsAngle,
  color,
  trackColor,
  running,
  ending = false,
}: AnimatedClockProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  // Remaining arc of the dial. Pinned to the top (12 o'clock); the empty gap
  // grows clockwise from the top as time goes down.
  const remainingLength = (1 - clamped) * CIRC;
  const startAngle = -90 + clamped * 360;
  // The hand points at the consumed edge and sweeps down as time passes.
  const handAngle = clamped * 360;

  const scale = useSharedValue(1);

  useEffect(() => {
    if (running) {
      scale.value = withRepeat(
        withTiming(ending ? 1.1 : 1.05, {
          duration: ending ? 480 : 1000,
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
        {/* Top crown / button so it reads as a stopwatch ("00" at the top) */}
        <Rect x={CX - 7} y={3} width={14} height={8} rx={3} fill={color} />
        <Rect x={CX - 3.5} y={10} width={7} height={12} rx={2} fill={color} />
        {/* Side lugs */}
        <Rect
          x={CX - 30}
          y={20}
          width={11}
          height={6}
          rx={3}
          fill={color}
          transform={`rotate(-45 ${CX - 24} ${24})`}
        />
        <Rect
          x={CX + 19}
          y={20}
          width={11}
          height={6}
          rx={3}
          fill={color}
          transform={`rotate(45 ${CX + 24} ${24})`}
        />

        {/* Dial track (faint full circle) */}
        <Circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Depleting dial: this IS the timer line, draining from the top */}
        <Circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${remainingLength} ${CIRC}`}
          transform={`rotate(${startAngle} ${CX} ${CY})`}
        />

        {/* Progress hand: sweeps slowly with the consumed edge */}
        <G transform={`rotate(${handAngle} ${CX} ${CY})`}>
          <Line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - HAND_LENGTH}
            stroke={color}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </G>
        {/* Seconds hand: ticks once per second (driven by real elapsed time) */}
        <G transform={`rotate(${secondsAngle} ${CX} ${CY})`}>
          <Line
            x1={CX}
            y1={CY + 7}
            x2={CX}
            y2={CY - (HAND_LENGTH + 6)}
            stroke={color}
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.7}
          />
        </G>
        <Circle cx={CX} cy={CY} r={5.5} fill={color} />
        <Circle cx={CX} cy={CY} r={2.5} fill={trackColor} />
      </Svg>
    </Animated.View>
  );
}
