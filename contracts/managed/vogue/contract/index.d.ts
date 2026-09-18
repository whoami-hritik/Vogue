import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getMaxPositionPct(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getStopLossPct(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getStrategyExpiry(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getPortfolioValue(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getTradeSizeUsd(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getRiskCheckPassed(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean];
  getDepositTNightAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getTNightPriceUsd(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getIntentAsset(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getMinFillAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getMaxPriceLimit(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getIntentExpiry(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getEscrowVusdAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  commitStrategy(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  executeTrade(context: __compactRuntime.CircuitContext<PS>,
               agentId_0: Uint8Array,
               tradeId_0: Uint8Array,
               currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  mintVaultBalance(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   depositId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  burnVaultBalance(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   burnId_0: Uint8Array,
                   withdrawUsdcAmount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  unshieldWithdraw(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   amountUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   intentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                    intentId_0: Uint8Array,
                    fillPriceUsd_0: bigint,
                    currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  refundDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   intentId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  commitStrategy(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  executeTrade(context: __compactRuntime.CircuitContext<PS>,
               agentId_0: Uint8Array,
               tradeId_0: Uint8Array,
               currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  mintVaultBalance(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   depositId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  burnVaultBalance(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   burnId_0: Uint8Array,
                   withdrawUsdcAmount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  unshieldWithdraw(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   amountUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   intentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                    intentId_0: Uint8Array,
                    fillPriceUsd_0: bigint,
                    currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  refundDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   intentId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  commitStrategy(context: __compactRuntime.CircuitContext<PS>,
                 agentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  executeTrade(context: __compactRuntime.CircuitContext<PS>,
               agentId_0: Uint8Array,
               tradeId_0: Uint8Array,
               currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  mintVaultBalance(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   depositId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  burnVaultBalance(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   burnId_0: Uint8Array,
                   withdrawUsdcAmount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  unshieldWithdraw(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   amountUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   intentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                    intentId_0: Uint8Array,
                    fillPriceUsd_0: bigint,
                    currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  refundDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   intentId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  agentCommitment: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  tradeStatus: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly tradeCount: bigint;
  darkIntentCommitment: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  darkIntentStatus: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly darkIntentCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
