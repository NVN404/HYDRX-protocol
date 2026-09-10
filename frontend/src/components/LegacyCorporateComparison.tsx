'use client';

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ExternalLink,
  ArrowRight,
  Clock,
  Cpu,
  FileSpreadsheet,
  Globe2,
  Lock,
} from 'lucide-react';

export default function LegacyCorporateComparison() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        marginBottom: '88px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="pill font-mono" style={{ marginBottom: '8px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
            THE ENTERPRISE WATER STEWARDSHIP DILEMMA
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: '4px 0' }}>
            How Traditional Corporates Claim &quot;Water Positive&quot; Without HydrX
          </h2>
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', maxWidth: '52ch', lineHeight: 1.6 }}>
          A multi-billion dollar corporate sustainability industry running on 18-month audit delays, spreadsheet estimates, and unverified phantom credits.
        </p>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '24px',
        }}
      >
        {/* COLUMN 1: The Legacy Corporate Model (Without HydrX) */}
        <div
          className="surface"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '28px',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            background: 'rgba(239, 68, 68, 0.02)',
            position: 'relative',
          }}
        >
          {/* Top Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="pill font-mono"
              style={{
                fontSize: '0.72rem',
                color: '#f87171',
                borderColor: 'rgba(248, 113, 113, 0.35)',
                background: 'rgba(239, 68, 68, 0.08)',
              }}
            >
              STATUS QUO · LEGACY CORPORATE MODEL
            </span>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: '#f87171' }}>
              WITHOUT HYDRX
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.3 }}>
            Manual Audits, Opaque Brokers &amp; Unverifiable Spreadsheets
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            When hyperscale data centers, tech campuses, or beverage companies claim to be &quot;water positive&quot; today, they rely on paper contracts with offset brokers rather than physical telemetry.
          </p>

          {/* Vulnerability 1 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', flexShrink: 0 }}>
              <Clock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                12 to 18 Month Auditing Latency
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                A third-party consultant visits a site once a year, reviews static paper logs, and signs off months after the water was supposedly replenished.
              </p>
            </div>
          </div>

          {/* Vulnerability 2 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', flexShrink: 0 }}>
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                Theoretical Runoff Models Instead of Physical Meters
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                Claims are calculated using computer simulation models and estimated rainfall runoffs rather than real-time sub-liter flow sensors on physical pipes.
              </p>
            </div>
          </div>

          {/* Vulnerability 3 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', flexShrink: 0 }}>
              <Globe2 size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                Zero Localized Basin Additionality
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                A cooling tower consumes 5,000,000 L/day from a critically stressed aquifer in Arizona, while purchasing offset credits from a wetland in Scotland where water is abundant.
              </p>
            </div>
          </div>

          {/* Vulnerability 4 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', flexShrink: 0 }}>
              <Lock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                Double-Counting &amp; Phantom Credits
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                Because registries are private and siloed, middlemen have repackaged and resold the exact same watershed restoration projects to multiple enterprise buyers simultaneously.
              </p>
            </div>
          </div>

          {/* Bottom Liability Callout */}
          <div
            style={{
              marginTop: 'auto',
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.5 }}>
              <strong>Regulatory Hazard:</strong> Exposure to fines up to 5% of global turnover under EU CSRD (ESRS E3) and SEC climate disclosure fraud rules for relying on unverified estimates.
            </span>
          </div>
        </div>

        {/* COLUMN 2: The HydrX Protocol Standard (With MagicBlock & Solana) */}
        <div
          className="surface"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '28px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            background: 'rgba(0, 242, 254, 0.02)',
            position: 'relative',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.05)',
          }}
        >
          {/* Top Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="pill font-mono"
              style={{
                fontSize: '0.72rem',
                color: '#00F2FE',
                borderColor: 'rgba(0, 242, 254, 0.4)',
                background: 'rgba(0, 242, 254, 0.08)',
              }}
            >
              HYDRX STANDARD · SOLANA + MAGICBLOCK
            </span>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: '#00F2FE' }}>
              WITH OUR PROTOCOL
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.3 }}>
            Sub-50ms Physical Telemetry &amp; Cryptographic Basin Proof
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            HydrX replaces paper promises with open IoT smart meters streaming verified physical flow into high-speed Ephemeral Rollups, anchored directly to Solana Base Layer.
          </p>

          {/* Solution 1 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', flexShrink: 0 }}>
              <Cpu size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                Physical Edge Sensing (450 Pulses / Liter)
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                Open-source ESP32 hardware measures flow right at the domestic inlet pipe with hardware microswitch tamper protection and reverse check valves.
              </p>
            </div>
          </div>

          {/* Solution 2 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', flexShrink: 0 }}>
              <Clock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                Sub-50ms Ephemeral Rollup Telemetry
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                Telemetry pings process in ~24 ms on MagicBlock Ephemeral Rollups with 0 gas fees, eliminating account write-lock congestion across thousands of parallel households.
              </p>
            </div>
          </div>

          {/* Solution 3 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', flexShrink: 0 }}>
              <Globe2 size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                Basin-Specific Geotagged Additionality
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                Water credits are tied to specific local watershed IDs. Corporations retire credits within the exact municipal basins where their facilities consume water.
              </p>
            </div>
          </div>

          {/* Solution 4 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', flexShrink: 0 }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                In-App AMM Purchase &amp; Deflationary Burning
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '4px 0 0' }}>
                Corporations buy $HYDRX directly from the open AMM liquidity pool and burn it on-chain with a permanent Solana Memo recording legal entity name and volume retired.
              </p>
            </div>
          </div>

          {/* Bottom Compliance Callout */}
          <div
            style={{
              marginTop: 'auto',
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <ShieldCheck size={18} style={{ color: '#00F2FE', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#a5f3fc', lineHeight: 1.5 }}>
              <strong>Audit-Ready Proof:</strong> 100% empirical, cryptographic records verified on Solana Explorer, fully compliant with UN SDG 6, Gold Standard GS4GG, and GRI 303.
            </span>
          </div>
        </div>
      </div>

      {/* Minimalist Side-by-Side Comparison Matrix Table */}
      <div
        className="surface"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '0',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-1)' }}>
            HEAD-TO-HEAD SPECIFICATION MATRIX
          </span>
          <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
            TRADITIONAL BROKER OFFSETS VS. HYDRX PROTOCOL
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, width: '25%' }}>
                  Evaluation Metric
                </th>
                <th style={{ padding: '12px 18px', textAlign: 'left', color: '#f87171', fontWeight: 600, width: '37%' }}>
                  Traditional Corporate Model
                </th>
                <th style={{ padding: '12px 18px', textAlign: 'left', color: '#00F2FE', fontWeight: 700, width: '38%' }}>
                  HydrX Protocol on MagicBlock (Solana)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-1)' }}>Verification Latency</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-2)' }}>12 to 18 Months (Annual consultant visit)</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-1)', fontWeight: 600 }}>
                  Sub-50ms Continuous (MagicBlock ER pings)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-1)' }}>Data Provenance</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-2)' }}>Self-reported spreadsheets &amp; runoff simulations</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-1)', fontWeight: 600 }}>
                  Physical ESP32 edge pulse counting (450 p/L)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-1)' }}>Watershed Locality</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-2)' }}>Disconnected (e.g. Arizona use, Scotland credit)</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-1)', fontWeight: 600 }}>
                  Geotagged to target basin ID on-chain
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-1)' }}>Double-Counting Protection</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-2)' }}>Zero (Opaque bilateral broker registries)</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-1)', fontWeight: 600 }}>
                  Permanent token burn + Solana L1 Memo etching
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-1)' }}>Household Incentive</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-2)' }}>None (Equal split bills penalize savers)</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-1)', fontWeight: 600 }}>
                  Direct $HYDRX token minting with 0 gas fees
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-1)' }}>Audit Compliance</td>
                <td style={{ padding: '12px 18px', color: '#f87171' }}>High risk of greenwashing regulatory fines</td>
                <td style={{ padding: '12px 18px', color: '#00F2FE', fontWeight: 600 }}>
                  Audit-ready for EU CSRD, ESRS E3, &amp; GRI 303
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            background: 'rgba(255, 255, 255, 0.015)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>
            Ready to inspect verified on-chain corporate water retirement?
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/corporate"
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
              Enter Corporate ESG Portal
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
