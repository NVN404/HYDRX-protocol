const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

async function main() {
    const rpcUrl = process.env.BASE_RPC_URL || "https://rpc.magicblock.app/devnet";
    const connection = new anchor.web3.Connection(rpcUrl, "confirmed");

    const walletRaw = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "wallet-keypair.json"), "utf8"));
    const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(walletRaw));
    const wallet = new anchor.Wallet(adminKeypair);

    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);

    const idlPath = fs.existsSync(path.join(__dirname, "..", "target", "idl", "hydrx_magic.json"))
        ? path.join(__dirname, "..", "target", "idl", "hydrx_magic.json")
        : path.join(__dirname, "..", "target", "idl", "aquamon_magic.json");
    if (!fs.existsSync(idlPath)) {
        console.error("[ERROR] IDL file not found at", idlPath, "- Run 'anchor build' first!");
        process.exit(1);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
    const programId = new PublicKey(idl.address || "8dLu65pPh6AbfDmRW5GUGqjPQuxihnpv2vWydzt98vKj");
    const program = new anchor.Program(idl, provider);

    const [poolStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool_state")],
        programId
    );
    const [tokenMintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("hydrx_mint")],
        programId
    );

    console.log("[HYDRX] Initializing HydrX Protocol on MagicBlock Devnet Base Layer...");
    console.log("• Admin / Payer:", adminKeypair.publicKey.toBase58());
    console.log("• Program ID:   ", programId.toBase58());
    console.log("• Pool State PDA:", poolStatePda.toBase58());
    console.log("• Token Mint PDA:", tokenMintPda.toBase58());

    // Check if already initialized
    const poolInfo = await connection.getAccountInfo(poolStatePda);
    if (poolInfo) {
        console.log("[OK] Pool state is ALREADY initialized on devnet!");
        return;
    }

    const tx = await program.methods
        .initializePool(new anchor.BN(200))
        .accounts({
            poolState: poolStatePda,
            tokenMint: tokenMintPda,
            relayer: adminKeypair.publicKey,
            admin: adminKeypair.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

    console.log("[SUCCESS] HydrX Pool & SPL Mint Initialized on MagicBlock Devnet!");
    console.log("• Signature:", tx);
    console.log("• Explorer URL:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
}

main().catch(err => {
    console.error("[ERROR] Initialization error:", err);
    process.exit(1);
});
