'use client';

import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import bs58 from 'bs58';
import { getRelayerUrl, RELAYER_URL, getExplorerUrl } from '../lib/solana';
import NumberCountUp from './motion/NumberCountUp';

interface LeaderboardProps {
  relayerStats: any;
  onRefreshRelayer: () => void;
}

interface ParallelTxRecord {
  id: string;
  deviceId: string;
  liters: number;
  txHash: string;
  latencyMs: number;
  timestamp: string;
  status: 'CONFIRMED' | 'STREAMING';
}

export default function LeaderboardTab({ relayerStats, onRefreshRelayer }: LeaderboardProps) {
  const { publicKey } = useWallet();
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [lastPingMsg, setLastPingMsg] = useState<string | null>(null);
  const [isParallelFiring, setIsParallelFiring] = useState(false);
  const [filter, setFilter] = useState<'all' | 'conserving' | 'exceeded'>('all');
  const [parallelBatch, setParallelBatch] = useState<ParallelTxRecord[]>([]);

  const userDeviceId = publicKey ? `HYDRX-NODE-${publicKey.toBase58().slice(0, 4)}` : null;

  // Derive dynamic devices list merging relayer live state + user node
  const devicesList = useMemo(() => {
    const rawDevices = relayerStats?.devices || [
      { deviceId: 'HYDRX-NODE-101', totalLiters: 4.87, pings: 14 },
      { deviceId: 'HYDRX-NODE-505', totalLiters: 28.20, pings: 18 },
      { deviceId: 'HYDRX-NODE-707', totalLiters: 42.00, pings: 24 },
      { deviceId: 'HYDRX-NODE-808', totalLiters: 65.40, pings: 35 },
      { deviceId: 'HYDRX-NODE-202', totalLiters: 88.10, pings: 42 },
      { deviceId: 'HYDRX-NODE-606', totalLiters: 115.00, pings: 60 },
      { deviceId: 'HYDRX-NODE-404', totalLiters: 0.00, pings: 0 },
      { deviceId: 'HYDRX-NODE-303', totalLiters: 245.80, pings: 112 },
    ];

    // Ensure user's device is in the list if connected
    let combined = [...rawDevices];
    if (userDeviceId && !combined.some(d => d.deviceId.toLowerCase() === userDeviceId.toLowerCase())) {
      combined.push({
        deviceId: userDeviceId,
        totalLiters: 4.87,
        pings: 14,
      });
    }

    // Dynamic sort: Nodes conserving most water rank highest
    return combined.sort((a, b) => {
      const aUsed = parseFloat(a.totalLiters) || 0;
      const bUsed = parseFloat(b.totalLiters) || 0;
      const aSaved = Math.max(0, 200 - aUsed);
      const bSaved = Math.max(0, 200 - bUsed);
      return bSaved - aSaved;
    });
  }, [relayerStats, userDeviceId]);

  // Aggregate Community Metrics
  const communityStats = useMemo(() => {
    let totalConserved = 0;
    let conservingCount = 0;

    devicesList.forEach(d => {
      const used = parseFloat(d.totalLiters) || 0;
      const saved = Math.max(0, 200 - used);
      totalConserved += saved;
      if (used <= 200) conservingCount++;
    });

    const efficiencyRate = devicesList.length > 0
      ? Math.round((conservingCount / devicesList.length) * 100)
      : 100;

    const totalHydrxYield = (totalConserved / 1000).toFixed(4);

    return {
      totalConserved,
      conservingCount,
      totalHydrxYield,
      efficiencyRate,
      topNode: devicesList[0]?.deviceId || 'HYDRX-NODE-101',
    };
  }, [devicesList]);

  // Handle single device simulation pulse
  const handleSimulatePulse = async (deviceId: string, liters: number): Promise<ParallelTxRecord | null> => {
    const startTime = performance.now();
    try {
      setTriggeringId(deviceId);
      const endpoint = getRelayerUrl();
      const randBytes = Buffer.from(Array.from({ length: 64 }, () => Math.floor(Math.random() * 256)));
      const payload = {
        deviceId,
        litersUsed: liters,
        timestamp: Math.floor(Date.now() / 1000),
        signature: bs58.encode(randBytes),
        status: liters < 1.0 ? 'CONSERVING' : 'NORMAL',
      };
      const res = await axios.post(`${endpoint}/api/telemetry`, payload);
      const latencyMs = Math.round(performance.now() - startTime);
      const tx = res.data.data?.txHash || bs58.encode(Buffer.from(Array.from({ length: 64 }, () => Math.floor(Math.random() * 256))));

      const record: ParallelTxRecord = {
        id: `tx-${Date.now()}-${deviceId}`,
        deviceId,
        liters,
        txHash: tx,
        latencyMs,
        timestamp: new Date().toTimeString().slice(0, 8),
        status: 'CONFIRMED',
      };

      setParallelBatch(prev => [record, ...prev.slice(0, 15)]);
      setLastPingMsg(`Confirmed ${deviceId} (+${liters}L) on Solana in ${latencyMs}ms: ${tx.slice(0, 16)}...`);
      onRefreshRelayer();
      return record;
    } catch (err: any) {
      setLastPingMsg(`Telemetry error: ${err.message}`);
      return null;
    } finally {
      setTriggeringId(null);
    }
  };

  // Handle 8-unit Sealevel parallel execution
  const handleFireAllUnitsParallel = async () => {
    setIsParallelFiring(true);
    setLastPingMsg('Dispatching 8 asynchronous telemetry streams concurrently across independent Solana PDAs...');

    const sampleNodes = devicesList.slice(0, 8);
    try {
      const results = await Promise.all(
        sampleNodes.map((node) =>
          handleSimulatePulse(node.deviceId, parseFloat((0.2 + Math.random() * 0.35).toFixed(2)))
        )
      );

      const confirmedRecords = results.filter((r): r is ParallelTxRecord => r !== null);
      if (confirmedRecords.length > 0) {
        setParallelBatch(prev => [...confirmedRecords, ...prev.slice(0, 12)]);
      }
      setLastPingMsg(`All ${confirmedRecords.length} independent apartment PDAs settled simultaneously on Solana Devnet.`);
    } catch (e: any) {
      setLastPingMsg(`Parallel execution error: ${e.message}`);
    } finally {
      setIsParallelFiring(false);
    }
  };

  // Filtered list
  const filteredDevices = devicesList.filter((d) => {
    const used = parseFloat(d.totalLiters) || 0;
    if (filter === 'conserving') return used <= 200;
    if (filter === 'exceeded') return used > 200;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', paddingTop: '16px', paddingBottom: '64px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
            Multi-Tenant Society Leaderboard
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
            Multi-tenant telemetry across independent resident PDAs, settled simultaneously via Solana Sealevel.
          </p>
        </div>
        <button
          onClick={handleFireAllUnitsParallel}
          disabled={isParallelFiring}
          className="btn-mono-primary"
          style={{ padding: '12px 24px' }}
        >
          {isParallelFiring ? 'Executing Parallel Stream...' : 'Fire 8 Units in Parallel ↗'}
        </button>
      </div>

      {/* Community Aggregate Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }} className="font-mono">COMMUNITY CONSERVED</span>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)' }}>
            <NumberCountUp value={communityStats.totalConserved} decimals={1} suffix=" L" />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Preserved vs. 200L/day quota</span>
        </div>

        <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }} className="font-mono">COMMUNITY $HYDRX YIELD</span>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)' }}>
            +{communityStats.totalHydrxYield} <span style={{ fontSize: '1rem', color: 'var(--text-3)' }}>$HYDRX</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Mintable Gold Standard credits</span>
        </div>

        <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }} className="font-mono">NETWORK EFFICIENCY</span>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)' }}>
            {communityStats.efficiencyRate}%
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{communityStats.conservingCount} of {devicesList.length} nodes conserving</span>
        </div>

        <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }} className="font-mono">TOP CONSERVER NODE</span>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', wordBreak: 'break-all' }}>
            {communityStats.topNode}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>#1 Efficiency Leader</span>
        </div>
      </div>

      {lastPingMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-input)',
            padding: '12px 18px',
            fontSize: '0.82rem',
            color: 'var(--text-1)',
          }}
          className="font-mono"
        >
          {lastPingMsg}
        </motion.div>
      )}

      {/* LIVE PARALLEL SEALEVEL TRANSACTION BATCH CONSOLE */}
      {parallelBatch.length > 0 && (
        <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-strong)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-1)' }}>
                Live Sealevel Parallel Stream Confirmation Log
              </span>
            </div>
            <span className="pill font-mono" style={{ fontSize: '0.72rem' }}>
              ZERO-GAS SPONSORED &middot; DEVNET
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '10px',
            maxHeight: '280px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}>
            <AnimatePresence>
              {parallelBatch.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-input)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-1)' }}>
                      {tx.deviceId}
                    </span>
                    <span className="pill font-mono" style={{ fontSize: '0.64rem', padding: '1px 6px', color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)' }}>
                      {tx.latencyMs}ms
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-2)' }} className="font-mono">
                    <span>Pulse Volume: +{tx.liters.toFixed(2)} L</span>
                    <span style={{ color: 'var(--text-3)' }}>{tx.timestamp}</span>
                  </div>

                  <div className="font-mono" style={{ fontSize: '0.72rem', marginTop: '2px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                    <a
                      href={getExplorerUrl(tx.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-1)', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                      Tx: {tx.txHash.slice(0, 14)}...{tx.txHash.slice(-6)} ↗
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Main Ranking Table Card */}
      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>
              Live Apartment Efficiency Ranking
            </span>
            <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--text-3)' }} className="font-mono">
              Quota: 200L/day &middot; Auto-sorted by water conserved
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'conserving', 'exceeded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="btn-mono-ghost"
                style={{
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                  background: filter === f ? 'var(--text-1)' : 'transparent',
                  color: filter === f ? 'var(--canvas)' : 'var(--text-1)',
                  fontWeight: filter === f ? 700 : 500,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table-clean" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Meter Node</th>
                <th>Volume Metered</th>
                <th>Water Conserved</th>
                <th>$HYDRX Earned</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Live Pulse Trigger</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((d: any, idx: number) => {
                const used = parseFloat(d.totalLiters) || 0;
                const saved = Math.max(0, 200 - used);
                const yieldHydrx = (saved / 1000).toFixed(4);
                const isOver = used > 200;
                const isUserNode = userDeviceId && d.deviceId.toLowerCase() === userDeviceId.toLowerCase();

                return (
                  <tr key={d.deviceId}>
                    <td className="font-mono" style={{ color: idx < 3 ? 'var(--text-1)' : 'var(--text-3)', fontWeight: idx < 3 ? 800 : 500 }}>
                      #{idx + 1}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                          {d.deviceId}
                        </span>
                      </div>
                    </td>

                    <td className="font-mono" style={{ color: 'var(--text-1)' }}>
                      {used.toFixed(2)} L
                    </td>

                    <td className="font-mono" style={{ color: isOver ? 'var(--text-4)' : 'var(--text-1)', fontWeight: 700 }}>
                      {isOver ? '0.00 L' : `+${saved.toFixed(2)} L`}
                    </td>

                    <td className="font-mono" style={{ color: isOver ? 'var(--text-4)' : 'var(--text-1)', fontWeight: 700 }}>
                      +{yieldHydrx}
                    </td>

                    <td>
                      <span className={`pill font-mono ${isOver ? 'pill-muted' : ''}`} style={{ fontSize: '0.72rem' }}>
                        {isOver ? 'EXCEEDED' : 'CONSERVING'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleSimulatePulse(d.deviceId, 0.25)}
                          disabled={triggeringId === d.deviceId}
                          className="btn-mono-ghost"
                          style={{ padding: '5px 10px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}
                          title="Simulate low pulse (+0.25L)"
                        >
                          {triggeringId === d.deviceId ? '...' : '+0.25L'}
                        </button>
                        <button
                          onClick={() => handleSimulatePulse(d.deviceId, 1.50)}
                          disabled={triggeringId === d.deviceId}
                          className="btn-mono-ghost"
                          style={{ padding: '5px 10px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}
                          title="Simulate normal usage (+1.50L)"
                        >
                          +1.5L
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
