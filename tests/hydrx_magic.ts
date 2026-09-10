import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Connection,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { expect } from "chai";

const DELEGATION_PROGRAM_ID = new PublicKey(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);
const MAGIC_PROGRAM_ID = new PublicKey(
  "Magic11111111111111111111111111111111111111"
);
const MAGIC_CONTEXT_ID = new PublicKey(
  "MagicContext1111111111111111111111111111111"
);

describe("HydrX Protocol on MagicBlock Ephemeral Rollups (hydrx_magic)", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = (anchor.workspace.HydrxMagic || anchor.workspace.AquamonMagic) as Program<any>;

  const admin = provider.wallet;
  const relayerKeypair = Keypair.generate();
  const residentKeypair = Keypair.generate();

  const [poolStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_state")],
    program.programId
  );

  const [tokenMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("hydrx_mint")],
    program.programId
  );

  const [residentStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("resident"), residentKeypair.publicKey.toBuffer()],
    program.programId
  );

  before(async () => {
    // Fund relayer and resident for testing
    const fundRelayerTx = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: relayerKeypair.publicKey,
        lamports: 1 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(fundRelayerTx);

    const fundResidentTx = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: residentKeypair.publicKey,
        lamports: 1 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(fundResidentTx);
  });

  it("1. Initializes global HydrX pool state and $HYDRX SPL token mint PDA on Base Layer", async () => {
    const tx = await program.methods
      .initializePool(new anchor.BN(200)) // 2.00 L benchmark flow per ping
      .accounts({
        poolState: poolStatePda,
        tokenMint: tokenMintPda,
        relayer: relayerKeypair.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("   [OK] Pool Initialized on Solana Base Layer. Tx:", tx);

    const poolAccount = await program.account.poolState.fetch(poolStatePda);
    expect(poolAccount.admin.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(poolAccount.relayer.toBase58()).to.equal(
      relayerKeypair.publicKey.toBase58()
    );
    expect(poolAccount.tokenMint.toBase58()).to.equal(tokenMintPda.toBase58());
    expect(poolAccount.benchmarkFlowScaled.toNumber()).to.equal(200);
  });

  it("2. Initializes Resident State on Base Layer before delegation", async () => {
    const tx = await program.methods
      .initializeResident()
      .accounts({
        residentState: residentStatePda,
        resident: residentKeypair.publicKey,
        payer: relayerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([relayerKeypair])
      .rpc();

    console.log("   [OK] Resident State Initialized on Base Layer. Tx:", tx);

    const residentAccount = await program.account.residentState.fetch(
      residentStatePda
    );
    expect(residentAccount.resident.toBase58()).to.equal(
      residentKeypair.publicKey.toBase58()
    );
    expect(residentAccount.totalLitersScaled.toNumber()).to.equal(0);
    expect(residentAccount.telemetriesLogged.toNumber()).to.equal(0);
    expect(residentAccount.isDelegated).to.be.false;
  });

  it("3. Delegates Resident State to MagicBlock Ephemeral Rollup (on Base Layer)", async () => {
    const tx = await program.methods
      .delegateResident()
      .accounts({
        payer: relayerKeypair.publicKey,
        resident: residentKeypair.publicKey,
        residentState: residentStatePda,
      })
      .signers([relayerKeypair])
      .rpc();

    console.log("   [OK] Resident State Delegated to MagicBlock ER. Tx:", tx);
  });

  it("4. Ingests high-frequency telemetry on Ephemeral Rollup and accrues rewards", async () => {
    // Household consumes 0.45 L (45 scaled) -> 200 - 45 = 155 saved -> 155 * 10 = 1,550 micro-tokens
    const litersScaled = new anchor.BN(45);

    const startTime = Date.now();
    const tx = await program.methods
      .recordTelemetry(litersScaled, new anchor.BN(200))
      .accounts({
        residentState: residentStatePda,
        resident: residentKeypair.publicKey,
        relayer: relayerKeypair.publicKey,
      })
      .signers([relayerKeypair])
      .rpc();

    const elapsed = Date.now() - startTime;
    console.log(
      `   [ER] Ephemeral Rollup Telemetry Logged in ${elapsed}ms! Tx: ${tx}`
    );

    const residentAccount = await program.account.residentState.fetch(
      residentStatePda
    );
    expect(residentAccount.totalLitersScaled.toNumber()).to.equal(45);
    expect(residentAccount.currentDayUsage.toNumber()).to.equal(45);
    expect(residentAccount.telemetriesLogged.toNumber()).to.equal(1);
    expect(residentAccount.pendingJalRewards.toNumber()).to.equal(1550);
  });

  it("5. Ingests second high-speed telemetry pulse on Ephemeral Rollup", async () => {
    // Household consumes 0.35 L (35 scaled) -> 200 - 35 = 165 saved -> 165 * 10 = 1,650 micro-tokens
    const litersScaled = new anchor.BN(35);

    const tx = await program.methods
      .recordTelemetry(litersScaled, new anchor.BN(200))
      .accounts({
        residentState: residentStatePda,
        resident: residentKeypair.publicKey,
        relayer: relayerKeypair.publicKey,
      })
      .signers([relayerKeypair])
      .rpc();

    console.log("   [ER] Second ER Telemetry Logged. Tx:", tx);

    const residentAccount = await program.account.residentState.fetch(
      residentStatePda
    );
    expect(residentAccount.totalLitersScaled.toNumber()).to.equal(80); // 45 + 35
    expect(residentAccount.telemetriesLogged.toNumber()).to.equal(2);
    expect(residentAccount.pendingJalRewards.toNumber()).to.equal(3200); // 1550 + 1650
  });

  it("6. Allows resident to claim accrued $HYDRX SPL tokens into their ATA", async () => {
    const residentAta = getAssociatedTokenAddressSync(
      tokenMintPda,
      residentKeypair.publicKey
    );

    // Create resident ATA
    const createAtaTx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        residentKeypair.publicKey,
        residentAta,
        residentKeypair.publicKey,
        tokenMintPda
      )
    );
    await provider.sendAndConfirm(createAtaTx, [residentKeypair]);

    const claimTx = await program.methods
      .claimTokens()
      .accounts({
        poolState: poolStatePda,
        tokenMint: tokenMintPda,
        residentState: residentStatePda,
        residentTokenAccount: residentAta,
        resident: residentKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([residentKeypair])
      .rpc();

    console.log("   [OK] $HYDRX Tokens Claimed to ATA. Tx:", claimTx);

    const residentAccount = await program.account.residentState.fetch(
      residentStatePda
    );
    expect(residentAccount.pendingJalRewards.toNumber()).to.equal(0);
    expect(residentAccount.totalJalClaimed.toNumber()).to.equal(3200);

    const ataBalance = await provider.connection.getTokenAccountBalance(
      residentAta
    );
    expect(ataBalance.value.amount).to.equal("3200");
  });

  it("7. Corporate ESG participant burns $HYDRX tokens for Water Benefit Certificates", async () => {
    const residentAta = getAssociatedTokenAddressSync(
      tokenMintPda,
      residentKeypair.publicKey
    );

    const burnTx = await program.methods
      .burnAndRetire(
        new anchor.BN(1200),
        "HYDRX-WBC-MB-2026 | Google Cloud Hyderabad Data Center Offset"
      )
      .accounts({
        poolState: poolStatePda,
        tokenMint: tokenMintPda,
        userTokenAccount: residentAta,
        user: residentKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([residentKeypair])
      .rpc();

    console.log("   [OK] Corporate ESG $HYDRX Burned. Tx:", burnTx);

    const poolAccount = await program.account.poolState.fetch(poolStatePda);
    expect(poolAccount.totalJalRetired.toNumber()).to.equal(1200);

    const ataBalance = await provider.connection.getTokenAccountBalance(
      residentAta
    );
    expect(ataBalance.value.amount).to.equal("2000"); // 3200 - 1200 = 2000
  });
});
