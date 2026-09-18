/**
 * Vogue — Versioned Contract Registry Utilities
 * Reads deployment addresses from deployments/registry.json with network fallbacks.
 */

import registryData from '../../deployments/registry.json';

export interface DeploymentEntry {
  version: string;
  contractAddress: string;
  deployedAt: string;
  commitHash: string;
  circuits: string[];
}

const LOCAL_STORAGE_KEY_PREFIX = 'vogue_active_contract_';

export function setCustomContractAddress(network: string, address: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${network}`, address);
  }
}

export function getCustomContractAddress(network: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${network}`);
  }
  return null;
}

export function resetCustomContractAddress(network: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${network}`);
  }
}

export function getActiveContractAddress(network: 'preview' | 'preprod' | string = 'preprod'): string {
  const netKey = network === 'preprod' ? 'preprod' : 'preview';
  const custom = getCustomContractAddress(netKey);
  if (custom && custom.startsWith('0x') && custom.length >= 64) {
    return custom;
  }
  const entries: DeploymentEntry[] = (registryData.vogue as Record<string, DeploymentEntry[]>)[netKey] || [];
  if (entries.length > 0) {
    return entries[entries.length - 1].contractAddress;
  }

  // Fallback to environment variables
  if (netKey === 'preprod') {
    return (
      (typeof import.meta !== 'undefined' && (import.meta.env?.['VITE_PREPROD_CONTRACT_ADDRESS'] as string)) ||
      '0x6f2821acd41d2da77e39ab995a00e2718d76040cb07da0f5fbf62229f0c67b43'
    );
  }
  return (
    (typeof import.meta !== 'undefined' && (import.meta.env?.['VITE_PREVIEW_CONTRACT_ADDRESS'] as string)) ||
    '0x6f2821acd41d2da77e39ab995a00e2718d76040cb07da0f5fbf62229f0c67b43'
  );
}

export function getContractHistory(network: 'preview' | 'preprod' | string = 'preview'): DeploymentEntry[] {
  const netKey = network === 'preprod' ? 'preprod' : 'preview';
  return (registryData.vogue as Record<string, DeploymentEntry[]>)[netKey] || [];
}
