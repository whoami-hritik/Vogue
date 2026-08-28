import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  commitStrategy(context: __compactRuntime.CircuitContext<T>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  executeTrade(context: __compactRuntime.CircuitContext<T>,
               agentId_0: Uint8Array,
               tradeId_0: Uint8Array,
               currentTime_0: bigint): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
  mintVaultBalance(agentId_0: Uint8Array, depositId_0: Uint8Array): [];
  burnVaultBalance(agentId_0: Uint8Array,
                   burnId_0: Uint8Array,
                   withdrawUsdcAmount_0: bigint): [];
  unshieldWithdraw(agentId_0: Uint8Array, amountUsd_0: bigint): [];
}

export type Circuits<T> = {
  commitStrategy(context: __compactRuntime.CircuitContext<T>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  executeTrade(context: __compactRuntime.CircuitContext<T>,
               agentId_0: Uint8Array,
               tradeId_0: Uint8Array,
               currentTime_0: bigint): __compactRuntime.CircuitResults<T, []>;
  mintVaultBalance(context: __compactRuntime.CircuitContext<T>,
                   agentId_0: Uint8Array,
                   depositId_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  burnVaultBalance(context: __compactRuntime.CircuitContext<T>,
                   agentId_0: Uint8Array,
                   burnId_0: Uint8Array,
                   withdrawUsdcAmount_0: bigint): __compactRuntime.CircuitResults<T, []>;
  unshieldWithdraw(context: __compactRuntime.CircuitContext<T>,
                   agentId_0: Uint8Array,
                   amountUsd_0: bigint): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  readonly agentCommitment: Uint8Array;
  readonly tradeCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>,
               initialAgent_0: Uint8Array): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
