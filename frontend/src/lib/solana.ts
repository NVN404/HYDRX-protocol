import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import idl from './idl.json';

// MagicBlock Deployed Program ID
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || '8dLu65pPh6AbfDmRW5GUGqjPQuxihnpv2vWydzt98vKj'
);

export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://rpc.magicblock.app/devnet';
export const ROUTER_URL =
  process.env.NEXT_PUBLIC_ROUTER_URL || 'https://devnet-router.magicblock.app/';
export const EPHEMERAL_RPC_URL =
  process.env.NEXT_PUBLIC_EPHEMERAL_RPC_URL || 'https://devnet-as.magicblock.app/';

export function getRelayerUrl(): string {
  if (typeof window !== 'undefined') {
    // 1. Check URL query param: ?relayer=https://...
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get('relayer');
    if (param) {
      const formatted = param.startsWith('http://') || param.startsWith('https://') ? param : `https://${param}`;
      return formatted.replace(/\/$/, '');
    }

    // 2. Check localStorage override
    const saved = localStorage.getItem('hydrx_relayer_url');
    if (saved) {
      const formatted = saved.startsWith('http://') || saved.startsWith('https://') ? saved : `https://${saved}`;
      return formatted.replace(/\/$/, '');
    }

    // 3. Auto-detect if running on Render
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://hydrx-relayer.onrender.com';
    }
  }

  // 4. Check Environment Variable
  const envUrl = process.env.NEXT_PUBLIC_RELAYER_URL;
  if (envUrl && envUrl.trim() !== '') {
    const formatted = envUrl.startsWith('http://') || envUrl.startsWith('https://') ? envUrl : `https://${envUrl}`;
    return formatted.replace(/\/$/, '');
  }

  // 5. Fallback for deployed domains
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://hydrx-relayer.onrender.com';
  }

  return 'http://localhost:3005';
}

export const RELAYER_URL = getRelayerUrl();

// Key MagicBlock Constants
export const DELEGATION_PROGRAM_ID = new PublicKey(
  'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh'
);
export const MAGIC_PROGRAM_ID = new PublicKey(
  'Magic11111111111111111111111111111111111111'
);
export const MAGIC_CONTEXT_ID = new PublicKey(
  'MagicContext1111111111111111111111111111111'
);

export function getSolanaConnection() {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

export function getEphemeralConnection(endpoint = EPHEMERAL_RPC_URL) {
  return new Connection(endpoint, 'confirmed');
}

export async function checkDelegationStatus(account: PublicKey) {
  try {
    const res = await fetch(ROUTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getDelegationStatus',
        params: [account.toBase58()],
      }),
    });
    const body = await res.json();
    return body.result || { isDelegated: false, fqdn: EPHEMERAL_RPC_URL };
  } catch (e) {
    return { isDelegated: false, fqdn: EPHEMERAL_RPC_URL };
  }
}

export function getPoolStatePda(programId = PROGRAM_ID) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool_state')],
    programId
  )[0];
}

export function getTokenMintPda(programId = PROGRAM_ID) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('hydrx_mint')],
    programId
  )[0];
}

export function getResidentStatePda(residentPubkey: PublicKey, programId = PROGRAM_ID) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('resident'), residentPubkey.toBuffer()],
    programId
  )[0];
}

export function getResidentAta(residentPubkey: PublicKey, mintPubkey?: PublicKey) {
  const mint = mintPubkey || getTokenMintPda();
  return getAssociatedTokenAddressSync(mint, residentPubkey);
}

export function getExplorerUrl(txHash: string, isEr = false, network = SOLANA_NETWORK) {
  if (isEr) {
    return `https://explorer.solana.com/tx/${txHash}?cluster=custom&customUrl=${encodeURIComponent(EPHEMERAL_RPC_URL)}`;
  }
  return `https://explorer.solana.com/tx/${txHash}?cluster=${network}`;
}

export function getAddressExplorerUrl(address: string, network = SOLANA_NETWORK) {
  return `https://explorer.solana.com/address/${address}?cluster=${network}`;
}

export { idl };
