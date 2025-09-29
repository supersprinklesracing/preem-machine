'use client';

import { useEffect, useRef, useState } from 'react';

export function AnimatedNumber({ value }: { value: number }) {
  const [currentValue, setCurrentValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    let startTime: number | null = null;
    const duration = 500; // ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const nextValue = Math.floor(
        startValue + (endValue - startValue) * progress,
      );
      setCurrentValue(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(animate);

    return () => {
      prevValueRef.current = value;
    };
  }, [value]);

  return <span>{currentValue.toLocaleString()}</span>;
}
