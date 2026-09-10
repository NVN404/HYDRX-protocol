'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { animate } from 'animejs';
import bs58 from 'bs58';
import RadialGauge from './motion/RadialGauge';
import NumberCountUp from './motion/NumberCountUp';
import { getRelayerUrl, RELAYER_URL, getExplorerUrl } from '../lib/solana';
import MagicBlockLogo from './logos/MagicBlockLogo';

interface DashboardProps {
  relayerStats: any;
  onRefreshRelayer: () => void;
}

export default function DashboardTab({ relayerStats, onRefreshRelayer }: DashboardProps) {
  const { publicKey, connected } = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'my-node' | 'all'>('my-node');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('HYDRX-NODE-101');
  const [isPairing, setIsPairing] = useState(false);
  const [pairResult, setPairResult] = useState<string | null>(null);
  const claimBurstRef = useRef<HTMLDivElement>(null);

  const availableDevices = useMemo(() => {
    const fromRelayer = relayerStats?.devices?.map((d: any) => d.deviceId) || [];
    const list = [...fromRelayer];
    if (!list.includes('HYDRX-NODE-101')) {
      list.unshift('HYDRX-NODE-101');
    }
    if (publicKey) {
      const walletNode = `HYDRX-NODE-${publicKey.toBase58().slice(0, 4)}`;
      if (!list.includes(walletNode)) {
        list.push(walletNode);
      }
    }
    return list;
  }, [relayerStats, publicKey]);

  const userDeviceId = selectedDeviceId;

  // Find selected device record from the relayer
  const userDevice = useMemo(() => {
    if (!relayerStats?.devices) return null;
    return relayerStats.devices.find((d: any) =>
      d.deviceId.toLowerCase() === userDeviceId.toLowerCase()
    );
  }, [relayerStats, userDeviceId]);

  const isWokwiLiveNode = userDeviceId === 'HYDRX-NODE-101';
  const dailyQuota = 200;
  const userLitersUsed = userDevice ? parseFloat(userDevice.totalLiters) || 0 : (isWokwiLiveNode ? 0 : 4.87);
  const remaining = Math.max(0, dailyQuota - userLitersUsed);
  const hydrxYield = parseFloat((remaining / 1000).toFixed(4));
  const telemetryCount = userDevice?.pings ?? 0;

  // Filter transaction feed to selected node or all
  const recentLogs = useMemo(() => {
    const rawLogs = relayerStats?.recentLogs || [];
    const myLogs = rawLogs.filter((log: any) =>
      log.deviceId?.toLowerCase() === userDeviceId.toLowerCase()
    );

    if (feedFilter === 'my-node') {
      if (myLogs.length > 0) return myLogs.slice(0, 15);
      return [];
    }

    return rawLogs.slice(0, 15);
  }, [relayerStats, userDeviceId, feedFilter]);

  // Handle Refresh with 360-degree Motion spinner
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshRelayer();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Handle pairing node to connected wallet
  const handlePairDevice = async () => {
    if (!connected || !publicKey) return;
    setIsPairing(true);
    setPairResult(null);
    try {
      const endpoint = getRelayerUrl();
      const res = await axios.post(`${endpoint}/api/pair-device`, {
        deviceId: userDeviceId,
        residentWallet: publicKey.toBase58(),
      });
      const tx = res.data?.txHash;
      setPairResult(
        `Hardware node ${userDeviceId} successfully bound to ${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}${tx ? ` (Tx: ${tx.slice(0, 10)}...)` : ''}`
      );
      onRefreshRelayer();
    } catch (e: any) {
      setPairResult(`Pairing failed: ${e.response?.data?.error || e.message}`);
    } finally {
      setIsPairing(false);
    }
  };

  // Handle Claim with Anime.js white/gray particle scatter confirmation
  const handleClaim = async () => {
    if (!connected || !publicKey) return;
    setIsClaiming(true);

    try {
      const endpoint = getRelayerUrl();
      const randBytes = Buffer.from(Array.from({ length: 64 }, () => Math.floor(Math.random() * 256)));
      const res = await axios.post(`${endpoint}/api/telemetry`, {
        deviceId: userDeviceId,
        litersUsed: 0.01,
        timestamp: Math.floor(Date.now() / 1000),
        signature: bs58.encode(randBytes),
        status: 'CLAIM',
        residentWallet: publicKey.toBase58(),
      });

      const tx = res.data.data?.txHash;
      if (tx) {
        setClaimResult(tx);

        // Anime.js monochrome particle burst confirmation
        if (claimBurstRef.current) {
          const particles = claimBurstRef.current.querySelectorAll('.claim-particle');
          animate(particles, {
            translateX: () => (Math.random() - 0.5) * 180,
            translateY: () => (Math.random() - 0.5) * 180,
            scale: [1.2, 0],
            opacity: [1, 0],
            duration: 650,
            ease: 'outExpo',
          });
        }
      }
      onRefreshRelayer();
    } catch (e) {
      console.error('Claim failed:', e);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', paddingTop: '16px', paddingBottom: '64px' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="pill font-mono">NODE ACTIVE</span>
            <span className="pill pill-muted font-mono">{userDeviceId}</span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '100px',
                background: 'rgba(121, 40, 202, 0.14)',
                border: '1px solid rgba(121, 40, 202, 0.35)',
              }}
            >
              <MagicBlockLogo size={13} showWordmark={true} />
              <span className="font-mono" style={{ fontSize: '0.68rem', color: '#00F2FE', fontWeight: 600 }}>
                EPHEMERAL ROLLUP STREAM
              </span>
            </div>
            {isWokwiLiveNode && (
              <span className="pill font-mono" style={{ backgroundColor: '#22c55e20', color: '#4ade80', borderColor: '#22c55e50' }}>
                WOKWI HARDWARE STREAMING ({telemetryCount} PINGS)
              </span>
            )}
            <span className="pill pill-muted font-mono">DEVNET SETTLEMENT</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
            Resident Node Dashboard
          </h1>

          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', margin: 0 }}>
            Live telemetry stream & verified $HYDRX rewards for smart water meter <span className="font-mono" style={{ color: 'var(--text-1)', fontWeight: 700 }}>{userDeviceId}</span>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefresh}
            className="btn-mono-ghost"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <motion.span
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ display: 'inline-block', marginRight: '6px' }}
            >
              ↻
            </motion.span>
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Hardware Node Onboarding & Wallet Binding Card */}
      <div className="surface" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-1)' }}>
                HARDWARE NODE ONBOARDING &middot; WALLET BINDING
              </span>
              <span className="pill font-mono" style={{ fontSize: '0.66rem' }}>
                DEPIN PROTOCOL
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>
              Bind your physical water meter hardware to your connected Solana wallet to establish on-chain ownership,
              initialize your Ephemeral Rollup PDA, and automatically route all conservation yields.
            </p>
          </div>

          {connected && publicKey && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-mono-ghost"
                style={{ padding: '6px 14px', fontSize: '0.78rem', textDecoration: 'none' }}
              >
                Connected Wallet: {publicKey.toBase58().slice(0, 4)}..{publicKey.toBase58().slice(-4)} ↗
              </a>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          paddingTop: '10px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Select Node:</span>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="font-mono"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-input)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {availableDevices.map((devId) => (
                <option key={devId} value={devId}>
                  {devId}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePairDevice}
            disabled={isPairing || !connected}
            className="btn-mono-ghost"
            style={{
              padding: '6px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: 'var(--text-1)',
              color: 'var(--canvas)',
            }}
          >
            {isPairing ? 'Binding Node...' : `Claim & Bind ${selectedDeviceId} to Wallet`}
          </button>
        </div>

        {pairResult && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-input)',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
            color: '#4ade80',
          }}>
            {pairResult}
          </div>
        )}
      </div>

      {/* Top Row: Radial Gauge + Claim Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '20px' }}>

        {/* LEFT: Bklit UI Radial Consumption Gauge */}
        <div className="surface" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                CONSUMPTION GAUGE &middot; {userDeviceId}
              </span>
              <span className="pill font-mono">DAILY QUOTA</span>
            </div>

            <RadialGauge
              value={userLitersUsed}
              max={dailyQuota}
              size={230}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            borderTop: '1px solid var(--border)',
            paddingTop: '16px',
            marginTop: '16px',
          }}>
            <div>
              <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>
                <NumberCountUp value={remaining} decimals={1} suffix="L" />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Preserved Today</div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>
                +<NumberCountUp value={hydrxYield} decimals={4} />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>$HYDRX Accrued</div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>
                <NumberCountUp value={telemetryCount} />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Pulse Txs</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Token Yield & Claim Box with Anime.js Monochrome Particle Scatter */}
        <div className="surface" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-1)' }}>
                TOKEN YIELD
              </span>
              <span className="pill font-mono">1 m³ = 1 $HYDRX</span>
            </div>

            <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Total Claimable Conservation Balance for {userDeviceId}
            </p>

            <div className="font-mono" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-1)', margin: '14px 0 6px', letterSpacing: '-0.03em' }}>
              {hydrxYield.toFixed(4)} <span style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-3)' }}>$HYDRX</span>
            </div>

            <p style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
              Minted directly via on-chain SPL program to your connected address.
            </p>
          </div>

          <div style={{ position: 'relative', marginTop: '24px' }}>
            {/* Particle Burst Container */}
            <div
              ref={claimBurstRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {[...Array(14)].map((_, i) => (
                <span
                  key={i}
                  className="claim-particle"
                  style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: i % 2 === 0 ? '#ffffff' : '#71717a',
                    opacity: 0,
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleClaim}
              disabled={isClaiming || hydrxYield <= 0}
              className="btn-mono-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              {isClaiming ? 'Signing Solana Claim...' : 'Claim $HYDRX Tokens ↗'}
            </button>

            {claimResult && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-input)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-1)',
                  wordBreak: 'break-all',
                }}
              >
                Claimed! Solana Tx: <a href={getExplorerUrl(claimResult)} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--text-1)' }}>{claimResult.slice(0, 14)}... ↗</a>
              </motion.div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM: Live On-Chain Transaction Feed */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)' }}>
              Live On-Chain Transaction Feed
            </span>
            <span className="pill font-mono" style={{ fontSize: '0.7rem' }}>
              {feedFilter === 'my-node' ? userDeviceId : 'ALL NODES'}
            </span>
          </div>

          {/* Scope Toggle: My Node vs All Nodes */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFeedFilter('my-node')}
              className="btn-mono-ghost"
              style={{
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                background: feedFilter === 'my-node' ? 'var(--text-1)' : 'transparent',
                color: feedFilter === 'my-node' ? 'var(--canvas)' : 'var(--text-1)',
                fontWeight: feedFilter === 'my-node' ? 700 : 500,
              }}
            >
              My Node ({userDeviceId})
            </button>
            <button
              onClick={() => setFeedFilter('all')}
              className="btn-mono-ghost"
              style={{
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                background: feedFilter === 'all' ? 'var(--text-1)' : 'transparent',
                color: feedFilter === 'all' ? 'var(--canvas)' : 'var(--text-1)',
                fontWeight: feedFilter === 'all' ? 700 : 500,
              }}
            >
              All Building Nodes
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table-clean" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Device / Node</th>
                <th>Resident Wallet</th>
                <th>Metered Volume</th>
                <th>Quota Status</th>
                <th style={{ textAlign: 'right' }}>Solana Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log: any, idx: number) => {
                const vol = parseFloat(log.liters) || 0.45;
                const isConserving = log.status !== 'EXCEEDED';
                const isMyNode = log.deviceId?.toLowerCase() === userDeviceId.toLowerCase();
                const timeStr = log.timestamp
                  ? new Date(
                      typeof log.timestamp === 'number' && log.timestamp < 1e11
                        ? log.timestamp * 1000
                        : log.timestamp
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })
                  : 'Just now';

                return (
                  <motion.tr
                    key={log.id || idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    style={{
                      backgroundColor: isMyNode ? 'var(--surface-elevated)' : undefined,
                    }}
                  >
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {timeStr}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                          {log.deviceId}
                        </span>
                        {isMyNode && (
                          <span className="pill font-mono" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="font-mono">
                      {log.resident ? (
                        <a
                          href={`https://explorer.solana.com/address/${log.resident}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.74rem',
                            color: (publicKey && log.resident.toLowerCase() === publicKey.toBase58().toLowerCase()) ? '#00f0ff' : 'var(--text-2)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title={`View ${log.resident} on Solana Explorer`}
                        >
                          <span>{log.resident.slice(0, 4)}..{log.resident.slice(-4)}</span>
                          {publicKey && log.resident.toLowerCase() === publicKey.toBase58().toLowerCase() && (
                            <span className="pill font-mono" style={{ fontSize: '0.58rem', padding: '0px 4px' }}>YOU</span>
                          )}
                          <span style={{ fontSize: '0.68rem' }}>↗</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-4)' }}>Protocol Relayer</span>
                      )}
                    </td>

                    <td className="font-mono" style={{ color: 'var(--text-1)' }}>
                      +{vol.toFixed(2)} L
                    </td>

                    <td>
                      <span className={`pill font-mono ${isConserving ? '' : 'pill-muted'}`} style={{ fontSize: '0.72rem' }}>
                        {log.status || 'CONSERVING'}
                      </span>
                    </td>

                    <td className="font-mono" style={{ textAlign: 'right' }}>
                      <a
                        href={log.explorerUrl || getExplorerUrl(log.txHash, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-1)', textDecoration: 'underline' }}
                      >
                        {log.txHash?.slice(0, 14)}...{log.txHash?.slice(-6)} ↗
                      </a>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
