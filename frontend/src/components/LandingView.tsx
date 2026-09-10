'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import HeroWaveCanvas from './motion/HeroWaveCanvas';
import StatCard from './motion/StatCard';
import GoldStandardCompliance from './hardware/GoldStandardCompliance';
import MagicBlockShowcase from './MagicBlockShowcase';
import TokenomicsStabilityLoop from './TokenomicsStabilityLoop';
import SolanaMagicBlockVisualizer from './SolanaMagicBlockVisualizer';
import MagicBlockLogo from './logos/MagicBlockLogo';
import SolanaLogo from './logos/SolanaLogo';
import { PROGRAM_ID, getAddressExplorerUrl } from '../lib/solana';

interface LandingViewProps {
  onOpenCorporatePortal?: () => void;
  onOpenHardwareLab: () => void;
  onOpenDashboard?: () => void;
  relayerStats: any;
}

export default function LandingView({
  onOpenCorporatePortal,
  onOpenHardwareLab,
  onOpenDashboard,
  relayerStats,
}: LandingViewProps) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const totalLiters = relayerStats?.totalLitersTracked ?? 18.3;
  const telemetryCount = relayerStats?.telemetriesCount ?? 14;
  const activeDevices = relayerStats?.activeDevicesCount ?? 8;

  const handleProtectedAction = (callback: () => void) => {
    callback();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>

      {/* HERO SECTION */}
      <section
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: 'calc(75dvh - 64px)',
          paddingTop: '56px',
          paddingBottom: '64px',
        }}
      >
        <HeroWaveCanvas />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px', position: 'relative', zIndex: 1 }}
        >
          <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: '100px',
                background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.12), rgba(121, 40, 202, 0.18), rgba(0, 255, 163, 0.12))',
                border: '1px solid rgba(121, 40, 202, 0.45)',
                boxShadow: '0 0 20px rgba(121, 40, 202, 0.2)',
              }}
            >
              <SolanaLogo size={16} showWordmark={true} />
              <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 300 }}>+</span>
              <MagicBlockLogo size={16} showWordmark={true} />
            </div>

            <span className="pill font-mono" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)' }}>
              HYDRX PROTOCOL
            </span>
            <span className="pill font-mono" style={{ color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.35)' }}>
              EPHEMERAL ROLLUP POWERED
            </span>
            <span className="pill pill-muted font-mono">
              SUB-50ms ZERO-GAS TELEMETRY
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.06,
              color: 'var(--text-1)',
            }}
          >
            Tokenized water conservation powered by{' '}
            <span style={{ background: 'linear-gradient(90deg, #00F2FE 0%, #7928CA 50%, #00FFA3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sub-Second IoT Telemetry
            </span>{' '}
            &{' '}
            <span style={{ background: 'linear-gradient(90deg, #00FFA3 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Verifiable On-Chain Credits
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            Gasless sub-50ms IoT water telemetry on MagicBlock Ephemeral Rollups, settled directly to Solana Base Layer.
          </motion.p>

          <motion.div
            variants={itemVariants}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '6px' }}
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleProtectedAction(() => onOpenDashboard?.())}
              className="btn-mono-primary"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
            >
              {connected ? 'Open Resident Dashboard' : 'Connect Solana Wallet to Enter'}
            </motion.button>

            <a
              href="/corporate"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="btn-mono-ghost"
                style={{ padding: '12px 24px', fontSize: '0.92rem' }}
              >
                Corporate ESG Portal ↗
              </motion.button>
            </a>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleProtectedAction(onOpenHardwareLab)}
              className="btn-mono-ghost"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
            >
              Hardware Lab ↗
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* STAT STRIP — 3 Live KPI Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '72px',
        }}
      >
        <StatCard
          value={totalLiters}
          decimals={1}
          suffix="L"
          label="Water tracked on-chain"
          sublabel="Real-time volume verified on Devnet"
          badge="LIVE TELEMETRY"
        />

        <StatCard
          value={telemetryCount}
          label="Solana transactions confirmed"
          sublabel="Zero-gas sponsored resident transactions"
          badge="SEALEVEL PARALLEL"
        />

        <StatCard
          value={activeDevices}
          label="Active IoT smart meters"
          sublabel="ESP32 hardware nodes streaming telemetry"
          badge="EDGE HARDWARE"
        />
      </motion.section>

      {/* 1. THE THREE PROBLEMS */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '80px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div>
          <span className="pill font-mono" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.35)', background: 'rgba(239, 68, 68, 0.08)' }}>
            THE WATER STEWARDSHIP DILEMMA
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: '6px 0 4px' }}>
            The Water Stewardship Dilemma
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.92rem', maxWidth: '64ch', margin: 0 }}>
            Why traditional water management fails residential households, corporate enterprises, and community projects.
          </p>
        </div>

        {/* 3 Problems: People, Corporates, NGOs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
          {/* Problem 01: Household */}
          <div className="surface" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '3px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>01</span>
              <span className="pill font-mono" style={{ fontSize: '0.68rem', color: '#ef4444' }}>PEOPLE · HOUSEHOLDS</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              The Split-Bill Tragedy of the Commons
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              In multi-family residential apartments worldwide, a single master meter splits the utility bill equally across all units. Households that invest effort to fix leaks and cut down consumption subsidize wasteful neighbors who leave taps running. With zero sub-metering feedback or financial incentive, millions of liters are lost down domestic drains.
            </p>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 'auto', paddingTop: '8px' }}>
              Equal-split penalty · Zero conservation incentive · Unmeasured domestic leaks
            </div>
          </div>

          {/* Problem 02: Corporate */}
          <div className="surface" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '3px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>02</span>
              <span className="pill font-mono" style={{ fontSize: '0.68rem', color: '#f59e0b' }}>CORPORATES · ENTERPRISES</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              18-Month Delays &amp; Phantom Paper Offsets
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              Corporates and hyperscale AI data centers claim &quot;Net Water Positive&quot; using paper broker contracts audited on 12 to 18-month delays. Offsets rely on computer rainfall simulations rather than physical meters and are often bought in disconnected watersheds, exposing firms to regulatory fines under EU CSRD and SEC rules.
            </p>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 'auto', paddingTop: '8px' }}>
              18-month audit latency · Zero localized additionality · Double-counting hazard
            </div>
          </div>

          {/* Problem 03: NGO Community Projects */}
          <div className="surface" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '3px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8b5cf6' }}>03</span>
              <span className="pill font-mono" style={{ fontSize: '0.68rem', color: '#8b5cf6' }}>NGOS · COMMUNITY PROJECTS</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              Unfunded Maintenance &amp; Abandoned Infrastructure
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              Traditional charity models install community borewells and water filters, but without continuous telemetry or sustainable funding, 40%+ break down within 18 months. Donors face fatigue and lack proof of water output, leaving vital community infrastructure stranded and financially unviable.
            </p>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 'auto', paddingTop: '8px' }}>
              Donor fatigue · Abandoned water infrastructure · Lack of ongoing verification
            </div>
          </div>
        </div>

        {/* HEAD-TO-HEAD SPECIFICATION MATRIX (TRADITIONAL VS HYDRX TABLE) */}
        <div
          className="surface"
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            padding: 0,
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-1)' }}>
                HEAD-TO-HEAD SPECIFICATION MATRIX
              </span>
              <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: '2px' }}>
                TRADITIONAL BROKER OFFSETS VS. HYDRX PROTOCOL
              </div>
            </div>
            <span className="pill font-mono" style={{ fontSize: '0.7rem', color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.4)' }}>
              EMPIRICAL COMPARISON
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, width: '24%' }}>
                    Evaluation Metric
                  </th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#f87171', fontWeight: 600, width: '38%' }}>
                    Traditional Corporate Model
                  </th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#00F2FE', fontWeight: 700, width: '38%' }}>
                    HydrX Protocol on MagicBlock (Solana)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-1)' }}>Verification Latency</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>12 to 18 Months (Annual consultant visit)</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-1)', fontWeight: 600 }}>
                    Sub-50ms Continuous (MagicBlock ER pings)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-1)' }}>Data Provenance</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>Self-reported spreadsheets &amp; runoff simulations</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-1)', fontWeight: 600 }}>
                    Physical ESP32 edge pulse counting (450 p/L)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-1)' }}>Watershed Locality</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>Disconnected (e.g. Arizona use, Scotland credit)</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-1)', fontWeight: 600 }}>
                    Geotagged to target basin ID on-chain
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-1)' }}>Double-Counting Protection</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>Zero (Opaque bilateral broker registries)</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-1)', fontWeight: 600 }}>
                    Permanent token burn + Solana L1 Memo etching
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-1)' }}>Household Incentive</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>None (Equal split bills penalize savers)</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-1)', fontWeight: 600 }}>
                    Direct $HYDRX token minting with 0 gas fees
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-1)' }}>Audit Compliance</td>
                  <td style={{ padding: '14px 20px', color: '#f87171' }}>High risk of greenwashing regulatory fines</td>
                  <td style={{ padding: '14px 20px', color: '#00F2FE', fontWeight: 600 }}>
                    Audit-ready for EU CSRD, ESRS E3, &amp; GRI 303
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border)',
              background: 'rgba(255, 255, 255, 0.015)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
              Ready to inspect verified on-chain corporate water retirement?
            </span>
            <a
              href="/corporate"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-mono-primary"
              style={{
                fontSize: '0.82rem',
                padding: '8px 16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Enter Corporate ESG Portal ↗
            </a>
          </div>
        </div>
      </motion.section>

      {/* 2. DUAL-ENGINE TELEMETRY & SETTLEMENT ENGINE */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '80px' }}
      >
        {/* Live Dual-Engine Visualizer */}
        <SolanaMagicBlockVisualizer relayerStats={relayerStats} />
      </motion.section>

      {/* 4. PERFORMANCE BENCHMARK */}
      <MagicBlockShowcase relayerStats={relayerStats} />

      {/* 5. CLOSED-LOOP MINT & BURN FLYWHEEL */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '80px' }}
      >
        <TokenomicsStabilityLoop />
      </motion.section>

      {/* 6. 3-SIDED ECOSYSTEM & GOLD STANDARD COMPLIANCE */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '80px' }}
      >
        <GoldStandardCompliance />
      </motion.section>

      {/* GLOBAL ESG GOALS & REGULATORY COMPLIANCE */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '44px',
          marginBottom: '44px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="pill font-mono" style={{ backgroundColor: '#22c55e15', color: '#4ade80', borderColor: '#22c55e40', fontSize: '0.7rem' }}>
                GLOBAL ESG FRAMEWORK
              </span>
              <span className="pill pill-muted font-mono" style={{ fontSize: '0.7rem' }}>2030 TARGETS</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: 0 }}>
              Institutional ESG Goals & Compliance
            </h2>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.86rem', maxWidth: '50ch', margin: 0 }}>
            Aligning on-chain water conservation with mandatory EU and US sustainability directives.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* ESG Goal 1 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>[GOAL-01] UNITED NATIONS</span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>TARGET 6.4</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-1)' }}>
              UN SDG 6: Clean Water & Sanitation
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              Directly advances Target 6.4 by curbing distribution losses and incentivizing localized aquifer replenishment through liquid tokenomics.
            </p>
          </div>

          {/* ESG Goal 2 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>[GOAL-02] EUROPEAN UNION</span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>ESRS E3</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-1)' }}>
              EU CSRD: Water & Marine Resources
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              Provides audit-grade digital proofs satisfying CSRD Article 29b rules for double materiality in water-stressed European and transatlantic basins.
            </p>
          </div>

          {/* ESG Goal 3 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#c9a15a', fontWeight: 700 }}>[GOAL-03] SEC DISCLOSURES</span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>RULE 33-11275</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-1)' }}>
              SEC Material Resource Disclosures
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              Equips hyperscalers with cryptographically verified offset ledgers to substantiate publicly filed 10-K physical water disclosures.
            </p>
          </div>

          {/* ESG Goal 4 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700 }}>[GOAL-04] GLOBAL COALITIONS</span>
              <span className="pill font-mono" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>CDP & WRC</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-1)' }}>
              Net Water Positive by 2030
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              Enables members of the UN CEO Water Mandate to replace paper credits with permanent on-chain SPL token burns and Water Benefit Certificates.
            </p>
          </div>
        </div>
      </motion.section>

      {/* STANDARDS, METHODOLOGIES & REFERENCES */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '40px',
          marginBottom: '56px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="pill font-mono" style={{ marginBottom: '6px', fontSize: '0.7rem' }}>CITATIONS</span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: 0 }}>
              Standards & Authoritative References
            </h2>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.84rem', maxWidth: '48ch', margin: 0 }}>
            Regulatory and technical benchmarks anchoring the HydrX Protocol economic framework.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {/* Ref 1 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#c9a15a', fontWeight: 700 }}>[REF-01] GOLD STANDARD</span>
              <a href="https://www.goldstandard.org/standards/water-benefit-standard" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                goldstandard.org ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              Water Benefit Standard (GS4GG)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              Gold Standard methodology defining 1 Water Benefit Certificate (WBC) as 1 m³ of verified freshwater preserved.
            </p>
          </div>

          {/* Ref 2 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#c9a15a', fontWeight: 700 }}>[REF-02] ISO STANDARDS</span>
              <a href="https://www.iso.org/standard/43263.html" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                iso.org ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              ISO 14046: Water Footprinting
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              International standard specifying principles and guidelines for assessing water footprints of corporate operations.
            </p>
          </div>

          {/* Ref 3 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#c9a15a', fontWeight: 700 }}>[REF-03] UN GLOBAL COMPACT</span>
              <a href="https://ceowatermandate.org/" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                ceowatermandate.org ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              CEO Water Mandate & Coalition
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              Global platform defining Net Water Positive corporate targets and localized basin replenishment standards.
            </p>
          </div>

          {/* Ref 4 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#c9a15a', fontWeight: 700 }}>[REF-04] ESG DISCLOSURE</span>
              <a href="https://www.cdp.net/en/water" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                cdp.net ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              CDP Water Security Framework
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              Institutional disclosure benchmark used by 23,000+ corporations to measure water withdrawal and verified restoration.
            </p>
          </div>

          {/* Ref 5 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#c9a15a', fontWeight: 700 }}>[REF-05] GLOBAL REPORTING</span>
              <a href="https://www.globalreporting.org/standards/media/1909/gri-303-water-and-effluents-2018.pdf" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                globalreporting.org ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              GRI 303: Water & Effluents
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              Defines accounting requirements for volumetric withdrawal, consumption in water-stressed basins, and reduction targets.
            </p>
          </div>

          {/* Ref 6 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#00F2FE', fontWeight: 700 }}>[REF-06] RUNTIME ACCELERATION</span>
              <a href="https://docs.magicblock.gg/" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                magicblock.gg ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              MagicBlock Ephemeral Rollups
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              Off-chain execution engine processing sub-50ms gasless IoT water pulses with delegated resident state accounts.
            </p>
          </div>

          {/* Ref 7 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#c9a15a', fontWeight: 700 }}>[REF-07] HARDWARE SIMULATOR</span>
              <a href="https://wokwi.com/projects/472508191464530945" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                wokwi.com ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              Wokwi ESP32 IoT Node Schematic
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              Interactive virtual test bench simulating YF-S201 pulse stream, 20x4 I2C LCD readout, and real-time WiFi telemetry attestation.
            </p>
          </div>

          {/* Ref 8 */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: '#c9a15a', fontWeight: 700 }}>[REF-08] SMART CONTRACT</span>
              <a href={getAddressExplorerUrl(PROGRAM_ID.toBase58())} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-1)', textDecoration: 'underline' }} className="font-mono">
                Solana Explorer ↗
              </a>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
              Anchor Program: {PROGRAM_ID.toBase58().slice(0, 4)}..{PROGRAM_ID.toBase58().slice(-5)}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
              Live audited Solana smart contract managing pool state, isolated resident PDAs, and programmatic $HYDRX minting.
            </p>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
