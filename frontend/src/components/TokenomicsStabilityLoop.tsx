'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Scale, ShieldCheck } from 'lucide-react';
import MagicBlockLogo from './logos/MagicBlockLogo';
import SolanaLogo from './logos/SolanaLogo';

export default function TokenomicsStabilityLoop() {
  const [simVolumeM3, setSimVolumeM3] = useState<number>(10);
  const tokenPegUsd = 1.85;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTION HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="pill font-mono" style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.35)', background: 'rgba(34, 197, 94, 0.08)' }}>
              NOT A MEME COIN
            </span>
            <span className="pill font-mono" style={{ color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.35)', background: 'rgba(0, 242, 254, 0.08)' }}>
              CLOSED-LOOP FLYWHEEL
            </span>
            <span className="pill pill-muted font-mono">
              1:1 COMMODITY PARITY
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.2rem)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: '4px 0' }}>
            The Mint-and-Burn Parity Loop
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', maxWidth: '60ch', margin: 0 }}>
            How $HYDRX locks price stability: conserved water mints tokens, corporates buy and burn them, and liquid USDC flows back to households.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>SETTLED ON:</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '100px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <SolanaLogo size={14} showWordmark={true} />
            <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>+</span>
            <MagicBlockLogo size={14} showWordmark={true} />
          </div>
        </div>
      </div>

      {/* PICTORIAL CIRCULAR FLYWHEEL (SVG CLOSED LOOP) */}
      <div
        className="surface"
        style={{
          borderRadius: '20px',
          padding: '24px 16px',
          border: '1px solid var(--border)',
          background: 'radial-gradient(ellipse at center, rgba(0, 242, 254, 0.05) 0%, rgba(13, 17, 23, 0.9) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <style>{`
          @keyframes spinLoopTrack {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinning-track {
            transform-origin: 350px 350px;
            animation: spinLoopTrack 24s linear infinite;
          }
        `}</style>

        {/* SVG Scalable Circular Flywheel Diagram */}
        <svg
          viewBox="0 0 700 700"
          style={{
            width: '100%',
            maxWidth: '620px',
            height: 'auto',
            display: 'block',
            overflow: 'visible',
          }}
        >
          <defs>
            {/* Arrowhead marker for clockwise directional flow */}
            <marker id="loopArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00F2FE" />
            </marker>
            <marker id="loopArrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e" />
            </marker>
            <marker id="loopArrowOrange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f97316" />
            </marker>
            <marker id="loopArrowPurple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
            </marker>

            {/* Gradients */}
            <linearGradient id="hubRadial" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(0, 242, 254, 0.12)" />
              <stop offset="50%" stopColor="rgba(34, 197, 94, 0.08)" />
              <stop offset="100%" stopColor="rgba(13, 17, 23, 0.95)" />
            </linearGradient>

            <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="33%" stopColor="#22c55e" />
              <stop offset="66%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* BACKGROUND CIRCULAR GUIDE TRACKS */}
          <circle cx="350" cy="350" r="230" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="2" fill="none" />
          <circle cx="350" cy="350" r="230" stroke="rgba(0, 242, 254, 0.18)" strokeWidth="2" strokeDasharray="8 8" fill="none" />

          {/* ANIMATED ROTATING PARTICLES TRACK */}
          <g className="spinning-track">
            <circle cx="350" cy="350" r="230" stroke="url(#orbitGrad)" strokeWidth="3" strokeDasharray="60 180" fill="none" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* 4 DIRECTIONAL CLOCKWISE FLOW ARCS */}
          {/* Arc 1: Top to Right */}
          <path d="M 370 120 A 230 230 0 0 1 580 330" fill="none" stroke="#22c55e" strokeWidth="2.5" markerEnd="url(#loopArrowGreen)" strokeDasharray="5 4" opacity="0.9" />

          {/* Arc 2: Right to Bottom */}
          <path d="M 580 370 A 230 230 0 0 1 370 580" fill="none" stroke="#f97316" strokeWidth="2.5" markerEnd="url(#loopArrowOrange)" strokeDasharray="5 4" opacity="0.9" />

          {/* Arc 3: Bottom to Left */}
          <path d="M 330 580 A 230 230 0 0 1 120 370" fill="none" stroke="#a855f7" strokeWidth="2.5" markerEnd="url(#loopArrowPurple)" strokeDasharray="5 4" opacity="0.9" />

          {/* Arc 4: Left to Top (The Loop Completes!) */}
          <path d="M 120 330 A 230 230 0 0 1 330 120" fill="none" stroke="#00F2FE" strokeWidth="2.5" markerEnd="url(#loopArrow)" strokeDasharray="5 4" opacity="0.9" />

          {/* ===================== CENTER HUB (PARITY ENGINE) ===================== */}
          <circle cx="350" cy="350" r="116" fill="#0d1117" stroke="rgba(0, 242, 254, 0.35)" strokeWidth="2" />
          <circle cx="350" cy="350" r="110" fill="url(#hubRadial)" stroke="rgba(34, 197, 94, 0.25)" strokeWidth="1.5" />

          {/* Top Center Pill: NOT A MEME COIN */}
          <rect x="270" y="272" width="160" height="22" rx="11" fill="rgba(34, 197, 94, 0.15)" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1" />
          <text x="350" y="287" textAnchor="middle" fill="#4ade80" fontSize="10.5" fontFamily="monospace" fontWeight="800" letterSpacing="0.05em">
            NOT A MEME COIN
          </text>

          {/* Center Pegged Value */}
          <text x="350" y="332" textAnchor="middle" fill="#22c55e" fontSize="30" fontFamily="monospace" fontWeight="900" letterSpacing="-0.02em">
            $1.85 USDC
          </text>

          {/* Subtitle */}
          <text x="350" y="354" textAnchor="middle" fill="#f3f4f6" fontSize="12" fontFamily="sans-serif" fontWeight="700">
            1 m³ Conserved = 1 $HYDRX
          </text>

          {/* Status Pill: CLOSED-LOOP PARITY */}
          <rect x="260" y="372" width="180" height="22" rx="11" fill="rgba(0, 242, 254, 0.12)" stroke="rgba(0, 242, 254, 0.3)" strokeWidth="1" />
          <text x="350" y="387" textAnchor="middle" fill="#00F2FE" fontSize="10" fontFamily="monospace" fontWeight="800" letterSpacing="0.06em">
            CLOSED-LOOP STABILITY
          </text>

          <text x="350" y="414" textAnchor="middle" fill="#9ca3af" fontSize="9.5" fontFamily="sans-serif">
            Supply strictly equals demand
          </text>

          {/* ===================== NODE 01: TOP (CONSERVE) ===================== */}
          <g transform="translate(350, 92)">
            <rect x="-135" y="-46" width="270" height="92" rx="14" fill="#131b26" stroke="#38bdf8" strokeWidth="1.8" />
            <circle cx="-102" cy="0" r="18" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.2" />
            {/* Water droplet icon representation */}
            <path d="M -102 -8 C -102 -8 -110 0 -110 5 C -110 9 -106 12 -102 12 C -98 12 -94 9 -94 5 C -94 0 -102 -8 -102 -8 Z" fill="#38bdf8" />
            <text x="-72" y="-18" fill="#38bdf8" fontSize="10.5" fontFamily="monospace" fontWeight="800">
              01 · CONSERVE
            </text>
            <text x="-72" y="4" fill="#ffffff" fontSize="15" fontFamily="sans-serif" fontWeight="800">
              {(simVolumeM3 * 1000).toLocaleString()}L Water Saved
            </text>
            <text x="-72" y="24" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">
              Physical IoT sub-meter flow
            </text>
          </g>

          {/* ===================== NODE 02: RIGHT (MINT) ===================== */}
          <g transform="translate(580, 350)">
            <rect x="-115" y="-46" width="230" height="92" rx="14" fill="#131b26" stroke="#22c55e" strokeWidth="1.8" />
            <circle cx="-84" cy="0" r="18" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="1.2" />
            {/* Coin icon representation */}
            <circle cx="-84" cy="0" r="10" fill="none" stroke="#22c55e" strokeWidth="2" />
            <text x="-84" y="4" textAnchor="middle" fill="#22c55e" fontSize="11" fontFamily="monospace" fontWeight="bold">$</text>
            <text x="-56" y="-18" fill="#22c55e" fontSize="10.5" fontFamily="monospace" fontWeight="800">
              02 · MINT
            </text>
            <text x="-56" y="4" fill="#ffffff" fontSize="15" fontFamily="sans-serif" fontWeight="800">
              +{simVolumeM3} $HYDRX
            </text>
            <text x="-56" y="24" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">
              To resident wallet (0 gas)
            </text>
          </g>

          {/* ===================== NODE 03: BOTTOM (BURN) ===================== */}
          <g transform="translate(350, 608)">
            <rect x="-135" y="-46" width="270" height="92" rx="14" fill="#131b26" stroke="#f97316" strokeWidth="1.8" />
            <circle cx="-102" cy="0" r="18" fill="rgba(249, 115, 22, 0.15)" stroke="#f97316" strokeWidth="1.2" />
            {/* Flame icon representation */}
            <path d="M -102 -8 C -100 -4 -96 -2 -96 3 C -96 7 -99 10 -102 10 C -105 10 -108 7 -108 3 C -108 0 -105 -5 -102 -8 Z" fill="#f97316" />
            <text x="-72" y="-18" fill="#f97316" fontSize="10.5" fontFamily="monospace" fontWeight="800">
              03 · BURN
            </text>
            <text x="-72" y="4" fill="#ffffff" fontSize="15" fontFamily="sans-serif" fontWeight="800">
              Corp Buys &amp; Burns
            </text>
            <text x="-72" y="24" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">
              -${(simVolumeM3 * tokenPegUsd).toFixed(2)} USDC for CSRD
            </text>
          </g>

          {/* ===================== NODE 04: LEFT (CASH OUT) ===================== */}
          <g transform="translate(120, 350)">
            <rect x="-115" y="-46" width="230" height="92" rx="14" fill="#131b26" stroke="#a855f7" strokeWidth="1.8" />
            <circle cx="-84" cy="0" r="18" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="1.2" />
            {/* Wallet icon representation */}
            <rect x="-92" y="-6" width="16" height="12" rx="2" fill="none" stroke="#a855f7" strokeWidth="2" />
            <circle cx="-82" cy="0" r="1.5" fill="#a855f7" />
            <text x="-56" y="-18" fill="#a855f7" fontSize="10.5" fontFamily="monospace" fontWeight="800">
              04 · CASH OUT
            </text>
            <text x="-56" y="4" fill="#ffffff" fontSize="15" fontFamily="sans-serif" fontWeight="800">
              +${(simVolumeM3 * tokenPegUsd).toFixed(2)} USDC
            </text>
            <text x="-56" y="24" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">
              Disbursed to people / bills
            </text>
          </g>

          {/* LOOP CONTINUITY LABELS */}
          <text x="495" y="195" textAnchor="middle" fill="#4ade80" fontSize="10.5" fontFamily="monospace" fontWeight="700">
            Mint Tokens -&gt;
          </text>
          <text x="515" y="515" textAnchor="middle" fill="#fb923c" fontSize="10.5" fontFamily="monospace" fontWeight="700">
            Corporate Buy -&gt;
          </text>
          <text x="205" y="525" textAnchor="middle" fill="#c084fc" fontSize="10.5" fontFamily="monospace" fontWeight="700">
            USDC Cash Out -&gt;
          </text>
          <text x="180" y="195" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontFamily="monospace" fontWeight="700">
            Drives Next Save -&gt;
          </text>
        </svg>

        {/* BOTTOM QUICK PRESET STRIP */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            width: '100%',
            maxWidth: '620px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={14} color="#00F2FE" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }} className="font-mono">
              ADJUST CONSERVED VOLUME:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[5, 10, 25, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => setSimVolumeM3(val)}
                className={simVolumeM3 === val ? 'btn-mono-primary' : 'btn-mono-ghost'}
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
              >
                {val} m³ ({(val * 1000).toLocaleString()}L)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 CORE SUMMARY PILLARS (LEAN & PUNCHY) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        <div className="surface" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }} className="font-mono">
            01 · 100% COMMODITY BACKED
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
            Physical Water, Not Speculative Air
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.45 }}>
            Every token is anchored to 1,000L of potable water saved. Zero pre-mining, zero developer dumps.
          </p>
        </div>

        <div className="surface" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#00F2FE', fontWeight: 700 }} className="font-mono">
            02 · CORPORATE STATUTORY BUY
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
            Mandatory CSRD Inflows
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.45 }}>
            AI data centers legally must retire water credits, continuously depositing USDC into the liquidity pool.
          </p>
        </div>

        <div className="surface" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 700 }} className="font-mono">
            03 · REAL HOUSEHOLD INCOME
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
            Money Disbursed to People
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.45 }}>
            Conserving households sell tokens for cash or utility bill credits, completing the closed economic loop.
          </p>
        </div>
      </div>
    </div>
  );
}
