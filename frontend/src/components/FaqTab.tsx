'use client';

import React, { useState } from 'react';
import { PROGRAM_ID, SOLANA_NETWORK, getAddressExplorerUrl } from '../lib/solana';

export default function FaqTab() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      q: "What is HydrX Protocol on Solana?",
      a: "HydrX is a Decentralized Physical Infrastructure Network (DePIN) that aligns real-world residential water conservation with tokenized environmental incentives. Smart water meters stream pulse telemetry to a zero-gas relayer, which audits daily consumption against a 200-liter baseline and mints Gold Standard Water Benefit Certificates ($HYDRX) on Solana."
    },
    {
      q: "How does the tokenomics work?",
      a: "HydrX adheres to the Gold Standard Water Benefit Certificate framework: 1 cubic meter (1,000 liters) of conserved water equals 1 $HYDRX token. Rewards accrue only when consumption stays below the 200L daily quota. If an apartment uses 45 liters, 155 liters are preserved, yielding +0.1550 $HYDRX."
    },
    {
      q: "Why Solana over EVM chains?",
      a: "Smart water meter networks stream high-frequency telemetry pulses across thousands of apartment nodes every few seconds. Solana's Sealevel parallel execution engine, 400ms block times, and microscopic transaction fees allow thousands of independent resident PDAs to update simultaneously with zero congestion."
    },
    {
      q: "Do residents pay gas fees?",
      a: "No. The HydrX zero-gas relayer proxy pays 100% of Solana network transaction fees for every incoming pulse. Residents only sign a free claim transaction when withdrawing $HYDRX tokens to their Phantom, Solflare, or Backpack wallet."
    },
    {
      q: "How do corporations use $HYDRX for ESG compliance?",
      a: "Corporations permanently burn $HYDRX SPL tokens via the ESG Portal. The on-chain burn generates an immutable Certificate of Water Benefit Retirement containing the transaction hash, volume in cubic meters, and timestamp, meeting GRI 303 and CDP Water Security disclosure standards."
    },
    {
      q: "What is Gold Standard Compliance and how does HydrX satisfy it?",
      a: "The Gold Standard for Global Goals (GS4GG) Water Benefit Standard defines 1 Water Benefit Certificate (WBC) as 1 cubic meter (1,000 liters) of verified freshwater saved or restored. HydrX satisfies all 5 GS4GG audit pillars: (1) Baseline additionality via a 200L/day smart contract quota, (2) ±1.5% volumetric metering accuracy via calibrated Hall-Effect pulse sensing, (3) Tamper-evident hardware interrupt loops, (4) Permanent SPL token burning to prevent double-counting, and (5) Public verification on the Solana Explorer."
    },
    {
      q: "Where does institutional corporate demand for $HYDRX come from?",
      a: "Large enterprises face strict natural resource reporting mandates (EU CSRD, SEC climate rules, CDP). Specifically, hyperscale AI data centers consume 3 to 5 million liters of potable cooling water daily per campus and face severe greenwashing scrutiny. By purchasing and burning $HYDRX tokens on the HydrX Marketplace, enterprises receive verifiable on-chain Water Restoration Certificates backed by immutable physical telemetry from real households."
    },
    {
      q: "What hardware is required?",
      a: "Any ESP32 microcontroller paired with a standard YF-S201 Hall-Effect pulse sensor (under $10 total) can run the HydrX open-source C++ firmware and stream encrypted telemetry to the network."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px', margin: '0 auto', width: '100%', paddingTop: '16px', paddingBottom: '64px' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Technical Architecture & FAQ
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
          Program: <a
            href={getAddressExplorerUrl(PROGRAM_ID.toBase58())}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{ color: 'var(--text-1)', textDecoration: 'underline' }}
          >{PROGRAM_ID.toBase58().slice(0, 8)}...{PROGRAM_ID.toBase58().slice(-4)}</a> on Solana {SOLANA_NETWORK}
        </p>
      </div>

      {/* Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{
                borderBottom: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: isOpen ? 'var(--text-1)' : 'var(--text-2)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'color 0.2s ease',
                }}
              >
                {faq.q}
                <span style={{
                  fontSize: '1.2rem',
                  color: 'var(--text-3)',
                  transition: 'transform 0.2s ease',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                  flexShrink: 0,
                  marginLeft: '16px',
                }}>
                  +
                </span>
              </button>

              <div style={{
                maxHeight: isOpen ? '300px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}>
                <p style={{
                  color: 'var(--text-2)',
                  fontSize: '0.92rem',
                  lineHeight: 1.7,
                  paddingBottom: '20px',
                  maxWidth: '65ch',
                }}>
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
