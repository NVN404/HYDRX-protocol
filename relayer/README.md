# HydrX MagicBlock Dual-Connection Relayer Proxy

High-speed zero-gas relayer proxy that integrates the dual-connection architecture for MagicBlock Ephemeral Rollups.

## Architecture

1. **Base Layer Connection**: Connects to Solana Devnet (`https://rpc.magicblock.app/devnet`) for durable account initialization, delegation CPI, and final settlement claims.
2. **MagicBlock Router**: Queries `https://devnet-router.magicblock.app/` using `getDelegationStatus` to discover active ER validator endpoints.
3. **Ephemeral Rollup Connection**: Sends high-frequency telemetry pulses directly to the ER RPC (`https://devnet-as.magicblock.app/`), executing in ~10-40ms with 0 gas fees per ping.
4. **Checkpoint Commits**: Batches commits back to Solana L1 using `MagicIntentBundleBuilder` every 20 pings or upon user request.

## API Reference

- `POST /api/telemetry`: Send IoT water meter pulse payload.
- `POST /api/delegate`: Delegate resident account to Ephemeral Rollup on Base Layer.
- `POST /api/commit`: Commit uncommitted ER telemetry back to Base Layer.
- `POST /api/undelegate`: Commit and undelegate account back to Base Layer.
- `GET /api/stats`: Real-time metrics comparing Solana L1 vs MagicBlock ER latency and telemetry stats.
- `GET /api/resident/:address`: Detailed resident dashboard data.
