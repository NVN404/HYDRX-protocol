'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MagicBlockLogo from './logos/MagicBlockLogo';
import SolanaLogo from './logos/SolanaLogo';
import { PROGRAM_ID, getAddressExplorerUrl } from '../lib/solana';

interface VisualizerProps {
  relayerStats?: any;
}

export default function SolanaMagicBlockVisualizer({ relayerStats }: VisualizerProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<{
    stage: string;
    latency: number;
    gas: string;
    txHash: string;
    savedLiters: number;
  } | null>(null);

  const telemetriesCount = relayerStats?.telemetriesCount ?? 84;
  const baseCommitsCount = relayerStats?.baseCommitsCount ?? 4;
  const avgErLatency = relayerStats?.avgErLatencyMs ?? 24;

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    // Stage 1: Edge sensor pulse
    setActiveStep(1);
    setTimeout(() => {
      // Stage 2: MagicBlock ER execution
      setActiveStep(2);
      setTimeout(() => {
        // Stage 3: Solana L1 checkpoint commit
        setActiveStep(3);
        const randomHash = Array.from({ length: 12 }, () =>
          '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join('');
        setSimulationLog({
          stage: 'Settled to Solana L1 & Delegated in MagicBlock ER',
          latency: Math.floor(Math.random() * 12) + 18,
          gas: '0 SOL ($0.00)',
          txHash: `5K${randomHash}...`,
          savedLiters: 1.45,
        });
        setIsSimulating(false);
      }, 750);
    }, 550);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'var(--mb-hero-bg)',
        border: '1px solid var(--mb-hero-border)',
        borderRadius: '24px',
        padding: '32px 28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--mb-hero-shadow)',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--mb-hero-glow-1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '15%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--mb-hero-glow-2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Badges & Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                fontFamily: 'var(--font-mono, monospace)',
                textTransform: 'uppercase',
                color: 'var(--mb-hero-badge-color)',
                background: 'var(--mb-hero-badge-bg)',
                border: '1px solid var(--mb-hero-badge-border)',
                padding: '4px 12px',
                borderRadius: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--mb-hero-badge-color)',
                  boxShadow: '0 0 8px var(--mb-hero-badge-color)',
                }}
              />
              POWERED BY SOLANA + MAGICBLOCKZ
            </span>
            <span className="pill font-mono" style={{ borderColor: 'rgba(0, 255, 163, 0.4)', color: '#00FFA3', fontSize: '0.7rem' }}>
              ER VALIDATOR ACTIVE
            </span>
            <span className="pill font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-2)', fontSize: '0.7rem' }}>
              DEVNET L1 SETTLEMENT
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--mb-hero-pill-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--mb-hero-pill-border)',
              padding: '6px 16px',
              borderRadius: '100px',
            }}
          >
            <MagicBlockLogo size={20} showWordmark={true} />
            <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>×</span>
            <SolanaLogo size={20} showWordmark={true} />
          </div>
        </div>

        {/* Title + Simulation CTA in one row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: 0 }}>
              The Real-Time Engine Powering Water DePIN
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', marginTop: '6px', marginBottom: 0, maxWidth: '64ch' }}>
              Sub-second IoT pulses process gas-free on Ephemeral Rollups at ~24ms turnaround, periodically committed to Solana L1.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="btn-mono-primary"
            style={{
              background: 'linear-gradient(90deg, #00F2FE 0%, #7928CA 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isSimulating ? 'wait' : 'pointer',
              boxShadow: '0 4px 18px rgba(0, 242, 254, 0.25)',
            }}
          >
            <span>{isSimulating ? 'Transmitting Pulse...' : 'Simulate Real-Time Telemetry'}</span>
          </motion.button>
        </div>

        {/* 4 Live Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--mb-hero-divider)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--mb-hero-label)', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
              ER Turnaround Latency
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--mb-hero-metric-latency)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              ~{avgErLatency}ms <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>SUB-50ms</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--mb-hero-label)', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
              Cost per Telemetry Ping
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--mb-hero-metric-gas)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              0 SOL <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>GASLESS</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--mb-hero-label)', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
              Active Ephemeral Pings
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--mb-hero-metric-pings)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              {telemetriesCount} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>PULSES</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--mb-hero-label)', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
              Solana Base Layer Commits
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--mb-hero-metric-commits)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              {baseCommitsCount} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>CHECKPOINTS</span>
            </div>
          </div>
        </div>

        {/* 3-Stage Pipeline Visualizer Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {/* Stage 1: Edge Hardware */}
          <motion.div
            onClick={() => setActiveStep(1)}
            animate={{
              borderColor: activeStep === 1 ? '#00F2FE' : 'var(--border)',
              backgroundColor: activeStep === 1 ? 'rgba(0, 242, 254, 0.05)' : 'var(--surface)',
            }}
            whileHover={{ y: -2 }}
            style={{
              padding: '18px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#00F2FE', fontWeight: 700 }}>
                STAGE 01 · EDGE SENSING
              </span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem' }}>ESP32 + YF-S201</span>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
                Off-Chain Pulse Capture
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                Water flow generates 450 Hall-effect pulses per liter. Edge node signs tamper-proof telemetry hash.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '6px' }}>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>450 Pulses/L</span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Hardware Encrypted</span>
            </div>
          </motion.div>

          {/* Stage 2: MagicBlock Ephemeral Rollup (ER) */}
          <motion.div
            onClick={() => setActiveStep(2)}
            animate={{
              borderColor: activeStep === 2 ? '#7928CA' : 'rgba(121, 40, 202, 0.4)',
              backgroundColor: activeStep === 2 ? 'rgba(121, 40, 202, 0.1)' : 'var(--surface)',
            }}
            whileHover={{ y: -2 }}
            style={{
              padding: '18px',
              borderRadius: '14px',
              border: '2px solid rgba(121, 40, 202, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: activeStep === 2 ? '0 0 20px rgba(121, 40, 202, 0.25)' : 'none',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MagicBlockLogo size={15} showWordmark={false} />
                <span className="font-mono" style={{ fontSize: '0.72rem', color: '#00F2FE', fontWeight: 800 }}>
                  STAGE 02 · MAGICBLOCK ER
                </span>
              </div>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', color: '#00FFA3', borderColor: 'rgba(0, 255, 163, 0.3)' }}>
                ~{avgErLatency}ms ZERO GAS
              </span>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
                Gasless Ephemeral Execution
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                Delegated resident PDAs ingest pulses concurrently without account write-lock bottlenecks.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '6px' }}>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', color: '#00FFA3', borderColor: 'rgba(0, 255, 163, 0.3)' }}>Avg {avgErLatency}ms Latency</span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.3)' }}>0 SOL Fee</span>
            </div>
          </motion.div>

          {/* Stage 3: Solana Base Layer (L1) */}
          <motion.div
            onClick={() => setActiveStep(3)}
            animate={{
              borderColor: activeStep === 3 ? '#00FFA3' : 'var(--border)',
              backgroundColor: activeStep === 3 ? 'rgba(0, 255, 163, 0.05)' : 'var(--surface)',
            }}
            whileHover={{ y: -2 }}
            style={{
              padding: '18px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SolanaLogo size={14} showWordmark={false} />
                <span className="font-mono" style={{ fontSize: '0.72rem', color: '#00FFA3', fontWeight: 800 }}>
                  STAGE 03 · SOLANA L1
                </span>
              </div>
              <span className="pill font-mono" style={{ fontSize: '0.65rem' }}>FINAL SETTLEMENT</span>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
                $HYDRX Minting & Audit
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                Conserved delta state commits to Solana Base Layer, minting SPL tokens and updating WBC records.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '6px' }}>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>SPL Token</span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Sealevel Consensus</span>
            </div>
          </motion.div>
        </div>

        {/* Live Simulation Output Box */}
        <AnimatePresence>
          {simulationLog && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(0, 242, 254, 0.06)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FFA3', boxShadow: '0 0 10px #00FFA3', display: 'inline-block' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00FFA3' }}>
                    Telemetry Pulse Stream Confirmed Off-Chain
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono, monospace)' }}>
                    Processed via MagicBlock ER in {simulationLog.latency}ms · Gas: {simulationLog.gas} · Seed: {simulationLog.txHash}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pill font-mono" style={{ color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.4)', fontSize: '0.72rem' }}>
                  +0.00145 $HYDRX
                </span>
                <a
                  href={getAddressExplorerUrl(PROGRAM_ID.toBase58())}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-1)',
                    textDecoration: 'underline',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  Anchor Program ↗
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Links Footer Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-3)' }}>Network Partners:</span>
            <a
              href="https://docs.magicblock.gg/"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-1)', textDecoration: 'none' }}
            >
              <MagicBlockLogo size={14} showWordmark={true} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Docs ↗</span>
            </a>
            <span style={{ color: 'var(--text-4)' }}>•</span>
            <a
              href="https://solana.com"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-1)', textDecoration: 'none' }}
            >
              <SolanaLogo size={14} showWordmark={true} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Devnet ↗</span>
            </a>
          </div>

          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.74rem', color: 'var(--text-3)' }}>
            Program ID: <span style={{ color: '#00F2FE' }}>{PROGRAM_ID.toBase58().slice(0, 6)}...{PROGRAM_ID.toBase58().slice(-6)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
