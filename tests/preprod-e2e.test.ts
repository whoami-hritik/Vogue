import { describe, it, expect } from 'vitest';
import manifest from '../deployments/manifest.json';
import { getActiveContractAddress } from '../src/utils/registry';
import { getMidnightExplorerTxUrl, getMidnightExplorerContractUrl } from '../src/utils/midnightApi';
import { VogueSmartContract, createDefaultVoguePrivateState, createVogueWitnesses } from '../src/lib/midnight-contract';
import { Contract } from '../contracts/managed/vogue/contract/index.js';

describe('Vogue Preprod Deployment & Authoritative SDK E2E Suite', () => {
  it('1. verifies deployment manifest conforms to preprod configuration', () => {
    expect(manifest.network).toBe('preprod');
    expect(manifest.contractAddress).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(manifest.deploymentTxId).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(manifest.contractAddress).toBe('0xbe694ffc83d109ec7587e940a80aae0e7e75d1421cefc4936b593457b484e9e7');
    expect(manifest.deploymentTxId).toBe('0x6f2821acd41d2da77e39ab995a00e2718d76040cb07da0f5fbf62229f0c67b43');

    // Explorer URLs must point to valid explorer links
    expect(manifest.explorer.contractUrl).toContain(manifest.contractAddress);
    expect(manifest.explorer.txUrl).toContain(manifest.deploymentTxId);
  });

  it('2. verifies all 9 circuits are present in manifest and compiled contract bindings', () => {
    const expectedCircuits = [
      'commitStrategy',
      'executeTrade',
      'mintVaultBalance',
      'burnVaultBalance',
      'unshieldWithdraw',
      'registerAuthorizedSolver',
      'commitDarkIntent',
      'fulfillDarkIntent',
      'refundDarkIntent'
    ];

    expect(manifest.circuits).toEqual(expectedCircuits);

    // Verify Contract class impure circuits from authoritative compilation
    const contractInstance = new Contract(createVogueWitnesses() as any);
    const compiledCircuits = Object.keys(contractInstance.impureCircuits);
    for (const c of expectedCircuits) {
      expect(compiledCircuits).toContain(c);
    }
  });

  it('3. verifies registry matches manifest address and explorer resolution', () => {
    const registryAddress = getActiveContractAddress('preprod');
    expect(registryAddress).toBe(manifest.contractAddress);

    const txExplorerUrl = getMidnightExplorerTxUrl(manifest.deploymentTxId, 'preprod');
    const contractExplorerUrl = getMidnightExplorerContractUrl(manifest.contractAddress, 'preprod');

    expect(txExplorerUrl).toBe(manifest.explorer.txUrl);
    expect(contractExplorerUrl).toBe(manifest.explorer.contractUrl);
  });

  it('4. verifies VogueSmartContract circuit methods interface', () => {
    const mockProviders = {
      privateStateProvider: {
        get: async () => createDefaultVoguePrivateState(),
        set: async () => {},
        clear: async () => {}
      }
    } as any;

    const client = new VogueSmartContract(mockProviders);

    // Assert that all 9 authoritative circuit methods exist on the client
    expect(typeof client.commitStrategy).toBe('function');
    expect(typeof client.executeTrade).toBe('function');
    expect(typeof client.mintVaultBalance).toBe('function');
    expect(typeof client.burnVaultBalance).toBe('function');
    expect(typeof client.unshieldWithdraw).toBe('function');
    expect(typeof client.registerAuthorizedSolver).toBe('function');
    expect(typeof client.commitDarkIntent).toBe('function');
    expect(typeof client.fulfillDarkIntent).toBe('function');
    expect(typeof client.refundDarkIntent).toBe('function');
  });

  it('5. verifies witness factory generates all active witness closures with crypto keys', () => {
    const secretKey = new Uint8Array(32).fill(0x77);
    const pState = createDefaultVoguePrivateState({
      maxPositionPct: 15n,
      stopLossPct: 4n,
      strategyExpiry: 1800000000n,
      portfolioValue: 100000n,
      tradeSizeUsd: 15000n,
      ownerSecret: secretKey,
      riskCheckPassed: true,
      depositTNightAmount: 1000n,
      tnightPriceUsd: 100n,
      minFillAmount: 500n,
      maxPriceLimit: 2500n,
      escrowVusdAmount: 5000n
    });

    const witnesses = createVogueWitnesses();
    const ctx = { privateState: pState } as any;

    expect(witnesses.getMaxPositionPct(ctx)).toEqual([pState, 15n]);
    expect(witnesses.getStopLossPct(ctx)).toEqual([pState, 4n]);
    expect(witnesses.getStrategyExpiry(ctx)).toEqual([pState, 1800000000n]);
    expect(witnesses.getPortfolioValue(ctx)).toEqual([pState, 100000n]);
    expect(witnesses.localSecretKey(ctx)).toEqual([pState, secretKey]);
    expect(witnesses.getRiskCheckPassed(ctx)).toEqual([pState, true]);
    expect(witnesses.getDepositTNightAmount(ctx)).toEqual([pState, 1000n]);
    expect(witnesses.getTNightPriceUsd(ctx)).toEqual([pState, 100n]);
    expect(witnesses.getMinFillAmount(ctx)).toEqual([pState, 500n]);
    expect(witnesses.getMaxPriceLimit(ctx)).toEqual([pState, 2500n]);
    expect(witnesses.getEscrowVusdAmount(ctx)).toEqual([pState, 5000n]);
  });
});
