'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { animate } from 'animejs';
import HydrXLogo from './HydrXLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light' | 'aqua';
  onToggleTheme: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const { publicKey, connected } = useWallet();
  const pulseDotRef = useRef<HTMLSpanElement>(null);

  // Dynamic glass effect on scroll via Motion useScroll
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0.8, 0.96]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0.08, 0.2]);

  // Anime.js infinite pulse dot loop in white/gray
  useEffect(() => {
    if (!pulseDotRef.current || !connected) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const anim = animate(pulseDotRef.current, {
      opacity: [1, 0.25, 1],
      scale: [1, 1.25, 1],
      duration: 2000,
      loop: true,
      ease: 'inOutSine',
    });

    return () => {
      anim?.pause?.();
    };
  }, [connected]);

  // Navigation tabs for residents & community (accessible for live exploration)
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'donation', label: 'Impact & Rewards' },
    { id: 'faq', label: 'FAQ' },
    { id: 'hardware', label: 'Hardware Lab' },
  ];

  const visibleNavItems = allNavItems;

  return (
    <motion.header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        backgroundColor: 'var(--canvas)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Brand Logo & Co-Brand Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <button
          onClick={() => setActiveTab('landing')}
          title="Overview · Return to Home"
          aria-label="Overview · Return to Home"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: 0,
            color: 'var(--text-1)',
            flexShrink: 0,
          }}
        >
          <HydrXLogo size={30} color="var(--text-1)" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
              HydrX Protocol
            </span>
            <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--text-3)', letterSpacing: '0.04em' }}>
              WATER DEPIN NETWORK
            </span>
          </div>
        </button>
      </div>

      {/* Nav Pills with Motion Shared-Element Underline (layoutId) */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          position: 'relative',
        }}
      >
        {visibleNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                padding: '8px 16px',
                color: isActive ? 'var(--text-1)' : 'var(--text-3)',
                fontSize: '0.86rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '16px',
                    right: '16px',
                    height: '2px',
                    background: 'var(--text-1)',
                    borderRadius: '2px',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions: Theme Toggle + Wallet Chip */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Dark / Light Mode Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleTheme}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-button)',
            padding: '8px 12px',
            color: 'var(--text-1)',
            cursor: 'pointer',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
          }}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' && 'Dark'}
          {theme === 'light' && 'Light'}
          {theme === 'aqua' && 'Aqua'}
        </motion.button>

        {/* Wallet Chip & Status Pulse in White/Gray */}
        {connected && publicKey && (
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="pill font-mono"
            style={{
              cursor: 'default',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              ref={pulseDotRef}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--pulse-dot)',
                display: 'inline-block',
              }}
            />
            <span>{publicKey.toBase58().slice(0, 4)}..{publicKey.toBase58().slice(-4)}</span>
          </motion.div>
        )}

        <WalletMultiButton />
      </div>
    </motion.header>
  );
}
