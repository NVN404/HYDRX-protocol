'use client';

import React from 'react';

interface SolanaLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function SolanaLogo({ size = 28, showWordmark = true, className = '' }: SolanaLogoProps) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.round(size * 0.35)}px`,
        lineHeight: 1,
      }}
    >
      <svg
        width={size}
        height={Math.round(size * 0.783)}
        viewBox="0 0 397 311"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <path
          d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
          fill="url(#solana-grad-1)"
        />
        <path
          d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
          fill="url(#solana-grad-2)"
        />
        <path
          d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
          fill="url(#solana-grad-3)"
        />
        <defs>
          <linearGradient id="solana-grad-1" x1="363.9" y1="311.6" x2="33.1" y2="234.1" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="solana-grad-2" x1="363.9" y1="77.5" x2="33.1" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="solana-grad-3" x1="26.4" y1="193.9" x2="357.2" y2="116.4" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
      </svg>

      {showWordmark && (
        <span
          style={{
            fontSize: `${Math.max(13, Math.round(size * 0.55))}px`,
            fontWeight: 800,
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-mono, monospace)',
            textTransform: 'uppercase',
            color: 'var(--text-1)',
          }}
        >
          Solana
        </span>
      )}
    </div>
  );
}
