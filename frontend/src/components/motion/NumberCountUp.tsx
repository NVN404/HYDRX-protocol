'use client';

import React, { useEffect, useState, useRef } from 'react';

interface NumberCountUpProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function NumberCountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.2,
  className = '',
  style = {},
}: NumberCountUpProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const startTimestampRef = useRef<number | null>(null);
  const startValRef = useRef<number>(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayValue(value);
      return;
    }

    let animationFrameId: number;
    const startVal = startValRef.current;
    const endVal = value;
    const durationMs = duration * 1000;

    const step = (timestamp: number) => {
      if (!startTimestampRef.current) startTimestampRef.current = timestamp;
      const progress = Math.min((timestamp - startTimestampRef.current) / durationMs, 1);
      
      // Soft liquid cubic-bezier easeOut: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        startValRef.current = endVal;
        startTimestampRef.current = null;
      }
    };

    startTimestampRef.current = null;
    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
      aria-live="polite"
      aria-label={`${prefix}${value.toFixed(decimals)}${suffix}`}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
}
