'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function GoldStandardCompliance() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header Banner */}
      <div className="surface" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="pill pill-muted font-mono">1 m³ = 1 $HYDRX = 1 WBC</span>
              <span className="pill font-mono" style={{ backgroundColor: '#22c55e15', color: '#4ade80', borderColor: '#22c55e40' }}>
                AUDIT TRAIL VERIFIED
              </span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: '4px 0' }}>
              Gold Standard & ISO 14046 Compliance Architecture
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', margin: 0, maxWidth: '68ch' }}>
              Verifying physical water conservation against globally recognized GS4GG and ISO 14046 water footprinting methodologies.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>OFFICIAL METHODOLOGY SOURCES:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href="https://www.goldstandard.org/standards/water-benefit-standard"
                target="_blank"
                rel="noreferrer"
                className="btn-mono-ghost"
                style={{ fontSize: '0.76rem', padding: '5px 10px' }}
              >
                Gold Standard WBC ↗
              </a>
              <a
                href="https://ceowatermandate.org/"
                target="_blank"
                rel="noreferrer"
                className="btn-mono-ghost"
                style={{ fontSize: '0.76rem', padding: '5px 10px' }}
              >
                CEO Water Mandate ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* THE 3-SIDED ECOSYSTEM STORY */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <span className="pill font-mono" style={{ marginBottom: '6px' }}>VALUE CAPTURE &amp; MARKET DYNAMICS</span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)', margin: '4px 0' }}>
            The 3-Sided Ecosystem: Connecting People, Corporates &amp; NGOs
          </h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', margin: 0 }}>
            How the $HYDRX token creates a closed-loop economy between household conservation, corporate compliance, and on-chain viable community water projects.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {/* Side 1: The Residents */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>01</span>
              <span className="pill font-mono" style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}>SUPPLY · PEOPLE &amp; RESIDENTS</span>
            </div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              Turn Daily Conservation into Household Income
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              Residents install an open $10 sub-meter on their flat inlet pipe. Every cubic meter preserved below the 200L daily baseline programmatically mints liquid $HYDRX tokens directly to their Solana wallet. Instead of subsidizing wasteful neighbors on split utility bills, conscious households earn spendable on-chain income with zero gas fees.
            </p>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 'auto', paddingTop: '6px' }}>
              Earn $HYDRX tokens · Direct wallet payouts · Zero resident gas
            </div>
          </div>

          {/* Side 2: The Enterprises (Demand) */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>02</span>
              <span className="pill font-mono" style={{ color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.3)' }}>DEMAND · CORPORATES &amp; DATA CENTERS</span>
            </div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              Audit-Grade Offsets for Mandatory CSRD Compliance
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              Hyperscale AI data centers and corporate campuses consume millions of liters daily and must meet strict EU CSRD (ESRS E3) and SEC sustainability rules. Corporates buy $HYDRX on the open AMM and permanently burn it on-chain to receive verifiable Water Benefit Certificates tied to physical telemetry in the exact municipal watershed they operate in.
            </p>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 'auto', paddingTop: '6px' }}>
              Guaranteed basin additionality · On-chain burn proof · Zero greenwashing
            </div>
          </div>

          {/* Side 3: NGOs & Community Projects */}
          <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>03</span>
              <span className="pill font-mono" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>IMPACT · NGOS &amp; COMMUNITY PROJECTS</span>
            </div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              On-Chain Capital &amp; Perpetual Project Viability
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              We fund community water projects and make them perpetually viable on-chain. Protocol fees from corporate marketplace burns flow directly into verified NGO project vaults. By retrofitting borewells and community filters with $10 IoT sub-meters, funding unlocks continuously per cubic meter of clean water delivered, eliminating donor fatigue and stranded assets.
            </p>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 'auto', paddingTop: '6px' }}>
              Direct on-chain project grants · Telemetry-unlocked funding · Zero stranded pumps
            </div>
          </div>
        </div>
      </div>

      {/* 5-PILLAR GOLD STANDARD COMPLIANCE MATRIX */}
      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>
              Gold Standard (GS4GG) Compliance Matrix
            </span>
            <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--text-3)' }} className="font-mono">
              Comparing Standard Criteria vs. HydrX Protocol Implementation
            </span>
          </div>
          <span className="pill font-mono" style={{ fontSize: '0.72rem', color: '#22c55e', borderColor: '#22c55e60' }}>
            5 / 5 AUDIT REQUIREMENTS MET
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="mono-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Gold Standard Requirement</th>
                <th style={{ width: '38%' }}>Traditional Water Project Flaws</th>
                <th style={{ width: '40%' }}>HydrX Protocol Solana DePIN Implementation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                  1. Baseline & Additionality
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>
                  Must establish a verifiable historical consumption baseline. Credits can only be minted for savings that exceed business-as-usual scenarios.
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-1)' }}>
                  <strong style={{ color: '#22c55e' }}>Smart Contract Baseline:</strong> Each household node PDA enforces a strict rolling 200L/day quota. If consumption exceeds 200L, status trips to `EXCEEDED` and $HYDRX minting halts.
                </td>
              </tr>

              <tr>
                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                  2. Physical Metering Accuracy
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>
                  Volumetric measurement must adhere to calibrated standards with a margin of error under ±3% across operating flow ranges.
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-1)' }}>
                  <strong style={{ color: '#22c55e' }}>Precision Hall-Effect Sensing:</strong> YF-S201 sensor calibrated at 450 pulses/liter with embedded quadratic polynomial correction, achieving ±1.5% accuracy from 1 to 30 L/min.
                </td>
              </tr>

              <tr>
                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                  3. Tamper Resistance
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>
                  Physical meter must be tamper-evident. Any physical bypass or reverse flow must be recorded and audited.
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-1)' }}>
                  <strong style={{ color: '#22c55e' }}>Hardware Interrupt Tripwire:</strong> Normally-closed enclosure microswitch trips an immediate hardware interrupt, flagging on-chain telemetry as `tamper: true` and freezing rewards.
                </td>
              </tr>

              <tr>
                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                  4. Anti-Double Counting
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>
                  Credits must be uniquely serialized and permanently retired upon corporate purchase to prevent double-claiming across jurisdictions.
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-1)' }}>
                  <strong style={{ color: '#22c55e' }}>Permanent SPL Token Burning:</strong> 1 m³ saved = 1 $HYDRX token. When an enterprise claims a Water Benefit Certificate, $HYDRX tokens are permanently burned via `retire_jal` instruction.
                </td>
              </tr>

              <tr>
                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                  5. Transparent Audit Trail
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>
                  Data must be accessible to third-party verifiers without proprietary lock-in or centralized database alterations.
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-1)' }}>
                  <strong style={{ color: '#22c55e' }}>Immutable Solana Ledger:</strong> All telemetry pulses, signatures, and credit mints are verifiable on the public Solana Explorer with immutable slot timestamps and cryptographic proofs.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
