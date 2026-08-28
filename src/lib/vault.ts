/**
 * Vogue — Shielded Vault (mintVaultBalance / burnVaultBalance)
 *
 * ASSUMPTION: This simulates the Midnight shield/unshield pattern for a
 * USDC-equivalent "vault balance." No actual USDC bridging, DEX routing,
 * or real custody occurs. The vault balance is a client-side shielded
 * state note, and the wallet popup is triggered via the existing
 * executeSignedTransaction gateway to demonstrate the ZK flow.
 */

import { executeSignedTransaction } from './midnight-api';
import { syncWalletVaultBalance } from './supabase-sync';

let _shieldedVaultBalance = 0;

export function getLocalVaultBalance(): number {
  return _shieldedVaultBalance;
}

export function setLocalVaultBalance(balance: number, walletAddress?: string): void {
  _shieldedVaultBalance = Math.max(0, balance);
  if (walletAddress) {
    syncWalletVaultBalance(walletAddress, _shieldedVaultBalance).catch((err) =>
      console.warn('[Vogue Vault] Sync error:', err)
    );
  }
}

export function addToLocalVaultBalance(amount: number, walletAddress?: string): number {
  _shieldedVaultBalance += Math.max(0, amount);
  if (walletAddress) {
    syncWalletVaultBalance(walletAddress, _shieldedVaultBalance).catch((err) =>
      console.warn('[Vogue Vault] Sync error:', err)
    );
  }
  return _shieldedVaultBalance;
}

export function subtractFromLocalVaultBalance(amount: number, walletAddress?: string): number {
  _shieldedVaultBalance = Math.max(0, _shieldedVaultBalance - amount);
  if (walletAddress) {
    syncWalletVaultBalance(walletAddress, _shieldedVaultBalance).catch((err) =>
      console.warn('[Vogue Vault] Sync error:', err)
    );
  }
  return _shieldedVaultBalance;
}

/**
 * Triggers 1AM wallet transaction signing to shield public tokens into the private vUSD vault.
 */
export async function mintVaultBalance(amountVusd: number, walletAddress?: string): Promise<string> {
  const txHash = await executeSignedTransaction('mintVaultBalance', {
    amountVusd,
    timestamp: Date.now(),
  });
  addToLocalVaultBalance(amountVusd, walletAddress);
  return txHash;
}

/**
 * Triggers 1AM wallet transaction signing to unshield private vUSD vault balance into public tokens.
 */
export async function burnVaultBalance(amountVusd: number, walletAddress?: string): Promise<string> {
  const current = getLocalVaultBalance();
  if (amountVusd > current) {
    throw new Error(`Insufficient vUSD vault balance. Current balance: $${current}`);
  }
  const txHash = await executeSignedTransaction('burnVaultBalance', {
    amountVusd,
    timestamp: Date.now(),
  });
  subtractFromLocalVaultBalance(amountVusd, walletAddress);
  return txHash;
}
