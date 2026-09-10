'use client';

import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function HeroWaveCanvas() {
  const wave1Ref = useRef<SVGPathElement>(null);
  const wave2Ref = useRef<SVGPathElement>(null);
  const wave3Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let anim1: any;
    let anim2: any;
    let anim3: any;

    // Anime.js Line-Art Wave: 2-3 thin stroke paths, no fill, independent slow loops
    if (wave1Ref.current) {
      anim1 = animate(wave1Ref.current, {
        translateX: ['-8%', '0%'],
        scaleY: [1, 1.12],
        duration: 9500,
        alternate: true,
        loop: true,
        ease: 'inOutSine',
      });
    }

    if (wave2Ref.current) {
      anim2 = animate(wave2Ref.current, {
        translateX: ['0%', '-12%'],
        scaleY: [1.08, 0.92],
        duration: 13500,
        alternate: true,
        loop: true,
        ease: 'inOutSine',
      });
    }

    if (wave3Ref.current) {
      anim3 = animate(wave3Ref.current, {
        translateX: ['-4%', '6%'],
        scaleY: [0.96, 1.15],
        duration: 11000,
        alternate: true,
        loop: true,
        ease: 'inOutSine',
      });
    }

    return () => {
      anim1?.pause?.();
      anim2?.pause?.();
      anim3?.pause?.();
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '130%', height: '100%', marginLeft: '-15%' }}
      >
        {/* Line 1: Main Topographic Stroke */}
        <path
          ref={wave1Ref}
          d="M0,220 C320,360 640,110 960,250 C1280,390 1440,170 1600,230"
          stroke="var(--wave-stroke-1)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          fill="none"
        />

        {/* Line 2: Mid Harmonic Contour */}
        <path
          ref={wave2Ref}
          d="M0,310 C360,170 720,410 1080,230 C1260,150 1440,350 1600,310"
          stroke="var(--wave-stroke-2)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Line 3: Deep Resonant Flow */}
        <path
          ref={wave3Ref}
          d="M0,390 C280,290 560,470 840,350 C1120,230 1400,430 1600,390"
          stroke="var(--wave-stroke-3)"
          strokeWidth="1"
          strokeDasharray="2 4"
          fill="none"
        />
      </svg>
    </div>
  );
}
