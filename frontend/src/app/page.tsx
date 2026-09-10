'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { animate } from 'animejs';
import Navbar from '../components/Navbar';
import LandingView from '../components/LandingView';
import DashboardTab from '../components/DashboardTab';
import LeaderboardTab from '../components/LeaderboardTab';
import DonationTab from '../components/DonationTab';
import HardwareLabTab from '../components/HardwareLabTab';
import FaqTab from '../components/FaqTab';
import { getRelayerUrl, RELAYER_URL, PROGRAM_ID, SOLANA_NETWORK, getAddressExplorerUrl } from '../lib/solana';

export default function Page() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('landing');
  const [theme, setTheme] = useState<'dark' | 'light' | 'aqua'>('dark');
  const [relayerStats, setRelayerStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const devnetPillRef = useRef<HTMLSpanElement>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('hydrx_theme') as 'dark' | 'light' | 'aqua' | null;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'aqua')) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const cycle: Record<'dark' | 'light' | 'aqua', 'dark' | 'light' | 'aqua'> = {
      dark: 'light',
      light: 'aqua',
      aqua: 'dark',
    };
    const nextTheme = cycle[theme];
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('hydrx_theme', nextTheme);
  };

  // Subtle pulse animation on Solana Devnet badge
  useEffect(() => {
    if (!mounted) return;
    let anim: any;
    if (devnetPillRef.current) {
      anim = animate(devnetPillRef.current, {
        opacity: [0.75, 1, 0.75],
        duration: 3200,
        repeat: true,
        ease: 'easeInOut',
      });
    }
    return () => {
      anim?.pause?.();
    };
  }, [mounted, theme]);

  // Auto-switch tabs to dashboard when wallet connects from landing
  useEffect(() => {
    if (connected && activeTab === 'landing') {
      setActiveTab('dashboard');
    }
  }, [connected]);

  const fetchRelayerStats = async () => {
    try {
      const endpoint = getRelayerUrl();
      const res = await axios.get(`${endpoint}/api/stats`);
      if (res.data) {
        setRelayerStats(res.data);
      }
    } catch (err) {
      setRelayerStats((prev: any) => prev || {
        totalLitersTracked: 18.30,
        telemetriesCount: 14,
        activeDevicesCount: 8,
        recentLogs: []
      });
    }
  };

  useEffect(() => {
    fetchRelayerStats();
    const interval = setInterval(fetchRelayerStats, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--canvas)', color: 'var(--text-1)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="pill font-mono" style={{ fontSize: '0.82rem' }}>Loading HydrX Protocol...</span>
        </div>
      </div>
    );
  }

  // Allow open access to all tabs (Hardware Lab, Dashboard preview, Leaderboard, FAQ)
  const currentView = activeTab;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: 'var(--canvas)',
    }}>
      <div>
        <Navbar
          activeTab={currentView}
          setActiveTab={setActiveTab}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main style={{ padding: '32px 24px 80px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {/* AnimatePresence Tab Route Cross-Fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentView === 'landing' && (
                <LandingView
                  onOpenHardwareLab={() => setActiveTab('hardware')}
                  onOpenDashboard={() => setActiveTab('dashboard')}
                  relayerStats={relayerStats}
                />
              )}

              {currentView === 'dashboard' && (
                <DashboardTab
                  relayerStats={relayerStats}
                  onRefreshRelayer={fetchRelayerStats}
                />
              )}

              {currentView === 'hardware' && (
                <HardwareLabTab
                  relayerStats={relayerStats}
                  onRefreshRelayer={fetchRelayerStats}
                />
              )}

              {currentView === 'leaderboard' && (
                <LeaderboardTab
                  relayerStats={relayerStats}
                  onRefreshRelayer={fetchRelayerStats}
                />
              )}

              {(currentView === 'donation' || currentView === 'donations' || currentView === 'impact') && (
                <DonationTab />
              )}

              {currentView === 'faq' && (
                <FaqTab />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Strict Monochrome Minimalist Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        width: '100%',
        backgroundColor: 'var(--canvas)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.84rem',
          color: 'var(--text-3)',
        }}>
          <div>
            <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>HydrX Protocol</span>
            <span style={{ margin: '0 8px', color: 'var(--text-4)' }}>/</span>
            <span>Verifiable Global Water Conservation DePIN · Powered by MagicBlock &amp; Solana</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
            <a
              href="/corporate"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-2)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Corporate ESG ↗
            </a>

            <a
              href={getAddressExplorerUrl(PROGRAM_ID.toBase58())}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-1)', textDecoration: 'none' }}
            >
              Program: {PROGRAM_ID.toBase58().slice(0, 4)}...{PROGRAM_ID.toBase58().slice(-4)} ↗
            </a>

            <span
              ref={devnetPillRef}
              className="pill font-mono"
              style={{ fontSize: '0.72rem' }}
            >
              Cluster: {SOLANA_NETWORK}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
