'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketplaceTab from '../../components/MarketplaceTab';
import HydrXLogo from '../../components/HydrXLogo';
import { ShieldCheck, ArrowLeft, Sun, Moon, Droplets } from 'lucide-react';

export default function CorporatePortalPage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'aqua'>('dark');
  const [mounted, setMounted] = useState(false);

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
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'aqua' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('hydrx_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--canvas)', color: 'var(--text-1)' }}>
        <span className="pill font-mono">Loading Institutional Portal...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--canvas)' }}>
      <div>
        {/* Dedicated Institutional Top Navigation Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            backgroundColor: 'var(--canvas)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Left: Brand & Return to Resident Portal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/"
              className="btn-mono-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.82rem', textDecoration: 'none' }}
              title="Return to Public Resident App"
            >
              <ArrowLeft size={14} />
              Public Network
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HydrXLogo size={28} color="var(--text-1)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
                  HydrX Protocol
                </span>
                <span className="font-mono" style={{ fontSize: '0.66rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
                  Institutional ESG Gateway
                </span>
              </div>
            </div>
          </div>

          {/* Center: Compliance Badge */}
          <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="md-flex">
            <span className="pill font-mono" style={{ fontSize: '0.7rem', borderColor: 'rgba(34,197,94,0.4)', color: '#22c55e', background: 'rgba(34,197,94,0.08)' }}>
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              GS4GG · ISO 14046 AUDIT COMPLIANT
            </span>
          </div>

          {/* Right: Theme Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleToggleTheme}
              className="btn-mono-ghost"
              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Toggle Theme"
            >
              {theme === 'dark' && <><Moon size={13} /> Dark</>}
              {theme === 'light' && <><Sun size={13} /> Light</>}
              {theme === 'aqua' && <><Droplets size={13} /> Aqua</>}
            </button>
          </div>
        </header>

        {/* Main Content: Institutional Marketplace */}
        <main style={{ padding: '24px 24px 80px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <MarketplaceTab onBackToLanding={() => { window.location.href = '/'; }} />
        </main>
      </div>

      {/* Institutional Enterprise Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: 'var(--canvas)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
            HydrX Protocol Institutional Clearinghouse · Program ID: 7TyAbEpq...8zzrZ
          </span>
          <span className="pill font-mono" style={{ fontSize: '0.68rem' }}>
            Enterprise Treasury Mode
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/"
            style={{ fontSize: '0.78rem', color: 'var(--text-2)', textDecoration: 'none' }}
          >
            ← Public Resident App
          </Link>
          <a
            href="https://explorer.solana.com/address/7TyAbEpqchj9FXQVb8YJmy6VZ6nb2VxwjBGMMCY8zzrZ?cluster=devnet"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.78rem', color: 'var(--text-2)', textDecoration: 'none' }}
          >
            Solana Devnet Explorer ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
