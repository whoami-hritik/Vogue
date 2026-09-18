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
  getAlphaFeeBps(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getAlphaMinStakeUsd(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getSignalAsset(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getSignalDirection(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getSignalPriceLimitUsd(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getProportionalAllocationBps(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getComplianceRiskScore(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getKycTier(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getAuditorScopeBitmask(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getAuditorExpiry(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getSolvencyRatioBps(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getIcebergTotalAmountUsd(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getIcebergAsset(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getIcebergMaxSlippageBps(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getIcebergTimeHorizonSeconds(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getIcebergMaxPriceLimit(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getSliceAmountUsd(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getCrossChainStateProof(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
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
  registerSolverBond(context: __compactRuntime.CircuitContext<PS>,
                     solverId_0: Uint8Array,
                     bondAmountUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   intentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                    intentId_0: Uint8Array,
                    solverId_0: Uint8Array,
                    fillPriceUsd_0: bigint,
                    currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  slashDishonestSolver(context: __compactRuntime.CircuitContext<PS>,
                       solverId_0: Uint8Array,
                       intentId_0: Uint8Array,
                       slashPenaltyUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  refundDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   intentId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerAlphaStrategy(context: __compactRuntime.CircuitContext<PS>,
                        strategyId_0: Uint8Array,
                        feeBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  subscribeAlphaStrategy(context: __compactRuntime.CircuitContext<PS>,
                         subscriptionId_0: Uint8Array,
                         strategyId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  settlePerformanceFee(context: __compactRuntime.CircuitContext<PS>,
                       strategyId_0: Uint8Array,
                       subscriptionId_0: Uint8Array,
                       profitUsd_0: bigint,
                       currentHwm_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  emitAlphaSignal(context: __compactRuntime.CircuitContext<PS>,
                  strategyId_0: Uint8Array,
                  signalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  mirrorAlphaTrade(context: __compactRuntime.CircuitContext<PS>,
                   subscriptionId_0: Uint8Array,
                   signalId_0: Uint8Array,
                   mirrorTradeId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerComplianceAttestation(context: __compactRuntime.CircuitContext<PS>,
                                fundId_0: Uint8Array,
                                kycProviderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  delegateAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                        delegationId_0: Uint8Array,
                        fundId_0: Uint8Array,
                        auditorPubKey_0: Uint8Array,
                        currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                      delegationId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyProofOfSolvency(context: __compactRuntime.CircuitContext<PS>,
                        fundId_0: Uint8Array,
                        minSolvencyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitIcebergOrder(context: __compactRuntime.CircuitContext<PS>,
                     orderId_0: Uint8Array,
                     startTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  executeIcebergSlice(context: __compactRuntime.CircuitContext<PS>,
                      orderId_0: Uint8Array,
                      sliceId_0: Uint8Array,
                      fillPriceUsd_0: bigint,
                      currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelIcebergOrder(context: __compactRuntime.CircuitContext<PS>,
                     orderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
  registerSolverBond(context: __compactRuntime.CircuitContext<PS>,
                     solverId_0: Uint8Array,
                     bondAmountUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   intentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                    intentId_0: Uint8Array,
                    solverId_0: Uint8Array,
                    fillPriceUsd_0: bigint,
                    currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  slashDishonestSolver(context: __compactRuntime.CircuitContext<PS>,
                       solverId_0: Uint8Array,
                       intentId_0: Uint8Array,
                       slashPenaltyUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  refundDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   intentId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerAlphaStrategy(context: __compactRuntime.CircuitContext<PS>,
                        strategyId_0: Uint8Array,
                        feeBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  subscribeAlphaStrategy(context: __compactRuntime.CircuitContext<PS>,
                         subscriptionId_0: Uint8Array,
                         strategyId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  settlePerformanceFee(context: __compactRuntime.CircuitContext<PS>,
                       strategyId_0: Uint8Array,
                       subscriptionId_0: Uint8Array,
                       profitUsd_0: bigint,
                       currentHwm_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  emitAlphaSignal(context: __compactRuntime.CircuitContext<PS>,
                  strategyId_0: Uint8Array,
                  signalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  mirrorAlphaTrade(context: __compactRuntime.CircuitContext<PS>,
                   subscriptionId_0: Uint8Array,
                   signalId_0: Uint8Array,
                   mirrorTradeId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerComplianceAttestation(context: __compactRuntime.CircuitContext<PS>,
                                fundId_0: Uint8Array,
                                kycProviderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  delegateAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                        delegationId_0: Uint8Array,
                        fundId_0: Uint8Array,
                        auditorPubKey_0: Uint8Array,
                        currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                      delegationId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyProofOfSolvency(context: __compactRuntime.CircuitContext<PS>,
                        fundId_0: Uint8Array,
                        minSolvencyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitIcebergOrder(context: __compactRuntime.CircuitContext<PS>,
                     orderId_0: Uint8Array,
                     startTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  executeIcebergSlice(context: __compactRuntime.CircuitContext<PS>,
                      orderId_0: Uint8Array,
                      sliceId_0: Uint8Array,
                      fillPriceUsd_0: bigint,
                      currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelIcebergOrder(context: __compactRuntime.CircuitContext<PS>,
                     orderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
  registerSolverBond(context: __compactRuntime.CircuitContext<PS>,
                     solverId_0: Uint8Array,
                     bondAmountUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   agentId_0: Uint8Array,
                   intentId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                    intentId_0: Uint8Array,
                    solverId_0: Uint8Array,
                    fillPriceUsd_0: bigint,
                    currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  slashDishonestSolver(context: __compactRuntime.CircuitContext<PS>,
                       solverId_0: Uint8Array,
                       intentId_0: Uint8Array,
                       slashPenaltyUsd_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  refundDarkIntent(context: __compactRuntime.CircuitContext<PS>,
                   intentId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerAlphaStrategy(context: __compactRuntime.CircuitContext<PS>,
                        strategyId_0: Uint8Array,
                        feeBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  subscribeAlphaStrategy(context: __compactRuntime.CircuitContext<PS>,
                         subscriptionId_0: Uint8Array,
                         strategyId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  settlePerformanceFee(context: __compactRuntime.CircuitContext<PS>,
                       strategyId_0: Uint8Array,
                       subscriptionId_0: Uint8Array,
                       profitUsd_0: bigint,
                       currentHwm_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  emitAlphaSignal(context: __compactRuntime.CircuitContext<PS>,
                  strategyId_0: Uint8Array,
                  signalId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  mirrorAlphaTrade(context: __compactRuntime.CircuitContext<PS>,
                   subscriptionId_0: Uint8Array,
                   signalId_0: Uint8Array,
                   mirrorTradeId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerComplianceAttestation(context: __compactRuntime.CircuitContext<PS>,
                                fundId_0: Uint8Array,
                                kycProviderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  delegateAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                        delegationId_0: Uint8Array,
                        fundId_0: Uint8Array,
                        auditorPubKey_0: Uint8Array,
                        currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                      delegationId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyProofOfSolvency(context: __compactRuntime.CircuitContext<PS>,
                        fundId_0: Uint8Array,
                        minSolvencyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  commitIcebergOrder(context: __compactRuntime.CircuitContext<PS>,
                     orderId_0: Uint8Array,
                     startTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  executeIcebergSlice(context: __compactRuntime.CircuitContext<PS>,
                      orderId_0: Uint8Array,
                      sliceId_0: Uint8Array,
                      fillPriceUsd_0: bigint,
                      currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelIcebergOrder(context: __compactRuntime.CircuitContext<PS>,
                     orderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
  alphaStrategyRegistry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  alphaSubscriptionStatus: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly alphaStrategyCount: bigint;
  alphaSignalCommitment: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  readonly alphaSignalCount: bigint;
  alphaMirroredTradeStatus: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  complianceAttestationRegistry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  auditorAccessRegistry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  readonly auditorDelegationCount: bigint;
  icebergOrderCommitment: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  icebergOrderStatus: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  icebergFilledAmountUsd: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly icebergSliceCount: bigint;
  readonly icebergOrderCount: bigint;
  solverBondRegistry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly solverSlashCount: bigint;
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
