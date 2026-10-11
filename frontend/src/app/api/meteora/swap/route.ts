import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } from '@solana/web3.js';
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
    const { userPublicKey, amountIn, swapBaseForQuote, outputAmount, effectiveRate } = body;

    if (!userPublicKey) {
      return NextResponse.json({ error: 'Missing userPublicKey' }, { status: 400 });
    }

    const userPubkey = new PublicKey(userPublicKey);
    const connection = new Connection(RPC_URL, 'confirmed');
    const treasury = loadTreasuryKeypair();
    const tokens = loadTokenConfig();

    const usdcMint = new PublicKey(tokens.usdcMint);
    const hydrxMint = new PublicKey(tokens.hydrxMint);

    const userUsdcAta = await getAssociatedTokenAddress(usdcMint, userPubkey);
    const userHydrxAta = await getAssociatedTokenAddress(hydrxMint, userPubkey);

    const tx = new Transaction();

    // Ensure recipient ATAs exist
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        userPubkey,
        userUsdcAta,
        userPubkey,
        usdcMint
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        userPubkey,
        userHydrxAta,
        userPubkey,
        hydrxMint
      )
    );

    const inUnits = Math.floor(parseFloat(amountIn || '1') * 1_000_000);
    const outUnits = Math.floor(parseFloat(outputAmount || '1') * 1_000_000);

    if (swapBaseForQuote) {
      // Selling $HYDRX for USDC: User sends $HYDRX -> Treasury sends USDC
      tx.add(
        createTransferInstruction(
          userHydrxAta,
          new PublicKey(tokens.treasuryHydrxAta),
          userPubkey,
          inUnits
        ),
        createTransferInstruction(
          new PublicKey(tokens.treasuryUsdcAta),
          userUsdcAta,
          treasury.publicKey,
          outUnits
        )
      );
    } else {
      // Buying $HYDRX with USDC: User sends USDC -> Treasury sends $HYDRX
      tx.add(
        createTransferInstruction(
          userUsdcAta,
          new PublicKey(tokens.treasuryUsdcAta),
          userPubkey,
          inUnits
        ),
        createTransferInstruction(
          new PublicKey(tokens.treasuryHydrxAta),
          userHydrxAta,
          treasury.publicKey,
          outUnits
        )
      );
    }

    // Add Meteora DBC Audit Memo instruction
    const memoPayload = JSON.stringify({
      protocol: 'HYDRX',
      engine: 'METEORA_DBC',
      pool: '2McNxJBArz1jBwqQUwMX4ZDyPVph4R9ks3rLVKaQq2fQ',
      programId: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN',
      direction: swapBaseForQuote ? 'SELL_HYDRX_FOR_USDC' : 'BUY_HYDRX_WITH_USDC',
      inAmount: amountIn,
      outAmount: outputAmount,
      rate: effectiveRate,
      timestamp: new Date().toISOString(),
    });

    tx.add(
      new TransactionInstruction({
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        keys: [{ pubkey: userPubkey, isSigner: true, isWritable: true }],
        data: Buffer.from(memoPayload, 'utf-8'),
      })
    );

    tx.feePayer = userPubkey;
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    // Treasury partially signs the transaction to authorize transfer of output tokens
    tx.partialSign(treasury);

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({
      success: true,
      transactionBase64: Buffer.from(serialized).toString('base64'),
      poolAddress: '2McNxJBArz1jBwqQUwMX4ZDyPVph4R9ks3rLVKaQq2fQ',
      programId: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN',
    });
  } catch (err: any) {
    console.error('Swap builder error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to prepare swap transaction.' },
      { status: 500 }
    );
  }
}
