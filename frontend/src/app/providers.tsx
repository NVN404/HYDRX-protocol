'use client';

import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SOLANA_RPC_URL } from '../lib/solana';

export function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);
  // Standard wallet detection (Phantom, Solflare, Backpack, etc.) works automatically
  const wallets = useMemo(() => [], []);

  const ConnectionProviderComp = ConnectionProvider as any;
  const WalletProviderComp = WalletProvider as any;
  const WalletModalProviderComp = WalletModalProvider as any;

  return (
    <ConnectionProviderComp endpoint={endpoint}>
      <WalletProviderComp wallets={wallets} autoConnect>
        <WalletModalProviderComp>{children}</WalletModalProviderComp>
      </WalletProviderComp>
    </ConnectionProviderComp>
  );
}
