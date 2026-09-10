'use client';

import React from 'react';
import { motion } from 'motion/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletGateViewProps {
  tabName?: string;
  onReturnHome?: () => void;
}

export default function WalletGateView({ tabName = 'this section', onReturnHome }: WalletGateViewProps) {
  const formatTabTitle = (name: string) => {
    switch (name.toLowerCase()) {
      case 'dashboard':
        return 'Resident Node Dashboard';
      case 'hardware':
        return 'Hardware Lab & Digital Twin';
      case 'leaderboard':
        return 'Network Conservation Leaderboard';
      case 'donation':
      case 'donations':
      case 'impact':
        return 'Impact & Conservation Rewards';
      default:
        return 'Protected Protocol Service';
    }
  };

  const onboardingSteps = [
    {
      step: '01',
      title: 'Provision Field Node',
      desc: 'Physical ESP32 meter unit (e.g. HYDRX-NODE-101) equipped with YF-S201 pulse sensor and device firmware.',
    },
    {
      step: '02',
      title: 'Connect Solana Wallet',
      desc: 'Authenticate your self-custody Solana wallet (Phantom, Solflare, Backpack) on Solana Devnet.',
    },
    {
      step: '03',
      title: 'Bind & Delegate PDA',
      desc: '1-click protocol registration binds the hardware ID to your wallet and delegates the state to MagicBlock ER.',
    },
    {
      step: '04',
      title: 'Stream & Earn Yield',
      desc: 'Pulses are attested in real-time at sub-50ms latency with zero gas. Conservation preserves yield $HYDRX.',
    },
  ];

  return (
    <div style={{
      maxWidth: '880px',
      margin: '0 auto',
      padding: '48px 16px 80px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      {/* Top Security Pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.28)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
          color: '#f87171',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
        <span>ACCESS RESTRICTED &middot; SOLANA WALLET REQUIRED</span>
      </motion.div>

      {/* Main Locked Message */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        style={{ maxWidth: '680px' }}
      >
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-1)',
          lineHeight: 1.15,
          marginBottom: '14px',
        }}>
          Authenticate to Access {formatTabTitle(tabName)}
        </h1>

        <p style={{
          color: 'var(--text-2)',
          fontSize: '0.96rem',
          lineHeight: 1.6,
          margin: '0 auto',
        }}>
          HydrX operates as an on-chain Decentralized Physical Infrastructure Network (DePIN).
          Live pulse metering, digital twin simulation controls, telemetry ledgers, and token claims
          require cryptographic signature verification through your connected Solana wallet.
        </p>
      </motion.div>

      {/* Wallet Connect Primary Action Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          padding: '24px 32px',
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
        }}
      >
        <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)', letterSpacing: '0.04em' }}>
          CLICK BELOW TO CONNECT DEVNET WALLET
        </span>

        <div style={{ transform: 'scale(1.05)' }}>
          <WalletMultiButton />
        </div>

        {onReturnHome && (
          <button
            onClick={onReturnHome}
            className="btn-mono-ghost"
            style={{
              marginTop: '6px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              color: 'var(--text-3)',
            }}
          >
            &larr; Return to Protocol Overview
          </button>
        )}
      </motion.div>

      {/* Onboarding Guide: How Users & Hardware Connect */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '28px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              HydrX Protocol Onboarding Architecture
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '4px 0 0' }}>
              How IoT hardware devices pair with resident Solana wallets for zero-gas verifiable telemetry.
            </p>
          </div>
          <span className="pill font-mono" style={{ fontSize: '0.68rem' }}>
            ON-CHAIN PROTOCOL
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          {onboardingSteps.map((item) => (
            <div
              key={item.step}
              style={{
                padding: '16px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: '#00f0ff', fontWeight: 700 }}>
                  [{item.step}]
                </span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-3)' }} />
              </div>

              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)' }}>
                {item.title}
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
