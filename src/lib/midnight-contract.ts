/**
 * Vogue — Production Midnight Smart Contract Interface
 *
 * Implements real Midnight SDK contract interactions:
 * - CompiledContract.make('vogue', Contract)
 * - findDeployedContract(providers, options)
 * - deployContract(providers, options)
 * - Typed callTx execution for:
 *     - commitStrategy
 *     - executeTrade
 *     - mintVaultBalance
 *     - burnVaultBalance
 *     - unshieldWithdraw
 *     - registerAuthorizedSolver
 *     - commitDarkIntent
 *     - fulfillDarkIntent
 *     - refundDarkIntent
 */

import { CompiledContract } from "@midnight-ntwrk/compact-js";
import {
  findDeployedContract,
  deployContract,
  type FoundContract,
  type DeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import {
  Contract,
  ledger,
  type Witnesses,
  type Ledger,
} from "../../contracts/managed/vogue/contract/index.js";

export const VOGUE_PRIVATE_STATE_ID = "voguePrivateState";

export type VoguePrivateState = {
  ownerSecret: Uint8Array;
  maxPositionPct: bigint;
  stopLossPct: bigint;
  strategyExpiry: bigint;
  portfolioValue: bigint;
  tradeSizeUsd: bigint;
  tradeAsset: Uint8Array;
  riskCheckPassed: boolean;
  depositTNightAmount: bigint;
  tnightPriceUsd: bigint;
  intentAsset: Uint8Array;
  minFillAmount: bigint;
  maxPriceLimit: bigint;
  intentExpiry: bigint;
  escrowVusdAmount: bigint;
};

export function createDefaultVoguePrivateState(
  overridesOrSecret?: Partial<VoguePrivateState> | Uint8Array
): VoguePrivateState {
  let secret: Uint8Array;
  let overrides: Partial<VoguePrivateState> = {};
  if (overridesOrSecret instanceof Uint8Array) {
    secret = overridesOrSecret;
  } else if (overridesOrSecret && typeof overridesOrSecret === "object") {
    overrides = overridesOrSecret;
    secret = overrides.ownerSecret ?? crypto.getRandomValues(new Uint8Array(32));
  } else {
    secret = crypto.getRandomValues(new Uint8Array(32));
  }
  return {
    ownerSecret: secret,
    maxPositionPct: 20n,
    stopLossPct: 10n,
    strategyExpiry: BigInt(Math.floor(Date.now() / 1000) + 86400 * 365),
    portfolioValue: 10000n,
    tradeSizeUsd: 1500n,
    tradeAsset: new Uint8Array(32),
    riskCheckPassed: true,
    depositTNightAmount: 0n,
    tnightPriceUsd: 1n,
    intentAsset: new Uint8Array(32),
    minFillAmount: 0n,
    maxPriceLimit: 0n,
    intentExpiry: 0n,
    escrowVusdAmount: 0n,
    ...overrides,
  };
}

export function createVogueWitnesses(): Witnesses<VoguePrivateState> {
  return {
    localSecretKey: (ctx) => [ctx.privateState, ctx.privateState.ownerSecret],
    getMaxPositionPct: (ctx) => [ctx.privateState, ctx.privateState.maxPositionPct],
    getStopLossPct: (ctx) => [ctx.privateState, ctx.privateState.stopLossPct],
    getStrategyExpiry: (ctx) => [ctx.privateState, ctx.privateState.strategyExpiry],
    getPortfolioValue: (ctx) => [ctx.privateState, ctx.privateState.portfolioValue],
    getTradeSizeUsd: (ctx) => [ctx.privateState, ctx.privateState.tradeSizeUsd],
    getRiskCheckPassed: (ctx) => [ctx.privateState, ctx.privateState.riskCheckPassed],
    getDepositTNightAmount: (ctx) => [ctx.privateState, ctx.privateState.depositTNightAmount],
    getTNightPriceUsd: (ctx) => [ctx.privateState, ctx.privateState.tnightPriceUsd],
    getIntentAsset: (ctx) => [ctx.privateState, ctx.privateState.intentAsset],
    getMinFillAmount: (ctx) => [ctx.privateState, ctx.privateState.minFillAmount],
    getMaxPriceLimit: (ctx) => [ctx.privateState, ctx.privateState.maxPriceLimit],
    getIntentExpiry: (ctx) => [ctx.privateState, ctx.privateState.intentExpiry],
    getEscrowVusdAmount: (ctx) => [ctx.privateState, ctx.privateState.escrowVusdAmount],
  };
}

export function getCompiledVogueContract() {
  return CompiledContract.make("vogue", Contract).pipe(
    CompiledContract.withWitnesses(createVogueWitnesses() as never),
    CompiledContract.withCompiledFileAssets("/zk/vogue/")
  );
}

export interface ContractCallResult {
  txHash: string;
  blockHeight?: number;
}

export class VogueSmartContract {
  private deployedContract: FoundContract<Contract<VoguePrivateState>> | null = null;
  private providers: any = null;
  private contractAddress: string | null = null;
  private privateState: VoguePrivateState;

  constructor(providers?: any, initialPrivateState?: VoguePrivateState) {
    if (providers) this.providers = providers;
    this.privateState = initialPrivateState ?? createDefaultVoguePrivateState();
  }

  public setProviders(providers: any) {
    this.providers = providers;
  }

  public updatePrivateState(updates: Partial<VoguePrivateState>) {
    this.privateState = { ...this.privateState, ...updates };
  }

  public getPrivateState(): VoguePrivateState {
    return this.privateState;
  }

  public async connectAndLoadContract(
    address: string
  ): Promise<FoundContract<Contract<VoguePrivateState>>> {
    if (!this.providers) {
      throw new Error("Cannot connect: Midnight providers not configured.");
    }
    const compiledContract = getCompiledVogueContract();
    const cleanAddress = address.trim().replace(/^0x/i, "");
    this.contractAddress = cleanAddress;

    this.deployedContract = (await findDeployedContract(this.providers as never, {
      contractAddress: cleanAddress,
      compiledContract,
      privateStateId: VOGUE_PRIVATE_STATE_ID,
      initialPrivateState: this.privateState,
    })) as FoundContract<Contract<VoguePrivateState>>;

    console.info(`[VogueContract] Connected to deployed contract at 0x${cleanAddress}`);
    return this.deployedContract;
  }

  public async commitStrategy(agentId: Uint8Array): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).commitStrategy(agentId);
    return tx.public.txHash;
  }

  public async executeTrade(
    agentId: Uint8Array,
    tradeId: Uint8Array,
    currentTime: bigint
  ): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).executeTrade(agentId, tradeId, currentTime);
    return tx.public.txHash;
  }

  public async commitDarkIntent(agentId: Uint8Array, intentId: Uint8Array): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).commitDarkIntent(agentId, intentId);
    return tx.public.txHash;
  }

  public async fulfillDarkIntent(
    intentId: Uint8Array,
    solverId: Uint8Array,
    fillPriceUsd: bigint,
    currentTime: bigint
  ): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).fulfillDarkIntent(intentId, solverId, fillPriceUsd, currentTime);
    return tx.public.txHash;
  }

  public async refundDarkIntent(intentId: Uint8Array, currentTime: bigint): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).refundDarkIntent(intentId, currentTime);
    return tx.public.txHash;
  }

  public async mintVaultBalance(agentId: Uint8Array, depositId: Uint8Array): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).mintVaultBalance(agentId, depositId);
    return tx.public.txHash;
  }

  public async burnVaultBalance(
    agentId: Uint8Array,
    burnId: Uint8Array,
    withdrawUsdcAmount: bigint
  ): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).burnVaultBalance(agentId, burnId, withdrawUsdcAmount);
    return tx.public.txHash;
  }

  public async unshieldWithdraw(agentId: Uint8Array, amountUsd: bigint): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).unshieldWithdraw(agentId, amountUsd);
    return tx.public.txHash;
  }

  public async registerAuthorizedSolver(solverId: Uint8Array): Promise<string> {
    if (!this.deployedContract) throw new Error("Contract not connected. Call connectAndLoadContract first.");
    const tx = await (this.deployedContract.callTx as any).registerAuthorizedSolver(solverId);
    return tx.public.txHash;
  }
}
