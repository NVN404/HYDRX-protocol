'use client';

import React from 'react';
import { motion } from 'motion/react';
import NumberCountUp from './NumberCountUp';

interface RadialGaugeProps {
  value: number; // e.g. 18.3
  max: number; // e.g. 200
  size?: number;
  strokeWidth?: number;
}

export default function RadialGauge({
  value,
  max = 200,
  size = 260,
  strokeWidth = 14,
}: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 240-degree open gauge arc
  const arcLength = circumference * 0.75;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const remaining = Math.max(0, max - value);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(135deg)', overflow: 'visible' }}
      >
        {/* Monochrome Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gauge-track)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Monochrome Animated Fill Arc (White on Black, Black on White) */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gauge-fill)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength * (1 - percentage) }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 20,
            delay: 0.1,
          }}
        />
      </svg>

      {/* Centered Hydro Metrics */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginTop: '-12px',
        }}
      >
        <span style={{ fontSize: '0.74rem', color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }} className="font-mono">
          DAILY QUOTA
        </span>

        <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.1, marginTop: '2px' }}>
          <NumberCountUp value={value} decimals={1} suffix="L" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
          <span className="pill" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
            <NumberCountUp value={remaining} decimals={1} prefix="+" suffix="L Remaining" />
          </span>
        </div>
      </div>

      {/* Bottom Range Labels */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          width: '78%',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.74rem',
          color: 'var(--text-4)',
        }}
        className="font-mono"
      >
        <span>0L</span>
        <span>{max}L Baseline</span>
      </div>
    </div>
  );
}
