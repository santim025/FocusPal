import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type FaceMood = 'focus' | 'rest';

interface AnimatedFaceProps {
  size: number;
  /** Phase color — the face tints with the rest of the system. */
  color: string;
  mood: FaceMood;
  /** Animates only while the timer is actually running. */
  running: boolean;
}

// Laid out in a 100x100 viewBox so it scales to any `size`.
const EYE_CY = 44;
const EYE_LX = 33;
const EYE_RX = 67;

// Focus: reading glasses. Pupils scan horizontally inside each lens.
const PUPIL_R = 3.6;
const GAZE_RANGE = 6; // how far the pupils travel left/right inside the lens

// Rest: closed, content "^ ^" arcs.
const REST_PEAK = 7;
const REST_HALF = 7.5;
const REST_OPEN_MS = 4400;

function arc(cx: number, peak: number) {
  'worklet';
  return `M${cx - REST_HALF} ${EYE_CY} Q${cx} ${EYE_CY - peak} ${cx + REST_HALF} ${EYE_CY}`;
}

export function AnimatedFace({ size, color, mood, running }: AnimatedFaceProps) {
  // Reading scan: 0 = looking left, 1 = looking right (focus mode).
  const gaze = useSharedValue(0);
  // Blink openness: 1 = open, ~0.1 = closed (rest mode).
  const blink = useSharedValue(1);

  useEffect(() => {
    if (!running) {
      cancelAnimation(gaze);
      cancelAnimation(blink);
      gaze.value = withTiming(0.5, { duration: 220 });
      blink.value = withTiming(1, { duration: 220 });
      return;
    }
    if (mood === 'focus') {
      cancelAnimation(blink);
      blink.value = 1;
      // Start from the far left so the scan covers the full range
      // (left -> center -> right -> center -> left). `reverse = true` glides
      // back smoothly instead of snapping.
      gaze.value = 0;
      gaze.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else {
      cancelAnimation(gaze);
      blink.value = withDelay(
        400,
        withRepeat(
          withSequence(
            withTiming(1, { duration: REST_OPEN_MS }),
            withTiming(0.1, { duration: 90, easing: Easing.in(Easing.quad) }),
            withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        )
      );
    }
    return () => {
      cancelAnimation(gaze);
      cancelAnimation(blink);
    };
  }, [running, mood, gaze, blink]);

  const leftPupilProps = useAnimatedProps(() => ({
    cx: EYE_LX - GAZE_RANGE + 2 * GAZE_RANGE * gaze.value,
  }));
  const rightPupilProps = useAnimatedProps(() => ({
    cx: EYE_RX - GAZE_RANGE + 2 * GAZE_RANGE * gaze.value,
  }));
  const restLeftProps = useAnimatedProps(() => ({ d: arc(EYE_LX, REST_PEAK * blink.value) }));
  const restRightProps = useAnimatedProps(() => ({ d: arc(EYE_RX, REST_PEAK * blink.value) }));

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {mood === 'focus' ? (
        <>
          {/* Round lenses (outline only) */}
          <Circle cx={EYE_LX} cy={EYE_CY} r={12} stroke={color} strokeWidth={3} fill="none" />
          <Circle cx={EYE_RX} cy={EYE_CY} r={12} stroke={color} strokeWidth={3} fill="none" />
          {/* Bridge */}
          <Path d="M45 42 Q50 39 55 42" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" />
          {/* Pupils that scan as if reading */}
          <AnimatedCircle cy={EYE_CY} r={PUPIL_R} fill={color} animatedProps={leftPupilProps} />
          <AnimatedCircle cy={EYE_CY} r={PUPIL_R} fill={color} animatedProps={rightPupilProps} />
          {/* Concentrated mouth — a firm, slightly pressed line. */}
          <Path d="M42 67 Q50 69 58 67" stroke={color} strokeWidth={3.4} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <AnimatedPath
            animatedProps={restLeftProps}
            stroke={color}
            strokeWidth={3.6}
            strokeLinecap="round"
            fill="none"
          />
          <AnimatedPath
            animatedProps={restRightProps}
            stroke={color}
            strokeWidth={3.6}
            strokeLinecap="round"
            fill="none"
          />
          {/* Soft, serene smile. */}
          <Path d="M37 62 Q50 76 63 62" stroke={color} strokeWidth={3.6} strokeLinecap="round" fill="none" />
        </>
      )}
    </Svg>
  );
}
