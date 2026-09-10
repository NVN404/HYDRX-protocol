'use client';

import React from 'react';

interface MagicBlockLogoProps {
  size?: number; // height in pixels
  showWordmark?: boolean;
  className?: string;
  glow?: boolean;
  variant?: 'auto' | 'dark' | 'light';
}

/**
 * Official MagicBlock Logo
 * Uses the authentic brand asset: the iconic wizard-hat cube character with eyes & star
 * and the custom "MagicBlock" wordmark.
 */
export default function MagicBlockLogo({
  size = 28,
  showWordmark = true,
  className = '',
  glow = false,
  variant = 'auto',
}: MagicBlockLogoProps) {
  if (showWordmark) {
    // Full MagicBlock Logo (Wizard Hat Cube + "MagicBlock" Wordmark)
    // Original aspect ratio is 1024 / 184 ~= 5.565
    const width = Math.round(size * 5.565);
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          lineHeight: 1,
          filter: glow ? 'drop-shadow(0 0 12px rgba(121, 40, 202, 0.45))' : undefined,
        }}
      >
        {variant === 'light' ? (
          <img
            src="/images/magicblock_logo_black.png"
            alt="MagicBlock"
            width={width}
            height={size}
            style={{
              height: `${size}px`,
              width: `${width}px`,
              display: 'block',
              objectFit: 'contain',
            }}
          />
        ) : variant === 'dark' ? (
          <img
            src="/images/magicblock_logo_white.png"
            alt="MagicBlock"
            width={width}
            height={size}
            style={{
              height: `${size}px`,
              width: `${width}px`,
              display: 'block',
              objectFit: 'contain',
            }}
          />
        ) : (
          <>
            <img
              src="/images/magicblock_logo_white.png"
              alt="MagicBlock"
              className="magicblock-logo-dark"
              width={width}
              height={size}
              style={{
                height: `${size}px`,
                width: `${width}px`,
                objectFit: 'contain',
              }}
            />
            <img
              src="/images/magicblock_logo_black.png"
              alt="MagicBlock"
              className="magicblock-logo-light"
              width={width}
              height={size}
              style={{
                height: `${size}px`,
                width: `${width}px`,
                objectFit: 'contain',
              }}
            />
          </>
        )}
      </div>
    );
  }

  // Standalone MagicBlock Character Icon (Wizard Hat Cube with eyes & star)
  // Original aspect ratio is 191 / 176 ~= 1.085
  const width = Math.round(size * 1.085);
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        filter: glow ? 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.5))' : undefined,
      }}
    >
      <img
        src="/images/magicblock_icon.png"
        alt="MagicBlock Icon"
        width={width}
        height={size}
        style={{
          height: `${size}px`,
          width: `${width}px`,
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
