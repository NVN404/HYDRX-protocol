'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import bs58 from 'bs58';
import { getRelayerUrl, RELAYER_URL, getExplorerUrl, PROGRAM_ID } from '../lib/solana';
import HardwareBlueprints from './hardware/HardwareBlueprints';

interface LedgerEntry {
  id: string;
  time: string;
  delta: number;
  hash: string;
  txHash?: string;
  ok: boolean;
}

interface HardwareLabProps {
  relayerStats?: any;
  onRefreshRelayer?: () => void;
}

export default function HardwareLabTab({ relayerStats, onRefreshRelayer }: HardwareLabProps) {
  const { publicKey, connected } = useWallet();
  const walletKey = publicKey ? publicKey.toBase58() : 'default_guest_node';
  const [selectedNode, setSelectedNode] = useState<string>('HYDRX-NODE-101');
  const [activeViewMode, setActiveViewMode] = useState<'simulator' | 'blueprints'>('simulator');
  const [isPairing, setIsPairing] = useState(false);
  const [pairStatus, setPairStatus] = useState<string | null>(null);
  const deviceId = selectedNode;

  // Find user's synced volume from the relayer
  const liveDeviceRecord = useMemo(() => {
    if (!relayerStats?.devices) return null;
    return relayerStats.devices.find((d: any) =>
      d.deviceId.toLowerCase() === deviceId.toLowerCase()
    );
  }, [relayerStats, deviceId]);

  const syncedVolume = useMemo(() => {
    return liveDeviceRecord ? parseFloat(liveDeviceRecord.totalLiters) || 0 : 0;
  }, [liveDeviceRecord]);

  const [valveVal, setValveVal] = useState(0);
  const [tampered, setTampered] = useState(false);
  const [totalLiters, setTotalLiters] = useState(syncedVolume);
  const [creditsMinted, setCreditsMinted] = useState(Math.max(0, 200 - syncedVolume) / 1000);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isRelayerConnected, setIsRelayerConnected] = useState(true);
  const [pulseLedActive, setPulseLedActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const MAX_LPM = 30.0; // YF-S201 max rated flow

  const valveRef = useRef(valveVal);
  const tamperedRef = useRef(tampered);
  const totalLitersRef = useRef(totalLiters);
  const intervalVolumeRef = useRef(0.0);

  valveRef.current = valveVal;
  tamperedRef.current = tampered;
  totalLitersRef.current = totalLiters;

  // Update volume whenever relayer live state reports new telemetry
  useEffect(() => {
    if (syncedVolume > 0) {
      setTotalLiters((prev) => Math.max(prev, syncedVolume));
      setCreditsMinted(Math.max(0, 200 - syncedVolume) / 1000);
    }
  }, [syncedVolume]);

  // Merge live incoming Wokwi telemetry logs from Relayer into ledger
  useEffect(() => {
    if (!relayerStats?.recentLogs) return;
    const deviceLogs = relayerStats.recentLogs.filter(
      (l: any) => l.deviceId?.toLowerCase() === deviceId.toLowerCase()
    );

    if (deviceLogs.length > 0) {
      setLedger((prev) => {
        const seenTx = new Set<string>();

        // Map relayer entries
        const relayerEntries: LedgerEntry[] = deviceLogs.map((l: any) => ({
          id: l.id,
          time: l.timestamp ? new Date(l.timestamp).toTimeString().slice(0, 8) : currentTime,
          delta: parseFloat(l.liters) || 0,
          hash: l.txHash ? `${l.txHash.slice(0, 12)}...` : (l.signature || `${l.deviceId}-SIG`),
          txHash: l.txHash,
          ok: l.status !== 'EXCEEDED' && l.status !== 'TAMPER',
        }));

        // Keep any pending local entries that haven't appeared in relayer yet
        const relayerTxSet = new Set(relayerEntries.map((e) => e.txHash).filter(Boolean));
        const pendingLocal = prev.filter(
          (e) => e.txHash && !relayerTxSet.has(e.txHash) && e.id.startsWith('entry-')
        );

        const combined = [...pendingLocal, ...relayerEntries];
        const deduped: LedgerEntry[] = [];
        for (const item of combined) {
          if (item.txHash) {
            if (seenTx.has(item.txHash)) continue;
            seenTx.add(item.txHash);
          }
          deduped.push(item);
        }

        if (deviceLogs.length > 0) {
          setPulseLedActive(true);
          setTimeout(() => setPulseLedActive(false), 300);
        }
        return deduped.slice(0, 30);
      });
    }
  }, [relayerStats?.recentLogs, deviceId]);

  // Load initial state synced with relayer and localStorage
  useEffect(() => {
    try {
      const savedLedger = localStorage.getItem(`hydrx_hw_ledger_${walletKey}`) || localStorage.getItem(`jal_hw_ledger_${walletKey}`);
      if (savedLedger) {
        const parsed = JSON.parse(savedLedger);
        const seen = new Set<string>();
        const deduped = (Array.isArray(parsed) ? parsed : []).filter((e: any) => {
          if (e.txHash) {
            if (seen.has(e.txHash)) return false;
            seen.add(e.txHash);
          }
          return true;
        });
        setLedger(deduped);
      } else {
        setLedger([]);
      }

      if (syncedVolume > 0) {
        setTotalLiters(syncedVolume);
        setCreditsMinted(Math.max(0, 200 - syncedVolume) / 1000);
      } else {
        const savedTotals = localStorage.getItem(`hydrx_hw_totals_${walletKey}`) || localStorage.getItem(`jal_hw_totals_${walletKey}`);
        if (savedTotals) {
          const parsed = JSON.parse(savedTotals);
          const initialVol = Math.max(parsed.totalLiters || 0, syncedVolume);
          setTotalLiters(initialVol);
          setCreditsMinted(Math.max(0, 200 - initialVol) / 1000);
        }
      }
    } catch (e) {
      console.error('Failed to load wallet hardware cache:', e);
    } finally {
      setLoaded(true);
    }
  }, [walletKey, syncedVolume]);

  // Persist state changes to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(`hydrx_hw_ledger_${walletKey}`, JSON.stringify(ledger));
      localStorage.setItem(
        `hydrx_hw_totals_${walletKey}`,
        JSON.stringify({ totalLiters, creditsMinted })
      );
    } catch (e) {
      console.error('Failed to persist wallet hardware cache:', e);
    }
  }, [ledger, totalLiters, creditsMinted, walletKey, loaded]);

  // Real-time RTC Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setCurrentTime(d.toTimeString().slice(0, 8));
    };
    tick();
    const clockInterval = setInterval(tick, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Flow Calculations
  const currentFlowLpm = (valveVal / 100) * MAX_LPM;
  const currentFlowLps = currentFlowLpm / 60;

  // Handle pairing current node to connected wallet
  const handlePairThisNode = async () => {
    if (!connected || !publicKey) return;
    setIsPairing(true);
    setPairStatus(null);
    try {
      const endpoint = getRelayerUrl();
      const res = await axios.post(`${endpoint}/api/pair-device`, {
        deviceId,
        residentWallet: publicKey.toBase58(),
      });
      setPairStatus(`Node ${deviceId} paired to wallet ${publicKey.toBase58().slice(0, 4)}..${publicKey.toBase58().slice(-4)}`);
      onRefreshRelayer?.();
    } catch (e: any) {
      setPairStatus(`Pairing error: ${e.response?.data?.error || e.message}`);
    } finally {
      setIsPairing(false);
    }
  };

  // High-frequency meter tick (100ms) - only ticks if wallet is connected
  useEffect(() => {
    const TICK_MS = 100;
    const interval = setInterval(() => {
      if (!connected || !publicKey || tamperedRef.current) return;

      const lpm = (valveRef.current / 100) * MAX_LPM;
      const lps = lpm / 60;
      const deltaLiters = lps * (TICK_MS / 1000);

      if (deltaLiters > 0) {
        setTotalLiters((prev) => {
          const nextVal = prev + deltaLiters;
          setCreditsMinted(Math.max(0, 200 - nextVal) / 1000);
          return nextVal;
        });
        intervalVolumeRef.current += deltaLiters;
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [connected, publicKey]);

  // Cryptographic payload signature in Solana Base58 format
  const hashPayload = async (payload: any) => {
    try {
      const bytes = new TextEncoder().encode(JSON.stringify(payload));
      const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
      return bs58.encode(new Uint8Array(digest)).slice(0, 16);
    } catch {
      return bs58.encode(Buffer.from(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))));
    }
  };

  // Attestation interval (800ms) matching hardware firmware transmission - requires wallet
  useEffect(() => {
    const ATTEST_MS = 800;
    const attestInterval = setInterval(async () => {
      if (!connected || !publicKey) return;

      const delta = intervalVolumeRef.current;
      const isTampered = tamperedRef.current;
      const lps = (valveRef.current / 100) * (MAX_LPM / 60);

      if (delta > 0.02 && lps > 0.02) {
        const timeStr = new Date().toTimeString().slice(0, 8);
        const payload = {
          deviceId,
          litersUsed: Number(delta.toFixed(2)),
          timestamp: Math.floor(Date.now() / 1000),
          tamper: isTampered,
          residentWallet: publicKey.toBase58(),
        };

        setPulseLedActive(true);
        setTimeout(() => setPulseLedActive(false), 200);

        const hash = await hashPayload(payload);
        let solanaTxHash = '';

        if (!isTampered) {
          // Live relay to Solana with user's wallet
          try {
            const endpoint = getRelayerUrl();
            const res = await axios.post(`${endpoint}/api/telemetry`, {
              deviceId,
              litersUsed: Number(delta.toFixed(2)),
              timestamp: Math.floor(Date.now() / 1000),
              status: lps > 0.4 ? 'NORMAL' : 'CONSERVING',
              signature: hash,
              residentWallet: publicKey.toBase58(),
            });
            if (res.data?.data?.txHash) {
              solanaTxHash = res.data.data.txHash;
            }
            setIsRelayerConnected(true);
            onRefreshRelayer?.();
          } catch (err) {
            console.warn('[HARDWARE LAB] Relayer telemetry submission notice:', err);
            setIsRelayerConnected(false);
          }
        }

        const newEntry: LedgerEntry = {
          id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          time: timeStr,
          delta: Number(delta.toFixed(2)),
          hash: solanaTxHash ? `${solanaTxHash.slice(0, 12)}...` : hash,
          txHash: solanaTxHash,
          ok: !isTampered,
        };

        setLedger((prev) => {
          const seen = new Set<string>();
          const list = [newEntry, ...prev].filter((e) => {
            if (e.txHash) {
              if (seen.has(e.txHash)) return false;
              seen.add(e.txHash);
            }
            return true;
          });
          return list.slice(0, 30);
        });
        intervalVolumeRef.current = 0;
      }
    }, ATTEST_MS);

    return () => clearInterval(attestInterval);
  }, [deviceId, connected, publicKey, onRefreshRelayer]);

  const handleToggleTamper = () => {
    const nextTamper = !tampered;
    setTampered(nextTamper);
    if (nextTamper) {
      setValveVal(0);
    }
  };

  const handleResetSimulation = () => {
    setTotalLiters(0);
    setCreditsMinted(0.2);
    setTampered(false);
    setValveVal(0);
    intervalVolumeRef.current = 0;
    setLedger([]);
    try {
      localStorage.removeItem(`hydrx_hw_ledger_${walletKey}`);
      localStorage.removeItem(`hydrx_hw_totals_${walletKey}`);
    } catch (e) {}
  };

  const flowSpeedSeconds = Math.max(0.3, 2.2 - (currentFlowLps / (MAX_LPM / 60)) * 1.7);
  const isFlowing = currentFlowLps > 0.02 && !tampered;

  let lcdStatusText = 'Status: STANDBY';
  if (tampered) {
    lcdStatusText = 'Status: TAMPER DETECTED';
  } else if (currentFlowLps > 0.05) {
    lcdStatusText = 'Status: METERING & ATTESTING..';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', margin: '0 auto', width: '100%', paddingTop: '16px', paddingBottom: '64px' }}>

      {/* Top Header Bar with RTC Clock & Status Dot */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)', flexWrap: 'wrap' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: tampered ? '#ef4444' : '#22c55e',
              boxShadow: tampered ? '0 0 8px #ef4444' : '0 0 8px #22c55e',
              transition: 'background-color 0.2s ease',
            }}
          />
          <span>HYDRX PROTOCOL &middot; FIELD NODE {deviceId}</span>
          <span className="pill font-mono" style={{ fontSize: '0.7rem' }}>
            {tampered ? 'TAMPER FLAGGED' : 'FIRMWARE v1.4'}
          </span>
          {deviceId === 'HYDRX-NODE-101' && (
            <span className="pill font-mono" style={{ backgroundColor: '#22c55e20', color: '#4ade80', borderColor: '#22c55e50', fontSize: '0.7rem' }}>
              ● WOKWI SIMULATOR CONNECTED
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Node Switcher & Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Node:</span>
            <input
              type="text"
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value.trim().toUpperCase())}
              placeholder="e.g. HYDRX-NODE-101"
              className="font-mono"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-input)',
                fontSize: '0.75rem',
                width: '150px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setSelectedNode('HYDRX-NODE-101')}
              className="btn-mono-ghost"
              style={{
                padding: '3px 8px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                background: selectedNode === 'HYDRX-NODE-101' ? 'var(--text-1)' : 'transparent',
                color: selectedNode === 'HYDRX-NODE-101' ? 'var(--canvas)' : 'var(--text-1)',
                fontWeight: selectedNode === 'HYDRX-NODE-101' ? 700 : 500,
              }}
            >
              Default
            </button>
            {publicKey && (
              <button
                onClick={() => setSelectedNode(`HYDRX-NODE-${publicKey.toBase58().slice(0, 4)}`)}
                className="btn-mono-ghost"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  background: selectedNode === `HYDRX-NODE-${publicKey.toBase58().slice(0, 4)}` ? 'var(--text-1)' : 'transparent',
                  color: selectedNode === `HYDRX-NODE-${publicKey.toBase58().slice(0, 4)}` ? 'var(--canvas)' : 'var(--text-1)',
                  fontWeight: selectedNode === `HYDRX-NODE-${publicKey.toBase58().slice(0, 4)}` ? 700 : 500,
                }}
              >
                Wallet Node
              </button>
            )}
          </div>

          <a
            href="https://wokwi.com/projects/472508191464530945"
            target="_blank"
            rel="noreferrer"
            className="btn-mono-ghost"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Wokwi ESP32 Schematic ↗
          </a>
          <div className="font-mono" style={{ color: 'var(--text-3)', fontSize: '0.92rem', letterSpacing: '0.04em' }}>
            RTC: {currentTime}
          </div>
        </div>
      </div>

      {liveDeviceRecord && liveDeviceRecord.pings > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: '#22c55e15',
          border: '1px solid #22c55e50',
          borderRadius: 'var(--radius-input)',
          fontSize: '0.85rem',
          color: 'var(--text-1)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontWeight: 700, color: '#4ade80' }}>LIVE WOKWI ESP32 HARDWARE STREAMING:</span>
            <span>Firmware transmitting telemetry pulses to Relayer &amp; MagicBlock Ephemeral Rollup contract.</span>
          </div>
          <span className="pill font-mono" style={{ borderColor: '#22c55e60', color: '#4ade80' }}>
            {liveDeviceRecord.pings} PINGS · {syncedVolume.toFixed(2)} L RECORDED
          </span>
        </div>
      )}

      {/* View Mode Switcher: Simulator vs Blueprints vs Gold Standard */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '14px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setActiveViewMode('simulator')}
          className="btn-mono-ghost"
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
            background: activeViewMode === 'simulator' ? 'var(--text-1)' : 'transparent',
            color: activeViewMode === 'simulator' ? 'var(--canvas)' : 'var(--text-1)',
            fontWeight: activeViewMode === 'simulator' ? 700 : 500,
          }}
        >
          [A] Virtual Twin Simulator
        </button>

        <button
          onClick={() => setActiveViewMode('blueprints')}
          className="btn-mono-ghost"
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
            background: activeViewMode === 'blueprints' ? 'var(--text-1)' : 'transparent',
            color: activeViewMode === 'blueprints' ? 'var(--canvas)' : 'var(--text-1)',
            fontWeight: activeViewMode === 'blueprints' ? 700 : 500,
          }}
        >
          [B] 3D Hardware Blueprints & BOM (3 Pages)
        </button>
      </div>

      {activeViewMode === 'blueprints' && <HardwareBlueprints />}

      {activeViewMode === 'simulator' && (
        <>
          <p style={{ color: 'var(--text-2)', fontSize: '0.94rem', lineHeight: 1.6, maxWidth: '780px', margin: 0 }}>
            Live in-browser hardware digital twin of the HydrX Protocol field unit — YF-S201 pulse flow sensor,
            industrial matrix LCD readout, physical pipe flow, and real-time Solana attestation feed.
            Readings and transactions are persistently logged to your connected wallet.
          </p>

          {/* Main Grid: Device Card + Attestation Ledger Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 0.95fr) minmax(380px, 1.05fr)', gap: '22px', alignItems: 'start' }}>

        {/* LEFT: Hardware Device Card with Authentic Industrial Enclosure & Green LCD */}
        <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '22px' }}>

          {/* Mechanical Industrial Bezel */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(145deg, #131d1b 0%, #0c1412 100%)',
            border: '2px solid rgba(201, 161, 90, 0.35)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '22px 20px 20px',
          }}>
            {/* Brass Corner Screws with realistic slot */}
            <div style={{ position: 'absolute', top: '9px', left: '9px', width: '8px', height: '8px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #e6c888, #8a6a2c 65%, #3a2b10 100%)', boxShadow: '0 1px 2px rgba(0,0,0,0.8)' }} />
            <div style={{ position: 'absolute', top: '9px', right: '9px', width: '8px', height: '8px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #e6c888, #8a6a2c 65%, #3a2b10 100%)', boxShadow: '0 1px 2px rgba(0,0,0,0.8)' }} />
            <div style={{ position: 'absolute', bottom: '9px', left: '9px', width: '8px', height: '8px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #e6c888, #8a6a2c 65%, #3a2b10 100%)', boxShadow: '0 1px 2px rgba(0,0,0,0.8)' }} />
            <div style={{ position: 'absolute', bottom: '9px', right: '9px', width: '8px', height: '8px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #e6c888, #8a6a2c 65%, #3a2b10 100%)', boxShadow: '0 1px 2px rgba(0,0,0,0.8)' }} />

            {/* Hardware LEDs Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', color: '#c9a15a' }}>
                HYDRX PROTOCOL &middot; ESP32 FIELD NODE
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* PWR LED */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    boxShadow: '0 0 6px #22c55e',
                  }} />
                  <span style={{ fontSize: '0.62rem', color: '#8fa6a2', fontFamily: 'var(--font-mono)' }}>PWR</span>
                </div>

                {/* PULSE/TX LED */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: pulseLedActive ? '#f59e0b' : '#332712',
                    boxShadow: pulseLedActive ? '0 0 8px #f59e0b' : 'none',
                    transition: 'background-color 0.1s ease',
                  }} />
                  <span style={{ fontSize: '0.62rem', color: '#8fa6a2', fontFamily: 'var(--font-mono)' }}>TX</span>
                </div>

                {/* TAMPER LED */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: tampered ? '#ef4444' : '#2d1412',
                    boxShadow: tampered ? '0 0 8px #ef4444' : 'none',
                  }} />
                  <span style={{ fontSize: '0.62rem', color: '#8fa6a2', fontFamily: 'var(--font-mono)' }}>TMP</span>
                </div>
              </div>
            </div>

            {/* Authentic Industrial Green Dot-Matrix Character LCD Display */}
            <div style={{
              background: 'linear-gradient(180deg, #183a26 0%, #10291b 100%)',
              border: '2px solid #08170f',
              borderRadius: '6px',
              padding: '16px 18px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#86efac',
              fontSize: '0.88rem',
              lineHeight: 1.85,
              whiteSpace: 'pre',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06)',
              textShadow: '0 0 8px rgba(134, 239, 172, 0.45)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* CRT Scanline overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 2px)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div>METER: {deviceId}</div>
                <div>FLOW : {currentFlowLps.toFixed(2)} L/s ({currentFlowLpm.toFixed(1)} L/m)</div>
                <div>TOTAL: {totalLiters.toFixed(2)} L</div>
                <div style={{
                  color: tampered ? '#fca5a5' : currentFlowLps > 0.05 ? '#6ee7b7' : '#4ade80',
                  fontWeight: 700,
                }}>
                  {lcdStatusText}
                </div>
              </div>
            </div>
          </div>

          {/* Flow Valve Controls */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <label htmlFor="valveSlider" style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-2)' }}>
                Valve Aperture Control
              </label>
              <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>
                {valveVal}% <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 400 }}>({currentFlowLps.toFixed(2)} L/s)</span>
              </span>
            </div>

            <input
              id="valveSlider"
              type="range"
              min="0"
              max="100"
              value={valveVal}
              disabled={!connected || tampered}
              onChange={(e) => setValveVal(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                accentColor: '#c9a15a',
                cursor: (!connected || tampered) ? 'not-allowed' : 'pointer',
                opacity: (!connected || tampered) ? 0.35 : 1,
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-4)', marginTop: '4px' }} className="font-mono">
              <span>Closed (0 L/s)</span>
              <span>Full Open ({ (MAX_LPM / 60).toFixed(1) } L/s)</span>
            </div>

            {/* Liquid Flowing Pipe with Realistic Cyan/Teal Water Drops */}
            <div style={{
              position: 'relative',
              height: '14px',
              margin: '20px 0 8px',
              borderTop: '1px dashed rgba(89, 194, 182, 0.4)',
              borderBottom: '1px dashed rgba(89, 194, 182, 0.4)',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(14, 28, 26, 0.8) 0%, rgba(8, 16, 15, 0.9) 100%)',
              borderRadius: '2px',
            }}>
              {[0, 0.4, 0.8, 1.2].map((delay, idx) => (
                <span
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '-6%',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#59c2b6',
                    boxShadow: '0 0 6px #59c2b6',
                    transform: 'translateY(-50%)',
                    opacity: isFlowing ? 0.95 : 0,
                    animation: isFlowing ? `pipeFlow ${flowSpeedSeconds}s linear infinite` : 'none',
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Switch Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={handleToggleTamper}
                disabled={!connected}
                className="btn-mono-ghost"
                style={{
                  borderColor: tampered ? '#ef4444' : undefined,
                  color: tampered ? '#ef4444' : undefined,
                  fontSize: '0.84rem',
                  padding: '8px 16px',
                  opacity: !connected ? 0.4 : 1,
                  cursor: !connected ? 'not-allowed' : 'pointer',
                }}
              >
                {tampered ? 'Reseal & Reset Switch' : 'Trip Tamper Switch'}
              </button>

              <button
                onClick={handleResetSimulation}
                disabled={!connected}
                className="btn-mono-ghost"
                style={{
                  fontSize: '0.84rem',
                  padding: '8px 16px',
                  color: 'var(--text-3)',
                  opacity: !connected ? 0.4 : 1,
                  cursor: !connected ? 'not-allowed' : 'pointer',
                }}
              >
                Reset Simulation
              </button>
            </div>

            {!connected && (
              <div style={{
                marginTop: '16px',
                padding: '14px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.28)',
                borderRadius: 'var(--radius-input)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 700 }}>
                    SIMULATION CONTROLS LOCKED · SOLANA WALLET REQUIRED
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>
                  Connect your Solana Devnet wallet to unlock the aperture valve, stream pulses, and generate on-chain attestations.
                </p>
              </div>
            )}

            {connected && publicKey && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-input)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                      PAIRED RESIDENT WALLET
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
                      {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-6)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handlePairThisNode}
                      disabled={isPairing}
                      className="btn-mono-ghost"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                    >
                      {isPairing ? 'Pairing...' : `Bind ${deviceId} to Wallet`}
                    </button>

                    <a
                      href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-mono-ghost"
                      style={{ padding: '6px 12px', fontSize: '0.76rem', textDecoration: 'none' }}
                    >
                      Explorer ↗
                    </a>
                  </div>
                </div>

                {pairStatus && (
                  <div className="font-mono" style={{ fontSize: '0.76rem', color: '#4ade80' }}>
                    {pairStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Attestation Ledger Card */}
        <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '22px', minHeight: '480px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Solana Attestation Feed
              </h2>
              <span className="pill font-mono" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isRelayerConnected ? '#22c55e' : '#eab308' }} />
                {isRelayerConnected ? 'SOLANA ER RELAYER ACTIVE' : 'CONNECTING TO RELAYER...'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5, margin: '6px 0 0' }}>
              Live Relayer: <span className="font-mono" style={{ color: '#00f0ff', fontSize: '0.76rem' }}>{getRelayerUrl()}</span> &middot; Attesting real-time pulses to MagicBlock Ephemeral Rollup &amp; Solana Devnet.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{
            display: 'flex',
            gap: '24px',
            padding: '12px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            <div>
              <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)' }}>
                {totalLiters.toFixed(2)} L
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Liters Metered</div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)' }}>
                +{creditsMinted.toFixed(4)}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>$HYDRX Credits Accrued</div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: tampered ? '#ef4444' : '#22c55e' }}>
                {tampered ? 'TAMPERED' : isRelayerConnected ? 'ACTIVE' : 'LOCAL'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Node Status</div>
            </div>
          </div>

          {/* Live Scrolling Attestation Ledger */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
            maxHeight: '340px',
            paddingRight: '4px',
          }}>
            {ledger.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 16px',
                color: 'var(--text-4)',
                fontSize: '0.88rem',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-input)',
              }}>
                Open the valve slider to start metering — cryptographically signed attestations will stream here in real time.
              </div>
            ) : (
              ledger.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-input)',
                    padding: '10px 14px',
                    backgroundColor: 'var(--surface-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      {entry.time}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-strong)',
                        color: entry.ok ? '#22c55e' : '#ef4444',
                        borderColor: entry.ok ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      {entry.ok ? 'ATTESTED OK' : 'TAMPER FLAGGED'}
                    </span>
                  </div>

                  <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-1)', wordBreak: 'break-all' }}>
                    <span style={{ fontWeight: 700 }}>+{entry.delta.toFixed(2)} L</span>
                    <span style={{ color: 'var(--text-4)', margin: '0 6px' }}>&middot;</span>
                    {entry.txHash ? (
                      <a
                        href={getExplorerUrl(entry.txHash, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#00f0ff', textDecoration: 'none', fontWeight: 600 }}
                        title="View Confirmed Transaction on Solana Explorer"
                      >
                        TX: {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-6)} ↗
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-3)' }}>SIG: {entry.hash}</span>
                    )}
                  </div>

                  {entry.txHash && (
                    <div className="font-mono" style={{ fontSize: '0.72rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#22c55e', fontSize: '0.65rem', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>
                        ON-CHAIN CONFIRMED
                      </span>
                      <a
                        href={getExplorerUrl(entry.txHash, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-2)', textDecoration: 'underline' }}
                      >
                        Solana Tx: {entry.txHash.slice(0, 18)}... ↗
                      </a>
                      {publicKey && (
                        <a
                          href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--text-3)', textDecoration: 'none', marginLeft: 'auto' }}
                        >
                          Wallet: {publicKey.toBase58().slice(0, 4)}..{publicKey.toBase58().slice(-4)} ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-4)', borderTop: '1px solid var(--border)', paddingTop: '10px' }} className="font-mono">
            Calibration: YF-S201 Hall-Effect sensor (450 pulses/L, 1–30 L/min). Connected to Solana Program {PROGRAM_ID.toBase58().slice(0, 4)}..{PROGRAM_ID.toBase58().slice(-5)}.
          </div>
        </div>

      </div>
        </>
      )}

    </div>
  );
}
