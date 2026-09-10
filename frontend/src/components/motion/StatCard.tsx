'use client';

import React from 'react';
import { motion } from 'motion/react';
import NumberCountUp from './NumberCountUp';

interface StatCardProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

export default function StatCard({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  label,
  sublabel,
  badge,
}: StatCardProps) {
  return (
    <motion.div
      className="surface"
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {badge && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <span className="pill font-mono">
            {badge}
          </span>
        </div>
      )}

      <div>
        <div
          className="font-mono"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-1)',
            letterSpacing: '-0.03em',
            marginBottom: '4px',
          }}
        >
          <NumberCountUp value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
        </div>

        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)' }}>
          {label}
        </div>
      </div>

      {sublabel && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '8px', lineHeight: 1.45 }}>
          {sublabel}
        </div>
      )}
    </motion.div>
  );
}
