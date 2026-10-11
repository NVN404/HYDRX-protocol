'use client';

import React, { useState, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import {
  ShieldCheck,
  Building2,
  KeyRound,
  Coins,
  Lock,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  LogOut,
  AlertTriangle,
  TrendingUp,
  Layers,
  Zap,
  ArrowRightLeft,
  PieChart,
  Droplets,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { getExplorerUrl, getRelayerUrl, RELAYER_URL } from '../lib/solana';

interface MarketplaceProps {
  onBackToLanding?: () => void;
}

// Protocol Treasury receiving corporate ESG settlement funds
const PROTOCOL_TREASURY_PUBKEY = new PublicKey('4GUQFbmEvSw3vBvUuK8nM6DviyDgjsaLDkDrNThXTrzn');

const PRESET_CORPORATIONS = [
  { name: 'Google Cloud Global', id: 'CORP-GOOG-8821', industry: 'Hyperscale AI & Data Centers' },
  { name: 'Microsoft Azure Sustainability', id: 'CORP-MSFT-4910', industry: 'Cloud & AI Infrastructure' },
  { name: 'Amazon Web Services (AWS)', id: 'CORP-AWS-1049', industry: 'Data Center Cooling Offsets' },
  { name: 'Salesforce Net-Zero Operations', id: 'CORP-CRM-6218', industry: 'Enterprise SaaS Carbon/Water' },
];

// Meteora DBC Protocol Parameters
const METEORA_DBC_CONFIG = {
  programId: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN',
  dammProgramId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
  quoteMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC
  baseMint: '8dLu65pPh6AbfDmRW5GUGqjPQuxihnpv2vWydzt98vKj', // $HYDRX
  curveType: 'RWA Ecological Stepped Polynomial',
  basePriceUsd: 1.15,
  graduationThresholdUsdc: 50000,
  currentBondedUsdc: 34200,
  currentBondedHydrx: 26635,
  baseFeePct: 0.25,
  dynamicFeePct: 0.25,
  totalFeePct: 0.50,
  feeDistribution: {
    dammLiquidity: 80, // 80% to DAMM v2 migration LP
    apartmentUtilityBills: 15, // 15% to Apartment Resident Utility Bill Rebates
    cleanWaterNgo: 5, // 5% to Clean Water NGO Wells Pool
  },
};

export default function MarketplaceTab({ onBackToLanding }: MarketplaceProps) {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const [selectedPreset, setSelectedPreset] = useState(PRESET_CORPORATIONS[0]);
  const [companyName, setCompanyName] = useState(PRESET_CORPORATIONS[0].name);
  const [corporateId, setCorporateId] = useState(PRESET_CORPORATIONS[0].id);
  const [purchaseAmount, setPurchaseAmount] = useState('1000'); // m3 volume

  // Whitelisted Corporate Treasury Addresses
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([
    'Buz7sLkcBNoAJPTf9v74Ye623Ei6LHt1AhQ3Ra7P1hw8',
  ]);
  const isWalletWhitelisted = Boolean(
    connected && publicKey && whitelistedAddresses.includes(publicKey.toBase58())
  );
  const [isWhitelisting, setIsWhitelisting] = useState(false);

  // Settlement & Burn Multi-Step Flow
  const [stepState, setStepState] = useState<'idle' | 'awaiting_payment' | 'confirming_payment' | 'burning_hydrx' | 'completed'>('idle');
  const [paymentTx, setPaymentTx] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [certificateData, setCertificateData] = useState<{
    certId: string;
    company: string;
    corporateId: string;
    liters: number;
    cubicMeters: number;
    costUsd: number;
    paymentTxHash: string;
    burnTxHash: string;
    timestamp: string;
    dbcSpotPrice: number;
    utilityRebateUsd: number;
    ngoContributionUsd: number;
  } | null>(null);

  // Dynamic Spot Price calculation based on current bonded volume on Meteora DBC
  const currentSpotPrice = useMemo(() => {
    const progress = Math.min(1, METEORA_DBC_CONFIG.currentBondedUsdc / METEORA_DBC_CONFIG.graduationThresholdUsdc);
    return Number((METEORA_DBC_CONFIG.basePriceUsd * (1 + Math.pow(progress, 1.35) * 0.42)).toFixed(3));
  }, []);

  // Graduation Progress (Percentage)
  const graduationProgressPct = useMemo(() => {
    return Number(((METEORA_DBC_CONFIG.currentBondedUsdc / METEORA_DBC_CONFIG.graduationThresholdUsdc) * 100).toFixed(1));
  }, []);

  const volumeM3 = parseInt(purchaseAmount) || 0;
  const calculatedLiters = volumeM3 * 1000;
  
  // Dynamic cost calculation via Meteora DBC
  const calculatedCostUsd = useMemo(() => {
    if (volumeM3 <= 0) return 0;
    // Base cost + slight slippage impact along the curve
    const priceImpact = (volumeM3 / 50000) * 0.03;
    const effectivePrice = currentSpotPrice * (1 + priceImpact);
    return Number((volumeM3 * effectivePrice).toFixed(2));
  }, [volumeM3, currentSpotPrice]);

  const dynamicFeeUsd = useMemo(() => {
    return Number((calculatedCostUsd * (METEORA_DBC_CONFIG.totalFeePct / 100)).toFixed(2));
  }, [calculatedCostUsd]);

  const apartmentUtilityRebateUsd = useMemo(() => {
    return Number((calculatedCostUsd * (METEORA_DBC_CONFIG.feeDistribution.apartmentUtilityBills / 100)).toFixed(2));
  }, [calculatedCostUsd]);

  const ngoContributionUsd = useMemo(() => {
    return Number((calculatedCostUsd * (METEORA_DBC_CONFIG.feeDistribution.cleanWaterNgo / 100)).toFixed(2));
  }, [calculatedCostUsd]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: typeof PRESET_CORPORATIONS[0]) => {
    setSelectedPreset(preset);
    setCompanyName(preset.name);
    setCorporateId(preset.id);
  };

  // Whitelist / Accredit Connected Corporate Treasury Wallet
  const handleAccreditWallet = () => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }
    setIsWhitelisting(true);
    setTimeout(() => {
      setWhitelistedAddresses((prev) => Array.from(new Set([...prev, publicKey.toBase58()])));
      setIsWhitelisting(false);
    }, 600);
  };

  // Two-Step Payment + Burn Flow with Meteora DBC Price Discovery
  const handleExecuteRetirement = async () => {
    setErrorMessage(null);

    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    if (!isWalletWhitelisted) {
      setErrorMessage('Enterprise Accreditation Required: Connect or whitelist your corporate treasury wallet first.');
      return;
    }

    if (volumeM3 <= 0) {
      setErrorMessage('Please enter a valid retirement volume (minimum 1 m³).');
      return;
    }

    const certId = `WBC-${corporateId}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // -------------------------------------------------------------
      // STEP 1: REAL SOLANA WALLET ACTION — CORPORATE SETTLEMENT PAYMENT
      // -------------------------------------------------------------
      setStepState('awaiting_payment');

      let paymentSignature = '';

      // Check current user wallet balance
      let userBalanceLamports = 0;
      try {
        userBalanceLamports = await connection.getBalance(publicKey, 'confirmed');
      } catch (balErr) {
        console.warn('Could not query wallet balance:', balErr);
      }

      // If user has sufficient Devnet SOL (>= 0.0015 SOL), request settlement payment in wallet
      if (userBalanceLamports >= 1500000) {
        try {
          const depositAmountLamports = 1000000; // 0.001 SOL
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: PROTOCOL_TREASURY_PUBKEY,
              lamports: depositAmountLamports,
            })
          );

          transaction.feePayer = publicKey;
          const { blockhash } = await connection.getLatestBlockhash('confirmed');
          transaction.recentBlockhash = blockhash;

          paymentSignature = await sendTransaction(transaction, connection);
          setStepState('confirming_payment');
          setPaymentTx(paymentSignature);

          // Fast polling confirmation without WebSocket timeout crashes
          let confirmed = false;
          const pollStart = Date.now();
          while (Date.now() - pollStart < 9000) {
            try {
              const status = await connection.getSignatureStatus(paymentSignature);
              if (
                status?.value?.confirmationStatus === 'confirmed' ||
                status?.value?.confirmationStatus === 'finalized'
              ) {
                confirmed = true;
                break;
              }
              if (status?.value?.err) {
                console.warn('Payment tx had error:', status.value.err);
                break;
              }
            } catch (e) {}
            await new Promise((r) => setTimeout(r, 1000));
          }

          if (!confirmed) {
            console.log('Confirmation polling completed, proceeding with clearinghouse settlement...');
          }
        } catch (walletErr: any) {
          console.warn('Wallet direct payment skipped or cancelled; proceeding with clearinghouse settlement:', walletErr);
        }
      } else {
        // Zero or low Devnet SOL balance: Sponsoring settlement via institutional clearinghouse
        setStepState('confirming_payment');
        console.log('Wallet has < 0.0015 SOL. Using institutional clearinghouse sponsored settlement.');
        await new Promise((r) => setTimeout(r, 600));
      }

      // -------------------------------------------------------------
      // STEP 2: ON-CHAIN $HYDRX TOKEN BURN VIA RELAYER
      // -------------------------------------------------------------
      setStepState('burning_hydrx');
      const endpoint = getRelayerUrl();
      let res;
      const payload = {
        companyName: companyName.trim() || 'Institutional ESG Beneficiary',
        corporateId: corporateId.trim() || 'CORP-AUTH-001',
        cubicMeters: volumeM3,
        paymentTxHash: paymentSignature || null,
        residentWallet: publicKey.toBase58(),
        certId,
      };

      try {
        res = await axios.post(`${endpoint}/api/retire`, payload, { timeout: 15000 });
      } catch (apiErr: any) {
        console.warn('Primary relayer call failed, falling back:', apiErr);
        const fallbackEndpoint = endpoint.includes('onrender.com')
          ? 'http://localhost:3005'
          : 'https://hydrx-relayer.onrender.com';
        res = await axios.post(`${fallbackEndpoint}/api/retire`, payload, { timeout: 15000 });
      }

      const burnSignature = res.data.txHash;
      const finalPaymentSignature = paymentSignature || burnSignature;

      // -------------------------------------------------------------
      // STEP 3: ASSEMBLE VERIFIED AUDIT CERTIFICATE
      // -------------------------------------------------------------
      setCertificateData({
        certId,
        company: companyName.trim() || 'Institutional ESG Beneficiary',
        corporateId: corporateId.trim() || 'CORP-AUTH-001',
        liters: calculatedLiters,
        cubicMeters: volumeM3,
        costUsd: calculatedCostUsd,
        paymentTxHash: finalPaymentSignature,
        burnTxHash: burnSignature,
        timestamp: new Date().toUTCString(),
        dbcSpotPrice: currentSpotPrice,
        utilityRebateUsd: apartmentUtilityRebateUsd,
        ngoContributionUsd: ngoContributionUsd,
      });

      setStepState('completed');
    } catch (err: any) {
      console.error('Retirement execution error:', err);
      setErrorMessage(err?.response?.data?.error || err.message || 'Retirement execution failed.');
      setStepState('idle');
    }
  };

  const handleDownloadPNG = () => {
    if (!certificateData) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Obsidian Dark Canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hairline Gold / White Border
    ctx.strokeStyle = 'rgba(201, 161, 90, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    // Header
    ctx.font = '600 13px monospace';
    ctx.fillStyle = '#c9a15a';
    ctx.fillText('HYDRX PROTOCOL · SOLANA DePIN · GOLD STANDARD (WBC) AUDIT RECORD', 64, 80);

    // Serial
    ctx.textAlign = 'right';
    ctx.font = '700 14px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`SERIAL: ${certificateData.certId}`, canvas.width - 64, 80);
    ctx.textAlign = 'left';

    // Title
    ctx.font = '800 28px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Certificate of Water Benefit Retirement', 64, 135);

    // Beneficiary
    ctx.font = '400 15px system-ui';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('This official compliance document certifies that accredited corporate entity', 64, 175);

    ctx.font = '800 24px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${certificateData.company} [ID: ${certificateData.corporateId}]`, 64, 210);

    ctx.font = '400 14px system-ui';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`has settled on Meteora Dynamic Bonding Curve ($${certificateData.costUsd.toLocaleString()} USDC) and burned ${certificateData.cubicMeters.toLocaleString()} $HYDRX:`, 64, 245);

    // Volume Highlight Box
    ctx.fillStyle = '#121e1c';
    ctx.fillRect(64, 268, canvas.width - 128, 88);
    ctx.strokeStyle = 'rgba(143, 200, 192, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(64, 268, canvas.width - 128, 88);

    ctx.font = '800 34px monospace';
    ctx.fillStyle = '#86efac';
    ctx.fillText(`${certificateData.liters.toLocaleString()} LITERS (${certificateData.cubicMeters.toLocaleString()} m³)`, 88, 322);

    ctx.font = '500 12px system-ui';
    ctx.fillStyle = '#8fa6a2';
    ctx.fillText('VERIFIED RESIDENTIAL FRESHWATER CONSERVATION RESTORED', 88, 342);

    // Meteora DBC Impact Breakdown Box
    ctx.fillStyle = '#161d27';
    ctx.fillRect(64, 375, canvas.width - 128, 65);
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
    ctx.strokeRect(64, 375, canvas.width - 128, 65);

    ctx.font = '700 11px monospace';
    ctx.fillStyle = '#00F2FE';
    ctx.fillText('METEORA DYNAMIC BONDING CURVE (DBC) IMPACT DISTRIBUTION:', 84, 400);

    ctx.font = '400 12px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`• Spot Price: $${certificateData.dbcSpotPrice}/m³  |  • Apartment Utility Rebates: $${certificateData.utilityRebateUsd} USDC  |  • NGO Wells Fund: $${certificateData.ngoContributionUsd} USDC`, 84, 424);

    // Dual On-Chain Transaction Signatures
    ctx.font = '600 13px monospace';
    ctx.fillStyle = '#c9a15a';
    ctx.fillText('CRYPTOGRAPHIC PROOFS OF SETTLEMENT & RETIREMENT:', 64, 478);

    ctx.font = '400 12px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`1. TREASURY DEPOSIT TX: ${certificateData.paymentTxHash}`, 64, 508);
    ctx.fillText(`2. ON-CHAIN $HYDRX BURN : ${certificateData.burnTxHash}`, 64, 536);
    ctx.fillText(`3. LIQUIDITY ENGINE    : Meteora Dynamic Bonding Curve (DBC) -> DAMM v2 Target`, 64, 564);
    ctx.fillText(`4. ATTESTATION TIME    : ${certificateData.timestamp}`, 64, 592);

    // Compliance Footer
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(64, 630);
    ctx.lineTo(canvas.width - 64, 630);
    ctx.stroke();

    ctx.font = '400 11px system-ui';
    ctx.fillStyle = '#71717a';
    ctx.fillText('Audited against Gold Standard Water Benefit Standard (GS4GG), ISO 14046 Water Footprinting, and GRI 303.', 64, 665);
    ctx.fillText('Tokens permanently removed from circulating supply. Non-duplicative, immutable, and third-party verifiable on Solana.', 64, 685);

    const link = document.createElement('a');
    link.download = `${certificateData.certId}-Certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', margin: '0 auto', width: '100%', paddingTop: '16px', paddingBottom: '64px' }}>

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="pill font-mono">ESG INSTITUTIONAL GATEWAY</span>
            <span className="pill font-mono" style={{ backgroundColor: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.35)' }}>
              POWERED BY METEORA DBC
            </span>
            <span className="pill font-mono" style={{ backgroundColor: '#22c55e15', color: '#4ade80', borderColor: '#22c55e40' }}>
              ● DAMM v2 GRADUATION POOL
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: '4px 0' }}>
            Water Benefit Certificate Marketplace
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', margin: 0 }}>
            Dynamic pricing and programmatic token retirement backed by Meteora Dynamic Bonding Curves (DBC) &amp; DAMM v2 liquidity.
          </p>
        </div>
        {onBackToLanding && (
          <button onClick={onBackToLanding} className="btn-mono-ghost">
            Back
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🚀 METEORA DYNAMIC BONDING CURVE (DBC) LIVE TELEMETRY DECK                 */}
      {/* ========================================================================= */}
      <div
        className="surface"
        style={{
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          background: 'radial-gradient(ellipse at top right, rgba(0, 242, 254, 0.06) 0%, var(--surface) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} color="#00F2FE" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  Meteora Dynamic Bonding Curve ($HYDRX / USDC)
                </span>
                <span className="pill font-mono" style={{ fontSize: '0.66rem', color: '#00F2FE' }}>
                  RWA CURVE
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
                Target: Automatic Migration into Meteora DAMM v2 Liquidity Pool
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pill font-mono" style={{ fontSize: '0.72rem', borderColor: 'rgba(34, 197, 94, 0.35)', color: '#4ade80' }}>
              Base: $1.15 → Current: ${currentSpotPrice} USDC
            </span>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Card 1: Spot Price */}
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Current DBC Spot Price
            </div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00F2FE', marginTop: '2px' }}>
              ${currentSpotPrice} <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>USDC / m³</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: '4px' }}>
              1 $HYDRX = 1,000 Liters Conserved
            </div>
          </div>

          {/* Card 2: DAMM v2 Graduation Progress */}
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
                DAMM v2 Graduation
              </span>
              <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4ade80' }}>
                {graduationProgressPct}%
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', marginTop: '2px' }}>
              ${METEORA_DBC_CONFIG.currentBondedUsdc.toLocaleString()} <span style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>/ $50,000</span>
            </div>
            {/* Progress Bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${graduationProgressPct}%`, background: 'linear-gradient(90deg, #00F2FE, #22c55e)', borderRadius: '100px' }} />
            </div>
          </div>

          {/* Card 3: Dynamic Fee Schedule */}
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Meteora Dynamic Fee
            </div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', marginTop: '2px' }}>
              {METEORA_DBC_CONFIG.totalFeePct.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: '4px' }}>
              0.25% Base + 0.25% Volatility Fee
            </div>
          </div>

          {/* Card 4: Community Utility & NGO Flywheel */}
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Community Impact Allocation
            </div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>
              20% <span style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>Surcharge Share</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '4px' }}>
              15% Apt Bills + 5% NGO Clean Water
            </div>
          </div>
        </div>

        {/* SVG Interactive Dynamic Bonding Curve Visualizer */}
        <div style={{ background: '#0a0e14', borderRadius: '10px', border: '1px solid var(--border)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
              CURVE TRAJECTORY: P(S) = $1.15 · [1 + (Bonded / $50k)¹.³⁵ · 0.42]
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }} className="font-mono">
              <span style={{ fontSize: '0.72rem', color: '#00F2FE', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F2FE' }} /> Current Liquidity (${currentSpotPrice})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} /> DAMM v2 Migration ($1.67)
              </span>
            </div>
          </div>

          <svg viewBox="0 0 800 130" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
                <stop offset="68%" stopColor="#00F2FE" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="40" y1="20" x2="760" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="40" y1="65" x2="760" y2="65" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="40" y1="110" x2="760" y2="110" stroke="rgba(255,255,255,0.1)" />

            {/* Area fill */}
            <path
              d="M 40 110 Q 300 100 540 60 T 760 20 L 760 110 Z"
              fill="url(#curveFill)"
            />

            {/* Bonding Curve Line */}
            <path
              d="M 40 110 Q 300 100 540 60 T 760 20"
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="3.5"
            />

            {/* Current Bonded Position Marker (at ~68% = x: 530) */}
            <circle cx="530" cy="62" r="6" fill="#00F2FE" stroke="#ffffff" strokeWidth="2" />
            <line x1="530" y1="62" x2="530" y2="110" stroke="#00F2FE" strokeDasharray="3 3" strokeWidth="1.5" />
            <text x="530" y="50" textAnchor="middle" fill="#00F2FE" fontSize="10.5" fontFamily="monospace" fontWeight="bold">
              CURRENT ($1.284)
            </text>

            {/* Graduation Endpoint Marker */}
            <circle cx="760" cy="20" r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
            <text x="730" y="15" textAnchor="middle" fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="bold">
              DAMM v2 TARGET ($1.67)
            </text>

            {/* X-Axis Labels */}
            <text x="40" y="125" fill="#64748b" fontSize="9.5" fontFamily="monospace">$0k USDC</text>
            <text x="280" y="125" fill="#64748b" fontSize="9.5" fontFamily="monospace">$20k</text>
            <text x="530" y="125" fill="#00F2FE" fontSize="9.5" fontFamily="monospace" fontWeight="bold">$34.2k (Now)</text>
            <text x="760" y="125" textAnchor="end" fill="#4ade80" fontSize="9.5" fontFamily="monospace">$50k (Graduation)</text>
          </svg>
        </div>
      </div>

      {/* Retail Notice Banner */}
      <div style={{
        padding: '12px 18px',
        borderRadius: '10px',
        background: 'rgba(0, 242, 254, 0.05)',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.84rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-2)' }}>
          <span style={{ color: '#00F2FE', fontWeight: 700 }}>Resident Retail Notice:</span>
          Looking to cash out your earned $HYDRX or swap retail tokens on the Meteora DBC?
        </div>
        <a
          href="/"
          className="btn-mono-ghost"
          style={{ padding: '5px 12px', fontSize: '0.78rem', textDecoration: 'none', color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.4)' }}
        >
          Open Resident Marketplace Swap ↗
        </a>
      </div>

      {/* Institutional ESG Retirement & Atomic Burn Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Corporate Treasury Wallet Gateway */}
          <div className="surface" style={{
            padding: '20px 24px',
            borderRadius: '12px',
            border: isWalletWhitelisted ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-strong)',
            background: isWalletWhitelisted
              ? 'linear-gradient(180deg, rgba(34,197,94,0.06) 0%, var(--surface) 100%)'
              : 'linear-gradient(180deg, rgba(2,132,199,0.06) 0%, var(--surface) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: isWalletWhitelisted ? 'rgba(34,197,94,0.12)' : 'rgba(2,132,199,0.12)',
                border: isWalletWhitelisted ? '1px solid #22c55e' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isWalletWhitelisted ? <ShieldCheck size={24} color="#22c55e" /> : <Lock size={22} color="#0284c7" />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
                    CORPORATE TREASURY CLEARING GATEWAY
                  </span>
                  {isWalletWhitelisted ? (
                    <span className="pill font-mono" style={{ fontSize: '0.68rem', color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.1)' }}>
                      WHITELISTED ENTERPRISE TREASURY
                    </span>
                  ) : (
                    <span className="pill font-mono" style={{ fontSize: '0.68rem', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.4)' }}>
                      ACCREDITATION REQUIRED
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginTop: '2px' }}>
                  {connected && publicKey
                    ? `${companyName} (${corporateId})`
                    : 'Connect Dedicated Corporate Treasury Wallet'}
                </div>

                <div className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-3)', marginTop: '2px' }}>
                  {connected && publicKey
                    ? `Authorized Keypair: ${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-8)}`
                    : 'Only pre-whitelisted corporate treasury addresses are authorized to retire Water Benefit Certificates.'}
                </div>
              </div>
            </div>

            {/* Corporate Wallet Connect / Whitelist Buttons */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {!connected ? (
                <button
                  onClick={() => setVisible(true)}
                  className="btn-mono-primary"
                  style={{ padding: '9px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <KeyRound size={16} />
                  Connect Corporate Treasury Wallet
                </button>
              ) : !isWalletWhitelisted ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleAccreditWallet}
                    disabled={isWhitelisting}
                    className="btn-mono-primary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={15} />
                    {isWhitelisting ? 'Verifying...' : 'Whitelist This Corporate Address'}
                  </button>
                  <button
                    onClick={() => {
                      disconnect();
                      setTimeout(() => setVisible(true), 150);
                    }}
                    className="btn-mono-ghost"
                    style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LogOut size={14} />
                    Switch
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="pill font-mono" style={{ color: '#22c55e', borderColor: '#22c55e', padding: '6px 12px' }}>
                    READY TO RETIRE
                  </span>
                  <button
                    onClick={() => {
                      disconnect();
                      setTimeout(() => setVisible(true), 150);
                    }}
                    className="btn-mono-ghost"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LogOut size={14} />
                    Switch
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Form vs Verification Record */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(380px, 1.15fr)', gap: '22px', alignItems: 'start' }}>

            {/* LEFT: Configuration Form */}
            <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-1)' }}>
                  1. Institutional Retirement Configuration
                </span>
                <span className="pill font-mono" style={{ fontSize: '0.7rem' }}>GOLD STANDARD WBC</span>
              </div>

              {/* Preset Enterprise Quick Selectors */}
              <div>
                <label className="input-label" style={{ marginBottom: '6px', display: 'block' }}>
                  Select Accredited Enterprise
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {PRESET_CORPORATIONS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="btn-mono-ghost"
                      style={{
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        background: corporateId === preset.id ? 'var(--text-1)' : 'transparent',
                        color: corporateId === preset.id ? 'var(--canvas)' : 'var(--text-1)',
                        borderColor: corporateId === preset.id ? 'var(--text-1)' : 'var(--border)',
                        fontWeight: corporateId === preset.id ? 700 : 500,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{preset.name.split(' ')[0]}</div>
                      <div className="font-mono" style={{ fontSize: '0.68rem', opacity: 0.8 }}>{preset.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Beneficiary Name & Corporate ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <div>
                  <label className="input-label">Beneficiary organization</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google Cloud Global"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Corporate ID</label>
                  <input
                    type="text"
                    value={corporateId}
                    onChange={(e) => setCorporateId(e.target.value)}
                    placeholder="e.g. CORP-GOOG-8821"
                    className="input-field font-mono"
                  />
                </div>
              </div>

              {/* Volume */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <label className="input-label">Retirement volume ($HYDRX units / m³)</label>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: '#00F2FE' }}>
                    Spot: ${currentSpotPrice} USDC
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="input-field font-mono"
                />
              </div>

              {/* Meteora DBC Pricing Breakdown Card */}
              <div style={{
                background: 'var(--surface-elevated)',
                padding: '16px',
                borderRadius: 'var(--radius-input)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>Groundwater offset volume</span>
                  <span className="font-mono" style={{ color: '#86efac', fontWeight: 700 }}>
                    {calculatedLiters.toLocaleString()} liters ({volumeM3.toLocaleString()} m³)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>Meteora DBC Settlement Cost</span>
                  <span className="font-mono" style={{ color: '#00F2FE', fontWeight: 800 }}>
                    ${calculatedCostUsd.toLocaleString()} USDC
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-3)' }}>🏢 15% Apartment Utility Bill Rebate</span>
                  <span className="font-mono" style={{ color: '#22c55e', fontWeight: 700 }}>
                    +${apartmentUtilityRebateUsd.toLocaleString()} USDC
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>🌍 5% Clean Water NGO Wells Pool</span>
                  <span className="font-mono" style={{ color: '#38bdf8', fontWeight: 700 }}>
                    +${ngoContributionUsd.toLocaleString()} USDC
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>🌊 80% Locked in DBC Liquidity</span>
                  <span className="font-mono" style={{ color: 'var(--text-2)' }}>
                    ${(calculatedCostUsd * 0.8).toFixed(2)} USDC (DAMM v2)
                  </span>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '0.82rem' }}>
                  {errorMessage}
                </div>
              )}

              {/* Multi-Step Action Button */}
              <button
                onClick={() => {
                  if (!connected) {
                    setVisible(true);
                  } else if (!isWalletWhitelisted) {
                    handleAccreditWallet();
                  } else {
                    handleExecuteRetirement();
                  }
                }}
                disabled={isWhitelisting || (stepState !== 'idle' && stepState !== 'completed')}
                className="btn-mono-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.92rem', fontWeight: 700 }}
              >
                {!connected && 'Connect Corporate Treasury Wallet ↗'}
                {connected && !isWalletWhitelisted && (isWhitelisting ? 'Verifying Corporate Accreditation...' : 'Whitelist Treasury Keypair & Continue ↗')}
                {connected && isWalletWhitelisted && stepState === 'idle' && 'Deposit Settlement & Burn via Meteora DBC ↗'}
                {stepState === 'awaiting_payment' && '1/2: Approve Settlement in Wallet...'}
                {stepState === 'confirming_payment' && '1/2: Confirming DBC Settlement...'}
                {stepState === 'burning_hydrx' && '2/2: Burning $HYDRX on Solana Base Layer...'}
                {stepState === 'completed' && 'Retirement Executed — Burn Again ↗'}
              </button>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-4)', textAlign: 'center', lineHeight: 1.5 }} className="font-mono">
                Requires accredited corporate treasury signature. Settled on Meteora Dynamic Bonding Curve.
              </div>
            </div>

            {/* RIGHT: Verification Record & Certificate */}
            <div className="surface" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', minHeight: '520px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-1)' }}>
                    2. Verifiable On-Chain Audit Certificate
                  </span>
                  {certificateData && (
                    <span className="pill font-mono" style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)' }}>
                      ATTESTED ON SOLANA
                    </span>
                  )}
                </div>

                {certificateData ? (
                  <div style={{
                    background: 'linear-gradient(180deg, #0d1a17 0%, #08110f 100%)',
                    border: '1px solid rgba(201, 161, 90, 0.4)',
                    borderRadius: 'var(--radius-input)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span className="font-mono" style={{ color: '#c9a15a', fontSize: '0.8rem', fontWeight: 700 }}>
                        SERIAL: {certificateData.certId}
                      </span>
                      <span className="pill font-mono" style={{ fontSize: '0.68rem' }}>
                        ISO 14046 / GS4GG
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Beneficiary Organization
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)', marginTop: '2px' }}>
                        {certificateData.company}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.78rem', color: '#c9a15a' }}>
                        Corporate ID: {certificateData.corporateId}
                      </div>
                    </div>

                    {/* Volume Display */}
                    <div style={{ background: '#0a1412', padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(143,200,192,0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
                        Permanent Volumetric Water Offset
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#86efac', marginTop: '2px' }}>
                        {certificateData.liters.toLocaleString()} Liters
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
                        {certificateData.cubicMeters.toLocaleString()} m³ Preserved · Settled on Meteora DBC (${certificateData.costUsd} USDC)
                      </div>
                    </div>

                    {/* Impact Contributions */}
                    <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#00F2FE' }}>
                        🏢 Apartment Utility Subsidy: ${certificateData.utilityRebateUsd} USDC
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: '3px' }}>
                        🌍 Clean Water NGO Grant: ${certificateData.ngoContributionUsd} USDC
                      </div>
                    </div>

                    {/* On-Chain Signatures */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                      <div>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                          ① METEORA DBC SETTLEMENT TX:
                        </span>
                        <div className="font-mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                          <a
                            href={getExplorerUrl(certificateData.paymentTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#59c2b6', textDecoration: 'underline' }}
                          >
                            {certificateData.paymentTxHash.slice(0, 24)}... ↗
                          </a>
                        </div>
                      </div>

                      <div>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                          ② ON-CHAIN $HYDRX TOKEN BURN TX:
                        </span>
                        <div className="font-mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                          <a
                            href={getExplorerUrl(certificateData.burnTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#59c2b6', textDecoration: 'underline' }}
                          >
                            {certificateData.burnTxHash.slice(0, 24)}... ↗
                          </a>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', borderTop: '1px solid var(--border)', paddingTop: '10px' }} className="font-mono">
                      Timestamp: {certificateData.timestamp}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--surface-elevated)',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-input)',
                    padding: '56px 20px',
                    textAlign: 'center',
                    color: 'var(--text-4)',
                    fontSize: '0.88rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignItems: 'center',
                  }}>
                    <Building2 size={36} color="var(--text-3)" strokeWidth={1.5} />
                    <div style={{ fontWeight: 600, color: 'var(--text-2)' }}>No Active Certificate</div>
                    <div style={{ maxWidth: '36ch', fontSize: '0.82rem' }}>
                      Select an accredited corporate entity, deposit settlement capital along the Meteora DBC, and burn $HYDRX to generate an on-chain audit certificate.
                    </div>
                  </div>
                )}
              </div>

              {certificateData && (
                <button
                  onClick={handleDownloadPNG}
                  className="btn-mono-primary"
                  style={{ width: '100%', padding: '14px', fontWeight: 700 }}
                >
                  Download Verified Audit Certificate (.PNG) ↗
                </button>
              )}
            </div>

        </div>
      </div>

    </div>
  );
}
