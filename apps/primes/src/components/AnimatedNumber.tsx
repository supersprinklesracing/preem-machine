'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A custom hook to animate a numeric value smoothly using easeOutQuad.
 * Properly handles cancelAnimationFrame on unmount and value transitions to prevent memory leaks.
 */
export function useAnimatedValue(targetValue: number, duration = 500) {
  const [currentValue, setCurrentValue] = useState(0);
  const prevValueRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = targetValue;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutQuad
      const easeProgress = progress * (2 - progress);

      const nextValue = Math.floor(
        startValue + (endValue - startValue) * easeProgress,
      );
      setCurrentValue(nextValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
        animationFrameRef.current = null;
      }
    };

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      prevValueRef.current = targetValue;
    };
  }, [targetValue, duration]);

  return currentValue;
}

export function AnimatedNumber({ value }: { value: number }) {
  const animatedValue = useAnimatedValue(value);
  return <span>{animatedValue.toLocaleString()}</span>;
}
