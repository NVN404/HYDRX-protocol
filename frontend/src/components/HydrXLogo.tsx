'use client';

import React from 'react';

interface HydrXLogoProps {
  size?: number;
  className?: string;
  color?: string; // default to currentColor or #000000
  showWordmark?: boolean;
}

/**
 * HydrX Minimal Modern Vector Logo
 * Pure geometric monochrome design — Zero AI artifacts, precision vector geometry.
 * Fuses the structural dual-pillars of 'H' with the cryptographic precision of 'X'
 * and an optical fluid aperture at the exact center.
 */
export default function HydrXLogo({
  size = 32,
  className = '',
  color = 'currentColor',
  showWordmark = false,
}: HydrXLogoProps) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.round(size * 0.35)}px`,
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      {/* Precision Geometric Monogram */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
      >
        {/* Left Structural Pillar (H-stem) */}
        <rect x="12" y="10" width="8" height="44" rx="4" fill={color} />

        {/* Right Structural Pillar (H-stem) */}
        <rect x="44" y="10" width="8" height="44" rx="4" fill={color} />

        {/* Diagonal 1: Top-Left to Bottom-Right (continuous bridge) */}
        <path
          d="M16 16L48 48"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Diagonal 2: Bottom-Left to Top-Right (with precision negative space gap for woven optical depth) */}
        <path
          d="M16 48L26.5 37.5"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M37.5 26.5L48 16"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Optical center node: precision droplet / focus point */}
        <circle cx="32" cy="32" r="2.8" fill={color} />
      </svg>

      {/* Optional Minimalist Wordmark in Swiss Typography */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span
            style={{
              fontSize: `${Math.max(13, Math.round(size * 0.5))}px`,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: color,
              textTransform: 'none',
            }}
          >
            Hydr<span style={{ fontWeight: 900 }}>X</span>
          </span>
          <span
            style={{
              fontSize: `${Math.max(8, Math.round(size * 0.22))}px`,
              fontWeight: 700,
              letterSpacing: '0.12em',
              opacity: 0.6,
              fontFamily: 'var(--font-mono, monospace)',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            Protocol
          </span>
        </div>
      )}
    </div>
  );
}
