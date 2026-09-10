#!/bin/bash
set -e

echo "🌊 Initializing HydrX on MagicBlock Ephemeral Rollups..."

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    echo "❌ solana-cli is not installed!"
    exit 1
fi

# Check Anchor CLI
if ! command -v anchor &> /dev/null; then
    echo "❌ anchor-cli is not installed!"
    exit 1
fi

echo "✓ Toolchain verified: Solana $(solana --version | cut -d ' ' -f 2) | Anchor $(anchor --version | cut -d ' ' -f 2)"

# Install Node dependencies
echo "📦 Installing relayer & dashboard dependencies..."
(cd relayer && npm install)
(cd iot-simulator && npm install)
(cd dashboard && npm install)

# Build Anchor Program
echo "🔨 Compiling Anchor Smart Contract for MagicBlock..."
anchor build

echo "🎉 Setup complete! You can now start the services:"
echo "  • Relayer:   npm run relayer"
echo "  • Simulator: npm run simulator"
echo "  • Dashboard: npm run dashboard"
