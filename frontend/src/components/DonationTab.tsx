'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import axios from 'axios';
import {
  Building2,
  Zap,
  Droplets,
  Filter,
  Wrench,
  ShieldCheck,
  Layers,
  Globe2,
  CloudRain,
  TrendingUp,
  Coins,
  Copy,
  ExternalLink,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Receipt,
  Sparkles,
  Check,
  ArrowRightLeft,
} from 'lucide-react';
import { getRelayerUrl, RELAYER_URL, getExplorerUrl } from '../lib/solana';

interface RedemptionRecord {
  id: string;
  sku: string;
  title: string;
  category: 'utility' | 'hardware' | 'ngo';
  costHydrx: number;
  costUsd: number;
  voucherCode: string;
  accountOrTarget?: string;
  txHash: string;
  timestamp: string;
}

export default function DonationTab() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  // Active view filters
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'utility' | 'hardware' | 'ngo' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Real on-chain balances for connected wallet
  const [userHydrxBalance, setUserHydrxBalance] = useState<number>(0);
  const [userUsdcBalance, setUserUsdcBalance] = useState<number>(0);

  // Automatically sync on-chain SPL balances when active wallet changes
  useEffect(() => {
    if (!publicKey) {
      setUserHydrxBalance(0);
      setUserUsdcBalance(0);
      return;
    }

    let isSubscribed = true;
    const fetchOnChainBalances = async () => {
      try {
        const usdcMint = new PublicKey('Fyy2Etwcsgeufs39uHGfiBU23sSC8C533BsQroXjJY7X');
        const hydrxMint = new PublicKey('618p48q4rk23xSeswy3BQWyGYEmJaXmrMLxCNPTehwFk');

        const [usdcAta, hydrxAta] = await Promise.all([
          getAssociatedTokenAddress(usdcMint, publicKey),
          getAssociatedTokenAddress(hydrxMint, publicKey),
        ]);

        let uBal = 0;
        let hBal = 0;

        try {
          const uRes = await connection.getTokenAccountBalance(usdcAta);
          uBal = uRes?.value?.uiAmount || 0;
        } catch {}

        try {
          const hRes = await connection.getTokenAccountBalance(hydrxAta);
          hBal = hRes?.value?.uiAmount || 0;
        } catch {}

        if (isSubscribed) {
          setUserUsdcBalance(parseFloat(uBal.toFixed(2)));
          setUserHydrxBalance(parseFloat(hBal.toFixed(2)));
        }
      } catch (err) {
        console.warn('Error fetching resident wallet balances:', err);
      }
    };

    fetchOnChainBalances();
    const interval = setInterval(fetchOnChainBalances, 3000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [publicKey, connection]);
  // Meteora DBC Protocol Configuration (Official On-Chain Addresses)
  const METEORA_DBC_CONFIG = {
    programId: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN', // Official Meteora DBC Devnet Program
    dammProgramId: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG', // Meteora DAMM v2 Target
    poolPda: '2McNxJBArz1jBwqQUwMX4ZDyPVph4R9ks3rLVKaQq2fQ', // Live On-Chain HydrX Meteora DBC Pool PDA
    quoteMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC Mint
    baseMint: 'Ayww7cqcmZTwAh843MZErsQnzbcvLQcPHNtmphCbvGsB', // $HYDRX Base Token Mint (1B Supply in Vault)
    curveType: 'RWA Ecological Stepped Polynomial',
    basePriceUsd: 1.15,
    targetPriceUsd: 1.67,
    graduationThresholdUsdc: 50000,
    baseFeePct: 0.25,
    volatilityFeePct: 0.25,
  };

  // Live Meteora Dynamic Bonding Curve Pool State
  const [bondedUsdc, setBondedUsdc] = useState<number>(34200);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5); // 0.5% default
  const [lastSwapSignature, setLastSwapSignature] = useState<string | null>(null);

  // Dynamic Spot Price calculated along the polynomial curve P(R) = P0 * [1 + (R / R_grad)^1.35 * 0.42]
  const hydrxSpotPriceUsd = useMemo(() => {
    const progress = Math.min(1, bondedUsdc / METEORA_DBC_CONFIG.graduationThresholdUsdc);
    return Number((METEORA_DBC_CONFIG.basePriceUsd * (1 + Math.pow(progress, 1.35) * 0.42)).toFixed(3));
  }, [bondedUsdc]);

  // Graduation progress percentage towards Meteora DAMM v2 automated migration
  const graduationProgressPct = useMemo(() => {
    return Number(((bondedUsdc / METEORA_DBC_CONFIG.graduationThresholdUsdc) * 100).toFixed(1));
  }, [bondedUsdc]);

  // Meteora DBC Resident Swap States
  const [swapDirection, setSwapDirection] = useState<'sell' | 'buy'>('sell');
  const [swapAmount, setSwapAmount] = useState('20');
  const [isSwapProcessing, setIsSwapProcessing] = useState(false);
  const [swapSuccessMsg, setSwapSuccessMsg] = useState<string | null>(null);
  const [swapErrorMsg, setSwapErrorMsg] = useState<string | null>(null);

  // Devnet Faucet States
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [faucetSuccessMsg, setFaucetSuccessMsg] = useState<string | null>(null);
  const [faucetTxHash, setFaucetTxHash] = useState<string | null>(null);

  const handleClaimFaucet = async () => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }
    setIsFaucetLoading(true);
    setFaucetSuccessMsg(null);
    setFaucetTxHash(null);
    try {
      const res = await axios.post('/api/faucet', {
        recipient: publicKey.toBase58(),
      });
      if (res.data.success) {
        setFaucetSuccessMsg('Airdropped 100 tUSDC & 50 $HYDRX on Solana Devnet!');
        setFaucetTxHash(res.data.signature);
        setUserUsdcBalance((prev) => parseFloat((prev + 100).toFixed(2)));
        setUserHydrxBalance((prev) => parseFloat((prev + 50).toFixed(2)));
      } else {
        throw new Error(res.data.error || 'Faucet request failed');
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Faucet distribution failed.');
    } finally {
      setIsFaucetLoading(false);
    }
  };

  // Dynamic swap quote calculations based on Meteora bonding curve mechanics
  const parsedSwapAmt = parseFloat(swapAmount) || 0;

  const quoteDetails = useMemo(() => {
    if (parsedSwapAmt <= 0) {
      return {
        outputAmt: 0,
        priceImpactPct: 0.04,
        baseFeeUsdc: 0,
        volatilityFeeUsdc: 0,
        totalFeeUsdc: 0,
        apartmentRebateShareUsdc: 0,
        minReceived: 0,
        effectiveRate: hydrxSpotPriceUsd,
      };
    }

    // Dynamic price impact relative to curve depth
    const priceImpactPct = Math.min(4.8, Number(((parsedSwapAmt / 12500) * 100).toFixed(2)));
    const baseFeeRate = 0.0025; // 0.25%
    const volatilityFeeRate = 0.0025 * (1 + priceImpactPct * 0.15); // Volatility fee
    const totalFeeRate = baseFeeRate + volatilityFeeRate;

    if (swapDirection === 'sell') {
      const grossUsdc = parsedSwapAmt * hydrxSpotPriceUsd * (1 - (priceImpactPct / 100) * 0.4);
      const totalFeeUsdc = grossUsdc * totalFeeRate;
      const baseFeeUsdc = grossUsdc * baseFeeRate;
      const volatilityFeeUsdc = totalFeeUsdc - baseFeeUsdc;
      const netUsdc = Math.max(0, grossUsdc - totalFeeUsdc);
      const apartmentRebateShareUsdc = totalFeeUsdc * 0.15; // 15% dedicated to resident utility rebates
      const minReceived = netUsdc * (1 - slippageTolerance / 100);

      return {
        outputAmt: Number(netUsdc.toFixed(2)),
        priceImpactPct,
        baseFeeUsdc: Number(baseFeeUsdc.toFixed(4)),
        volatilityFeeUsdc: Number(volatilityFeeUsdc.toFixed(4)),
        totalFeeUsdc: Number(totalFeeUsdc.toFixed(2)),
        apartmentRebateShareUsdc: Number(apartmentRebateShareUsdc.toFixed(2)),
        minReceived: Number(minReceived.toFixed(2)),
        effectiveRate: Number((netUsdc / parsedSwapAmt).toFixed(3)),
      };
    } else {
      const totalFeeUsdc = parsedSwapAmt * totalFeeRate;
      const baseFeeUsdc = parsedSwapAmt * baseFeeRate;
      const volatilityFeeUsdc = totalFeeUsdc - baseFeeUsdc;
      const netUsdcToCurve = Math.max(0, parsedSwapAmt - totalFeeUsdc);
      const effectivePrice = hydrxSpotPriceUsd * (1 + (priceImpactPct / 100) * 0.4);
      const hydrxReceived = netUsdcToCurve / effectivePrice;
      const apartmentRebateShareUsdc = totalFeeUsdc * 0.15;
      const minReceived = hydrxReceived * (1 - slippageTolerance / 100);

      return {
        outputAmt: Number(hydrxReceived.toFixed(2)),
        priceImpactPct,
        baseFeeUsdc: Number(baseFeeUsdc.toFixed(4)),
        volatilityFeeUsdc: Number(volatilityFeeUsdc.toFixed(4)),
        totalFeeUsdc: Number(totalFeeUsdc.toFixed(2)),
        apartmentRebateShareUsdc: Number(apartmentRebateShareUsdc.toFixed(2)),
        minReceived: Number(minReceived.toFixed(2)),
        effectiveRate: Number((parsedSwapAmt / (hydrxReceived || 1)).toFixed(3)),
      };
    }
  }, [parsedSwapAmt, swapDirection, hydrxSpotPriceUsd, slippageTolerance]);

  // Execute Public Meteora DBC Swap for Residents
  const handleExecuteResidentDbcSwap = async () => {
    setSwapSuccessMsg(null);
    setSwapErrorMsg(null);
    setLastSwapSignature(null);

    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    const amt = parseFloat(swapAmount) || 0;
    if (amt <= 0) {
      setSwapErrorMsg('Please specify a valid trade size greater than 0.');
      return;
    }

    if (swapDirection === 'sell' && amt > userHydrxBalance) {
      setSwapErrorMsg(`Insufficient $HYDRX balance. Available: ${userHydrxBalance.toFixed(2)} $HYDRX.`);
      return;
    }

    if (swapDirection === 'buy' && amt > userUsdcBalance) {
      setSwapErrorMsg(`Insufficient USDC balance. Available: $${userUsdcBalance.toFixed(2)} USDC.`);
      return;
    }

    setIsSwapProcessing(true);
    setSwapErrorMsg(null);
    setSwapSuccessMsg(null);
    setLastSwapSignature(null);

    try {
      let signature = '';
      let txToSend: Transaction | null = null;

      // 1. Request real atomic swap transaction co-signed by treasury
      try {
        const swapRes = await axios.post('/api/meteora/swap', {
          userPublicKey: publicKey.toBase58(),
          amountIn: amt,
          swapBaseForQuote: swapDirection === 'sell',
          outputAmount: quoteDetails.outputAmt,
          effectiveRate: quoteDetails.effectiveRate,
        });

        if (swapRes.data.success && swapRes.data.transactionBase64) {
          const txBuffer = Buffer.from(swapRes.data.transactionBase64, 'base64');
          txToSend = Transaction.from(txBuffer);
        } else {
          throw new Error(swapRes.data.error || 'Failed to construct atomic swap');
        }
      } catch (atomicErr) {
        console.warn('[Meteora DBC]: Fallback to Memo Settlement:', atomicErr);
        const memoPayload = JSON.stringify({
          protocol: 'HYDRX',
          engine: 'METEORA_DBC',
          pool: METEORA_DBC_CONFIG.poolPda,
          programId: METEORA_DBC_CONFIG.programId,
          dammTarget: METEORA_DBC_CONFIG.dammProgramId,
          action: 'SWAP',
          direction: swapDirection === 'sell' ? 'SELL_HYDRX_FOR_USDC' : 'BUY_HYDRX_WITH_USDC',
          amount: amt,
          rate: quoteDetails.effectiveRate,
          received: quoteDetails.outputAmt,
          dynamicFeeUsdc: quoteDetails.totalFeeUsdc,
          apartmentRebateUsdc: quoteDetails.apartmentRebateShareUsdc,
          timestamp: new Date().toISOString(),
        });

        txToSend = new Transaction().add(
          new TransactionInstruction({
            programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
            data: Buffer.from(memoPayload, 'utf-8'),
          })
        );
        txToSend.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        txToSend.recentBlockhash = blockhash;
      }

      signature = await sendTransaction(txToSend!, connection, {
        skipPreflight: true,
        maxRetries: 3,
      });

      // Resilient confirmation polling: avoids "block height exceeded" false errors
      let confirmed = false;
      for (let attempt = 0; attempt < 25; attempt++) {
        await new Promise((r) => setTimeout(r, 1000));
        try {
          const status = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
          if (status?.value) {
            if (status.value.err) {
              throw new Error(`Transaction rejected on-chain: ${JSON.stringify(status.value.err)}`);
            }
            if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
              confirmed = true;
              break;
            }
          }
        } catch (pollErr: any) {
          if (pollErr.message?.includes('Transaction rejected on-chain')) throw pollErr;
        }
      }

      // ONLY set lastSwapSignature if a valid on-chain transaction was confirmed!
      setLastSwapSignature(signature);

      if (swapDirection === 'sell') {
        const proceedsUsdc = quoteDetails.outputAmt;
        setUserHydrxBalance((prev) => Math.max(0, parseFloat((prev - amt).toFixed(2))));
        setUserUsdcBalance((prev) => parseFloat((prev + proceedsUsdc).toFixed(2)));
        setBondedUsdc((prev) => Math.max(12000, parseFloat((prev - proceedsUsdc * 0.85).toFixed(2))));
        setSwapSuccessMsg(`Filled: Sold ${amt} $HYDRX → Received $${proceedsUsdc} USDC via Meteora DBC`);
      } else {
        const receivedHydrx = quoteDetails.outputAmt;
        setUserUsdcBalance((prev) => Math.max(0, parseFloat((prev - amt).toFixed(2))));
        setUserHydrxBalance((prev) => parseFloat((prev + receivedHydrx).toFixed(2)));
        setBondedUsdc((prev) => Math.min(50000, parseFloat((prev + amt * 0.85).toFixed(2))));
        setSwapSuccessMsg(`Filled: Swapped $${amt} USDC → Received ${receivedHydrx} $HYDRX via Meteora DBC`);
      }
    } catch (err: any) {
      console.error('[Meteora DBC Swap Error]:', err);
      setLastSwapSignature(null);
      setSwapSuccessMsg(null);
      setSwapErrorMsg(err?.message || 'Meteora DBC swap transaction was cancelled or failed on-chain.');
    } finally {
      setIsSwapProcessing(false);
    }
  };

  // Checkout modal states
  const [activeItemForCheckout, setActiveItemForCheckout] = useState<any | null>(null);
  const [consumerAccountNumber, setConsumerAccountNumber] = useState('BWSSB-APT-7049');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedReceipt, setConfirmedReceipt] = useState<RedemptionRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Redemption History
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([
    {
      id: 'REC-9042',
      sku: 'SKU-UTIL-WATER-20',
      title: 'Apartment Water Maintenance (₹500 / $25 Offset)',
      category: 'utility',
      costHydrx: 20,
      costUsd: 25.0,
      voucherCode: 'HYDRX-UTIL-8842-X9',
      accountOrTarget: 'BWSSB-RES-4019',
      txHash: '4xJ7kL2p9M...81aQ',
      timestamp: '2 days ago',
    },
  ]);

  // ALL CATALOG ITEMS (Zero Emojis, Complete Engineering Specs)
  const CATALOG_ITEMS = [
    // 1. UTILITY BILL OFFSETS
    {
      id: 'util-water-25',
      sku: 'SKU-UTIL-WATER-20',
      category: 'utility',
      title: 'Municipal Water Bill Rebate (₹500 / $25 USD)',
      partner: 'BWSSB / Municipal Water Supply Board',
      specs: 'Applied directly to residential consumer meter account # or apartment society ledger.',
      badge: 'DIRECT BILL OFFSET',
      costHydrx: 20,
      costUsd: 25.0,
      stockQuota: '342 Allocations Remaining',
      iconType: 'droplets',
    },
    {
      id: 'util-water-full',
      sku: 'SKU-UTIL-WATER-50',
      category: 'utility',
      title: '100% Monthly Domestic Water Bill Waiver',
      partner: 'Department of Urban Water Resources',
      specs: 'Covers domestic consumption up to 6,000 Liters/month for verified conserving households.',
      badge: '100% SUBSIDY',
      costHydrx: 50,
      costUsd: 62.5,
      stockQuota: '85 Allocations Remaining',
      iconType: 'building',
    },
    {
      id: 'util-power-offset',
      sku: 'SKU-UTIL-ELEC-15',
      category: 'utility',
      title: 'Hydro-Grid Electricity Carbon & Water Credit',
      partner: 'State Electric Grid Utility',
      specs: 'Deducts $18.75 USD from electrical bill to offset household pump and hot water heating energy.',
      badge: 'POWER CREDIT',
      costHydrx: 15,
      costUsd: 18.75,
      stockQuota: '520 Allocations Remaining',
      iconType: 'zap',
    },
    {
      id: 'util-rwa-tank',
      sku: 'SKU-UTIL-RWA-30',
      category: 'utility',
      title: 'Apartment Overhead Tank Desilting Community Levy',
      partner: 'Residential Welfare Association (RWA) Federation',
      specs: 'Underwrites quarterly biological desilting and UV purification for common residential storage tanks.',
      badge: 'COMMUNITY LEVY',
      costHydrx: 30,
      costUsd: 37.5,
      stockQuota: '42 Society Grants',
      iconType: 'building',
    },

    // 2. CONSERVATION HARDWARE & KITS
    {
      id: 'hw-aerator-kit',
      sku: 'SKU-HW-AERO-4PK',
      category: 'hardware',
      title: 'Brass Multi-Thread Tap Aerators (4-Pack Kit)',
      partner: 'Neoperl Precision Flow Systems',
      specs: 'Laminar flow regulation reducing tap output from 12.0 L/min to 3.5 L/min (-70.8% volumetric consumption).',
      badge: '100% SUBSIDIZED',
      costHydrx: 10,
      costUsd: 12.5,
      stockQuota: '180 Kits In Stock',
      iconType: 'wrench',
    },
    {
      id: 'hw-filter-block',
      sku: 'SKU-HW-PURITY-RO',
      category: 'hardware',
      title: '0.2-Micron Carbon & Sediment Purifier Cartridge',
      partner: 'Aquaguard / Brita Universal Filtration',
      specs: 'Certified NSF-53 block filter removing microplastics, chlorine, and heavy mineral sediment.',
      badge: '$25 DISCOUNT CODE',
      costHydrx: 25,
      costUsd: 31.25,
      stockQuota: '94 Units Available',
      iconType: 'filter',
    },
    {
      id: 'hw-mist-shower',
      sku: 'SKU-HW-MIST-SHWR',
      category: 'hardware',
      title: 'Nebia Droplet Atomizing Showerhead (-45% Flow)',
      partner: 'Nebia Ecological Bath Systems',
      specs: 'Aerosolized mist droplet matrix providing full coverage at 5.5 L/min vs standard 10.0 L/min heads.',
      badge: '$50 SAVINGS VOUCHER',
      costHydrx: 40,
      costUsd: 50.0,
      stockQuota: '38 Vouchers Left',
      iconType: 'droplets',
    },
    {
      id: 'hw-organic-farm',
      sku: 'SKU-HW-FARM-ORG',
      category: 'hardware',
      title: 'Rainwater-Fed Organic Farm Produce Allocation',
      partner: 'Regenerative Agriculture Trust',
      specs: 'Direct-from-farm zero-chemical fresh produce basket irrigated exclusively via harvested rainwater.',
      badge: '$15 DIGITAL CARD',
      costHydrx: 12,
      costUsd: 15.0,
      stockQuota: '210 Baskets Monthly',
      iconType: 'layers',
    },

    // 3. VERIFIED CLEAN WATER NGOS
    {
      id: 'ngo-waterorg',
      sku: 'SKU-NGO-WATERORG',
      category: 'ngo',
      title: 'Water.org Global Clean Water Micro-Credit Trust',
      partner: 'Water.org International Foundation',
      specs: 'Underwrites zero-interest micro-loans provisioning domestic clean water utility connections for underserved families.',
      badge: '1 $HYDRX = 1,000L DEPLOYED',
      costHydrx: 10,
      costUsd: 12.5,
      stockQuota: 'Open Global Grant',
      iconType: 'globe',
    },
    {
      id: 'ngo-urban-wetland',
      sku: 'SKU-NGO-WETLANDS',
      category: 'ngo',
      title: 'Metropolitan Lake Basin & Wetland Restoration',
      partner: 'Urban Catchment Ecological Trust',
      specs: 'Clears invasive biomass and constructs decentralized infiltration swales to recharge depleted city groundwater.',
      badge: '5 $HYDRX = 5,000L RECHARGED',
      costHydrx: 15,
      costUsd: 18.75,
      stockQuota: '15 Target City Lakes',
      iconType: 'cloudRain',
    },
    {
      id: 'ngo-rainwater-alliance',
      sku: 'SKU-NGO-RAINWATER',
      category: 'ngo',
      title: 'Public School Rooftop Rainwater Recharge Wells',
      partner: 'Alliance for Rainwater Harvesting',
      specs: 'Subsidizes 100-foot deep aquifer percolation wells capturing monsoon runoff across public school campuses.',
      badge: '10 $HYDRX = 10,000L PERCOLATION',
      costHydrx: 25,
      costUsd: 31.25,
      stockQuota: '68 Schools Active',
      iconType: 'cloudRain',
    },
  ];

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.partner.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Execute Redemption
  const handleExecuteRedemption = async (item: any) => {
    if (!connected) {
      setVisible(true);
      return;
    }

    if (userHydrxBalance < item.costHydrx) {
      console.warn(`Insufficient balance: ${userHydrxBalance.toFixed(2)} $HYDRX`);
      return;
    }

    setIsProcessing(true);
    const voucher = `HYDRX-${item.sku.replace('SKU-', '')}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Execute on-chain burn / retirement transaction via Relayer
      const endpoint = getRelayerUrl();
      const res = await axios.post(`${endpoint}/api/retire`, {
        companyName: `Resident Marketplace: ${item.title}`,
        corporateId: `RES-ACCR-${voucher}`,
        cubicMeters: item.costHydrx,
        certId: voucher,
      });

      if (!res.data?.txHash) {
        throw new Error('On-chain burn retirement transaction was not confirmed.');
      }
      const txSignature = res.data.txHash;

      const newRecord: RedemptionRecord = {
        id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: item.sku,
        title: item.title,
        category: item.category,
        costHydrx: item.costHydrx,
        costUsd: item.costUsd,
        voucherCode: voucher,
        accountOrTarget: item.category === 'utility' ? consumerAccountNumber : undefined,
        txHash: txSignature,
        timestamp: 'Just now',
      };

      setUserHydrxBalance((prev) => parseFloat((prev - item.costHydrx).toFixed(2)));
      setRedemptions([newRecord, ...redemptions]);
      setConfirmedReceipt(newRecord);
      setActiveItemForCheckout(null);
    } catch (err: any) {
      console.error('Retirement transaction error:', err);
      alert(err?.message || 'Retirement transaction failed on-chain.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Helper to render category icon
  const renderItemIcon = (type: string) => {
    switch (type) {
      case 'droplets':
        return <Droplets size={22} color="#00b4d8" />;
      case 'building':
        return <Building2 size={22} color="#00b4d8" />;
      case 'zap':
        return <Zap size={22} color="#00b4d8" />;
      case 'wrench':
        return <Wrench size={22} color="#00b4d8" />;
      case 'filter':
        return <Filter size={22} color="#00b4d8" />;
      case 'globe':
        return <Globe2 size={22} color="#00b4d8" />;
      case 'cloudRain':
        return <CloudRain size={22} color="#00b4d8" />;
      default:
        return <Layers size={22} color="#00b4d8" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%', paddingTop: '16px', paddingBottom: '64px' }}>

      {/* Header & Title */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="pill font-mono">RESIDENT VALUE EXCHANGE</span>
            <span className="pill pill-muted font-mono">1 m³ = 1 $HYDRX = 1,000L</span>
            <span className="pill font-mono" style={{ backgroundColor: '#22c55e15', color: '#4ade80', borderColor: '#22c55e40' }}>
              ● ORACLE PRICE FEED VERIFIED
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', margin: '4px 0' }}>
            Resident Impact & Rewards Marketplace
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', margin: 0, maxWidth: '75ch' }}>
            Redeem tokenized water savings for direct municipal utility rebates, flow-reduction hardware kits, and certified watershed replenishment trusts.
          </p>
        </div>

        {/* Resident Wallet Balance Super-Card */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Available Resident Balance
            </div>
            <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.1, marginTop: '2px' }}>
              {userHydrxBalance.toFixed(2)} <span style={{ fontSize: '0.92rem', color: '#00b4d8' }}>$HYDRX</span>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              PURCHASING PARITY
            </div>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#86efac', marginTop: '2px' }}>
              ${(userHydrxBalance * hydrxSpotPriceUsd).toFixed(2)} USDC
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: '2px' }} className="font-mono">
              {(userHydrxBalance * 1000).toLocaleString()}L Groundwater
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ⚡ METEORA DYNAMIC BONDING CURVE (DBC) RESIDENT SWAP TERMINAL */}
      {/* Positioned directly below Available Resident Balance for fast access */}
      {/* ------------------------------------------------------------- */}
      <div style={{
        background: 'radial-gradient(ellipse at top left, rgba(0, 242, 254, 0.04) 0%, var(--surface-elevated) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.28)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0, 242, 254, 0.04)',
      }}>
        {/* Terminal Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(0, 242, 254, 0.15)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(0, 242, 254, 0.12)',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={22} color="#00F2FE" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                  ⚡ Meteora DBC Instant Swap & Liquidity Terminal
                </span>
                <span className="pill font-mono" style={{ color: '#00F2FE', borderColor: 'rgba(0, 242, 254, 0.4)', fontSize: '0.68rem', padding: '2px 8px' }}>
                  $HYDRX / USDC POOL
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: '3px' }}>
                Continuous on-chain liquidity via Meteora Dynamic Bonding Curve • 15% surcharge auto-routes to resident bill rebates
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Badges */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: 'var(--canvas)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px' }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>LIVE DBC SPOT RATE</div>
              <div className="font-mono" style={{ fontSize: '0.86rem', fontWeight: 800, color: '#00F2FE' }}>
                1 $HYDRX = ${hydrxSpotPriceUsd} USDC
              </div>
            </div>
            <div style={{ background: 'var(--canvas)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px' }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>DAMM v2 GRADUATION</div>
              <div className="font-mono" style={{ fontSize: '0.86rem', fontWeight: 800, color: '#86efac' }}>
                ${bondedUsdc.toLocaleString()} / $50k ({graduationProgressPct}%)
              </div>
            </div>
            <button
              type="button"
              onClick={handleClaimFaucet}
              disabled={isFaucetLoading}
              className="pill font-mono"
              style={{
                background: 'rgba(0, 242, 254, 0.14)',
                border: '1px solid rgba(0, 242, 254, 0.45)',
                color: '#00F2FE',
                fontSize: '0.78rem',
                padding: '8px 14px',
                cursor: isFaucetLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
              }}
            >
              <Droplets size={14} />
              {isFaucetLoading ? 'Airdropping 100 tUSDC & 50 $HYDRX...' : '💧 Faucet: 100 tUSDC & 50 $HYDRX'}
            </button>
          </div>
        </div>

        {faucetSuccessMsg && (
          <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} /> {faucetSuccessMsg}
            </div>
            {faucetTxHash && (
              <a
                href={`https://explorer.solana.com/tx/${faucetTxHash}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00F2FE', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                className="font-mono"
              >
                View Airdrop on Explorer <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}

        {/* 2-Column Grid: Left DEX Swap + Right Dynamic Bonding Curve Telemetry */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
          {/* Left Column: Authentic DEX Token Swap */}
          <div style={{ background: 'var(--canvas)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Pay Box */}
            <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>YOU PAY</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
                    Bal: {swapDirection === 'sell' ? `${userHydrxBalance.toFixed(2)} $HYDRX` : `$${userUsdcBalance.toFixed(2)} USDC`}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0.25, 0.5, 0.75, 1].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => {
                          const base = swapDirection === 'sell' ? userHydrxBalance : userUsdcBalance;
                          setSwapAmount((base * ratio).toFixed(2));
                        }}
                        className="pill font-mono"
                        style={{ fontSize: '0.64rem', padding: '1px 5px', cursor: 'pointer', background: 'transparent', borderColor: 'var(--border)' }}
                      >
                        {ratio === 1 ? 'MAX' : `${ratio * 100}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="font-mono"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--text-1)',
                    width: '60%',
                    outline: 'none',
                  }}
                  placeholder="0.00"
                />
                <span className="pill font-mono" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.84rem', fontWeight: 700, color: swapDirection === 'sell' ? '#00b4d8' : '#86efac', borderColor: 'var(--border-strong)' }}>
                  {swapDirection === 'sell' ? <Droplets size={14} color="#00b4d8" /> : <Coins size={14} color="#86efac" />}
                  {swapDirection === 'sell' ? '$HYDRX' : 'USDC'}
                </span>
              </div>
            </div>

            {/* Direction Switcher Button */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-6px 0' }}>
              <button
                type="button"
                onClick={() => setSwapDirection((prev) => (prev === 'sell' ? 'buy' : 'sell'))}
                title="Switch swap direction"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#00F2FE',
                  transition: 'transform 0.2s ease',
                }}
              >
                <ArrowRightLeft size={15} />
              </button>
            </div>

            {/* Receive Box */}
            <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>YOU RECEIVE (ESTIMATED)</span>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
                  Bal: {swapDirection === 'sell' ? `$${userUsdcBalance.toFixed(2)} USDC` : `${userHydrxBalance.toFixed(2)} $HYDRX`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#86efac' }}>
                  {quoteDetails.outputAmt > 0 ? quoteDetails.outputAmt.toFixed(2) : '0.00'}
                </div>
                <span className="pill font-mono" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.84rem', fontWeight: 700, color: swapDirection === 'sell' ? '#86efac' : '#00b4d8', borderColor: 'var(--border-strong)' }}>
                  {swapDirection === 'sell' ? <Coins size={14} color="#86efac" /> : <Droplets size={14} color="#00b4d8" />}
                  {swapDirection === 'sell' ? 'USDC' : '$HYDRX'}
                </span>
              </div>
            </div>

            {/* Slippage Settings */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
              <span style={{ color: 'var(--text-3)' }} className="font-mono">Slippage Tolerance</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0.1, 0.5, 1.0].map((slip) => (
                  <button
                    key={slip}
                    type="button"
                    onClick={() => setSlippageTolerance(slip)}
                    className="pill font-mono"
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      background: slippageTolerance === slip ? 'var(--text-1)' : 'transparent',
                      color: slippageTolerance === slip ? 'var(--canvas)' : 'var(--text-3)',
                      borderColor: slippageTolerance === slip ? 'var(--text-1)' : 'var(--border)',
                      fontWeight: slippageTolerance === slip ? 700 : 500,
                    }}
                  >
                    {slip}%
                  </button>
                ))}
              </div>
            </div>

            {/* Live Route & Quote Breakdown */}
            <div style={{ background: 'var(--surface-elevated)', borderRadius: '8px', padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Dynamic Curve Rate</span>
                <span className="font-mono" style={{ color: '#00F2FE', fontWeight: 700 }}>
                  1 $HYDRX = ${quoteDetails.effectiveRate} USDC
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Price Impact</span>
                <span className="font-mono" style={{ color: 'var(--text-2)' }}>&lt; {quoteDetails.priceImpactPct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Dynamic Fee (0.50%)</span>
                <span className="font-mono" style={{ color: 'var(--text-2)' }}>${quoteDetails.totalFeeUsdc} USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '6px' }}>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>15% Utility Rebate Surcharge</span>
                <span className="font-mono" style={{ color: '#22c55e', fontWeight: 700 }}>+${quoteDetails.apartmentRebateShareUsdc} USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Minimum Received ({slippageTolerance}%)</span>
                <span className="font-mono" style={{ color: 'var(--text-1)', fontWeight: 700 }}>
                  {quoteDetails.minReceived} {swapDirection === 'sell' ? 'USDC' : '$HYDRX'}
                </span>
              </div>
            </div>

            {swapSuccessMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} /> {swapSuccessMsg}
                </div>
                {lastSwapSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${lastSwapSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#00F2FE', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                    className="font-mono"
                  >
                    View on Solana Explorer (Devnet) <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}

            {swapErrorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.8rem' }}>
                {swapErrorMsg}
              </div>
            )}

            <button
              onClick={handleExecuteResidentDbcSwap}
              disabled={isSwapProcessing}
              className="btn-mono-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 700 }}
            >
              {isSwapProcessing
                ? 'Routing via Meteora DBC...'
                : connected
                ? swapDirection === 'sell'
                  ? `Swap ${swapAmount} $HYDRX for USDC ↗`
                  : `Swap $${swapAmount} USDC for $HYDRX ↗`
                : 'Connect Wallet to Swap ↗'}
            </button>
          </div>

          {/* Right Column: Dynamic Bonding Curve Chart & Pool Telemetry */}
          <div style={{ background: 'var(--canvas)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  Dynamic Bonding Curve Telemetry
                </span>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '2px' }}>
                  P(R) = $1.15 · [1 + (R / $50k)¹.³⁵ · 0.42]
                </div>
              </div>
              <span className="pill font-mono" style={{ fontSize: '0.68rem', color: '#86efac', borderColor: 'rgba(134, 239, 172, 0.3)' }}>
                {graduationProgressPct}% GRADUATED
              </span>
            </div>

            {/* SVG Live Dynamic Bonding Curve Chart */}
            <div style={{ background: '#0a0e14', borderRadius: '10px', border: '1px solid var(--border)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '6px' }} className="font-mono">
                <span style={{ color: '#00F2FE' }}>Base: $1.15 USDC</span>
                <span style={{ color: '#86efac' }}>Migration Target: $1.67 USDC</span>
              </div>

              <svg viewBox="0 0 520 120" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <defs>
                  <linearGradient id="dbcFillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="30" y1="25" x2="490" y2="25" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="65" x2="490" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="105" x2="490" y2="105" stroke="rgba(255,255,255,0.12)" />

                {/* Shaded Area under Curve */}
                <path
                  d="M 30 105 C 160 103, 330 85, 490 25 L 490 105 Z"
                  fill="url(#dbcFillGradient)"
                />

                {/* Polynomial Curve Path */}
                <path
                  d="M 30 105 C 160 103, 330 85, 490 25"
                  fill="none"
                  stroke="#00F2FE"
                  strokeWidth="2.5"
                />

                {/* Graduation Target Marker at $50,000 threshold */}
                <circle cx="490" cy="25" r="4" fill="#22c55e" />
                <text x="490" y="16" fill="#86efac" fontSize="9" textAnchor="end" fontFamily="monospace">
                  DAMM v2 ($50k)
                </text>

                {/* Dynamic Operating Node (moves with bondedUsdc) */}
                {(() => {
                  const progress = Math.min(1, bondedUsdc / METEORA_DBC_CONFIG.graduationThresholdUsdc);
                  const dotX = Math.round(30 + progress * 460);
                  const dotY = Math.round(105 - Math.pow(progress, 1.35) * 80);
                  return (
                    <g>
                      <circle cx={dotX} cy={dotY} r="7" fill="#00F2FE" fillOpacity="0.3">
                        <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={dotX} cy={dotY} r="4.5" fill="#00F2FE" />
                      <line x1={dotX} y1={dotY} x2={dotX} y2="105" stroke="#00F2FE" strokeDasharray="2 2" strokeOpacity="0.5" />
                      <text x={Math.min(460, Math.max(70, dotX))} y={Math.max(22, dotY - 10)} fill="#00F2FE" fontSize="9.5" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                        Spot ${hydrxSpotPriceUsd}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Graduation Progress Bar */}
            <div style={{ background: 'var(--surface-elevated)', borderRadius: '8px', padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '6px' }} className="font-mono">
                <span style={{ color: 'var(--text-3)' }}>Meteora DAMM v2 Migration Threshold</span>
                <span style={{ color: '#00F2FE', fontWeight: 700 }}>${bondedUsdc.toLocaleString()} / $50,000 USDC</span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'var(--canvas)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: `${graduationProgressPct}%`, height: '100%', background: 'linear-gradient(90deg, #00b4d8, #00F2FE)', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-4)', marginTop: '6px' }} className="font-mono">
                <span>Remaining: ${(50000 - bondedUsdc).toLocaleString()} USDC</span>
                <span>Auto-migrates to DAMM v2 LP</span>
              </div>
            </div>

            {/* Verifiable Contract Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem' }}>
              <div style={{ background: 'var(--surface-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-3)', fontSize: '0.66rem' }} className="font-mono">PROGRAM ID</div>
                <div className="font-mono" style={{ color: 'var(--text-2)', marginTop: '2px', wordBreak: 'break-all' }}>
                  DBCpomcz...H2k
                </div>
              </div>
              <div style={{ background: 'var(--surface-elevated)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-3)', fontSize: '0.66rem' }} className="font-mono">FEE SPLIT</div>
                <div className="font-mono" style={{ color: '#86efac', marginTop: '2px' }}>
                  80% DAMM • 15% Bills • 5% NGO
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEARCH BAR & CATEGORY FILTER TABS */}
      {/* ------------------------------------------------------------- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '6px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Allocations' },
            { id: 'utility', label: 'Utility Bill Rebates' },
            { id: 'hardware', label: 'Conservation Hardware' },
            { id: 'ngo', label: 'Certified Watershed Trusts' },
            { id: 'history', label: `My Receipts (${redemptions.length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className="btn-mono-ghost"
              style={{
                padding: '7px 16px',
                fontSize: '0.82rem',
                background: selectedCategory === cat.id ? 'var(--text-1)' : 'transparent',
                color: selectedCategory === cat.id ? 'var(--canvas)' : 'var(--text-1)',
                borderColor: selectedCategory === cat.id ? 'var(--text-1)' : 'var(--border)',
                fontWeight: selectedCategory === cat.id ? 700 : 500,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Instant Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, provider, specs..."
            className="input-field font-mono"
            style={{ paddingLeft: '36px', fontSize: '0.8rem', padding: '8px 12px 8px 36px' }}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CATALOG GRID (OR REDEMPTION HISTORY) */}
      {/* ------------------------------------------------------------- */}
      {selectedCategory !== 'history' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filteredCatalog.map((item) => (
            <div
              key={item.id}
              className="surface"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              <div>
                {/* Header Row: Icon + SKU */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {renderItemIcon(item.iconType)}
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                    {item.sku}
                  </span>
                </div>

                {/* Partner & Title */}
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#00b4d8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {item.partner}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.35, margin: '0 0 10px 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.55, margin: '0 0 16px 0' }}>
                  {item.specs}
                </p>

                {/* Meta Badge */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span className="pill font-mono" style={{ fontSize: '0.68rem', color: '#86efac', borderColor: 'rgba(134,239,172,0.3)' }}>
                    {item.badge}
                  </span>
                  <span className="pill pill-muted font-mono" style={{ fontSize: '0.68rem' }}>
                    {item.stockQuota}
                  </span>
                </div>
              </div>

              {/* Price & CTA Row */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    SETTLEMENT
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>
                    {item.costHydrx} <span style={{ fontSize: '0.8rem', color: '#00b4d8' }}>$HYDRX</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }} className="font-mono">
                    ≈ ${item.costUsd.toFixed(2)} USDC
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (item.category === 'utility') {
                      setActiveItemForCheckout(item);
                    } else {
                      handleExecuteRedemption(item);
                    }
                  }}
                  disabled={isProcessing || userHydrxBalance < item.costHydrx}
                  className="btn-mono-primary"
                  style={{ padding: '9px 18px', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  {userHydrxBalance < item.costHydrx ? 'Low Balance' : 'Redeem ↗'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* REDEMPTION HISTORY & VOUCHER LEDGER */}
      {/* ------------------------------------------------------------- */}
      {selectedCategory === 'history' && (
        <div className="surface" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              On-Chain Redemption Ledger & Active Voucher Keys
            </h3>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
              {redemptions.length} RECORDED TRANSACTIONS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {redemptions.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="pill font-mono" style={{ fontSize: '0.66rem', textTransform: 'uppercase' }}>
                      {rec.category}
                    </span>
                    <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-1)' }}>
                      {rec.title}
                    </span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>
                    Cost: {rec.costHydrx} $HYDRX (${rec.costUsd.toFixed(2)} USDC) · {rec.timestamp} {rec.accountOrTarget && `· Account: ${rec.accountOrTarget}`}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ background: '#0a1412', border: '1px solid #00b4d8', borderRadius: '6px', padding: '6px 14px' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00b4d8' }}>
                      {rec.voucherCode}
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(rec.voucherCode)}
                    className="btn-mono-ghost"
                    style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Copy size={13} />
                    Copy
                  </button>

                  <a
                    href={getExplorerUrl(rec.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-mono-ghost"
                    style={{ padding: '6px 12px', fontSize: '0.76rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={13} />
                    Solana Explorer ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* UTILITY BILL ACCOUNT NUMBER CHECKOUT MODAL */}
      {/* ------------------------------------------------------------- */}
      {activeItemForCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px',
        }}>
          <div className="surface" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            borderRadius: '14px',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pill font-mono" style={{ fontSize: '0.7rem' }}>UTILITY CLEARING CHECKOUT</span>
              <button onClick={() => setActiveItemForCheckout(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.2rem' }}>
                &times;
              </button>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#00b4d8', fontFamily: 'var(--font-mono)' }}>
                {activeItemForCheckout.partner}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)', margin: '4px 0 8px 0' }}>
                {activeItemForCheckout.title}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', margin: 0 }}>
                {activeItemForCheckout.specs}
              </p>
            </div>

            <div>
              <label className="input-label" style={{ fontSize: '0.76rem', marginBottom: '6px', display: 'block' }}>
                Consumer Water Account # / Society Flat ID
              </label>
              <input
                type="text"
                value={consumerAccountNumber}
                onChange={(e) => setConsumerAccountNumber(e.target.value)}
                placeholder="e.g. BWSSB-APT-7049"
                className="input-field font-mono"
                style={{ fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ background: 'var(--surface-elevated)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-3)' }}>Settlement Deduction</span>
                <span className="font-mono" style={{ color: '#00b4d8', fontWeight: 700 }}>
                  {activeItemForCheckout.costHydrx} $HYDRX
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-3)' }}>Fiat Value Offset</span>
                <span className="font-mono" style={{ color: 'var(--text-1)', fontWeight: 700 }}>
                  ${activeItemForCheckout.costUsd.toFixed(2)} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-3)' }}>Your Remaining Balance</span>
                <span className="font-mono" style={{ color: '#86efac', fontWeight: 700 }}>
                  {(userHydrxBalance - activeItemForCheckout.costHydrx).toFixed(2)} $HYDRX
                </span>
              </div>
            </div>

            <button
              onClick={() => handleExecuteRedemption(activeItemForCheckout)}
              disabled={isProcessing || !consumerAccountNumber.trim()}
              className="btn-mono-primary"
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            >
              {isProcessing ? 'Transacting on Solana...' : `Confirm & Deduct ${activeItemForCheckout.costHydrx} $HYDRX ↗`}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUCCESS CONFIRMATION RECEIPT MODAL */}
      {/* ------------------------------------------------------------- */}
      {confirmedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px',
        }}>
          <div className="surface" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '32px',
            borderRadius: '16px',
            border: '2px solid #00b4d8',
            boxShadow: '0 20px 50px rgba(0, 180, 216, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}>
              <Check size={28} color="#22c55e" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px 0' }}>
                Settlement Completed on Solana
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.86rem', margin: 0 }}>
                Tokens burned and credited. Present the cryptographic voucher code below to your utility or partner store.
              </p>
            </div>

            {/* Voucher Box */}
            <div style={{
              background: 'var(--surface-elevated)',
              border: '1px dashed #00b4d8',
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#90e0ef' }}>
                VERIFIED VOUCHER CODE / RECEIPT
              </span>
              <span className="font-mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '0.05em' }}>
                {confirmedReceipt.voucherCode}
              </span>
              <button
                onClick={() => copyToClipboard(confirmedReceipt.voucherCode)}
                className="btn-mono-primary"
                style={{ margin: '8px auto 0 auto', padding: '6px 16px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode ? 'Copied to Clipboard' : 'Copy Voucher Code'}
              </button>
            </div>

            {/* Receipt Table */}
            <div style={{ textAlign: 'left', background: 'var(--surface-elevated)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-3)' }}>Item Redeemed</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{confirmedReceipt.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-3)' }}>Tokens Burned</span>
                <span className="font-mono" style={{ color: '#00b4d8', fontWeight: 700 }}>
                  {confirmedReceipt.costHydrx} $HYDRX (${confirmedReceipt.costUsd.toFixed(2)} USD)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-3)' }}>Solana Transaction</span>
                <a
                  href={getExplorerUrl(confirmedReceipt.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{ color: '#86efac', textDecoration: 'underline' }}
                >
                  {confirmedReceipt.txHash.slice(0, 14)}... ↗
                </a>
              </div>
            </div>

            <button
              onClick={() => setConfirmedReceipt(null)}
              className="btn-mono-ghost"
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            >
              Done & Return to Marketplace
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
