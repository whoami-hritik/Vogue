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

export function getActiveContractAddress(network: 'preview' | 'preprod' | string = 'preview'): string {
  const netKey = network === 'preprod' ? 'preprod' : 'preview';
  const entries: DeploymentEntry[] = (registryData.vogue as Record<string, DeploymentEntry[]>)[netKey] || [];
  if (entries.length > 0) {
    return entries[entries.length - 1].contractAddress;
  }

  // Fallback to environment variables
  if (netKey === 'preprod') {
    return (
      (typeof import.meta !== 'undefined' && (import.meta.env?.['VITE_PREPROD_CONTRACT_ADDRESS'] as string)) ||
      '0x2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524'
    );
  }
  return (
    (typeof import.meta !== 'undefined' && (import.meta.env?.['VITE_PREVIEW_CONTRACT_ADDRESS'] as string)) ||
    '0x62a27ceda5eb600263e208768d5d285c659d47f2cd6b14a20c62b160f4da46f3'
  );
}

export function getContractHistory(network: 'preview' | 'preprod' | string = 'preview'): DeploymentEntry[] {
  const netKey = network === 'preprod' ? 'preprod' : 'preview';
  return (registryData.vogue as Record<string, DeploymentEntry[]>)[netKey] || [];
}
