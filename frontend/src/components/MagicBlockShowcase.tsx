'use client';

import React from 'react';
import { motion } from 'motion/react';
import MagicBlockLogo from './logos/MagicBlockLogo';
import SolanaLogo from './logos/SolanaLogo';
import { PROGRAM_ID, EPHEMERAL_RPC_URL, SOLANA_RPC_URL } from '../lib/solana';

interface MagicBlockShowcaseProps {
  relayerStats?: any;
}

export default function MagicBlockShowcase({ relayerStats }: MagicBlockShowcaseProps) {
  const telemetriesCount = relayerStats?.telemetriesCount ?? 84;
  const baseCommitsCount = relayerStats?.baseCommitsCount ?? 4;
  const avgErLatency = relayerStats?.avgErLatencyMs ?? 24;

  const comparisonRows = [
    {
      feature: 'Telemetry Pulse Latency',
      l1: '400ms – 1,200ms',
      er: 'Sub-50ms (Avg 24ms)',
      highlight: true,
      badge: '95% FASTER',
    },
    {
      feature: 'Gas Fee per IoT Ping',
      l1: '~0.000005 SOL (~$0.001)',
      er: '0 SOL ($0.00 Zero Gas)',
      highlight: true,
      badge: '100% FREE',
    },
    {
      feature: 'Account State Contention',
      l1: 'Global pool PDA write-lock bottleneck',
      er: 'Delegated Resident PDAs (Zero contention)',
      highlight: false,
    },
    {
      feature: 'Cost to run 1,000 Nodes (24h)',
      l1: '~$86.40 / day ($2,592 / month)',
      er: '$0.00 / day (Gasless Rollup Stream)',
      highlight: true,
      badge: 'SAVE $31K/YR',
    },
    {
      feature: 'Finality & Security Layer',
      l1: 'Solana Devnet L1',
      er: 'MagicBlock ER + Solana L1 Settlement',
      highlight: false,
    },
  ];

  return (
    <section
      style={{
        marginBottom: '96px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        position: 'relative',
      }}
    >
      {/* BENCHMARK COMPARISON TABLE: SOLANA L1 vs HYDRX + MAGICBLOCK */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '28px',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="pill font-mono" style={{ color: 'var(--mb-hero-badge-color)', borderColor: 'var(--mb-hero-badge-border)', background: 'var(--mb-hero-badge-bg)' }}>
                DEPIN PERFORMANCE MATRIX
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <MagicBlockLogo size={14} showWordmark={true} />
                <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>×</span>
                <SolanaLogo size={14} showWordmark={true} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', margin: 0 }}>
              Architecture Benchmark: Solana L1 vs MagicBlock ER
            </h3>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono, monospace)' }}>
            RPC: {EPHEMERAL_RPC_URL}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table-clean" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontWeight: 600, fontSize: '0.8rem' }}>METRIC / REQUIREMENT</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontWeight: 600, fontSize: '0.8rem' }}>STANDARD SOLANA L1</th>
                <th style={{ padding: '12px 16px', color: 'var(--mb-hero-badge-color)', fontWeight: 700, fontSize: '0.8rem' }}>HYDRX + MAGICBLOCK ER</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.feature}
                  style={{
                    borderTop: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                  }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-1)', fontSize: '0.88rem' }}>
                    {row.feature}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-3)', fontSize: '0.86rem', fontFamily: 'var(--font-mono, monospace)' }}>
                    {row.l1}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--mb-hero-metric-latency)', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-mono, monospace)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{row.er}</span>
                      {row.badge && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'var(--mb-hero-badge-bg)',
                            color: 'var(--mb-hero-metric-latency)',
                            border: '1px solid var(--mb-hero-badge-border)',
                          }}
                        >
                          {row.badge}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
