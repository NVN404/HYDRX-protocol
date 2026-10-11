import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

const RPC_URL = process.env.BASE_RPC_URL || 'https://api.devnet.solana.com';

const DEVNET_TREASURY_SECRET = [33,145,26,72,208,27,217,101,208,219,194,139,43,46,187,243,209,93,190,34,144,234,82,113,205,161,43,41,143,35,50,165,162,122,244,208,77,191,171,111,247,88,57,223,252,98,161,195,45,33,223,152,21,225,113,115,103,180,151,67,132,149,21,231];

function loadTreasuryKeypair(): Keypair {
  if (process.env.RELAYER_KEYPAIR) {
    try {
      const parsed = JSON.parse(process.env.RELAYER_KEYPAIR);
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    } catch (e) {}
  }
  if (process.env.TREASURY_KEYPAIR) {
    try {
      const parsed = JSON.parse(process.env.TREASURY_KEYPAIR);
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    } catch (e) {}
  }
  const possiblePaths = [
    path.join(process.cwd(), 'wallet-keypair.json'),
    path.join(process.cwd(), '..', 'wallet-keypair.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const secret = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return Keypair.fromSecretKey(Uint8Array.from(secret));
      } catch (e) {}
    }
  }
  return Keypair.fromSecretKey(Uint8Array.from(DEVNET_TREASURY_SECRET));
}

function loadTokenConfig() {
  const possiblePaths = [
    path.join(process.cwd(), 'devnet-tokens.json'),
    path.join(process.cwd(), '..', 'devnet-tokens.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }
  return {
    usdcMint: 'Fyy2Etwcsgeufs39uHGfiBU23sSC8C533BsQroXjJY7X',
    hydrxMint: '618p48q4rk23xSeswy3BQWyGYEmJaXmrMLxCNPTehwFk',
    treasuryUsdcAta: 'ApL9ujqWXLkRJ3UZ1Sjjc2cwybmBgG5TmrPgk7bstNMv',
    treasuryHydrxAta: '6NLhv2y712vAuhVRvYXdzwR2cGWk1VEkXDZtDok5ptc5',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipient } = body;

    if (!recipient) {
      return NextResponse.json({ error: 'Missing recipient public key' }, { status: 400 });
    }

    const recipientPubkey = new PublicKey(recipient);
    const connection = new Connection(RPC_URL, 'confirmed');
    const treasury = loadTreasuryKeypair();
    const tokens = loadTokenConfig();

    const usdcMint = new PublicKey(tokens.usdcMint);
    const hydrxMint = new PublicKey(tokens.hydrxMint);

    const recipientUsdcAta = await getAssociatedTokenAddress(usdcMint, recipientPubkey);
    const recipientHydrxAta = await getAssociatedTokenAddress(hydrxMint, recipientPubkey);

    const tx = new Transaction();

    // 0. Transfer 0.02 SOL for gas fees
    tx.add(
      SystemProgram.transfer({
        fromPubkey: treasury.publicKey,
        toPubkey: recipientPubkey,
        lamports: 20_000_000, // 0.02 SOL
      })
    );

    // 1. Ensure Recipient USDC ATA exists & Transfer 100 tUSDC
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        treasury.publicKey,
        recipientUsdcAta,
        recipientPubkey,
        usdcMint
      ),
      createTransferInstruction(
        new PublicKey(tokens.treasuryUsdcAta),
        recipientUsdcAta,
        treasury.publicKey,
        100_000_000 // 100 tUSDC (6 decimals)
      )
    );

    // 2. Ensure Recipient $HYDRX ATA exists & Transfer 50 $HYDRX
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        treasury.publicKey,
        recipientHydrxAta,
        recipientPubkey,
        hydrxMint
      ),
      createTransferInstruction(
        new PublicKey(tokens.treasuryHydrxAta),
        recipientHydrxAta,
        treasury.publicKey,
        50_000_000 // 50 $HYDRX (6 decimals)
      )
    );

    tx.feePayer = treasury.publicKey;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.sign(treasury);

    const signature = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    return NextResponse.json({
      success: true,
      signature,
      usdcMint: tokens.usdcMint,
      hydrxMint: tokens.hydrxMint,
      usdcAmount: 100,
      hydrxAmount: 50,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (err: any) {
    console.error('Faucet error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Faucet distribution failed.' },
      { status: 500 }
    );
  }
}
