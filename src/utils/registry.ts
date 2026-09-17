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

export function getActiveContractAddress(network: 'preview' | 'preprod' | string = 'preprod'): string {
  const netKey = network === 'preprod' ? 'preprod' : 'preview';
  const entries: DeploymentEntry[] = (registryData.vogue as Record<string, DeploymentEntry[]>)[netKey] || [];
  if (entries.length > 0) {
    return entries[entries.length - 1].contractAddress;
  }

  // Fallback to environment variables
  if (netKey === 'preprod') {
    return (
      (typeof import.meta !== 'undefined' && (import.meta.env?.['VITE_PREPROD_CONTRACT_ADDRESS'] as string)) ||
      '0x2428cd4ae7c2cd8bb581e1e9182de3003b103c1083c228e0d5cfc3f0b438e524'
    );
  }
  return (
    (typeof import.meta !== 'undefined' && (import.meta.env?.['VITE_PREVIEW_CONTRACT_ADDRESS'] as string)) ||
    '0x2428cd4ae7c2cd8bb581e1e9182de3003b103c1083c228e0d5cfc3f0b438e524'
  );
}

export function getContractHistory(network: 'preview' | 'preprod' | string = 'preview'): DeploymentEntry[] {
  const netKey = network === 'preprod' ? 'preprod' : 'preview';
  return (registryData.vogue as Record<string, DeploymentEntry[]>)[netKey] || [];
}
