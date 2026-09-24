/**
 * Vogue — Network-Aware RPC Transaction Confirmation
 *
 * Reads RPC endpoint URL and API key from environment variables:
 *   - VITE_RPC_URL / RPC_URL
 *   - VITE_RPC_API_KEY / RPC_API_KEY
 * Falls back to Midnight Explorer REST API for live on-chain status checks.
 */

import { MIDNIGHT_EXPLORER_API_BASE, MIDNIGHT_EXPLORER_API_KEY } from './midnightApi';

export type TransactionRpcStatus = 'pending' | 'confirmed' | 'failed' | 'timeout';

export interface RpcEndpointConfig {
  rpcUrl: string;
  rpcApiKey: string;
}

export function getRpcConfig(network: 'preview' | 'preprod' = 'preview'): RpcEndpointConfig {
  const envRpcUrl =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.[`VITE_RPC_URL_${network.toUpperCase()}`] || import.meta.env?.['VITE_RPC_URL'])) ||
    (typeof process !== 'undefined' && (process.env?.[`RPC_URL_${network.toUpperCase()}`] || process.env?.['RPC_URL'])) ||
    `${MIDNIGHT_EXPLORER_API_BASE}/${network}`;

  const envApiKey =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.[`VITE_RPC_API_KEY_${network.toUpperCase()}`] || import.meta.env?.['VITE_RPC_API_KEY'])) ||
    (typeof process !== 'undefined' &&
      (process.env?.[`RPC_API_KEY_${network.toUpperCase()}`] || process.env?.['RPC_API_KEY'])) ||
    MIDNIGHT_EXPLORER_API_KEY;

  return {
    rpcUrl: envRpcUrl,
    rpcApiKey: envApiKey,
  };
}

export async function checkTransactionStatus(
  txHash: string,
  network: 'preview' | 'preprod' = 'preprod'
): Promise<TransactionRpcStatus> {
  if (!txHash) {
    return 'failed';
  }

  const cleanHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  const config = getRpcConfig(network);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${config.rpcUrl}/api/v1/tx/${cleanHash}`, {
      signal: controller.signal,
      headers: {
        'x-api-key': config.rpcApiKey,
        'Accept': 'application/json'
      }
    }).catch(() => null);

    clearTimeout(timeout);

    if (!res) {
      return 'pending';
    }

    if (res.status === 404) {
      return 'pending';
    }

    if (!res.ok) {
      return 'pending';
    }

    const data = await res.json().catch(() => null);
    if (data && data.tx) {
      if (data.tx.status === 'SUCCESS') {
        return 'confirmed';
      }
      if (data.tx.status === 'FAILED') {
        return 'failed';
      }
      if (data.tx.status === 'PENDING') {
        return 'pending';
      }
    }
    return 'confirmed';
  } catch {
    return 'pending';
  }
}

export async function confirmTransaction(
  txHash: string,
  network: 'preview' | 'preprod' = 'preprod',
  maxAttempts: number = 3,
  intervalMs: number = 2000
): Promise<TransactionRpcStatus> {
  if (!txHash) return 'failed';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const status = await checkTransactionStatus(txHash, network);
    if (status === 'confirmed' || status === 'failed') {
      return status;
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  return 'pending';
}
