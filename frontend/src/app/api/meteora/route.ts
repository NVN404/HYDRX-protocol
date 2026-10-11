import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  DynamicBondingCurveClient,
  DYNAMIC_BONDING_CURVE_PROGRAM_ID,
  DAMM_V2_PROGRAM_ID,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';

const RPC_URL = process.env.BASE_RPC_URL || 'https://api.devnet.solana.com';
const DEVNET_POOL_ADDRESS = new PublicKey(
  process.env.METEORA_POOL_ADDRESS || '2McNxJBArz1jBwqQUwMX4ZDyPVph4R9ks3rLVKaQq2fQ'
);
const DEVNET_USDC_MINT = new PublicKey(
  process.env.USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
);

/**
 * GET /api/meteora
 * Fetches real on-chain Meteora DBC pool telemetry from Solana Devnet.
 */
export async function GET() {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const client = new DynamicBondingCurveClient(connection, 'confirmed');

    const pool = await client.state.getPool(DEVNET_POOL_ADDRESS);
    if (!pool || !pool.poolState) {
      throw new Error('Meteora pool account not found on Devnet');
    }

    const config = await client.state.getPoolConfig(pool.poolState.config);

    return NextResponse.json({
      success: true,
      programId: DYNAMIC_BONDING_CURVE_PROGRAM_ID.toBase58(),
      dammProgramId: DAMM_V2_PROGRAM_ID.toBase58(),
      poolAddress: DEVNET_POOL_ADDRESS.toBase58(),
      configAddress: pool.poolState.config.toBase58(),
      baseMint: pool.poolState.baseMint.toBase58(),
      quoteMint: config?.quoteMint?.toBase58() || DEVNET_USDC_MINT.toBase58(),
      baseReserve: pool.poolState.baseReserve.toString(),
      quoteReserve: pool.poolState.quoteReserve.toString(),
      isMigrated: pool.poolState.isMigrated || false,
      migrationProgress: pool.poolState.migrationProgress?.toString() || '0',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch Meteora pool state',
        programId: DYNAMIC_BONDING_CURVE_PROGRAM_ID.toBase58(),
        dammProgramId: DAMM_V2_PROGRAM_ID.toBase58(),
        poolAddress: DEVNET_POOL_ADDRESS.toBase58(),
      },
      { status: 500 }
    );
  }
}

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

function getAtaAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

/**
 * POST /api/meteora
 * Generates an authentic on-chain Meteora DBC swap transaction or routes to On-Chain Settlement.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userPublicKey, amountIn, swapBaseForQuote, slippageBps = 50 } = body;

    if (!userPublicKey) {
      return NextResponse.json({ error: 'Missing userPublicKey' }, { status: 400 });
    }

    const userPubkey = new PublicKey(userPublicKey);
    const amountInBN = new BN(Math.floor(parseFloat(amountIn || '1') * 1000000)); // 6 decimals

    const connection = new Connection(RPC_URL, 'confirmed');
    const client = new DynamicBondingCurveClient(connection, 'confirmed');

    // Retrieve pool state to know the active base mint
    const pool = await client.state.getPool(DEVNET_POOL_ADDRESS);
    const baseMint = pool?.poolState?.baseMint || new PublicKey('FQeEsLJSV5inxbH31xsHVfTqMK1ZxDh5D4ydjtSFAM4d');
    const sourceMint = swapBaseForQuote ? baseMint : DEVNET_USDC_MINT;

    // Check if user has an associated token account with sufficient devnet SPL balance
    const userAta = getAtaAddress(sourceMint, userPubkey);
    let hasSplBalance = false;
    try {
      const bal = await connection.getTokenAccountBalance(userAta);
      if (bal?.value?.uiAmount && bal.value.uiAmount >= parseFloat(amountIn || '0')) {
        hasSplBalance = true;
      }
    } catch {
      hasSplBalance = false;
    }

    if (!hasSplBalance) {
      // Wallet does not hold Devnet SPL tokens for direct Meteora transfer.
      // Route cleanly to On-Chain Settlement via Solana Memo Program.
      return NextResponse.json({
        success: true,
        mode: 'MEMO_SETTLEMENT',
        reason: 'User wallet does not have Devnet SPL token balance. Routing via On-Chain Memo Settlement.',
        poolAddress: DEVNET_POOL_ADDRESS.toBase58(),
        programId: DYNAMIC_BONDING_CURVE_PROGRAM_ID.toBase58(),
        dammProgramId: DAMM_V2_PROGRAM_ID.toBase58(),
      });
    }

    // Build genuine on-chain swap transaction using official Meteora SDK
    const tx: Transaction = await client.pool.swap({
      pool: DEVNET_POOL_ADDRESS,
      amountIn: amountInBN,
      minimumAmountOut: new BN(0),
      swapBaseForQuote: Boolean(swapBaseForQuote),
      owner: userPubkey,
      payer: userPubkey,
      referralTokenAccount: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
    });

    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey;

    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({
      success: true,
      mode: 'METEORA_CPI',
      transactionBase64: Buffer.from(serializedTx).toString('base64'),
      programId: DYNAMIC_BONDING_CURVE_PROGRAM_ID.toBase58(),
      dammProgramId: DAMM_V2_PROGRAM_ID.toBase58(),
      poolAddress: DEVNET_POOL_ADDRESS.toBase58(),
    });
  } catch (error: any) {
    console.error('[Meteora API Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to construct Meteora swap transaction' },
      { status: 500 }
    );
  }
}
